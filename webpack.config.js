const path = require("path");
const webpack = require("webpack");

const tailwindConf = require("./tailwind.config.js");

//  Plugins
const globby = require("globby");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ImageminPlugin = require("imagemin-webpack-plugin").default;
const CopyPlugin = require("copy-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const PurgecssPlugin = require("purgecss-webpack-plugin");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const VueLoaderPlugin = require("vue-loader/lib/plugin");

const PATHS = {
  public: path.join(__dirname, "public"),
  templates: path.join(__dirname, "templates"),
  modules: path.join(__dirname, "modules"),
  tailoff: path.join(__dirname, "tailoff", "/js"),
  favicon: path.join(__dirname, "tailoff", "/img"),
  ejs: path.join(__dirname, "tailoff", "/ejs"),
  icons: path.join(__dirname, "tailoff", "/icons")
};

module.exports = env => {
  const isDevelopment = env.NODE_ENV === "development";

  return {
    mode: env.NODE_ENV,
    entry: {
      main: getSourcePath("js/main.js")
    },
    output: {
      publicPath: "/",
      path: getPublicPath(),
      filename: "js/[name].[contenthash].js"
    },
    // resolve: {
    //   alias: {
    //     vue$: path.resolve(__dirname, "./node_modules/vue/dist/vue.esm.js")
    //   },
    //   extensions: ["*", ".js", ".vue", ".json"]
    // },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules\/(?!(@vue\/web-component-wrapper)\/).*/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/env"]
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {}
            },
            {
              loader: "css-loader",
              options: {
                url: false
              }
            },
            {
              loader: "postcss-loader",
              options: {
                ident: "postcss",
                plugins: [
                  require("postcss-import"),
                  require("postcss-nested"),
                  require("postcss-custom-properties"),
                  require("tailwindcss"),
                  require("autoprefixer")
                ]
              }
            }
          ]
        },
        {
          test: /\.font\.js/,
          use: ["css-loader", "webfonts-loader"]
        }
        // {
        //   test: /\.vue$/,
        //   loader: "vue-loader"
        // }
      ]
    },

    plugins: [
      // new webpack.ProvidePlugin({
      //   $: "jquery",
      //   jQuery: "jquery"
      // }),
      // new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: "css/[name].[contenthash].css"
      }),
      new CopyPlugin([
        {
          from: getSourcePath("img"),
          to: getPublicPath("img")
        }
      ]),
      new ImageminPlugin({
        test: /\.img\.(jpe?g|png|gif)$/i
      }),
      new Dotenv(),
      ...(!isDevelopment || env.purge
        ? [
            new PurgecssPlugin({
              paths: globby.sync(
                [
                  `${PATHS.templates}/**/*`,
                  `${PATHS.modules}/**/*`,
                  `${PATHS.tailoff}/**/*`
                ],
                { nodir: true }
              ),
              extractors: [
                {
                  extractor: class {
                    static extract(content) {
                      return content.match(/[\w-/:]+(?<!:)/g) || [];
                    }
                  },
                  extensions: [
                    "html",
                    "js",
                    "php",
                    "vue",
                    "twig",
                    "scss",
                    "css",
                    "svg",
                    "md"
                  ]
                }
              ],
              whitelistPatternsChildren: [
                /pika*/,
                /modaal/,
                /selectize/,
                /selectize-*/,
                /section*/,
                /dropdown/,
                /show/,
                /dropdown show/,
                /parsley/,
                /required/
              ]
            })
          ]
        : []),
      ...(isDevelopment
        ? [
            new BrowserSyncPlugin({
              host: "localhost",
              port: 3000,
              notify: false,
              proxy: process.env.npm_package_config_proxy,
              files: ["**/*.css", "**/*.js", "**/*.twig"]
            })
          ]
        : []),
      new HtmlWebpackPlugin({
        filename: `${PATHS.templates}/_snippet/_global/_favicon.twig`,
        template: `${PATHS.ejs}/favicon.ejs`,
        inject: false,
        files: {
          css: []
        }
      }),
      new HtmlWebpackPlugin({
        filename: `${PATHS.templates}/_snippet/_global/_header-assets.twig`,
        template: `${PATHS.ejs}/header.ejs`,
        inject: false,
        files: {
          css: ["css/[name].[contenthash].css"],
          js: ["js/[name].[contenthash].js"]
        }
      }),
      new HtmlWebpackPlugin({
        filename: `${PATHS.templates}/_snippet/_global/_footer-assets.twig`,
        template: `${PATHS.ejs}/footer.ejs`,
        inject: false,
        files: {
          js: ["js/[name].[contenthash].js"]
        }
      }),
      new FaviconsWebpackPlugin({
        logo: `${PATHS.favicon}/favicon.svg`,
        devMode: "webapp",
        cache: true,
        favicons: {
          theme_color: tailwindConf.theme.colors.primary.default
        }
      })
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
      ]
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
