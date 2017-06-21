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
const postcss = require("postcss")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const URL_PATTERN = /url\(\s*["']?([^:\s]+?)["']?\s*\)/g
const IGNORE_PATTERN = /^(?:\w+:|\/\/)/

/**
 * The information to replace URL.
 * @typedef {object} UrlInfo
 * @property {string} url The new URL to replace.
 * @property {number} start The start index to replace.
 * @property {number} end The end index to replace.
 */

/**
 * Search URLs in the given value, then create replacement information of the
 * URLs.
 * @param {AssetProcessor} assets The asset processor to process URLs.
 * @param {string} sourcePath The absolute path to this CSS file.
 * @param {string} value The value of a CSS property which might have URLs.
 * @returns {Promise<UrlInfo[]>} The replacement information of URLs.
 */
function getReplacements(assets, sourcePath, value) {
    const replacements = []
    let matched = null

    URL_PATTERN.lastIndex = 0
    while ((matched = URL_PATTERN.exec(value)) != null) {
        const {0: whole, 1: url, index} = matched
        if (!url || IGNORE_PATTERN.test(url)) {
            continue
        }

        const sourceDir = path.dirname(sourcePath)
        const assetPath = path.resolve(sourceDir, decodeURI(url))

        replacements.push(
            assets.processAsset(assetPath).then(asset => ({
                url: `url(${JSON.stringify(asset.url)})`,
                start: index,
                end: index + whole.length,
            }))
        )
    }

    return Promise.all(replacements)
}

/**
 * Replace URLs in the given CSS property.
 * @param {AssetProcessor} assets The asset processor to process assets in CSS.
 * @param {object} decl The CSS property information which PostCSS provided.
 * @returns {Promise<void>} The promise which will get fulfilled after done.
 */
async function processDecl(assets, decl) {
    const sourcePath =
        decl.source.input.file ||
        path.join(assets.sourceRoot, "unknown.css")
    const value = decl.value
    const replacements = await getReplacements(assets, sourcePath, value)

    // Replace.
    let newValue = ""
    let lastPos = 0
    for (const {url, start, end} of replacements) {
        newValue += value.slice(lastPos, start)
        newValue += url
        lastPos = end
    }
    newValue += value.slice(lastPos)

    // Modify the value if needed.
    if (newValue !== value) {
        decl.value = newValue
    }
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = postcss.plugin("url", ({assets}) => (styles) => {
    const promises = []

    styles.walkDecls(decl => {
        promises.push(processDecl(assets, decl))
    })

    return Promise.all(promises)
})
