import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const readFileAsync = promisify(fs.readFile)

const manifestPath = path.join(process.cwd(), 'build/public/js/manifest.json')
let cachedManifest

getManifest()

export async function getManifest() {
  if (cachedManifest) {
    return cachedManifest
  }

  try {
    /* eslint-disable-next-line require-atomic-updates */
    cachedManifest = JSON.parse(await readFileAsync(manifestPath))
    return cachedManifest
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }

    return {}
  }
}

export async function getBundlePath(manifestKey) {
  const manifest = await getManifest()
  return manifest[manifestKey] || manifestKey
}
