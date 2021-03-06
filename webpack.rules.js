var path = require('path');
var MCEP = require('mini-css-extract-plugin');

module.exports = {
    ts: {
        test: /\.tsx?$/,
        use: [
            {
                loader: 'awesome-typescript-loader',
            },
            {
                loader: 'tslint-loader',
            },
        ],
        include: path.join(__dirname, 'src'),
        exclude: /node_modules/,
    },
    js: {
        test: /\.jsx?$/,
        use: [
            {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                },
            },
            {
                loader: 'source-map-loader',
            },
        ],
        include: path.join(__dirname, 'src'),
        exclude: /node_modules/,
    },
    scss: {
        test: /\.(sc|c)ss$/,
        use: [
            { loader: MCEP.loader, options: { url: false } },
            { loader: 'css-loader', options: { url: false } },
            {
                loader: 'sass-loader',
            },
        ],
        include: path.join(__dirname, 'src'),
        exclude: /node_modules/,
    },
};
