import { ExtractableFile, isExtractableFile } from 'extract-files'

// Support streams for NodeJS compatibility
const isExtractableFileEnhanced = <TFile = ExtractableFile>(
  value: any
): value is TFile =>
  isExtractableFile(value) ||
  // Check if stream
  // https://github.com/sindresorhus/is-stream/blob/3750505b0727f6df54324784fe369365ef78841e/index.js#L3
  (value !== null &&
    typeof value === 'object' &&
    typeof value.pipe === 'function') ||
  // Check if formdata-node File
  // https://github.com/octet-stream/form-data/blob/14a6708f0ae28a5ffded8b6f8156394ba1d1244e/lib/File.ts#L29
  (value !== null &&
    typeof value === 'object' &&
    typeof value.stream === 'function')

export default isExtractableFileEnhanced
