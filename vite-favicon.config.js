import { ViteFaviconsPlugin } from 'vite-plugin-favicon2';

export default ({ command }) => ({
  base: '',
  build: {
    manifest: false,
    outDir: './public/favicon/',
    rollupOptions: {
      input: {
        dummy: './dummy.js',
      },
      output: {
        dir: './public/favicon/',
      },
    },
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
});
