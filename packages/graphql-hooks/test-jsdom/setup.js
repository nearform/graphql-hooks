global.fetch = require('jest-fetch-mock')

if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder } = require('util')
  global.TextEncoder = TextEncoder
}

global.structuredClone = jest.fn(function (obj) {
  return JSON.parse(JSON.stringify(obj))
})
