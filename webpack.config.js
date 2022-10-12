/* eslint-env node */

const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const glob = require('glob');

// this will update the process.env with environment variables in .env file
dotenv.config();

module.exports = {
  entry: {
    ui: './webAO/ui.js',
    client: './webAO/client.ts',
    master: './webAO/master.ts',
    dom: {
      dependOn: 'client',
      import: glob.sync('./webAO/dom/*.{js,ts}')
    },
    components: glob.sync('./webAO/components/*.js'),
  },
  node: {
    global: true,
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts', '.json'],
  },
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
                    'defaults',
                    'Safari > 3',
                    'Opera > 8',
                    'Android > 3',
                  ],
                  corejs: 3,
                },
              ],
            ],
          },
        },
      },
      { test: /\.ts?$/, loader: "ts-loader" },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: "source-map-loader" },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].bundle.js',
    clean: true,
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'webAO', 'styles'), to: 'styles' },
        { from: path.resolve(__dirname, 'static') },
        { from: path.resolve(__dirname, 'webAO', 'golden'), to: 'golden' },
        { from: path.resolve(__dirname, 'webAO', 'lib'), to: 'lib' },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'public/index.html',
      chunks: ['master', 'sw'],
      title: 'Attorney Online',
    }),

    new HtmlWebpackPlugin({
      title: 'Attorney Online',
      filename: 'client.html',
      chunks: ['client', 'ui', 'dom', 'components'],
      template: 'public/client.html',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
    // new WorkboxPlugin.GenerateSW(),

  ],

};
