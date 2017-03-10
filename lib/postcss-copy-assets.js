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
const copySync = require("cpx/lib/copy-sync")
const mime = require("mime")
const postcss = require("postcss")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

// Currently it supports local path only.
const URL_PATTERN = /url\(\s*["']?([^:\s]+?)["']?\s*\)/g
const BACKSLASH = /\\/g
const CP_OPTS = Object.freeze({preserve: true, update: true})
const INLINING_MAX_SIZE = 10240 // 10KB

/**
 * Create the data URL of the given file.
 * @param {string} targetPath The path to the target file.
 * @returns {string|null} Generated data URL or null.
 */
function convertToDataUrl(targetPath) {
    if (fs.statSync(targetPath).size > INLINING_MAX_SIZE) {
        return null
    }

    const type = mime.lookup(targetPath)
    if (type == null) {
        return null
    }

    const body = fs.readFileSync(targetPath).toString("base64")
    return `data:${type};base64,${body}`
}

/**
 * Create the relative path for The path to the parent directory of the current
 * CSS file.
 * @param {string} srcRoot The path to the source directory.
 * @param {string} srcDir The path to the parent directory of the current CSS
 * file.
 * @returns {string|null} The relative path to the parent directory of the
 * current CSS file from the source directory.
 */
function getRelativeSrcDir(srcRoot, srcDir) {
    const relativeSrcDir = path.relative(srcRoot, srcDir)
    if (!relativeSrcDir.startsWith("..")) {
        return relativeSrcDir
    }

    const moduleRootPos = srcDir.lastIndexOf("node_modules")
    if (moduleRootPos !== -1) {
        return srcDir.slice(moduleRootPos + "node_modules".length + 1)
    }

    return null
}

/**
 * Copy assets which are written in `url(...)` style.
 * @param {object} styles The AST of a style sheet.
 * @param {object} _result The object to output results. Unused.
 * @param {string} srcRoot The path to the source directory.
 * @param {string} outRoot The path to the output directory.
 * @returns {void}
 */
function copyAsserts(styles, _result, srcRoot, outRoot) {
    styles.walkDecls(decl => {
        let srcDir = null
        let outDir = null

        const oldValue = decl.value
        const newValue = oldValue.replace(URL_PATTERN, (whole, url) => {
            // Leave other hosts'.
            if (url.startsWith("//")) {
                return whole
            }

            // Resolve the url.
            if (srcDir == null) {
                srcDir = (decl.source.input.file != null)
                    ? path.dirname(decl.source.input.file)
                    : srcRoot
            }
            const srcPath = path.join(srcDir, decodeURI(url))

            // Try inlining.
            const dataUrl = convertToDataUrl(srcPath)
            if (dataUrl != null) {
                return `url(${encodeURI(dataUrl)})`
            }

            // Resolve asset path.
            if (outDir == null) {
                const relativeSrcDir = getRelativeSrcDir(srcRoot, srcDir)
                if (relativeSrcDir == null) {
                    return whole
                }
                outDir = path.join(outRoot, relativeSrcDir)
            }
            const outPath = path.join(outDir, url)
            const assetUrl =
                path.relative(outRoot, outPath)
                    .replace(BACKSLASH, "/")

            // Copy.
            copySync(path.dirname(srcPath), path.dirname(outPath), CP_OPTS)
            copySync(srcPath, outPath, CP_OPTS)

            return `url(${encodeURI(assetUrl)})`
        })

        if (newValue !== oldValue) {
            decl.value = newValue
        }
    })
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = postcss.plugin("copy-assets", (options) =>
    (styles, result) => copyAsserts(
        styles,
        result,
        path.resolve(options.srcDir),
        path.resolve(options.outDir)
    )
)
