import ViteRestart from 'vite-plugin-restart';
import mkcert from 'vite-plugin-mkcert';
import { viteStaticCopy } from './tailoff/vite/vite-plugin-statik-copy';

export default ({ command }) => ({
  base: command === 'serve' ? '' : '/frontend/craft/',
  publicDir: false,
  build: {
    emptyOutDir: true,
    assetsDir: '',
    manifest: false,
    outDir: './public/frontend/craft/',
    rollupOptions: {
      input: {
        input: './tailoff/css/site/ckeditor.css',
      },
      output: {
        assetFileNames: `[name].[ext]`,
      },
    },
  },
});
