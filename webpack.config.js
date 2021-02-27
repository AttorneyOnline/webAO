/* eslint-env node */

const path = require('path');

module.exports = {
    entry: {
        ui: './webAO/ui.js',
        client: './webAO/client.js',
        master: './webAO/master.js'
    },
    output: {
        path: path.resolve(__dirname, 'webAO'),
        filename: '[name].b.js'
    },
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

    devtool: 'source-map',
    mode: 'production'
};