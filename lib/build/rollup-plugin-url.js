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
const MagicString = require("magic-string")
const mime = require("mime")
const {SAXParser} = require("parse5")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const TARGET_TYPES = /^(?:audio|image|video)\//
const TARGET_TAGS = /^(?:audio|img|source|track|video)$/

/**
 * Create replacement information of the given HTML file.
 *
 * This includes such as `<img src="">` attributes.
 * This processes those attributes with the given asset processor, then replaces
 * the value of the attributes by new URL that the asset processor gave.
 *
 * @param {AssetProcessor} assets The asset processor.
 * @param {string} content HTML content to parse.
 * @param {string} sourcePath The path to this HTML file.
 * @returns {object} The replacement information.
 */
function getReplacements(assets, content, sourcePath) {
    const replacements = []

    new SAXParser({locationInfo: true})
        .on("startTag", (name, attrs, _selfClosing, location) => {
            if (!TARGET_TAGS.test(name)) {
                return
            }

            const srcAttr = attrs.find(attr => attr.name === "src")
            if (srcAttr) {
                const {startOffset, endOffset} = location.attrs.src
                const attrText = content.slice(startOffset, endOffset)
                const eqPos = attrText.indexOf("=")
                const sourceDir = path.dirname(sourcePath)
                const assetPath = path.resolve(
                    sourceDir,
                    decodeURI(srcAttr.value)
                )

                replacements.push(
                    assets.processAsset(assetPath)
                        .then(asset => ({
                            url: asset.url,
                            start: startOffset + eqPos + 1,
                            end: endOffset,
                        }))
                )
            }
        })
        .end(content)

    replacements.reverse()
    return Promise.all(replacements)
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = ({assets}) => ({
    name: "url",

    load(id) {
        const type = mime.lookup(id)
        if (!type || !TARGET_TYPES.test(type)) {
            return null
        }
        return assets
            .processAsset(id)
            .then(({url}) => `export default ${JSON.stringify(url)}`)
    },

    transform(content, id) {
        if (!id.endsWith(".vue")) {
            return null
        }
        return getReplacements(assets, content, id).then(replacements => {
            const modifier = new MagicString(content)
            for (const {url, start, end} of replacements) {
                modifier.overwrite(start, end, JSON.stringify(url))
            }

            const ret = {
                code: String(modifier),
                map: modifier.generateMap({
                    file: id,
                    source: id,
                    includeContent: true,
                    hires: true,
                }),
            }
            return ret
        })
    },
})
