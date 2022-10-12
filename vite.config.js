import ViteRestart from 'vite-plugin-restart';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default ({ command }) => ({
  // base: command === 'serve' ? '' : '/public/frontend/',
  build: {
    emptyOutDir: false,
    manifest: true,
    outDir: './public/',
    rollupOptions: {
      input: {
        site: './tailoff/js/site.ts',
      },
      output: {
        dir: './public/frontend/',
      },
    },
  },
  plugins: [
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
