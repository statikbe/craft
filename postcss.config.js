module.exports = {
  plugins: [
    require('postcss-custom-properties'),
    require('postcss-import'),
    {
      postcssPlugin: 'grouped',
      Once(root, { result }) {
        let postcss = require('postcss');
        return postcss([require('postcss-mixins')]).process(root, result.opts);
      },
    },
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('autoprefixer'),
  ],
  browserslist: ['defaults', 'not ie < 11', 'last 3 versions', '> 1%', 'iOS 7', 'last 3 iOS versions'],
};
