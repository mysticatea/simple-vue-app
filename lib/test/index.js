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
const fs = require("fs-promise")
const createEntryFile = require("../common/create-entry-file")
const build = require("../build/build")
const watchToBuild = require("../build/watch")
const startKarma = require("./karma")

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = async function({
    sourceRoot,
    outputRoot,
    includeIE = false,
    watch = false,
}) {
    /*eslint-disable no-param-reassign */
    sourceRoot = path.resolve(sourceRoot)
    outputRoot = path.resolve(outputRoot)
    /*eslint-enable no-param-reassign */

    await createEntryFile(sourceRoot, await fs.readdir(sourceRoot))

    const karma = await startKarma(sourceRoot, outputRoot, includeIE, watch)
    try {
        if (watch) {
            await watchToBuild(
                sourceRoot,
                outputRoot,
                includeIE,
                () => karma.run()
            )
        }
        else {
            await build(sourceRoot, outputRoot, includeIE, true, null)
            const exitCode = await karma.run()

            process.exitCode = (typeof exitCode === "number") ? exitCode : 1
        }
    }
    finally {
        await karma.stop()
    }
}
