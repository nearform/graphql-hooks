/* eslint-env mocha */

import path from 'path'
import glob from 'glob'
import fs from 'fs'
import assert from 'assert'
import { transformFileSync } from '@babel/core'

import plugin from '../../src'

const babelOptions = {
  presets: [['@babel/react']],
  plugins: [[plugin, {}]],
  babelrc: false
}

describe('Exracts gql queries', () => {
  const inDir = path.join(__dirname, 'fixtures', 'actual')
  const outDir = path.join(__dirname, 'fixtures', 'expected')

  glob
    .sync('*', { cwd: inDir })
    .filter(d => !d.startsWith('.'))
    .map(file => {
      it(`should transform ${file}`, () => {
        const actualPath = path.join(inDir, file)
        const expectedPath = path.join(outDir, file)

        const actual = transformFileSync(actualPath, babelOptions).code
        const expected = fs.readFileSync(expectedPath, 'utf8')

        assert.strictEqual(actual.trim(), expected.trim())
      })
    })
})
