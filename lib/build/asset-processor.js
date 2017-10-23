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
const fs = require("fs-extra")
const mime = require("mime")
const logger = require("../common/logger")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const BACKSLASH = /\\/g
const COPY_OPTS = Object.freeze({dereference: true, preserveTimestamps: true})
const INLINING_MAX_SIZE = 10240 // 10KB

/**
 * @typedef {object} AssetInfo
 * @property {string} id The absolute to the asset file.
 * @property {fs.Stats} stat The stats object of the asset file.
 * @property {string} url The URL to access the asset.
 * @property {boolean} embedded The flag which indicates whether the `url` is a
 * Data URL or not.
 */

/**
 * Get the stat of the given file.
 * @param {string} filePath The path to the file you want to get stat.
 * @returns {Promise<fs.Stats|null>} The stat object of the file. If the file
 * does not exist, returns null.
 */
async function statSafely(filePath) {
    try {
        return await fs.stat(filePath)
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            throw err
        }
        return null
    }
}

/**
 * Get the relative path of the asset to output.
 * @param {string} assetPath The absolute path to an asset file.
 * @param {string} sourceRoot The absolute path to the root of source codes.
 * @returns {string|null} The relative path. If the asset locates outside of the
 * source root, returns null.
 */
function getRelativeOutputPath(assetPath, sourceRoot) {
    const relativePath = path.relative(sourceRoot, assetPath)
    if (!relativePath.startsWith("..")) {
        return relativePath
    }

    const moduleRootPos = assetPath.indexOf("node_modules")
    if (moduleRootPos !== -1) {
        return assetPath.slice(moduleRootPos + "node_modules/".length)
    }

    return null
}

/**
 * Process the given asset.
 * If the asset is enough small, this generates a Data URL to embed it.
 * Otherwise, you need to copy the asset to `relOutputPath`.
 * In both case, this returns valid URL to access the asset.
 *
 * @param {string} assetPath The absolute path to the asset.
 * @param {string} relOutputPath The relative path to output the asset.
 * @param {boolean} noEmbed The flag to prevent embedding.
 * @returns {Promise<AssetInfo>} The information of the asset.
 */
async function loadAsset(assetPath, relOutputPath, noEmbed) {
    const id = path.relative(process.cwd(), assetPath)
    if (id.startsWith("..")) {
        logger.error(
            "Processing \"%s\", but this came from outside of this package. " +
            "Please install this into this package.",
            id
        )
    }
    else {
        logger.log("Processing \"%s\"", id)
    }

    const type = mime.getType(assetPath)
    const assetStat = await statSafely(assetPath)
    if (assetStat == null || !assetStat.isFile()) {
        throw new Error(`File not found: "${assetPath}".`)
    }

    // Try inlining.
    if (!noEmbed && assetStat.size <= INLINING_MAX_SIZE && type != null) {
        const body = (await fs.readFile(assetPath)).toString("base64")
        const dataUrl = `data:${type};base64,${body}`
        return {
            id: assetPath,
            stat: assetStat,
            url: dataUrl,
            embedded: true,
        }
    }

    // Save to copy.
    return {
        id: assetPath,
        stat: assetStat,
        url: encodeURI(relOutputPath.replace(BACKSLASH, "/")),
        embedded: false,
    }
}

/**
 * Copy a large asset file.
 * @param {string} outputRoot The absolute path to the output directory.
 * @param {object} entry The asset entry to copy.
 * @param {string} entry.0 The relative path to the asset file.
 * @param {Promise<AssetInfo>} entry.1 The promise of this asset.
 * @returns {Promise<void>} The promise which will get fulfilled after done.
 */
async function copyAsset(outputRoot, [relOutputPath, assetPromise]) {
    const asset = await assetPromise
    if (asset == null) {
        return
    }
    const outputPath = path.join(outputRoot, relOutputPath)
    const srcId = path.relative(process.cwd(), asset.id)
    const outId = path.relative(process.cwd(), outputPath)

    if (asset.embedded) {
        logger.log("Skipped \"%s\" as embedded.", outId)
        return
    }

    const outputStat = await statSafely(outputPath)
    const isNewer = (outputStat == null || outputStat.mtime < asset.stat.mtime)

    if (isNewer) {
        logger.log("Copying \"%s\" from \"%s\".", outId, srcId)
        await fs.copy(asset.id, outputPath, COPY_OPTS)
    }
    else {
        logger.log("Skipped \"%s\" as not modified.", outId)
    }
}

/**
 * The asset processor.
 *
 * This class determines which given assets should be embedded as Data URLs or
 * be copied to the output directory.
 * Also, this class copies the assets which should be copied.
 */
class AssetProcessor {
    /**
     * Initialize this asset processor.
     * @param {string} sourceRoot The absolute path to the source directory.
     */
    constructor(sourceRoot) {
        this.sourceRoot = sourceRoot
        this.ready = Promise.resolve()
        this.entries = new Map()
    }

    /**
     * Copy the known assets to the output directory.
     * @param {string} outputRoot The absolute path to the output directory.
     * @returns {Promise<void>} The promise which will get fulfilled after done.
     */
    async write(outputRoot) {
        await this.ready
        await Promise.all(
            Array
                .from(this.entries.entries())
                .map(copyAsset.bind(null, outputRoot))
        )
        this.entries = new Map()
    }

    /**
     * Determine which given assets should be embedded as Data URLs or be copied
     * to the output directory.
     * @param {string} assetPath The absolute path to the asset file.
     * @param {boolean} noEmbed The flag to prevent embedding.
     * @returns {Promise<AssetInfo>} Information of the asset.
     */
    processAsset(assetPath, noEmbed = false) {
        const relOutputPath = getRelativeOutputPath(assetPath, this.sourceRoot)
        if (relOutputPath == null) {
            return Promise.reject(new Error(
                `Invalid path: "${assetPath}"; ` +
                "this asset locates out of the source root."
            ))
        }

        let promise = this.entries.get(relOutputPath)
        if (promise == null) {
            promise = loadAsset(assetPath, relOutputPath, noEmbed)
            this.entries.set(relOutputPath, promise)
        }
        return promise
    }

    /**
     * Delay starting to copy assets until the given promise gets fulfilled.
     * @param {Promise<any>} promise The promise to wait.
     * @returns {void}
     */
    waitUntil(promise) {
        this.ready = this.ready.then(() => promise)
    }
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = AssetProcessor
