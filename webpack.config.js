const path = require('path');
const plugins = require('./webpack.plugins');
const rules = require('./webpack.rules');
const resolve = require('./webpack.resolve');

module.exports = [
    {
        resolve,
        mode: 'development',
        output: {
            path: path.join(__dirname, 'public'),
            chunkFilename: 'js/[name].bundle.js',
            filename: 'js/[name].bundle.js',
        },
        plugins: [...plugins.HtmlWebpackPlugin, plugins.MiniExtractCss, plugins.CopyStatic, plugins.DotEnv],
        module: {
            rules: [rules.ts, rules.js, rules.scss],
        },
        devtool: 'source-map',
        entry: [path.join(__dirname, 'src', 'index.ts')],
        target: 'web',
        name: 'client',
        stats: {
            children: false,
            colors: true,
        },
        optimization: {
            nodeEnv: 'development',
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'initial',
                    },
                },
            },
        },
    },
];
