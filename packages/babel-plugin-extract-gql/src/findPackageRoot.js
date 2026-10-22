const fs = require('fs')
const path = require('path')

function isFile(file) {
  try {
    return fs.statSync(file).isFile()
  } catch (e) {
    return false
  }
}

// The nearest directory with a package.json, from `dir` upwards. pkg-dir used
// to do this, but it has been ESM-only since version 6 and cannot be
// require()d from here.
function findPackageRoot(dir = process.cwd()) {
  for (;;) {
    if (isFile(path.join(dir, 'package.json'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) {
      throw new Error(
        `babel-plugin-extract-gql: no package.json found in ${process.cwd()} or any parent directory`
      )
    }
    dir = parent
  }
}

module.exports = findPackageRoot
