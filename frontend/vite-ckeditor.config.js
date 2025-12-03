import tailwindcss from '@tailwindcss/vite';

export default ({ command }) => ({
  base: command === 'serve' ? '' : '/frontend/craft/',
  publicDir: false,
  build: {
    emptyOutDir: true,
    assetsDir: '',
    manifest: false,
    outDir: './../public/frontend/craft/',
    rollupOptions: {
      input: {
        ckeditor: './css/site/ckeditor.css',
      },
      output: {
        assetFileNames: `[name].[ext]`,
      },
    },
  },
  plugins: [tailwindcss()],
});
