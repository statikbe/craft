import dynamicImport from 'vite-plugin-dynamic-import';

export default ({ command }) => ({
  base: '/craft/assets/examples/',
  publicDir: false,
  build: {
    emptyOutDir: true,
    assetsDir: '',
    manifest: true,
    outDir: './docs/src/assets/examples/',
    rollupOptions: {
      input: {
        docs: './tailoff/js/docs.ts',
      },
    },
  },
  plugins: [dynamicImport()],
});
