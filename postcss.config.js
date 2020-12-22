module.exports = {
  plugins: [
    require("postcss-mixins"),
    require("postcss-import"),
    require("postcss-nested"),
    require("postcss-custom-properties"),
    require("tailwindcss"),
    require("autoprefixer"),
  ],
  browserslist: [
    "defaults",
    "not ie < 11",
    "last 3 versions",
    "> 1%",
    "iOS 7",
    "last 3 iOS versions",
  ],
};
