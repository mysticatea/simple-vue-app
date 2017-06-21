/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
import Vue from "vue"
import A from "./a.vue"
import B from "./b.vue"

async function init() {
    return new Vue({
        el: "#main",
        render(h) {
            return <div><A></A><B></B></div>
        },
    })
}

init().catch(err => {
    console.error((err && err.stack) || err)
})
