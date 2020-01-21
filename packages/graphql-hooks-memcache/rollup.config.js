import generateRollupConfig from '../../config/rollup.config'

const pkg = require('./package.json')
const externalPeerDeps = [...Object.keys(pkg.peerDependencies || {})]

const overrides = {
  external: [...externalPeerDeps, '@sindresorhus/fnv1a', 'tiny-lru']
}

export default generateRollupConfig('GraphQLHooksMemcache', overrides)
