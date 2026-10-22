/* eslint-env mocha */

// The suite above runs the plugin from src through @babel/register. This one
// runs the built lib/ in a plain node process, as a consumer's babel would load
// it, so a dependency that cannot be require()d fails here rather than for users.

// Plain CommonJS on purpose: mocha import()s a test file before it tries
// require(), and on a node that detects module syntax that would load an ES
// module test natively, without @babel/register, and leave __dirname undefined.
const path = require('path')
const fs = require('fs')
const os = require('os')
const assert = require('assert')
const { execFileSync } = require('child_process')

const lib = path.join(__dirname, '..', '..', 'lib', 'index.js')

describe('built lib', function () {
  before(function () {
    if (!fs.existsSync(lib)) this.skip() // needs `npm run build` first
  })

  it('can be require()d by plain node', () => {
    const type = execFileSync(
      process.execPath,
      ['-e', `process.stdout.write(typeof require(${JSON.stringify(lib)}))`],
      { encoding: 'utf8' }
    )
    assert.strictEqual(type, 'function')
  })

  it('writes gql-queries.json next to the nearest package.json', () => {
    const project = fs.mkdtempSync(path.join(os.tmpdir(), 'extract-gql-'))
    const nested = path.join(project, 'src', 'deep')
    fs.mkdirSync(nested, { recursive: true })
    fs.writeFileSync(path.join(project, 'package.json'), '{}')

    try {
      execFileSync(
        process.execPath,
        [
          '-e',
          `
          const babel = require(${JSON.stringify(require.resolve('@babel/core'))})
          babel.transformSync(
            'const q = persist\`{ hello }\`',
            { plugins: [require(${JSON.stringify(lib)})], babelrc: false, configFile: false }
          )
        `
        ],
        { cwd: nested }
      )

      const output = JSON.parse(
        fs.readFileSync(path.join(project, 'gql-queries.json'), 'utf8')
      )
      assert.deepStrictEqual(Object.values(output), ['{ hello }'])
      assert.strictEqual(
        fs.existsSync(path.join(nested, 'gql-queries.json')),
        false
      )
    } finally {
      fs.rmSync(project, { recursive: true, force: true })
    }
  })
})
