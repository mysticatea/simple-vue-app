/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

/**
 * Print help text.
 * @returns {void}
 */
module.exports = function printHelp() {
    //eslint-disable-next-line no-console
    console.log(`
This is a tool to build a single page application powered by Vue.js.
This tool has some commands.

$ simple-vue-app [OPTIONS]

    The main command, this builds your cool application.

    OPTIONS:
        [SOURCE_DIR] ............... The source directory. Default is "src".
        --output, -o <OUTPUT_DIR> .. The output directory. Default is "out".
        --ie ....................... The flag to do additional processes for IE.
        --watch, -w ................ The flag to observe files and rebuild on 
                                     every file change.
        --include-compiler ......... The flag to use compilers of Vue.js.

    Prepare the following files:

    - '[SOURCE_DIR]/index.js'

    Then this will create the following files into <OUTPUT_DIR>:

    - 'index.html' is the main page.
    - 'index.css' is the main stylesheet.
    - 'index.js' is the main script.
    - 'index.js.map' is the source map of the main script.
    - And detected assets.

    That's almost all, enjoy for development!

$ simple-vue-app --test [OPTIONS]

    This runs the tests of your cool application with Karma + Mocha.

    OPTIONS:
        [SOURCE_DIR] ............... The source directory. Default is "test".
        --output, -o <OUTPUT_DIR> .. The output directory. Default is 
                                     ".test_workspace".
        --ie ....................... The flag to do additional processes for IE.
        --watch, -w ................ The flag to observe files and rebuild on 
                                     every file change.
        --include-compiler ......... The flag to use compilers of Vue.js.

    This builds '[SOURCE_DIR]/*.js' files then runs them by Karma + Mocha.

$ simple-vue-app --help

    Print this help text.

$ simple-vue-app --version

    Print this version number.
`)
}
