import path from 'path'
import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import esbuild from 'rollup-plugin-esbuild' // Used for TS transpiling

// get the package.json for the current package
const packageDir = path.join(__filename, '..')
const pkg = require(`${packageDir}/package.json`)
const external = [...Object.keys(pkg.peerDependencies || {})]

// name will be used as the global name exposed in the UMD bundles
const generateRollupConfig = ({ name, overrides, entryPoint }) => {
  overrides = overrides || {}
  entryPoint = entryPoint || 'src/index.js'
  // CommonJS
  return [
    {
      input: entryPoint,
      output: { file: `lib/${pkg.name}.js`, format: 'cjs', indent: false },
      external,
      plugins: [commonjs(), esbuild(), babel(), sizeSnapshot()],
      ...overrides
    },

    // ES
    {
      input: entryPoint,
      output: { file: `es/${pkg.name}.js`, format: 'es', indent: false },
      external,
      plugins: [commonjs(), esbuild(), babel(), sizeSnapshot()],
      ...overrides
    },

    // ES for Browsers
    {
      input: entryPoint,
      output: { file: `es/${pkg.name}.mjs`, format: 'es', indent: false },
      external,
      plugins: [
        commonjs(),
        nodeResolve({
          jsnext: true
        }),
        esbuild(),
        replace({
          'process.env.NODE_ENV': JSON.stringify('production')
        }),
        terser({
          compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false
          }
        }),
        sizeSnapshot()
      ],
      ...overrides
    },

    // UMD Development
    {
      input: entryPoint,
      output: {
        file: `dist/${pkg.name}.js`,
        format: 'umd',
        name,
        indent: false
      },
      external,
      plugins: [
        commonjs(),
        nodeResolve({
          jsnext: true
        }),
        esbuild(),
        babel({
          exclude: 'node_modules/**'
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify('development')
        }),
        sizeSnapshot()
      ],
      ...overrides
    },

    // UMD Production
    {
      input: entryPoint,
      output: {
        file: `dist/${pkg.name}.min.js`,
        format: 'umd',
        name,
        indent: false
      },
      external,
      plugins: [
        commonjs(),
        nodeResolve({
          jsnext: true
        }),
        esbuild(),
        babel({
          exclude: 'node_modules/**'
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify('production')
        }),
        terser({
          compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false
          }
        }),
        sizeSnapshot()
      ],
      ...overrides
    }
  ]
}

export default generateRollupConfig
