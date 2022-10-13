import ViteRestart from 'vite-plugin-restart';
// import legacy from '@vitejs/plugin-legacy';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default ({ command }) => ({
  base: command === 'serve' ? '' : '/public/frontend/',
  publicDir: false,
  build: {
    emptyOutDir: true,
    assetsDir: '',
    manifest: true,
    outDir: './public/frontend/',
    rollupOptions: {
      input: {
        site: './tailoff/js/site.ts',
      },
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
