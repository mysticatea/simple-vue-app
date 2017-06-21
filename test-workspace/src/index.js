/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import Vue from "vue"
import AssetInCss from "./lib/asset-in-css"
import AssetInHtml from "./lib/asset-in-html"
import AssetInJs from "./lib/asset-in-js"

/*globals SplashScreen */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function delay(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout))
}

async function initialize() {
    SplashScreen.addProgressMessage("Initializing database...")
    await delay(4000)

    return new Vue({
        el: "#main",
        render(h) {
            return <div>
                <AssetInCss></AssetInCss>
                <AssetInHtml></AssetInHtml>
                <AssetInJs></AssetInJs>
            </div>
        },
        mounted() {
            SplashScreen.hide()
        },
    })
}

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

initialize().catch(err => {
    console.error(err.stack || err)
})
