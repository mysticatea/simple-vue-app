/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const fs = require("fs")
const path = require("path")
const postcssAutoPrefixer = require("autoprefixer")
const browserify = require("browserify")
const cpx = require("cpx")
const postcssImport = require("postcss-import")
const generateJsForIE = require("./generate-js-for-ie")
const minify = require("./minify-transform-stream")
const postcssCopyAssets = require("./postcss-copy-assets")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Make the result files.
 * @param {BrowserifyObject} build The build definition.
 * @param {string} outDir The path to the output directory.
 * @param {boolean} noIE The flag to not make 'index.ie.js'.
 * @param {boolean} isWatch The flag which indicates watch mode.
 * @returns {void}
 */
function generate(build, outDir, noIE, isWatch) {
    return new Promise((resolve, reject) => {
        const outJs = path.join(outDir, "index.js")

        build.bundle()
            .on("error", reject)
            .pipe(minify(isWatch))
            .on("error", reject)
            .pipe(fs.createWriteStream(outJs))
            .on("error", reject)
            .on("finish", () => {
                if (noIE) {
                    resolve(build)
                }
                else {
                    generateJsForIE(outDir, isWatch).then(
                        () => resolve(build),
                        reject
                    )
                }
            })
    })
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

/**
 * Make the result files.
 * @param {string} srcDir The path to the source directory.
 * @param {string} outDir The path to the output directory.
 * @param {boolean} noIE The flag to not make 'index.ie.js'.
 * @param {boolean} isWatch The flag which indicates watch mode.
 * @returns {void}
 */
module.exports = (srcDir, outDir, noIE, isWatch) => {
    const browserifyOptions = {
        builtins: false,
        cache: {},
        debug: isWatch,
        extensions: [".js", ".vue"],
        packageCache: {},
    }
    const babelOptions = {
        babelrc: false,
        plugins: [
            "transform-vue-jsx",
            "transform-async-to-generator",
            "transform-inline-environment-variables",
        ],
        sourceMaps: isWatch ? "inline" : false,
        sourceType: "script",
    }
    const srcHtml = path.join(srcDir, "index.html")
    const srcJs = path.join(srcDir, "index.js")
    const outCss = path.join(outDir, "index.css")

    //--------------------------------------------------------------------------
    // For output directory
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir)
    }

    //--------------------------------------------------------------------------
    // For index.html
    if (isWatch) {
        cpx.watch(srcHtml, outDir)
    }
    else {
        cpx.copy(srcHtml, outDir)
    }

    //--------------------------------------------------------------------------
    // For .vue and .js files
    const build = browserify(srcJs, browserifyOptions)

    // Transform JSX and Async Functions in .js files.
    build.transform("babelify", Object.assign({global: true}, babelOptions))

    // Transform .vue files
    build.transform("vueify", {
        global: true,
        babel: babelOptions,
        postcss: [
            postcssImport(),
            postcssCopyAssets({srcDir, outDir}),
            postcssAutoPrefixer(),
        ],
        sourceMap: isWatch,
    })
    build.plugin("vueify/plugins/extract-css", {out: outCss})

    // Setup to overve file chagnes.
    if (isWatch) {
        build.plugin("watchify")
        build.on("update", () => {
            generate(build, outDir, noIE, isWatch).catch(error => {
                build.emit("error", error)
            })
        })
    }

    // Go!
    return generate(build, outDir, noIE, isWatch)
}
