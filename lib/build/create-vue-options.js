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
 * @param {StyleProcessor} styleProcessor The style processor to process
 * extracted CSSs.
 * @returns {object} The created options.
 */
function createVueOptions(styleProcessor) {
    return {
        autoStyles: false,
        compileTemplate: true,
        css() {
            styleProcessor.end()
        },
        disableCssModuleStaticReplacement: true,
        eachCss(styles, id) {
            styleProcessor.removeStyles(id)
            for (const [index, style] of styles.entries()) {
                styleProcessor.processStyle(style, index)
            }
        },
    }
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = createVueOptions
