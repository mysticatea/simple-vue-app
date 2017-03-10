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
const browserify = require("browserify")
const minify = require("./minify-transform-stream")

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

/**
 * Generate JS file for IE.
 *
 * @param {string} outDir The path to the output directory.
 * @param {boolean} isWatch The flag which indicates whether this is watch mode
 * or not.
 * @returns {Promise<void>} The promise object which will get fulfilled after
 * completed.
 */
module.exports = (outDir, isWatch) => {
    if (isWatch) {
        return Promise.resolve()
    }
    return new Promise((resolve, reject) => {
        const srcPath = path.join(outDir, "index.js")
        const outPath = path.join(outDir, "index.ie.js")
        const relativeSrcPath = `./${path.relative(process.cwd(), srcPath)}`

        browserify({builtins: false, debug: isWatch})
            .add({
                file: "index.ie.js",
                source: `"use strict"
require("babel-polyfill")
require(${JSON.stringify(relativeSrcPath)})
`,
            })
            .transform("babelify", {
                babelrc: false,
                presets: ["es2015"],
                sourceMaps: isWatch ? "inline" : false,
                sourceType: "script",
            })
            .bundle()
            .on("error", reject)
            .pipe(minify(isWatch))
            .on("error", reject)
            .pipe(fs.createWriteStream(outPath))
            .on("error", reject)
            .on("finish", resolve)
    })
}
