const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniExtractCss = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const DotEnv = require('dotenv-webpack');
const templateParameters = require('./src/templates/template-parameters');
const routeTemplates = require('./src/templates/route-templates');

const generateHtmlWebpackPlugins = () => {
    return Object.entries(routeTemplates).reduce(
        (acc, [, config]) => {
            if (config.output) {
                acc.push(new HtmlWebpackPlugin({
                    template: `src/templates/${config.template}`,
                    inject: false,
                    title: config.title || templateParameters.defaultTitle,
                    filename: `html/${config.output}`,
                    ...templateParameters,
                }))
            }

            return acc
        },
        [],
    )
};

module.exports = {
    MiniExtractCss: new MiniExtractCss({ filename: 'css/style.bundle.css' }),
    HtmlWebpackPlugin: generateHtmlWebpackPlugins(),
    CopyStatic: new CopyPlugin([
        { from: 'src/assets' },
    ]),
    DotEnv: new DotEnv(),
};
