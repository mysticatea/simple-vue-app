/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const {version} = require("../package.json")

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

/**
 * Print version text.
 * @returns {void}
 */
module.exports = function printVersion() {
    //eslint-disable-next-line no-console
    console.log(`v${version}`)
}
