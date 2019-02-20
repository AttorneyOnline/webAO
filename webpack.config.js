module.exports = {
    entry: {
        ui: './webAO/ui.js',
        fingerprint: './webAO/fingerprint.js',
        client: './webAO/client.js'
    },
    output: {
        filename: '[name].b.js'
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015']
                    }
                }
            }
        ]
    },

    devtool: 'source-map'
}