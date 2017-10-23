/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { Buffer } = require("buffer")
const path = require("path")
const fs = require("fs-extra")
const rollup = require("rollup")
const rollupAlias = require("rollup-plugin-alias")
const rollupBabel = require("rollup-plugin-babel")
const rollupCommonjs = require("rollup-plugin-commonjs")
const rollupJson = require("rollup-plugin-json")
const rollupResolve = require("rollup-plugin-node-resolve")
const rollupVue = require("rollup-plugin-vue")
const logger = require("../common/logger")
const AssetProcessor = require("./asset-processor")
const createBabelOptions = require("./create-babel-options")
const createVueOptions = require("./create-vue-options")
const minify = require("./minify")
const getGzippedSize = require("./get-gzipped-size")
const rollupUrl = require("./rollup-plugin-url")
const StyleProcessor = require("./style-processor")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const IS_PRODUCTION = process.env.NODE_ENV === "production"
const ENTER_LOG = {
    name: "enter-log",
    transform(_, id) {
        if (!id.startsWith("\u0000")) {
            logger.log("Processing \"%s\".", relative(id))
        }
    },
}
const STYLE_PROCESSOR = Symbol("styleProcessor")

/**
 * Get relative path.
 * @param {string} filePath The absolute path.
 * @returns {string} The relative path from the current working directory.
 */
function relative(filePath) {
    return path.relative(process.cwd(), filePath)
}

/**
 * If the cache has the style processor of the previous build, return it.
 * Otherwise, create new style processor.
 * @param {object|null} cache The cache object of rollup. This is not null if
 * this is `watch` mode.
 * @param {AssetProcessor} assetProcessor The asseto processor of the current
 * build.
 * @returns {StyleProcessor} The style processor.
 */
function getOrCreateStyleProcessor(cache, assetProcessor) {
    if (cache != null && cache[STYLE_PROCESSOR] != null) {
        cache[STYLE_PROCESSOR].restart(assetProcessor)
        return cache[STYLE_PROCESSOR]
    }
    return new StyleProcessor(assetProcessor, IS_PRODUCTION)
}

/**
 * Build.
 * @param {string} sourceRoot The absolute path to the source directory.
 * @param {string} outputRoot The absolute path to the output directory.
 * @param {boolean} includeCompiler The flag to include the compilers of Vue.js.
 * @param {boolean} includeIE The flag to build code which supports IE11.
 * @param {boolean} test The flag to instrument coverage.
 * @param {object|null} cache The cache object of rollup.
 * @returns {Promise<object>} The cache object of rollup.
 */
async function build(
    sourceRoot,
    outputRoot,
    includeCompiler,
    includeIE,
    test,
    cache
) {
    const startTick = Date.now()
    logger.info("Start to build.")

    // Initialize.
    const sourceFile = path.join(sourceRoot, "__index__.js")
    const outputFile = path.join(outputRoot, "index.js")
    const relOutputFile = path.relative(process.cwd(), outputFile)
    const assetProcessor = new AssetProcessor(sourceRoot)
    const styleProcessor = getOrCreateStyleProcessor(cache, assetProcessor)

    // Bundle.
    const bundle = await rollup.rollup({
        cache,
        input: sourceFile,
        plugins: [
            ENTER_LOG,
            ...(includeCompiler
                ? [rollupAlias({ vue: require.resolve("vue/dist/vue.esm.js") })]
                : []),
            rollupJson(),
            rollupUrl({ assets: assetProcessor }),
            rollupVue(createVueOptions(styleProcessor)),
            rollupBabel(createBabelOptions(includeIE, test)),
            rollupCommonjs(),
            rollupResolve({
                browser: true,
                extensions: [".js", ".json", ".vue"],
                jail: process.cwd(),
                main: true,
                preferBuiltins: false,
            }),
        ],
    })
    let { code, map } = await bundle.generate({
        format: "iife",
        sourcemap: true,
        sourcemapFile: outputFile,
        strict: true,
    })
    await assetProcessor.ready

    logger.info("Writing files.")

    const assetPromises = [
        assetProcessor.write(outputRoot),
        styleProcessor.write(outputRoot),
    ]

    // Minify it if necessary.
    if (IS_PRODUCTION) {
        const beforeSize = Math.ceil(Buffer.byteLength(code) / 1024)
        logger.log("Minifying \"%s\".", relOutputFile)

        ;({ code, map } = await minify(outputRoot, code, map))
        const afterSize = Math.ceil(Buffer.byteLength(code) / 1024)
        const rate = Math.ceil(100 * (beforeSize - afterSize) / beforeSize)

        logger.log(
            "Minified \"%s\": %d KB → %d Kb (%d % reduced)",
            relOutputFile, beforeSize, afterSize, rate
        )
    }

    // Write the outputs.
    logger.log("Writing \"%s\".", relOutputFile)
    logger.log("Writing \"%s.map\".", relOutputFile)
    const sourceMapComment =
        `//# sourceMappingURL=${path.basename(outputFile)}.map`
    await Promise.all([
        fs.outputFile(outputFile, `${code}\n${sourceMapComment}`),
        fs.outputFile(`${outputFile}.map`, JSON.stringify(map)),
        ...assetPromises,
    ])

    if (IS_PRODUCTION) {
        const jsSize = await getGzippedSize(outputFile)
        const cssSize = await getGzippedSize(path.join(outputRoot, "index.css"))

        logger.info(
            "The size of \"%s\"  is %d KB (gzipped).",
            relOutputFile,
            Math.ceil(jsSize / 1024)
        )
        logger.info(
            "The size of \"%s\" is %d KB (gzipped).",
            path.relative(process.cwd(), path.join(outputRoot, "index.css")),
            Math.ceil(cssSize / 1024)
        )
    }

    const totalSeconds = Math.ceil((Date.now() - startTick) / 1000)
    const seconds = totalSeconds % 60
    const minutes = Math.floor(totalSeconds / 60)
    logger.info(
        "Completed, spent %d minutes %d seconds on this build.",
        minutes,
        seconds
    )

    // Return the cache to re-build as inheriting the result of this build.
    bundle[STYLE_PROCESSOR] = styleProcessor
    return bundle
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = build
