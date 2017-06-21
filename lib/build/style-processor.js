/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const path = require("path")
const postcssAutoPrefixer = require("autoprefixer")
const cssnano = require("cssnano")
const fs = require("fs-promise")
const postcss = require("postcss")
const postcssCalc = require("postcss-calc")
const postcssCustomProperties = require("postcss-custom-properties")
const postcssImport = require("postcss-import")
const loadContent = require("postcss-import/lib/load-content")
const resolveId = require("postcss-import/lib/resolve-id")
const logger = require("../common/logger")
const postcssUrl = require("./postcss-url")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * @typedef {object} FileInfo
 * @property {string} id The absolute path to this file.
 * @property {string|Buffer} content The content of this file.
 * @property {object} sourceMap The source map of this file.
 */

/**
 * The class to process CSSs.
 *
 * CSSs are in `.vue` files. `rollup-plugin-vue` will extract the CSSs then give
 * those to this processor. This processor does:
 *
 * 1. Fetch and embed the content of @import.
 * 2. Fetch and embed the content of URLs as Data URL if the content is enough
 *    small (less than 10KB). Otherwise, extract the content as assets.
 * 3. Add vender prefixes with autoprefixer.
 * 4. Fold CSS custom properties.
 *
 * Also, this processor writes the converted CSS to the output directory.
 *
 * TODO(t-nagashima): This style processor does not support source maps for now.
 *                    There is a problem the source maps which map CSS data to
 *                    `.vue` files, the file name becomes null, I'm not sure
 *                    why.
 */
class StyleProcessor {
    /**
     * Initialize this processor.
     * @param {assetProcessor} assetProcessor The asset processor to process
     * assets in CSS.
     * @param {boolean} isProduction The flag which indicates whether this is
     * production build or not. If true, this processor will minify the CSS.
     */
    constructor(assetProcessor, isProduction) {
        this.postcss = postcss([
            postcssImport({
                resolve: (id, base, options) => {
                    if (this.styles.has(id)) {
                        return id
                    }
                    return resolveId(id, base, options)
                },
                load: async (id, options) => {
                    const style = this.styles.get(id)
                    const name = path.relative(process.cwd(), id)
                    const body = (style != null)
                        ? style.code.trim()
                        : await loadContent(id, options)

                    return `/* START ${name} */\n${body}\n/* END ${name} */\n`
                },
            }),
            postcssUrl({assets: assetProcessor}),
            postcssCustomProperties({strict: false}),
            postcssCalc(),
            postcssAutoPrefixer(),
            ...(isProduction ? [cssnano({safe: true, sourcemap: false})] : []),
        ])
        this.styles = new Map()
        this.ready = new Promise((resolve, reject) => {
            this.resolve = resolve
            this.reject = reject
        })

        assetProcessor.waitUntil(this.ready)
    }

    /**
     * Write the CSS and their source map to the output directory.
     * @param {string} outputRoot The absolute path to the output directory.
     * @returns {Promise<void>} The promise which will get fulfilled after done.
     */
    async write(outputRoot) {
        const outputPath = path.join(outputRoot, "index.css")
        const relOutputPath = path.relative(process.cwd(), outputPath)
        const {content} = await this.ready

        logger.log("Writing \"%s\".", relOutputPath)
        await fs.outputFile(outputPath, content)
    }

    /**
     * Remove all styles of the given file.
     * @param {string} id The absolute path to the .vue file.
     * @returns {void}
     */
    removeStyles(id) {
        let i = 0
        while (this.styles.delete(`${id}@${i}`)) {
            i += 1
        }
    }

    /**
     * Process the style `rollup-plugin-vue` provides.
     * @param {object} style The style `rollup-plugin-vue` provides.
     * @param {number} index The index of styles of this file.
     * @returns {void}
     */
    processStyle(style, index) {
        if (style.lang !== "css") {
            throw new Error(`"${style.lang}" isn't supported.`)
        }
        if (style.scoped) {
            throw new Error("Scoped styles aren't supported.")
        }
        if (style.module) {
            throw new Error("CSS modules aren't supported.")
        }
        this.styles.set(`${style.id}@${index}`, style)
    }

    /**
     * Restart the style processing with inheriting the previous result.
     * @param {AssetProcessor} assetProcessor The asset processor.
     * @returns {void}
     */
    restart(assetProcessor) {
        this.ready = new Promise((resolve, reject) => {
            this.resolve = resolve
            this.reject = reject
        })
        assetProcessor.waitUntil(this.ready)
    }

    /**
     * Notify the end of parsing.
     * @returns {void}
     */
    end() {
        const indexCssCode = Array
            .from(this.styles.keys())
            .map(id => `@import "${id}";`)
            .join("\n")
        this.postcss.process(indexCssCode).then(this.resolve, this.reject)
    }
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = StyleProcessor
