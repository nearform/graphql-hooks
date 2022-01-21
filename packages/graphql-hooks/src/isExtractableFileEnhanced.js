import isExtractableFile from 'extract-files/isExtractableFile.mjs'

// Support streams for NodeJS compatibility
const isExtractableFileEnhanced = value =>
  isExtractableFile(value) ||
  // Check if stream
  // https://github.com/sindresorhus/is-stream/blob/3750505b0727f6df54324784fe369365ef78841e/index.js#L3
  (value !== null &&
    typeof value === 'object' &&
    typeof value.pipe === 'function')

export default isExtractableFileEnhanced
