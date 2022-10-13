import { ViteFaviconsPlugin } from 'vite-plugin-favicon2';

export default ({ command }) => ({
  base: '/favicon/',
  publicDir: false,
  build: {
    emptyOutDir: true,
    assetsDir: '',
    manifest: true,
    outDir: './public/favicon/',
    rollupOptions: {
      input: {
        dummy: './dummy.js',
      },
    },
  },
  plugins: [
    ViteFaviconsPlugin({
      logo: 'tailoff/img/site/favicon.svg',
      inject: false,
      // favicons: {
      //   appName: dotenv.parsed.SYSTEM_NAME,
      //   appDescription: dotenv.parsed.SYSTEM_NAME,
      //   theme_color: tailwindConf.theme.extend.colors.primary.DEFAULT,
      // }
    }),
  ],
});
