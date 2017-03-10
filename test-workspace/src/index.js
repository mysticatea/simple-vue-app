/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const Vue = require("vue")
const Hello = require("./lib/hello")

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

//eslint-disable-next-line no-new
new Vue({
    el: "#main",
    render(h) {
        return <Hello></Hello>
    },
})
