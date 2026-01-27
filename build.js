const webpack = require('webpack');
const config = require('./webpack.config.js');

const compiler = webpack(config);

// Keep process alive
const keepAlive = setInterval(() => {}, 1000);

compiler.run((err, stats) => {
    clearInterval(keepAlive);

    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(stats.toString({ colors: true }));
    compiler.close(() => process.exit(stats.hasErrors() ? 1 : 0));
});
