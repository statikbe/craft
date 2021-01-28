const path = require("path");
const webpack = require("webpack");

const tailwindConf = require("./tailwind.config.js");
const dotenv = require("dotenv").config({ path: __dirname + "/.env" });

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
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const SVGSpritemapPlugin = require("svg-spritemap-webpack-plugin");
// const VueLoaderPlugin = require("vue-loader/lib/plugin");

const PATHS = {
  public: path.join(__dirname, "public"),
  templates: path.join(__dirname, "templates"),
  modules: path.join(__dirname, "modules"),
  tailoff: path.join(__dirname, "tailoff", "/js"),
  icons: path.join(__dirname, "tailoff", "/icons"),
  ejs: path.join(__dirname, "tailoff", "/ejs"),
};

module.exports = (env) => {
  const isDevelopment = env.NODE_ENV === "development";

  return {
    mode: env.NODE_ENV,
    entry: {
      main: getSourcePath("js/main.ts"),
      // extra: getSourcePath("js/extraComponent.ts"),
    },
    output: {
      publicPath: "/",
      path: getPublicPath(),
      filename: "js/[name].[contenthash].js",
    },
    // resolve: {
    //   alias: {
    //     vue$: path.resolve(__dirname, "./node_modules/vue/dist/vue.esm.js")
    //   },
    //   extensions: ["*", ".js", ".vue", ".json"]
    // },
    resolve: {
      extensions: ["*", ".tsx", ".ts", ".js", ".json"],
      alias: {
        "wicg-inert": path.resolve("./node_modules/wicg-inert/dist/inert"),
      },
    },
    devtool: "inline-source-map",
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules\/(?!(@vue\/web-component-wrapper)\/).*/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/env"],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {},
            },
            {
              loader: "css-loader",
              options: {
                url: false,
              },
            },
            {
              loader: "postcss-loader",
              // options: {
              //   ident: "postcss",
              //   plugins: [
              //     require("postcss-import"),
              //     require("postcss-mixins"),
              //     require("postcss-nested"),
              //     require("postcss-custom-properties"),
              //     require("tailwindcss"),
              //     require("autoprefixer"),
              //   ],
              // },
            },
          ],
        },
        {
          test: /\.font\.js/,
          use: ["css-loader", "webfonts-loader"],
        },
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        // {
        //   test: /\.vue$/,
        //   loader: "vue-loader"
        // }
      ],
    },

    plugins: [
      // new webpack.ProvidePlugin({
      //   $: "jquery",
      //   jQuery: "jquery"
      // }),
      // new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: "css/[name].[contenthash].css",
      }),
      new CopyPlugin([
        {
          from: getSourcePath("img"),
          to: getPublicPath("img"),
        },
        {
          from: getSourcePath("css/inert.css"),
          to: getPublicPath("css/inert.css"),
        },
      ]),
      new ImageminPlugin({
        test: /\.img\.(jpe?g|png|gif)$/i,
      }),
      new SVGSpritemapPlugin(`${PATHS.icons}/**/*.svg`, {
        output: {
          filename: "icon/sprite.svg",
        },
        sprite: {
          prefix: false,
          generate: {
            use: true,
            view: "-icon",
          },
        },
      }),
      new Dotenv(),
      ...(!isDevelopment || env.purge
        ? [
            new PurgecssPlugin({
              paths: globby.sync(
                [
                  `${PATHS.templates}/**/*`,
                  `${PATHS.modules}/**/*`,
                  `${PATHS.tailoff}/**/*`,
                  `!${PATHS.templates}/jsPlugins/**/*`,
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
                    "md",
                  ],
                },
              ],
              whitelistPatternsChildren: [
                /btn*/,
                /flatpickr*/,
                /pika*/,
                /modaal/,
                /selectize/,
                /selectize-*/,
                /section*/,
                /dropdown/,
                /show/,
                /dropdown show/,
                /parsley/,
                /required/,
              ],
            }),
          ]
        : []),
      ...(isDevelopment
        ? [
            new BrowserSyncPlugin({
              host: "localhost",
              port: 3000,
              notify: false,
              proxy: process.env.npm_package_config_proxy,
              files: ["**/*.css", "**/*.js", "**/*.twig"],
            }),
          ]
        : []),
      new HtmlWebpackPlugin({
        filename: `${PATHS.templates}/_snippet/_global/_header-assets.twig`,
        template: `${PATHS.ejs}/header.ejs`,
        inject: false,
        files: {
          css: ["css/[name].[contenthash].css"],
          js: ["js/[name].[contenthash].js"],
        },
      }),
      new HtmlWebpackPlugin({
        filename: `${PATHS.templates}/_snippet/_global/_footer-assets.twig`,
        template: `${PATHS.ejs}/footer.ejs`,
        inject: false,
        files: {
          js: ["js/[name].[contenthash].js"],
        },
      }),
      new CleanWebpackPlugin({
        // dry: true,
        // verbose: true,
        cleanOnceBeforeBuildPatterns: [
          "**/*",
          "!index.php",
          "!.htaccess",
          "!**/.gitignore",
          "!files",
          "!files/**/*",
          "!img",
          "!img/**/*",
          "!css/inert.css",
          "!assets",
          "!assets/**/*",
          "!cpresources",
          "!cpresources/**/*",
        ],
        cleanAfterEveryBuildPatterns: [
          "!img",
          "!img/**/*",
          "!fonts",
          "!fonts/**/*",
          "!css/inert.css",
        ],
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
        new OptimizeCSSAssetsPlugin(),
      ],
    },

    stats: {
      children: false,
    },
  };
};

function getSourcePath() {
  return path.resolve(process.env.npm_package_config_path_src, ...arguments);
}

function getPublicPath() {
  return path.resolve(process.env.npm_package_config_path_public, ...arguments);
}
