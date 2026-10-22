/* eslint-env mocha */

import path from 'path'
import fs from 'fs'
import assert from 'assert'
import { transformFileSync } from '@babel/core'
import * as prettier from 'prettier'

import plugin from '../../src'

const babelOptions = {
  presets: [['@babel/react']],
  plugins: [[plugin, {}]],
  babelrc: false
}

describe('Exracts gql queries', () => {
  const inDir = path.join(__dirname, 'fixtures', 'actual')
  const outDir = path.join(__dirname, 'fixtures', 'expected')

  fs.readdirSync(inDir)
    .filter(d => !d.startsWith('.'))
    .map(file => {
      it(`should transform ${file}`, async () => {
        const actualPath = path.join(inDir, file)
        const expectedPath = path.join(outDir, file)

        // The expected files are kept in the repo's Prettier style, while Babel
        // prints its own, so compare after formatting the plugin's output.
        const options = await prettier.resolveConfig(expectedPath)
        const actual = await prettier.format(
          transformFileSync(actualPath, babelOptions).code,
          { ...options, filepath: expectedPath }
        )
        const expected = fs.readFileSync(expectedPath, 'utf8')

        // Babel drops the blank lines the fixtures keep.
        const withoutBlankLines = code => code.trim().replace(/\n\s*\n/g, '\n')
        assert.strictEqual(
          withoutBlankLines(actual),
          withoutBlankLines(expected)
        )
      })
    })
})
