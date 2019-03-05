import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'

import pkg from './package.json'

const external = [...Object.keys(pkg.peerDependencies || {})]

export default [
  // CommonJS
  {
    input: 'src/index.js',
    output: { file: 'lib/graphql-hooks.js', format: 'cjs', indent: false },
    external,
    plugins: [babel(), sizeSnapshot()]
  },

  // ES
  {
    input: 'src/index.js',
    output: { file: 'es/graphql-hooks.js', format: 'es', indent: false },
    external,
    plugins: [babel(), sizeSnapshot()]
  },

  // ES for Browsers
  {
    input: 'src/index.js',
    output: { file: 'es/graphql-hooks.mjs', format: 'es', indent: false },
    external,
    plugins: [
      nodeResolve({
        jsnext: true
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
    ]
  },

  // UMD Development
  {
    input: 'src/index.js',
    output: {
      file: 'dist/graphql-hooks.js',
      format: 'umd',
      name: 'GraphQLHooks',
      indent: false
    },
    external,
    plugins: [
      nodeResolve({
        jsnext: true
      }),
      babel({
        exclude: 'node_modules/**'
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development')
      }),
      sizeSnapshot()
    ]
  },

  // UMD Production
  {
    input: 'src/index.js',
    output: {
      file: 'dist/graphql-hooks.min.js',
      format: 'umd',
      name: 'GraphQLHooks',
      indent: false
    },
    external,
    plugins: [
      nodeResolve({
        jsnext: true
      }),
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
    ]
  }
]
