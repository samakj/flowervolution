var path = require('path');

module.exports = {
    alias: {
        '@flowervolution': path.join(__dirname, 'src'),
        '@flowervolution/public': path.join(__dirname, 'public'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: ['node_modules', path.resolve(__dirname, 'src')],
};
