global.fetch = require('jest-fetch-mock')

if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder } = require('util')
  global.TextEncoder = TextEncoder
}
