import nodeResolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import generateRollupConfig, { esbuildTs } from '../../config/rollup.config'

const pkg = require('./package.json')
const externalPeerDeps = [...Object.keys(pkg.peerDependencies || {})]

const overrides = {
  external: [...externalPeerDeps],
  plugins: [
    commonjs(),
    nodeResolve({
      jsnext: true
    }),
    esbuildTs(),
    babel(),
    sizeSnapshot()
  ]
}

export default generateRollupConfig({
  name: 'GraphQLHooksMemcache',
  overrides
})
