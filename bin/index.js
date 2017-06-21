#!/usr/bin/env node
/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const chalk = require("chalk")
const options = require("./options")

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

if (options == null) {
    process.exitCode = 1
}
else if (options.help) {
    require("./help")()
}
else if (options.version) {
    require("./version")()
}
else if (options.test) {
    process.env.NODE_ENV = process.env.NODE_ENV || "development"

    require("../lib/test")(options).catch(error => {
        //eslint-disable-next-line no-console
        console.error(chalk.red.bold(error.stack || String(error)))
        process.exitCode = 1
    })
}
else {
    process.env.NODE_ENV =
        process.env.NODE_ENV ||
        (options.watch ? "development" : "production")

    require("../lib/build")(options).catch(error => {
        //eslint-disable-next-line no-console
        console.error(chalk.red.bold(error.stack || String(error)))
        process.exitCode = 1
    })
}

process.on("uncaughtException", (error) => {
    if (error.code === "ECONNRESET") {
        // Probably a bug of karma#stopper. Just ignore it.
        return
    }

    //eslint-disable-next-line no-console
    console.error(
        chalk.red.bold("Uncaught exception:"),
        chalk.red.bold(error.stack || String(error))
    )
    //eslint-disable-next-line no-process-exit
    process.exit(1)
})

process.on("unhandledRejection", (error) => {
    //eslint-disable-next-line no-console
    console.error(
        chalk.red.bold("Unhandled rejection:"),
        chalk.red.bold(error.stack || String(error))
    )
    //eslint-disable-next-line no-process-exit
    process.exit(1)
})
