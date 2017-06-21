/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Create the options of Babel.
 * @param {boolean} includeIE The flag to include plugins for IE.
 * @param {boolean} test The flag to instrument coverage.
 * @returns {object} The created options.
 */
function createBabelOptions(includeIE, test) {
    return {
        babelrc: false,
        plugins: [
            "transform-vue-jsx",
            ...(test ? [["istanbul", {exclude: ["**/{test,node_modules}/**"]}]] : []),
            "transform-inline-environment-variables",
            "minify-constant-folding",
            "minify-dead-code-elimination",
        ],
        presets: [
            ["env", {
                targets: {
                    browsers: [
                        "last 2 Chrome versions",
                        "last 2 Firefox versions",
                        "last 1 Edge versions",
                        "last 1 Safari versions",
                        ...(includeIE ? ["last 1 IE versions"] : []),
                    ],
                },
                debug: true,
                modules: false,
                useBuiltIns: true,
            }],
        ],
        sourceMaps: true,
        sourceRoot: process.cwd(),
        sourceType: "module",
    }
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = createBabelOptions
