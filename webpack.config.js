const path = require('path');

//  Plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CopyPlugin = require('copy-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const { ESBuildMinifyPlugin } = require('esbuild-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');
const StatikLiveReloadPlugin = require('./StatikLiveReloadPlugin');
const StatikIconSpritePlugin = require('./StatikIconSpritePlugin');
const Dotenv = require('dotenv-webpack');

const PATHS = {
  public: path.join(__dirname, 'public'),
  modules: path.join(__dirname, 'modules'),
  tailoff: path.join(__dirname, 'tailoff', '/js'),
  icons: path.join(__dirname, 'tailoff', '/icons'),
  css: path.join(__dirname, 'tailoff', '/css'),
  ejs: path.join(__dirname, 'tailoff', '/ejs'),
  templatesSite: path.join(__dirname, 'templates/_site'),
  // uncomment for multisite (see MULTISITE.MD)
  // templatesSite2: path.join(__dirname, 'templates/_site2'),
};

module.exports = (env, options) => {
  const isDevelopment = env.NODE_ENV === 'development';

  return [
    /**************************
     * Icon sprite
     **************************/
    {
      mode: env.NODE_ENV,
      entry: {
        site: getSourcePath('icons/index.js'),
      },
      output: {
        publicPath: '/',
        path: getPublicPath() + '/icon',
      },
      plugins: [
        new SVGSpritemapPlugin(`${PATHS.icons}/**/*.svg`, {
          output: {
            filename: 'sprite.[contenthash].svg',
          },
          sprite: {
            prefix: false,
            generate: {
              use: true,
              view: '-icon',
            },
          },
        }),
        new StatikIconSpritePlugin({
          filename: {
            twig: `${PATHS.templatesSite}/_snippet/_global/_iconSprite.twig`,
            css: `${PATHS.css}/site/base/icon.css`,
          },
          template: {
            twig: `${PATHS.ejs}/icon-sprite-twig.ejs`,
            css: `${PATHS.ejs}/icon-sprite-css.ejs`,
          },
        }),
        new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: ['**/*'],
        }),
      ],
      stats: 'normal',
    },
    /**************************
     * CSS and JS config
     **************************/
    {
      mode: env.NODE_ENV,
      entry: {
        site: getSourcePath('js/site.ts'),
        // uncomment for multisite (see MULTISITE.MD)
        // site2: getSourcePath('js/site2.ts'),
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
      module: {
        rules: [
          {
            test: /[\\\/]css[\\\/]site[\\\/].*\.css$/,
            include: /node_modules/,
            use: [MiniCssExtractPlugin.loader, { loader: 'css-loader', options: { url: false } }],
          },
          {
            test: /[\\\/]css[\\\/]site[\\\/].*\.css$/,
            exclude: /node_modules/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  url: false,
                  importLoaders: 1,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    config: path.resolve(__dirname, 'postcss.config.js'),
                  },
                },
              },
            ],
          },
          // uncomment for multisite (see MULTISITE.MD)
          // {
          //   test: /[\\\/]css[\\\/]site2[\\\/].*\.css$/,
          //   include: /node_modules/,
          //   use: [MiniCssExtractPlugin.loader, { loader: 'css-loader', options: { url: false } }],
          // },
          // {
          //   test: /[\\\/]css[\\\/]site2[\\\/].*\.css$/,
          //   use: [
          //     MiniCssExtractPlugin.loader,
          //     {
          //       loader: 'css-loader',
          //       options: {
          //         url: false,
          //       },
          //     },
          //     {
          //       loader: 'postcss-loader',
          //       options: {
          //         postcssOptions: {
          //           config: path.resolve(__dirname, 'postcss.config.site2.js'),
          //         },
          //       },
          //     },
          //   ],
          // },
          {
            test: /\.tsx?$/,
            loader: 'esbuild-loader',
            options: {
              loader: 'ts',
              target: 'es2015',
            },
            exclude: /node_modules/,
          },
        ],
      },

      // @ts-ignore
      plugins: [
        new Dotenv(),
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
            {
              from: getSourcePath('fonts'),
              to: getPublicPath('fonts'),
            },
          ],
        }),
        new ImageminPlugin({
          test: /\.img\.(jpe?g|png|gif)$/i,
        }),
        ...(isDevelopment
          ? [
              new StatikLiveReloadPlugin({
                protocol: 'http',
                hostname: 'localhost',
                appendScriptTag: true,
              }),
            ]
          : []),
        ...(!options.watch
          ? [
              new HtmlWebpackPlugin({
                filename: `${PATHS.templatesSite}/_snippet/_global/_headerAssets.twig`,
                template: `${PATHS.ejs}/header-site.ejs`,
                inject: false,
                files: {
                  css: [isDevelopment ? 'css/[name].css' : 'css/[name].[contenthash].css'],
                  js: 'js/[name].[contenthash].js',
                },
              }),
            ]
          : []),
        // uncomment for multisite (see MULTISITE.MD)
        // ...(!options.watch
        //   ? [
        //       new HtmlWebpackPlugin({
        //         filename: `${PATHS.templatesSite2}/_snippet/_global/_headerAssets.twig`,
        //         template: `${PATHS.ejs}/header-site2.ejs`,
        //         inject: false,
        //         files: {
        //           css: [isDevelopment ? 'css/[name].css' : 'css/[name].[contenthash].css'],
        //           js: 'js/[name].[contenthash].js',
        //         },
        //       }),
        //     ]
        //   : []),
        new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: [
            'js/**/*',
            'css/**/*',
            '!css/inert.css',
            '!css/ie.**.css',
            '!js/ie.**.js',
            'icon/site.js',
          ],
        }),
      ],
      optimization: {
        minimizer: [
          new ESBuildMinifyPlugin({
            target: ['es2015', 'safari13'], // Syntax to compile to (see options below for possible values)
            css: true,
          }),
        ],
      },
      stats: 'normal',
    },
  ];
};

function getSourcePath() {
  return path.resolve(process.env.npm_package_config_path_src, ...arguments);
}

function getPublicPath() {
  return path.resolve(process.env.npm_package_config_path_public, ...arguments);
}
