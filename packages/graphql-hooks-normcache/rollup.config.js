import generateRollupConfig from '../../config/rollup.config'

const pkg = require('./package.json')
const externalPeerDeps = [...Object.keys(pkg.peerDependencies || {})]

const overrides = {
  external: [...externalPeerDeps, 'graphql-norm', 'graphql-tag', 'tiny-lru']
}

export default generateRollupConfig('GraphQLHooksNormcache', overrides)
