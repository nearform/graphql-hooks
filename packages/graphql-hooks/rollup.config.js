import babel from 'rollup-plugin-babel'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'

import generateRollupConfig from '../../config/rollup.config'

export default generateRollupConfig('GraphQLHooks').concat({
  input: 'src/middlewares/apqMiddleware.js',
  output: {
    file: `lib/middlewares/apqMiddleware.js`,
    format: 'cjs',
    indent: false
  },
  plugins: [babel(), sizeSnapshot()]
})
