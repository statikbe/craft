import dynamicImport from 'vite-plugin-dynamic-import';

export default ({ command }) => ({
  base: '/craft/assets/examples/',
  publicDir: false,
  build: {
    emptyOutDir: true,
    assetsDir: '',
    manifest: true,
    outDir: './src/assets/examples/',
    rollupOptions: {
      input: {
        site: '../tailoff/js/docs.ts',
      },
    },
  },
  plugins: [dynamicImport()],
});
