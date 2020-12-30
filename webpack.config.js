var path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('webpack-uglify-harmony-plugin')

const dotenv = require("dotenv")
dotenv.config()

module.exports = (env, argv) => {
  let production = (argv.mode === "production")

  return {
    entry: './index.js',
    output: {
      path: path.resolve(__dirname, './dist'),
      publicPath: '/dist/',
      filename: '[name].bundle.js'
    },
    context: path.resolve(__dirname, './app'),
    module: {
      rules: [
        {
          test: /\.s(c|a)ss$/,
          use: [
            'vue-style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                sourceMap: !production
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader'
          ],
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {}
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]'
          }
        }
      ]
    },
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': path.resolve('app/')
      },
      extensions: ['*', '.js', '.vue', '.json']
    },
    devServer: {
      historyApiFallback: true,
      noInfo: false,
      overlay: true,
      publicPath: '/dist',
      open: true,
      hot: true,
      proxy: {
        "/apiql": {
          target: `http://localhost:${process.env.PORT}`
        },
        "/api/*": {
          target: `http://localhost:${process.env.PORT}`
        },
        '/ws': {
          target: `ws://localhost:${process.env.PORT}`,
          ws: true
        },
      }
    },
    performance: {
      hints: false
    },
    optimization: {
      minimizer: production ? [
        new OptimizeCssAssetsPlugin({
          cssProcessorPluginOptions: {
            preset: [
              'default',
              { discardComments: { removeAll: true } }
            ],
          }
        }),
        new UglifyJsPlugin({
          test: /\.js(\?.*)?$/i,
          cache: true,
          parallel: true,
          sourceMap: !production
        })
      ] : []
    },
    devtool: false,
    target: 'web',
    cache: { type: 'memory' },
    plugins: [
      new VueLoaderPlugin()
    ]
  }
}