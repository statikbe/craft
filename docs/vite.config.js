import dynamicImport from 'vite-plugin-dynamic-import';
import tailwindcss from '@tailwindcss/vite';

export default ({ command }) => ({
  root: '../',
  base: '/craft/assets/examples/',
  publicDir: false,
  build: {
    emptyOutDir: true,
    assetsDir: '',
    manifest: true,
    outDir: './docs/src/public/examples/',
    rollupOptions: {
      input: {
        docs: '../tailoff/js/site.ts',
      },
    },
  },
  plugins: [tailwindcss(), dynamicImport()],
});
