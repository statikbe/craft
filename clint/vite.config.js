import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from '@tailwindcss/vite';

export default ({ command }) => ({
  base: '',
  publicDir: false,
  build: {
    emptyOutDir: true,
    assetsDir: '',
    manifest: true,
    outDir: './public/frontend/',
    rollupOptions: {
      input: {
        site: './src/frontend/js/site.ts',
      },
    },
  },
  plugins: [
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/frontend/img/',
          dest: '',
        },
      ],
    }),
  ],
});
