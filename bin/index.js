#!/usr/bin/env node
/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

/*eslint-disable no-console, no-process-env */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const fs = require("fs")
const path = require("path")
const minimist = require("minimist")
const generate = require("..")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Parse CLI arguments.
 * @returns {object} CLI arguments.
 */
function parseCLIArguments() {
    const unknownArgs = []
    const argv = minimist(process.argv.slice(2), {
        alias: {
            h: "help",
            o: "output",
            v: "version",
            w: "watch",
        },
        boolean: ["help", "ie", "version", "watch"],
        default: {
            help: false,
            ie: true,
            output: "",
            version: false,
            watch: false,
        },
        string: ["output"],

        unknown(arg) {
            if (arg.startsWith("-")) {
                unknownArgs.push(arg)
            }
        },
    })

    return {
        srcDir: argv._[0] || "",
        outDir: argv.output,
        noIE: !argv.ie,
        watch: argv.watch,
        help: argv.help || (argv._.length === 0 && !argv.output),
        version: argv.version,
        unknownOptions: unknownArgs,
    }
}

/**
 * Check whether CLI arguments are valid or not.
 * This prints error messages if invalid.
 * @param {object} args CLI arguments to check.
 * @returns {boolean} `true` if the CLI arguments are valid.
 */
function validateCLIArguments(args) {
    if (args.unknownOptions.length > 0) {
        console.error(`Unknown option(s): '${args.unknownOptions.join("', '")}'.`)
        return false
    }
    if (!args.srcDir) {
        console.error("Require the path to the source directory.")
        return false
    }
    if (!fs.existsSync(args.srcDir)) {
        console.error(`Directory not found: ${args.srcDir}`)
        return false
    }
    if (!fs.existsSync(path.join(args.srcDir, "index.html"))) {
        console.error(`File not found: ${path.join(args.srcDir, "index.html")}`)
        return false
    }
    if (!fs.existsSync(path.join(args.srcDir, "index.js"))) {
        console.error(`File not found: ${path.join(args.srcDir, "index.js")}`)
        return false
    }
    if (!args.outDir) {
        console.error("Require the path to the output directory.")
        return false
    }
    try {
        if (fs.realpathSync(args.outDir) === fs.realpathSync(args.srcDir)) {
            console.error("The path to the output directory must be different to the path to the source directory.")
            return false
        }
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            throw err
        }
        // Ignore ENOENT errors.
        // If args.outDir does not exist then those never be same.
    }
    return true
}

/**
 * Print help text.
 * @returns {void}
 */
function printHelp() {
    console.log(`
Usage: simple-vue-app <source_dir> --output <output_dir> [OPTIONS]
       simple-vue-app <source_dir> -o <output_dir> [OPTIONS]
       simple-vue-app --help
       simple-vue-app --version

    Build a single page application powered by Vue.js.

    Prepare the following files:

    - '<source_dir>/index.html' is the main page.
    - '<source_dir>/index.js' is the entry file.

    Then this generates the following files:

    - '<output_dir>/index.html' is the main page.
    - '<output_dir>/index.css' is the main stylesheet.
    - '<output_dir>/index.js' is the main script.
    - '<output_dir>/index.ie.js' is the main script for IE11.

    Enjoy for development!

OPTIONS:
    --no-ie ....... The flag to not generate '<output_dir>/index.ie.js'.
    --watch, -w ... The flag to observe files and rebuild on every file change.
`)
}

/**
 * Print version text.
 * @returns {void}
 */
function printVersion() {
    console.log(`v${require("../package.json").version}`)
}

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

const args = parseCLIArguments()

if (args.help) {
    printHelp()
    return
}
if (args.version) {
    printVersion()
    return
}
if (!validateCLIArguments(args)) {
    process.exitCode = 1
    return
}

process.env.NODE_ENV = args.watch ? "development" : "production"
process.env.VUE_ENV = "browser"

console.log("started.")
generate(args.srcDir, args.outDir, args.noIE, args.watch).then(
    (build) => {
        if (args.watch) {
            console.log("ready.")

            // Setup logs
            build.on("update", (moduleIds) => {
                console.log(
                    "change found:",
                    moduleIds
                        .map(file => path.relative(process.cwd(), file))
                        .join(", ")
                )
            })
            build.on("log", (message) => {
                console.log("done:", message)
            })
            build.on("error", (error) => {
                console.error(error.stack || String(error))
            })
        }
        else {
            console.log("done.")
        }
    },
    (error) => {
        console.error(error.stack || String(error))
        if (!args.watch) {
            process.exitCode = 1
        }
    }
)

/*eslint-enable no-console, no-process-env */
