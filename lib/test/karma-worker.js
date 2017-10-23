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
const { Server } = require("karma")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Make relative path with "/".
 * @param {string} to The absolute path to make relative.
 * @returns {string} The relative path.
 */
function relative(to) {
    return path.relative(process.cwd(), to).replace(/\\/g, "/")
}

/**
 * Join 2 given paths.
 * @param {string} a A path to join.
 * @param {string} b Another path to join.
 * @returns {string} The Joined path.
 */
function join(a, b) {
    return path.posix.join(a, b)
}

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

process.on("message", ({ sourceRoot, outputRoot, includeIE, watch }) => {
    try {
        const relSourceRoot = relative(sourceRoot)
        const relOutputRoot = relative(outputRoot)
        const useBrowsers = new Set(["Chrome", "Edge", "Firefox", "Saferi"])
        if (includeIE) {
            useBrowsers.add("IE")
        }
        const options = {
            autoWatch: false,
            basePath: ".",
            colors: true,
            coverageReporter: { type: "lcov", dir: "coverage/" },
            detectBrowsers: {
                enabled: true,
                postDetection(browsers) {
                    return browsers.filter(useBrowsers.has, useBrowsers)
                },
            },
            files: [
                join(relOutputRoot, "index.js"),
                {
                    pattern: join(relOutputRoot, "**"),
                    included: false,
                },
                {
                    pattern: join(relSourceRoot, "**"),
                    included: false,
                    watch: false,
                },
            ],
            frameworks: ["detectBrowsers", "mocha"],
            plugins: [
                "karma-chrome-launcher",
                "karma-edge-launcher",
                "karma-firefox-launcher",
                "karma-ie-launcher",
                "karma-safari-launcher",
                "karma-detect-browsers",
                "karma-mocha",
                "karma-coverage",
                "karma-growl-reporter",
            ],
            reporters: watch
                ? ["coverage", "growl", "progress"]
                : ["coverage", "progress"],
        }

        const server = new Server(options)
        server.on("browsers_ready", () => {
            process.send({ type: "ok" })
            process.disconnect()
        })
        server.start()
    }
    catch (err) {
        process.send({
            type: "error",
            message: err.message,
            stack: err.stack,
        })
        process.disconnect()
    }
})
