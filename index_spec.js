'use strict'
/* eslint-env mocha */

const makeErrorHandler = require('./index')
const express = require('express')
const request = require('supertest')


const _makeTest = (error, handlerOptions, runTest) => (done) => {
    const errorHandler = makeErrorHandler(handlerOptions)
    const app = express()

    app.use('/', (req, res, next) => {
        next(error)
    })

    app.use(errorHandler)

    const r = request(app).get('/')
    runTest(r)
    r.end(done)
}

const _test = (error, handlerOptions, status, json) => _makeTest(error, handlerOptions, (r) => {
    if (status !== null) {
        r.expect(status)
    }
    if (json !== null) {
        r.expect(json)
    }
})

describe('exprest-error-handler', () => {
    describe('non public errors', () => {
        const error = new Error('unknown error')
        it('should use status of 500', _test(
            error, null, 500, null
        ))
        it('should use default json response', _test(
            error, null, null, { error: 'An internal server error occurred.' }
        ))
    })
})
