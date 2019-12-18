const path = require('path');
const webpack = require('webpack');

//  Plugins
const globby = require('globby');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CopyPlugin = require('copy-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');

const PATHS = {
    templates: path.join(__dirname, 'templates'),
    modules: path.join(__dirname, 'modules'),
    takeoff: path.join(__dirname, 'takeoff', '/js'),
};

module.exports = env => {

    const isDevelopment = env.NODE_ENV === 'development';

    return {
        mode: env.NODE_ENV,
        entry: {
            'main': getSourcePath('js/main.js'),
            'docs': getSourcePath('js/docs.js'),
            'filter': getSourcePath('js/filter.js'),
            'modaal': getSourcePath('js/modaal.js'),
            'pikaday': getSourcePath('js/pikaday.js'),
        },
        output: {
            path: getPublicPath(),
            filename: 'js/[name].js'
        },
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/env']
                        }
                    }
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {}
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                url: false
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {}
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    use: ['css-loader']
                },
                {
                    test: /\.font\.js/,
                    use: [
                        'css-loader',
                        'webfonts-loader'
                    ]
                }
            ]
        },

        plugins: [
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].css'
            }),
            new CopyPlugin([
                {
                    from: getSourcePath('img'),
                    to: getPublicPath('img')
                },
                {
                    from: getSourcePath('docs'),
                    to: getPublicPath('docs')
                },
                {
                    from: getSourcePath('fonts'),
                    to: getPublicPath('fonts')
                }
            ]),

            new ImageminPlugin({
                test: /\.(jpe?g|png|gif|svg)$/i
            }),
            new Dotenv(),
            new PurgecssPlugin({
                    paths: globby.sync([
                        `${PATHS.templates}/**/*`,
                        `${PATHS.modules}/**/*`,
                        `${PATHS.takeoff}/**/*`,
                    ], { nodir: true }),
                extractors: [
                    {
                        extractor: class {
                            static extract(content) {
                                return content.match(/[A-Za-z0-9:@_-]+/g) || [];
                            }
                        },
                        extensions: ['html', 'js', 'php', 'vue', 'twig', 'scss', 'css', 'svg', 'md'],
                    }
                ],
                whitelistPatternsChildren: [/pika*/,/modaal/, /selectize/, /selectize-*/, /dropdown/, /show/, /dropdown show/],
            }),
        ],
        optimization: {
            minimizer: [
                new TerserJSPlugin({
                    terserOptions: {
                        output: {
                            comments: false
                        }
                    }
                }),
                new OptimizeCSSAssetsPlugin()
            ],
        },

        stats: {
            children: false
        }
    };
};

function getSourcePath() {

    return path.resolve(process.env.npm_package_config_path_src, ...arguments);
}

function getPublicPath() {

    return path.resolve(process.env.npm_package_config_path_public, ...arguments);
}
