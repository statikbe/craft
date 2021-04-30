const path = require('path');
const webpack = require('webpack');

const tailwindConf = require('./tailwind.config.js');
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });

//  Plugins
const globby = require('globby');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CopyPlugin = require('copy-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');
const { NONAME } = require('dns');

const PATHS = {
  public: path.join(__dirname, 'public'),
  templates: path.join(__dirname, 'templates'),
  modules: path.join(__dirname, 'modules'),
  tailoff: path.join(__dirname, 'tailoff', '/js'),
  icons: path.join(__dirname, 'tailoff', '/icons'),
  ejs: path.join(__dirname, 'tailoff', '/ejs'),
};

module.exports = (env) => {
  const isDevelopment = env.NODE_ENV === 'development';

  return [
    {
      mode: env.NODE_ENV,
      entry: {
        main: getSourcePath('js/main.ts'),
        // extra: getSourcePath("js/extraComponent.ts"),
      },
      output: {
        publicPath: '/',
        path: getPublicPath(),
        filename: isDevelopment ? 'js/[name].js' : 'js/[name].[contenthash].js',
      },
      resolve: {
        extensions: ['*', '.tsx', '.ts', '.js', '.json'],
        alias: {
          'wicg-inert': path.resolve('./node_modules/wicg-inert/dist/inert'),
        },
      },
      devtool: false,
      // devtool: "inline-source-map",
      module: {
        rules: [
          // {
          //   test: /\.m?js$/,
          //   exclude: /node_modules\/(?!(@vue\/web-component-wrapper)\/).*/,
          //   use: {
          //     loader: 'babel-loader',
          //     options: {
          //       presets: ['@babel/env'],
          //     },
          //   },
          // },
          {
            test: /\.css$/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  url: false,
                },
              },
              {
                loader: 'postcss-loader',
              },
            ],
          },
          // {
          //   test: /\.font\.js/,
          //   use: ['css-loader', 'webfonts-loader'],
          // },
          {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
        ],
      },

      plugins: [
        new MiniCssExtractPlugin({
          filename: isDevelopment ? 'css/[name].css' : 'css/[name].[contenthash].css',
        }),
        new CopyPlugin({
          patterns: [
            {
              from: getSourcePath('img'),
              to: getPublicPath('img'),
            },
            {
              from: getSourcePath('css/inert.css'),
              to: getPublicPath('css/inert.css'),
            },
          ],
        }),
        new ImageminPlugin({
          test: /\.img\.(jpe?g|png|gif)$/i,
        }),
        new SVGSpritemapPlugin(`${PATHS.icons}/**/*.svg`, {
          output: {
            filename: 'icon/sprite.svg',
          },
          sprite: {
            prefix: false,
            generate: {
              use: true,
              view: '-icon',
            },
          },
        }),
        new Dotenv(),
        // ...(!isDevelopment || env.purge
        //   ? [
        //       new PurgecssPlugin({
        //         paths: globby.sync(
        //           [
        //             `${PATHS.templates}/**/*`,
        //             `${PATHS.modules}/**/*`,
        //             `${PATHS.tailoff}/**/*`,
        //             `!${PATHS.templates}/jsPlugins/**/*`,
        //           ],
        //           { nodir: true }
        //         ),
        //         extractors: [
        //           {
        //             extractor: (content) => {
        //               return content.match(/[\w-/:]+(?<!:)/g) || [];
        //             },
        //             extensions: ['html', 'js', 'php', 'vue', 'twig', 'scss', 'css', 'svg', 'md'],
        //           },
        //         ],
        //       }),
        //     ]
        //   : []),
        ...(isDevelopment
          ? [
              new BrowserSyncPlugin({
                host: 'localhost',
                port: 3000,
                notify: false,
                proxy: process.env.npm_package_config_proxy,
                files: ['public/**/*.css', 'public/**/*.js', '**/*.twig'],
              }),
            ]
          : []),
        new HtmlWebpackPlugin({
          filename: `${PATHS.templates}/_snippet/_global/_header-assets.twig`,
          template: `${PATHS.ejs}/header.ejs`,
          inject: false,
          files: {
            css: [isDevelopment ? 'css/[name].css' : 'css/[name].[contenthash].css'],
            js: [isDevelopment ? 'js/[name].js' : 'js/[name].[contenthash].js'],
          },
        }),
        new CleanWebpackPlugin({
          // dry: true,
          // verbose: true,
          cleanOnceBeforeBuildPatterns: ['js/**/*', 'css/**/*', '!css/inert.css', '!css/ie.**.css', '!js/ie.**.js'],
        }),
      ],
      optimization: {
        minimizer: [
          new TerserJSPlugin({
            terserOptions: {
              output: {
                comments: false,
              },
            },
          }),
          new CssMinimizerPlugin(),
        ],
      },
      stats: 'normal',
    },
    /**************************
     * IE 11 CSS and JS config
     **************************/
    {
      mode: env.NODE_ENV,
      entry: {
        ie: getSourcePath('js/ie.ts'),
      },
      target: ['web', 'es5'],
      devtool: false,
      output: {
        publicPath: '/',
        path: getPublicPath(),
        filename: 'js/[name].[contenthash].js',
      },
      resolve: {
        extensions: ['*', '.tsx', '.ts', '.js', '.json'],
        alias: {
          'wicg-inert': path.resolve('./node_modules/wicg-inert/dist/inert'),
        },
      },
      module: {
        rules: [
          {
            test: /\.css$/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  url: false,
                },
              },
              {
                loader: 'postcss-loader',
              },
            ],
          },
          {
            test: /\.tsx?$/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  configFile: 'tsconfig.ie.json',
                },
              },
            ],
            exclude: /node_modules/,
          },
        ],
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash].css',
        }),
        new HtmlWebpackPlugin({
          filename: `${PATHS.templates}/_snippet/_global/_header-ie-assets.twig`,
          template: `${PATHS.ejs}/header-ie.ejs`,
          inject: false,
          files: {
            css: ['css/[name].[contenthash].css'],
            js: ['js/[name].[contenthash].js'],
          },
        }),
        new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: ['css/ie.**.css', 'js/ie.**.js'],
        }),
      ],
      optimization: {
        minimizer: [
          new TerserJSPlugin({
            terserOptions: {
              output: {
                comments: false,
              },
            },
          }),
          new CssMinimizerPlugin(),
        ],
      },
      stats: 'minimal',
    },
  ];
};

function getSourcePath() {
  return path.resolve(process.env.npm_package_config_path_src, ...arguments);
}

function getPublicPath() {
  return path.resolve(process.env.npm_package_config_path_public, ...arguments);
}
