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
const shell = require("shelljs")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const COMMAND = "node ../bin/index.js"

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("simple-vue-app command", () => {
    before(() => {
        shell.cd("test-workspace")
    })
    after(() => {
        shell.cd("..")
    })

    describe("if no source directory,", () => {
        let exitCode = 0

        before(() => {
            exitCode = shell.exec(`${COMMAND} -o out`).code
        })

        it("should exit with 1.", () => {
            assert(exitCode === 1)
        })
    })

    describe("if no output directory,", () => {
        let exitCode = 0

        before(() => {
            exitCode = shell.exec(`${COMMAND} src`).code
        })

        it("should exit with 1.", () => {
            assert(exitCode === 1)
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

        it("should make 'out/index.ie.js'.", () => {
            assert(shell.test("-f", "out/index.ie.js"))
        })

        it("should make 'out/lib/big.gif'.", () => {
            assert(shell.test("-f", "out/lib/big.gif"))
        })

        it("should not make 'out/lib/small.png', it's inlined.", () => {
            assert(!shell.test("-f", "out/lib/small.png"))
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

    describe("if it ran with '--no-ie' option,", () => {
        let exitCode = 0

        before(() => {
            shell.rm("-rf", "out")
            exitCode = shell.exec(`${COMMAND} src -o out --no-ie`).code
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

        it("should not make 'out/index.ie.js'.", () => {
            assert(!shell.test("-f", "out/index.ie.js"))
        })

        it("should make 'out/lib/big.gif'.", () => {
            assert(shell.test("-f", "out/lib/big.gif"))
        })

        it("should not make 'out/lib/small.png', it's inlined.", () => {
            assert(!shell.test("-f", "out/lib/small.png"))
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
})
