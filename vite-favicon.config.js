import { defineConfig, loadEnv } from "vite";
import { ViteFaviconsPlugin } from "vite-plugin-favicon2";
const tailwindConf = require("./tailoff/css/site/tailwind.config.js");

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "/favicon/site/",
    publicDir: false,
    build: {
      emptyOutDir: true,
      assetsDir: "",
      manifest: true,
      outDir: "./public/favicon/site/",
      rollupOptions: {
        input: {
          dummy: "./dummy.js",
        },
      },
    },
    plugins: [
      ViteFaviconsPlugin({
        logo: "tailoff/img/site/favicon.svg",
        inject: false,
        favicons: {
          appName: env.SYSTEM_NAME,
          appDescription: env.SYSTEM_NAME,
          theme_color: tailwindConf.default.theme.extend.colors.primary.DEFAULT,
        },
      }),
    ],
  };
});
