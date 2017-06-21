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
const createEntryFile = require("../common/create-entry-file")
const build = require("./build")
const copyIndexHtml = require("./copy-html")
const watchToBuild = require("./watch")

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = async function({
    sourceRoot,
    outputRoot,
    includeCompiler = false,
    includeIE = false,
    watch = false,
}) {
    /*eslint-disable no-param-reassign */
    sourceRoot = path.resolve(sourceRoot)
    outputRoot = path.resolve(outputRoot)
    /*eslint-enable no-param-reassign */

    await copyIndexHtml(sourceRoot, outputRoot)
    await createEntryFile(sourceRoot, ["index.js"])

    // Build.
    if (watch) {
        await watchToBuild(sourceRoot, outputRoot, includeCompiler, includeIE)
    }
    else {
        await build(
            sourceRoot, outputRoot, includeCompiler, includeIE, false, null)
    }
}
