module.exports = {
    entry: {
        ui: './webAO/ui.js',
        client: './webAO/client.js'
    },
    output: {
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
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      },

    devtool: 'source-map'
}