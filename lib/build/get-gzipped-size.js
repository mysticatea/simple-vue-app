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
const zlib = require("zlib")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const ZLIP_OPTS = Object.freeze({ level: zlib.constants.Z_BEST_COMPRESSION })

/**
 * Get gzipped byte size of the given data.
 * @param {string} filePath The absolute path to the file you want to check.
 * @returns {Promise<number>} The gzipped byte size.
 */
function getGzippedSize(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (readingError, content) => {
            if (readingError != null) {
                if (readingError.code === "ENOENT") {
                    resolve(0)
                }
                else {
                    reject(readingError)
                }
                return
            }

            zlib.gzip(content, ZLIP_OPTS, (compressingError, result) => {
                if (compressingError != null) {
                    reject(compressingError)
                    return
                }
                resolve(result.byteLength)
            })
        })
    })
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = getGzippedSize
