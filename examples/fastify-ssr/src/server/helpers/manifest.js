const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readFileAsync = promisify(fs.readFile)

const manifestPath = path.join(process.cwd(), 'build/public/js/manifest.json')
let cachedManifest

getManifest()

async function getManifest() {
  if (cachedManifest) {
    return cachedManifest
  }

  try {
    cachedManifest = JSON.parse(await readFileAsync(manifestPath))
    return cachedManifest
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }

    return {}
  }
}

async function getBundlePath(manifestKey) {
  const manifest = await getManifest()
  return manifest[manifestKey] || manifestKey
}

module.exports = {
  getManifest,
  getBundlePath
}
