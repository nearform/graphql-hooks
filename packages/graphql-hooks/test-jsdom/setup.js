// jest-fetch-mock 4 no longer installs its globals as a side effect of being
// required; enableMocks() is the documented entry point.
const fetchMock = require('jest-fetch-mock')
fetchMock.enableMocks()

// enableMocks() only fills globals that are undefined, and jsdom already defines
// its own `Headers` — so the mocked responses carry the mock's class while
// `expect.any(Headers)` would resolve to jsdom's, and `instanceof` never
// matches. Align the global with the class actually in use.
global.Headers = fetchMock.Headers

if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder } = require('util')
  global.TextEncoder = TextEncoder
}

global.structuredClone = jest.fn(function (obj) {
  return JSON.parse(JSON.stringify(obj))
})
