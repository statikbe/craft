module.exports = {
  plugins: [
    {
      postcssPlugin: 'grouped',
      Once(root, { result }) {
        let postcss = require('postcss');
        return postcss([
          require('postcss-mixins'),
          require('postcss-import'),
          require('postcss-custom-properties'),
        ]).process(root, result.opts);
      },
    },
    require('tailwindcss/nesting'),
    require('tailwindcss')('./tailwind.config.site2.js'),
    require('autoprefixer'),
  ],
  browserslist: ['defaults', 'not ie < 11', 'last 3 versions', '> 1%', 'iOS 7', 'last 3 iOS versions'],
};
