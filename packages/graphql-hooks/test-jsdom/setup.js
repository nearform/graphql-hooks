// jest-fetch-mock 4 no longer installs its globals as a side effect of being
// required. enableMocks() is the documented entry point and sets `fetch`,
// `Headers`, `Request` and `Response` from the same implementation, which keeps
// `expect.any(Headers)` matching what the mocked responses actually carry.
require('jest-fetch-mock').enableMocks()

// ...and make the same implementation's classes the globals the tests compare
// against. Under jsdom, `Headers` would otherwise resolve to the environment's
// own class while the mocked responses carry cross-fetch's, so
// `expect.any(Headers)` never matches.
const { Headers, Request, Response } = require('cross-fetch')
Object.assign(global, { Headers, Request, Response })

if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder } = require('util')
  global.TextEncoder = TextEncoder
}

global.structuredClone = jest.fn(function (obj) {
  return JSON.parse(JSON.stringify(obj))
})
