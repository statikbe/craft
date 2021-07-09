const path = require('path');

const tailwindConf = require('./tailwind.config.site2.js');
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });

//  Plugins
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
  public: path.join(__dirname, 'public'),
  templates: path.join(__dirname, 'templates/_site2'),
  favicon: path.join(__dirname, 'tailoff', '/img/site2'),
  ejs: path.join(__dirname, 'tailoff', '/ejs'),
};

module.exports = (env) => {
  return {
    mode: 'production',
    entry: {},
    output: {
      publicPath: '/',
      path: `${PATHS.public}`,
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: `${PATHS.templates}/_snippet/_global/_favicon.twig`,
        template: `${PATHS.ejs}/favicon.ejs`,
        inject: false,
        files: {
          css: [],
        },
      }),
      new FaviconsWebpackPlugin({
        logo: `${PATHS.favicon}/favicon.svg`,
        devMode: 'webapp',
        cache: true,
        prefix: 'assets/site2/',
        outputPath: 'assets/site2',
        favicons: {
          appName: dotenv.parsed.SYSTEM_NAME,
          appDescription: dotenv.parsed.SYSTEM_NAME,
          theme_color: tailwindConf.theme.colors.primary.default,
        },
      }),
    ],
  };
};
