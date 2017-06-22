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
const fs = require("fs-extra")

require("./sigint")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Check whether the given file name is valid as entry files or not.
 * @param {string} name The file name to check.
 * @returns {boolean} `true` if the name is valid as an entry file.
 */
function isValid(name) {
    return name !== "__index__.js" && path.extname(name) === ".js"
}

/**
 * Convert the given file name to the import declaration.
 * @param {string} name The file name to convert.
 * @returns {string} The code of the import declaration.
 */
function toImportDeclarations(name) {
    return `import "./${name}"`
}

/**
 * Create `__index__.js` file for the entry point with `babel-polyfill`.
 * And the file will be removed before exit.
 * @param {string} sourceRoot The root directory of source code.
 * @param {string[]} targets The user's entry files.
 * @returns {Promise<void>} The promise which will get fulfilled after complete.
 */
function createEntryFile(sourceRoot, targets) {
    const filePath = path.join(sourceRoot, "__index__.js")
    const imports = targets
        .filter(isValid)
        .map(toImportDeclarations)
        .join("\n")

    /**
     * Dispose the created `__index__.js` file before exit.
     * @returns {void}
     */
    function dispose() {
        process.removeListener("exit", dispose)
        process.removeListener("SIGINT", dispose)
        process.removeListener("uncaughtException", dispose)
        process.removeListener("unhandledRejection", dispose)
        try {
            fs.unlinkSync(filePath)
        }
        catch (e) {
            if (e.code !== "ENOENT") {
                throw e
            }
        }
    }

    process.on("exit", dispose)
    process.on("SIGINT", dispose)
    process.on("uncaughtException", dispose)
    process.on("unhandledRejection", dispose)

    return fs.outputFile(filePath, `import "babel-polyfill"\n${imports}`)
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = createEntryFile
