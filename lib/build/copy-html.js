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
const dotProp = require("dot-prop")
const fs = require("fs-extra")
const readPackageJson = require("read-pkg-up")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const DEFAULT_HTML = path.join(__dirname, "index.html")
const VARIABLE_PATTERN = /<!--{{\s*(.+?)\s*(?::\s*(.+?))?\s*}}-->/g

/**
 * Check whether the given file exists or not.
 * @param {string} sourcePath The absolute path to "index.html" file of the
 * source directory.
 * @returns {boolean} `true` if the file exists.
 */
function exists(sourcePath) {
    return fs.stat(sourcePath).then(() => true, (err) => {
        if (err.code === "ENOENT") {
            return false
        }
        throw err
    })
}

/**
 * Copy the given file.
 * In the copying process, this read "package.json" and put the values to the HTML file.
 *
 * Notation is `<!--{{field.name.of.package.json}}-->`.
 * For example, `<!--{{version}}-->` will become version number.
 *
 * @param {string} sourcePath The absolute path to "index.html" file of the
 * source directory.
 * @param {string} outputPath The absolute path to "index.html" file of the
 * output directory.
 * @returns {Promise<void>} The promise which will get fulfilled after done.
 */
async function copy(sourcePath, outputPath) {
    const info = await readPackageJson()
    if (info == null) {
        await fs.copy(sourcePath, outputPath)
        return
    }

    const content = (await fs.readFile(sourcePath, "utf8")).replace(
        VARIABLE_PATTERN,
        (_, propPath, defaultValue) =>
            dotProp.get(info, propPath, defaultValue || "")
    )
    await fs.outputFile(outputPath, content)
}

/**
 * Copy "index.html" from the source directory to the output directory.
 * If the source "index.html" file does not exist, this will create the default
 * "index.html" file.
 *
 * @param {string} sourceRoot The absolute path to the source directory.
 * @param {string} outputRoot The absolute path to the output directory.
 * @returns {Promise<void>} The promise which will get fulfilled after done.
 */
async function copyIndexHtml(sourceRoot, outputRoot) {
    const sourcePath = path.join(sourceRoot, "index.html")
    const outputPath = path.join(outputRoot, "index.html")

    if (await exists(sourcePath)) {
        await copy(sourcePath, outputPath)
    }
    else {
        await copy(DEFAULT_HTML, outputPath)
    }
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = copyIndexHtml
