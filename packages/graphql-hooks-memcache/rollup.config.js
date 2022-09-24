import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import esbuild from 'rollup-plugin-esbuild' // Used for TS transpiling
import generateRollupConfig from '../../config/rollup.config'

const pkg = require('./package.json')
const externalPeerDeps = [...Object.keys(pkg.peerDependencies || {})]

const overrides = {
  external: [...externalPeerDeps],
  plugins: [
    commonjs(),
    nodeResolve({
      jsnext: true
    }),
    esbuild(),
    babel(),
    sizeSnapshot()
  ]
}

export default generateRollupConfig({
  name: 'GraphQLHooksMemcache',
  overrides
})
