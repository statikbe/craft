import ViteRestart from 'vite-plugin-restart';
// import legacy from '@vitejs/plugin-legacy';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default ({ command }) => ({
  base: command === 'serve' ? '' : '/frontend-site2/',
  publicDir: false,
  build: {
    emptyOutDir: true,
    assetsDir: '',
    manifest: true,
    outDir: './public/frontend-site2/',
    css: {
      postcss: './postcss.config.site2.js',
    },
    rollupOptions: {
      input: {
        site: './tailoff/js/site2.ts',
      },
    },
  },
  css: {
    postcss: {
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
        require('tailwindcss')('./tailwind.config.site2.js'),
        require('autoprefixer'),
      ],
      browserslist: ['defaults', 'not ie < 11', 'last 3 versions', '> 1%', 'iOS 7', 'last 3 iOS versions'],
    },
  },
  plugins: [
    // legacy({
    //   targets: ['defaults', 'not IE 11'],
    // }),
    ViteRestart({
      reload: ['./templates/**/*'],
    }),
    basicSsl(),
    viteStaticCopy({
      targets: [
        {
          src: './tailoff/icons/',
          dest: '',
        },
        {
          src: './tailoff/img/',
          dest: '',
        },
        {
          src: './tailoff/fonts/',
          dest: '',
        },
        {
          src: './tailoff/css/inert.css',
          dest: '',
        },
      ],
    }),
  ],
  server: {
    fs: {
      strict: false,
    },
    origin: 'https://localhost:3000',
    host: '0.0.0.0',
    port: 3000,
    https: true,
    strictPort: true,
  },
});
