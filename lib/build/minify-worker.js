/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const babel = require("babel-core")

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

process.on("message", ({outputFile, code, map}) => {
    try {
        const result = babel.transform(code, {
            ast: false,
            babelrc: false,
            filename: outputFile,
            inputSourceMap: map,
            minified: true,
            plugins: ["transform-inline-environment-variables"],
            presets: ["minify"],
            sourceMaps: true,
        })
        process.send({
            type: "ok",
            code: result.code,
            map: result.map,
        })
    }
    catch (err) {
        process.send({
            type: "error",
            message: err.message,
            stack: err.stack,
        })
    }
    finally {
        process.disconnect()
    }
})
