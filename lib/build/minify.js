/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const cp = require("child_process")
const path = require("path")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const WORKER = [path.join(__dirname, "minify-worker")]
const SPAWN_OPTS = {stdio: ["inherit", "inherit", "inherit", "ipc"]}

/**
 * Minify the given code.
 * @param {string} outputRoot The absolute path to the output directory.
 * @param {string} code The code to minify.
 * @param {object} map The source maps of this code.
 * @returns {Promise<object>} The result of minifying.
 */
function minify(outputRoot, code, map) {
    return new Promise((resolve, reject) => {
        try {
            const task = cp.spawn(process.execPath, WORKER, SPAWN_OPTS)
            task.on("message", (result) => {
                if (result.type === "ok") {
                    resolve(result)
                }
                else {
                    reject(result)
                }
            })
            task.on("error", reject)
            task.send({outputRoot, code, map})
        }
        catch (err) {
            reject(err)
        }
    })
}

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

module.exports = minify
