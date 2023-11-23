import postcssCustomProperties from 'postcss-custom-properties';
import postcssImport from 'postcss-import';
import postcssMixins from 'postcss-mixins';
import tailwindcssNesting from 'tailwindcss/nesting/index.js';
import tailwindcss from 'tailwindcss';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    postcssCustomProperties,
    postcssImport,
    {
      postcssPlugin: 'grouped',
      Once(root, { result }) {
        return postcss([postcssMixins]).process(root, result.opts);
      },
    },
    tailwindcssNesting,
    tailwindcss,
    autoprefixer,
  ],
  browserslist: ['defaults', 'not ie < 11', 'last 3 versions', '> 1%', 'iOS 7', 'last 3 iOS versions'],
};
