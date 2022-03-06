/* eslint-env node */

const path = require('path');
const dotenv = require('dotenv')
const webpack = require('webpack')

// this will update the process.env with environment variables in .env file
dotenv.config();

module.exports = {
  entry: {
    ui: './webAO/ui.js',
    client: './webAO/client.js',
    master: './webAO/master.js'
  },
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'webAO'),
    },
    compress: true,
    port: 8080,
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env', {
                  useBuiltIns: 'usage',
                  targets: [
                    "defaults",
                    "Safari > 3",
                    "Opera > 8",
                    "Android > 3"
                  ],
                  corejs: 3
                }
              ]
            ]
          }
        }
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'webAO'),
    filename: '[name].b.js'
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }, 
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  ],

};
