/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

const chalk = require("chalk")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

let prevTick = 0

/**
 * Decorate the given method.
 * @param {object} obj The object which has the originate log methods.
 * @param {string} methodName The name of the log method to decorate.
 * @param {string} colorName The name of the chalk method name to decorate.
 * @returns {function} Decorated method.
 */
function decorate(obj, methodName, colorName) {
    return (message, ...args) => {
        const tick = Date.now()
        const time = new Date(tick).toISOString().slice(11, 23)
        const postfix = prevTick === 0
            ? ""
            : chalk.gray(` (+${tick - prevTick}ms)`)

        prevTick = tick

        if (typeof message === "string") {
            const prefix = `${chalk[colorName](time)} ${message}`
            obj[methodName](prefix, ...args, postfix)
        }
        else {
            const prefix = chalk[colorName](time)
            obj[methodName](prefix, message, ...args, postfix)
        }
    }
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = {
    log: decorate(console, "log", "gray"),
    info: decorate(console, "info", "blue"),
    warn: decorate(console, "warn", "yellow"),
    error: decorate(console, "error", "red"),
}
