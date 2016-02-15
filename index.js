'use strict'

const DEFAULTS = {
    showStackTrace: false,
    showNonPublic: false,
    includeRawError: false,
}

/**
 * Extracts json content of error into json serializable object.
 *
 * @param {Error} error to extract
 * @param {boolean} includeStackTrace true if include stack trace
 * @returns {object} content
 */
const extractJsonContent = (error, includeStackTrace) => {
    const json = {
        error: `${error.message}`,
    }
    if (error.jsonDetail) {
        json.detail = error.jsonDetail
    }
    if (includeStackTrace && error.stack) {
        const lines = error.stack.split('\n')
        const reason = lines.shift()
        json._stackTrace = {
            reason,
            at: lines.map((line) => line.trim()),
        }
    }
    return json
}

/**
 * Handles errors by outputting to json. If err.status is truthy, this is considered a "public" error.
 *
 * @param {object} [options] options for error handling
 * @param {boolean} [options.showStackTrace] show stack trace in error output, default: false
 * @param {boolean} [options.showNonPublic] show underlying error embedded in non-public errors, default: false
 * @param {boolean} [options.includeRawError] include actual error object with no changes, default: false
 * @returns {Function} error handler suitable for placement on root application.
 */
module.exports = (options) => {
    const o = Object.assign({}, DEFAULTS, options || {})

    return (err, req, res, next) => {  // eslint-disable-line no-unused-vars
        let json
        let status
        if (err.status) {
            // this is an error that is ok to show to the public
            status = err.status
            json = extractJsonContent(err, o.showStackTrace)
        } else {
            status = 500
            json = { error: 'An internal server error occurred.' }
            if (o.showNonPublic) {
                json._underlyingError = extractJsonContent(err, o.showStackTrace)
            }
        }

        if (o.includeRawError) {
            json._rawUnderlyingError = err
        }

        res
            .status(status)
            .json(json)
    }
}
