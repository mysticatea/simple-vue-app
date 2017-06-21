/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const fs = require("fs")
const path = require("path")
const minimist = require("minimist")

//------------------------------------------------------------------------------
// Heleprs
//------------------------------------------------------------------------------

/**
 * Check whether the build options are valid or not.
 * This prints error messages if invalid.
 * @param {object} options The options to check.
 * @returns {boolean} `true` if the CLI arguments are valid.
 */
function validateBuildOptions(options) {
    if (options.unknownOptions.length > 0) {
        //eslint-disable-next-line no-console
        console.error(
            `Unknown option(s): '${options.unknownOptions.join("', '")}'.`)
        return false
    }

    if (!options.sourceRoot) {
        //eslint-disable-next-line no-console
        console.error("Require the path to the source directory.")
        return false
    }
    if (!fs.existsSync(options.sourceRoot)) {
        //eslint-disable-next-line no-console
        console.error(`Directory not found: ${options.sourceRoot}`)
        return false
    }
    if (!options.test &&
        !fs.existsSync(path.join(options.sourceRoot, "index.js"))
    ) {
        //eslint-disable-next-line no-console
        console.error(
            `File not found: ${path.join(options.sourceRoot, "index.js")}`)
        return false
    }
    if (!options.outputRoot) {
        //eslint-disable-next-line no-console
        console.error("Require the path to the output directory.")
        return false
    }
    try {
        const realOutputRoot = fs.realpathSync(options.outputRoot)
        const realSourceRoot = fs.realpathSync(options.sourceRoot)
        if (realOutputRoot === realSourceRoot) {
            //eslint-disable-next-line no-console
            console.error(
                "The path to the output directory must be different to the " +
                "path to the source directory."
            )
            return false
        }
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            throw err
        }
        // Ignore ENOENT errors.
        // If args.outputRoot does not exist then those never be same.
    }
    return true
}

/**
 * Parse CLI arguments.
 * @param {string[]} args CLI arguments to parse.
 * @returns {object} The parsed options.
 */
function normalize(args) {
    const unknownArgs = []
    const argv = minimist(args, {
        alias: {
            h: "help",
            includeCompiler: "include-compiler",
            o: "output",
            t: "test",
            v: "version",
            w: "watch",
        },
        boolean: ["help", "ie", "include-compiler", "test", "version", "watch"],
        default: {
            help: false,
            ie: false,
            includeCompiler: false,
            output: "",
            test: false,
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
    const options = {
        help: argv.help,
        includeCompiler: argv.includeCompiler,
        includeIE: argv.ie,
        outputRoot: argv.output || (argv.test ? ".test_workspace" : "out"),
        sourceRoot: argv._[0] || (argv.test ? "test" : "src"),
        test: argv.test,
        unknownOptions: unknownArgs,
        version: argv.version,
        watch: argv.watch,
    }

    if (!validateBuildOptions(options)) {
        return null
    }
    return options
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = normalize(process.argv.slice(2))
