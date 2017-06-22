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
const chokidar = require("chokidar")
const fs = require("fs-extra")
const logger = require("../common/logger")
const build = require("./build")

require("../common/sigint")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const CHOKIDAR_OPTS = Object.freeze({
    alwaysStat: true,
    followSymlinks: true,
    ignoreInitial: true,
    persistent: true,
})

/**
 * Get relative path.
 * @param {string} filePath The absolute path.
 * @returns {string} The relative path from the current working directory.
 */
function relative(filePath) {
    return path.relative(process.cwd(), filePath)
}

/**
 * Get the modified time of the given file safely.
 * @param {string} filePath The path to the file you want to get modified time.
 * @returns {number} The ticks of the modified time of the file. If the file
 * didn't exist then NaN.
 */
async function getMtime(filePath) {
    try {
        return (await fs.stat(filePath)).mtime.getTime()
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            throw err
        }
        return NaN
    }
}

/**
 * Build on each change.
 * @param {string} sourceRoot The absolute path to the source directory.
 * @param {string} outputRoot The absolute path to the output directory.
 * @param {boolean} includeCompiler The flag to include the compilers of Vue.js.
 * @param {boolean} includeIE The flag to build code which supports IE11.
 * @param {function|null} onBuild The callback function which is called when a
 * build completed.
 * @returns {Promise<void>} The promise which will get fulfilled after the first
 * build completed.
 * Also, this promise has an additional method "stop". The "stop" method stops
 * observing.
 */
function watch(
    sourceRoot,
    outputRoot,
    includeCompiler,
    includeIE,
    onBuild = null) {
    return new Promise((resolve, reject) => {
        const observers = new Map()
        let bundle = null
        let running = false
        let dirty = false
        let aborted = false

        /**
         * Dispose observers.
         * @returns {void}
         */
        function dispose() {
            aborted = true
            process.removeListener("SIGINT", onStop)
            process.removeListener("uncaughtException", onError)
            process.removeListener("unhandledRejection", onError)
            for (const observer of observers.values()) {
                observer.watch.close()
            }
            observers.clear()
        }

        /**
         * SIGINT will call this function.
         * Resolve this process.
         * @returns {void}
         */
        function onStop() {
            if (aborted) {
                return
            }
            logger.info("Stop observing.")
            dispose()
            resolve()
        }

        /**
         * Unknown errors will call this function.
         * Reject this process.
         * @param {Error} err The error object.
         * @returns {void}
         */
        function onError(err) {
            logger.error("Observing Error:", err.stack || String(err))
            dispose()
            reject(err)
        }

        process.on("SIGINT", onStop)
        process.on("uncaughtException", onError)
        process.on("unhandledRejection", onError)

        ;(async function rebuild() {
            /**
             * Chokidar will call this function on observed files are changed.
             * Does re-build.
             * @param {string} filePath The path to the changed file.
             * @param {fs.Stats} stat The stat object of the changed file.
             * @returns {void}
             */
            function onChange(filePath, stat) {
                if (aborted) {
                    return
                }

                const observer = observers.get(filePath)
                const mtime = stat.mtime.getTime()
                if (observer != null && observer.mtime < mtime) {
                    logger.info("Changed \"%s\".", relative(filePath))
                    observer.mtime = mtime
                    rebuild()
                }
            }

            /**
             * Chokidar will call this function on observed files are removed.
             * Does re-build.
             * @param {string} filePath The path to the removed file.
             * @param {fs.Stats} stat The stat object of the removed file.
             * @returns {void}
             */
            function onRemove(filePath) {
                if (aborted) {
                    return
                }

                const observer = observers.get(filePath)
                if (observer != null) {
                    logger.info("Removed \"%s\".", relative(filePath))
                    observers.delete(filePath)
                    observer.watch.close()
                    rebuild()
                }
            }

            if (running) {
                dirty = true
                return
            }
            try {
                running = true
                dirty = false

                bundle = await build(
                    sourceRoot,
                    outputRoot,
                    includeCompiler,
                    includeIE,
                    Boolean(onBuild),
                    bundle
                )
                if (aborted) {
                    return
                }

                for (const {id: filePath} of bundle.modules) {
                    if (observers.has(filePath)) {
                        continue
                    }

                    const observer = {
                        watch: chokidar.watch(filePath, CHOKIDAR_OPTS),
                        mtime: await getMtime(filePath),
                    }
                    if (aborted) {
                        observer.watch.close()
                        return
                    }

                    observers.set(filePath, observer)
                    observer.watch
                        .on("change", onChange)
                        .on("unlink", onRemove)
                        .on("error", onError)
                }

                if (onBuild != null) {
                    await onBuild()
                    if (aborted) {
                        return
                    }
                }

                running = false
                if (dirty) {
                    rebuild()
                }
                else {
                    logger.info(
                        "Continue to observe files. Press Ctrl+C to stop.")
                }
            }
            catch (err) {
                running = false
                logger.error("Failed to build:", err.stack || String(err))
                logger.info("Continue to observe files. Press Ctrl+C to stop.")
            }
        })()
    })
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = watch
