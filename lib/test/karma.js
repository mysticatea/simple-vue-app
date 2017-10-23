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
const { runner, stopper } = require("karma")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const WORKER = [path.join(__dirname, "karma-worker")]
const SPAWN_OPTS = { stdio: ["ignore", "ignore", "ignore", "ipc"] }

/**
 * Run tests.
 * @returns {Promise<number>} The exit code of the tests.
 */
function run() {
    return new Promise(resolve => {
        runner.run(undefined, resolve)
    })
}

/**
 * Stop the karma server.
 * @returns {Promise<number>} The exit code of the tests.
 */
function stop() {
    return new Promise(resolve => {
        stopper.stop(undefined, resolve)
    })
}

/**
 * Start karma on a child process.
 * @param {string} sourceRoot The absolute path to the source directory.
 * @param {string} outputRoot The absolute path to the output directory.
 * @param {boolean} includeIE The flag to build code which supports IE11.
 * @param {boolean} watch The flag to observe file changes.
 * @returns {Promise<void>} The promise which will get fulfilled after done.
 */
function start(sourceRoot, outputRoot, includeIE, watch) {
    return new Promise((resolve, reject) => {
        try {
            const task = cp.spawn(process.execPath, WORKER, SPAWN_OPTS)
            task.on("message", (result) => {
                if (result.type === "ok") {
                    resolve({ run, stop })
                }
                else {
                    reject(result)
                }
            })
            task.on("error", reject)
            task.send({ sourceRoot, outputRoot, includeIE, watch })
        }
        catch (err) {
            reject(err)
        }
    })
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = start
