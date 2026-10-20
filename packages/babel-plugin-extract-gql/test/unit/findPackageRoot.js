/* eslint-env mocha */

// Plain CommonJS, like src: mocha import()s a test file before it tries
// require(), and a file with ES module syntax would then load natively on a node
// that detects module syntax, without @babel/register.
const path = require('path')
const fs = require('fs')
const os = require('os')
const assert = require('assert')

const findPackageRoot = require('../../src/findPackageRoot')

describe('findPackageRoot', () => {
  let tmp

  beforeEach(() => {
    // realpath, so comparisons hold where the temp directory is a symlink
    tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'find-root-')))
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  const mkdir = (...parts) => {
    const dir = path.join(tmp, ...parts)
    fs.mkdirSync(dir, { recursive: true })
    return dir
  }
  const writePackage = dir =>
    fs.writeFileSync(path.join(dir, 'package.json'), '{}')

  it('returns the directory itself when it has a package.json', () => {
    writePackage(tmp)

    assert.strictEqual(findPackageRoot(tmp), tmp)
  })

  it('walks up from a nested directory', () => {
    writePackage(tmp)
    const nested = mkdir('src', 'deep')

    assert.strictEqual(findPackageRoot(nested), tmp)
  })

  it('returns the nearest package.json, not the outermost', () => {
    writePackage(tmp)
    const inner = mkdir('packages', 'inner')
    writePackage(inner)

    assert.strictEqual(findPackageRoot(inner), inner)
  })

  it('ignores a directory called package.json', () => {
    writePackage(tmp)
    const nested = mkdir('sub')
    fs.mkdirSync(path.join(nested, 'package.json'))

    assert.strictEqual(findPackageRoot(nested), tmp)
  })

  it('starts from the working directory by default', () => {
    writePackage(tmp)
    const nested = mkdir('src')
    const cwd = process.cwd()

    process.chdir(nested)
    try {
      assert.strictEqual(findPackageRoot(), tmp)
    } finally {
      process.chdir(cwd)
    }
  })

  it('throws a clear error when no parent has a package.json', function () {
    // Needs a temp directory with no package.json anywhere above it.
    for (let dir = tmp; ; dir = path.dirname(dir)) {
      if (fs.existsSync(path.join(dir, 'package.json'))) return this.skip()
      if (path.dirname(dir) === dir) break
    }

    assert.throws(() => findPackageRoot(tmp), /no package\.json found/)
  })
})
