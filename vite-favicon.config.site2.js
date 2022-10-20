import { defineConfig, loadEnv } from 'vite';
import { ViteFaviconsPlugin } from 'vite-plugin-favicon2';
const tailwindConf = require('./tailwind.config.js');

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/favicon/site2/',
    publicDir: false,
    build: {
      emptyOutDir: true,
      assetsDir: '',
      manifest: true,
      outDir: './public/favicon/site2/',
      rollupOptions: {
        input: {
          dummy: './dummy.js',
        },
      },
    },
    plugins: [
      ViteFaviconsPlugin({
        logo: 'tailoff/img/site2/favicon.svg',
        inject: false,
        favicons: {
          appName: env.SYSTEM_NAME,
          appDescription: env.SYSTEM_NAME,
          theme_color: tailwindConf.theme.extend.colors.primary.DEFAULT,
        },
      }),
    ],
  };
});
