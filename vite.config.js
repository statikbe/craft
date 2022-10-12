import ViteRestart from 'vite-plugin-restart';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { ViteFaviconsPlugin } from 'vite-plugin-favicon2';

export default ({ command }) => ({
  base: command === 'serve' ? '' : '/public/',
  build: {
    manifest: true,
    outDir: './public/dist/',
    rollupOptions: {
      input: {
        app: './tailoff/js/site.ts',
      },
      plugins: [
        ViteFaviconsPlugin({
          logo: 'tailoff/img/site/favicon.svg',
          // favicons: {
          //   appName: dotenv.parsed.SYSTEM_NAME,
          //   appDescription: dotenv.parsed.SYSTEM_NAME,
          //   theme_color: tailwindConf.theme.extend.colors.primary.DEFAULT,
          // }
        }),
      ],
    },
  },
  plugins: [
    ViteRestart({
      reload: ['./templates/**/*'],
    }),
    basicSsl(),
    // ViteFaviconsPlugin({
    //   logo: 'tailoff/img/site/favicon.svg',
    //   // favicons: {
    //   //   appName: dotenv.parsed.SYSTEM_NAME,
    //   //   appDescription: dotenv.parsed.SYSTEM_NAME,
    //   //   theme_color: tailwindConf.theme.extend.colors.primary.DEFAULT,
    //   // }
    // }),
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
