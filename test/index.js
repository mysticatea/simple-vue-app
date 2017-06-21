/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("assert")
const SEP = require("path").sep
const shell = require("shelljs")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const COMMAND = `.${SEP}node_modules${SEP}.bin${SEP}simple-vue-app`

// Prevent minification.
process.env.NODE_ENV = "test"

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("simple-vue-app command", () => {
    before(() => {
        shell.cd("test-workspace")

        //eslint-disable-next-line no-console
        console.log("running 'npm install'.")
        if (shell.exec("npm install").code !== 0) {
            throw new Error("failed to 'npm install'.")
        }

        //eslint-disable-next-line no-console
        console.log("done.")
    })
    after(() => {
        shell.cd("..")
    })

    describe("if the source directory does not have 'index.js' on build,", () => {
        let exitCode = 0

        before(() => {
            exitCode = shell.exec(`${COMMAND} test`).code
        })

        it("should exit with 1.", () => {
            assert(exitCode === 1)
        })
    })

    describe("if the source directory does not have 'index.js' on test,", () => {
        let exitCode = 0

        before(() => {
            exitCode = shell.exec(`${COMMAND} test --test`).code
        })

        it("should succeed.", () => {
            assert(exitCode === 0)
        })
    })

    describe("if the output directory is same as the source directory,", () => {
        let exitCode = 0

        before(() => {
            exitCode = shell.exec(`${COMMAND} src -o src`).code
        })

        it("should exit with 1.", () => {
            assert(exitCode === 1)
        })
    })

    describe("if it ran with valid arguments,", () => {
        let exitCode = 0

        before(() => {
            shell.rm("-rf", "out")
            exitCode = shell.exec(`${COMMAND} src -o out`).code
        })

        it("should exit with 0.", () => {
            assert(exitCode === 0)
        })

        it("should make 'out/index.html'.", () => {
            assert(shell.test("-f", "out/index.html"))
        })

        it("should make 'out/index.css'.", () => {
            assert(shell.test("-f", "out/index.css"))
        })

        it("should make 'out/index.js'.", () => {
            assert(shell.test("-f", "out/index.js"))
        })

        it("should make 'out/index.js.map'.", () => {
            assert(shell.test("-f", "out/index.js.map"))
        })

        it("should make 'out/lib/big-in-css.gif'.", () => {
            assert(shell.test("-f", "out/lib/big-in-css.gif"))
        })

        it("should make 'out/lib/big-in-html.gif'.", () => {
            assert(shell.test("-f", "out/lib/big-in-html.gif"))
        })

        it("should make 'out/lib/big-in-js.gif'.", () => {
            assert(shell.test("-f", "out/lib/big-in-js.gif"))
        })

        it("should not make 'out/lib/small-in-css.png', it's inlined.", () => {
            assert(!shell.test("-f", "out/lib/small-in-css.png"))
        })

        it("should not make 'out/lib/small-in-html.png', it's inlined.", () => {
            assert(!shell.test("-f", "out/lib/small-in-html.png"))
        })

        it("should not make 'out/lib/small-in-js.png', it's inlined.", () => {
            assert(!shell.test("-f", "out/lib/small-in-js.png"))
        })

        it("should make 'out/material-design-icons/iconfont/MaterialIcons-Regular.eot'.", () => {
            assert(shell.test("-f", "out/material-design-icons/iconfont/MaterialIcons-Regular.eot"))
        })

        it("should make 'out/material-design-icons/iconfont/MaterialIcons-Regular.woff2'.", () => {
            assert(shell.test("-f", "out/material-design-icons/iconfont/MaterialIcons-Regular.woff2"))
        })

        it("should make 'out/material-design-icons/iconfont/MaterialIcons-Regular.woff'.", () => {
            assert(shell.test("-f", "out/material-design-icons/iconfont/MaterialIcons-Regular.woff"))
        })

        it("should make 'out/material-design-icons/iconfont/MaterialIcons-Regular.ttf'.", () => {
            assert(shell.test("-f", "out/material-design-icons/iconfont/MaterialIcons-Regular.ttf"))
        })
    })

    describe("even if multiple `@import`s which import the same CSS file,", () => {
        let exitCode = 0

        before(() => {
            shell.rm("-rf", "out")
            exitCode = shell.exec(`${COMMAND} src2 -o out`).code
        })

        it("should exit with 0.", () => {
            assert(exitCode === 0)
        })

        it("should not duplicate contents", () => {
            const css = shell.cat("out/index.css").stdout
            assert(css.match(/html/g).length === 1)
        })
    })

    describe("if `--include-compiler` option was given,", () => {
        let exitCode = 0

        before(() => {
            shell.rm("-rf", "out")
            exitCode = shell.exec(`${COMMAND} src2 -o out --include-compiler`).code
        })

        it("should exit with 0.", () => {
            assert(exitCode === 0)
        })

        it("should include 'compileToFunctions'.", () => {
            const js = shell.cat("out/index.js").stdout
            assert(js.includes("compileToFunctions"))
        })
    })

    describe("if `--include-compiler` option was not given,", () => {
        let exitCode = 0

        before(() => {
            shell.rm("-rf", "out")
            exitCode = shell.exec(`${COMMAND} src2 -o out`).code
        })

        it("should exit with 0.", () => {
            assert(exitCode === 0)
        })

        it("should include 'compileToFunctions'.", () => {
            const js = shell.cat("out/index.js").stdout
            assert(!js.includes("compileToFunctions"))
        })
    })
})
