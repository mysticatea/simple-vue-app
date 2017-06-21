/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const readline = require("readline")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

if (process.platform === "win32") {
    let rl = null
    process.on("newListener", (type) => {
        if (type === "SIGINT" && process.listenerCount("SIGINT") === 1) {
            rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            })
            rl.on("SIGINT", process.emit.bind(process, "SIGINT"))
        }
    })
    process.on("removeListener", (type) => {
        if (type === "SIGINT" && rl && process.listenerCount("SIGINT") === 0) {
            rl.close()
            rl = null
        }
    })
}
