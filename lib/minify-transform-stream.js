/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const Buffer = require("buffer").Buffer
const stream = require("stream")
const babel = require("babel-core")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const options = {
    babelrc: false,
    presets: ["babili"],
    sourceType: "script",
}

/**
 * The transform stream to minify code.
 */
class MinifyTransformStream extends stream.Transform {
    /**
     * Initialize this stream.
     */
    constructor() {
        super()
        this.chunks = []
    }

    /** @inheritdoc */
    _transform(chunk, _encoding, callback) {
        this.chunks.push(chunk)
        callback(null)
    }

    /** @inheritdoc */
    _flush(callback) {
        const rawCode = Buffer.concat(this.chunks).toString()
        try {
            const result = babel.transform(rawCode, options)
            this.push(result.code)
            callback(null)
        }
        catch (error) {
            callback(error)
        }
    }
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

/**
 * Create a transform stream to minify.
 * @param {boolean} isWatch The flag which indicates whether this is watch mode
 * or not.
 * @returns {stream.Transform} The created transform stream.
 */
module.exports = (isWatch) =>
    new (isWatch ? stream.PassThrough : MinifyTransformStream)()
