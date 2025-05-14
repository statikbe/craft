import ViteRestart from 'vite-plugin-restart';
// import legacy from '@vitejs/plugin-legacy';
import mkcert from 'vite-plugin-mkcert';
import dynamicImport from 'vite-plugin-dynamic-import';
import { viteStaticCopy } from './frontend/vite/vite-plugin-statik-copy';
import tailwindcss from '@tailwindcss/vite';

export default ({ command }) => ({
  base: command === 'serve' ? '' : '/frontend/',
  publicDir: false,
  build: {
    emptyOutDir: true,
    assetsDir: '',
    manifest: true,
    outDir: './public/frontend/',
    rollupOptions: {
      input: {
        site: './frontend/js/site.ts',
      },
    },
  },
  plugins: [
    // legacy({
    //   targets: ['defaults', 'not IE 11'],
    // }),
    tailwindcss(),
    dynamicImport(),
    ViteRestart({
      reload: ['./templates/**/*'],
    }),
    mkcert(),
    viteStaticCopy({
      targets: [
        {
          src: './frontend/icons/',
          dest: '',
        },
        {
          src: './frontend/img/',
          dest: '',
        },
        {
          src: './frontend/fonts/',
          dest: '',
        },
        {
          src: './frontend/css/inert.css',
          dest: '',
        },
      ],
      watch: {
        reloadPageOnChange: true,
        copyToDest: true,
      },
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
    cors: true,
  },
});
