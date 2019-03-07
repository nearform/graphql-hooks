const path = require('path')
const merge = require('webpack-merge')
const ManifestPlugin = require('webpack-manifest-plugin')

const PATHS = {
  build: path.join(__dirname, 'build'),
  src: path.join(__dirname, 'src'),
  node_modules: path.join(__dirname, 'node_modules')
}

const commonConfig = {
  entry: {
    'app-shell': path.join(PATHS.src, 'client/js/app-shell.js')
  },
  devtool: '#cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            [
              '@babel/preset-env',
              {
                targets: '> 5%, not dead'
              }
            ],
            '@babel/preset-react'
          ],
          plugins: [
            '@babel/plugin-proposal-object-rest-spread',
            'dynamic-import-node'
          ]
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [PATHS.src, 'node_modules'],
    symlinks: false
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: '/js/',
    path: path.join(PATHS.build, 'public/js')
  },
  plugins: [new ManifestPlugin()]
}

const productionConfig = {
  mode: 'production',
  optimization: {
    minimize: false
  },
  output: {
    filename: '[chunkhash].[name].js',
    chunkFilename: '[chunkhash].[name].js',
    publicPath: '/js/',
    path: path.join(PATHS.build, 'public/js')
  }
}

const developmentConfig = {
  mode: 'development'
}

module.exports = () => {
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'staging'
  ) {
    return merge(commonConfig, productionConfig)
  }

  return merge(commonConfig, developmentConfig)
}
