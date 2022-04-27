import babel from 'rollup-plugin-babel'
import esbuild from 'rollup-plugin-esbuild' // Used for TS transpiling
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'

import generateRollupConfig from '../../config/rollup.config'

export default generateRollupConfig({
  name: 'GraphQLHooks',
  entryPoint: 'src/index.ts'
}).concat({
  input: 'src/middlewares/apqMiddleware.ts',
  output: {
    file: 'lib/middlewares/apqMiddleware.js',
    format: 'cjs',
    indent: false
  },
  plugins: [esbuild(), babel(), sizeSnapshot()]
})
