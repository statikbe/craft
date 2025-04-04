import dynamicImport from 'vite-plugin-dynamic-import';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

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
  plugins: [
    tailwindcss(),
    dynamicImport(),
    {
      name: 'rename-script',
      buildStart(options) {
        if (command === 'build') {
          console.log('Changing the css sources');
          const cssFilePath = path.resolve(__dirname, '../tailoff/css/site/main.css');
          if (fs.existsSync(cssFilePath)) {
            const cssContent = fs.readFileSync(cssFilePath, 'utf8');
            const updatedCssContent = cssContent
              .replace(/\n\/\* @source "..\/..\/..\/docs\/src"; \*\//g, '\n@source "../../../docs/src";')
              .replace(
                /\n@source "..\/..\/..\/vendor\/statikbe\/craft-cookie-banner\/src";/g,
                '\n/* @source "../../../vendor/statikbe/craft-cookie-banner/src"; */'
              )
              .replace(/\n@source "..\/..\/..\/templates\/_site";/g, '\n/* @source "../../../templates/_site"; */');
            fs.writeFileSync(cssFilePath, updatedCssContent, 'utf8');
            console.log('CSS File changed:', cssFilePath);
          } else {
            console.error('CSS file not found:', cssFilePath);
          }
        }
      },
      buildEnd() {
        if (command === 'build') {
          console.log('Changing the css sources back');
          const cssFilePath = path.resolve(__dirname, '../tailoff/css/site/main.css');
          if (fs.existsSync(cssFilePath)) {
            const cssContent = fs.readFileSync(cssFilePath, 'utf8');
            const updatedCssContent = cssContent
              .replace(/\n@source "..\/..\/..\/docs\/src";/g, '\n/* @source "../../../docs/src"; */')
              .replace(
                /\n\/\* @source "..\/..\/..\/vendor\/statikbe\/craft-cookie-banner\/src"; \*\//g,
                '\n@source "../../../vendor/statikbe/craft-cookie-banner/src";'
              )
              .replace(/\n\/\* @source "..\/..\/..\/templates\/_site"; \*\//g, '\n@source "../../../templates/_site";');
            fs.writeFileSync(cssFilePath, updatedCssContent, 'utf8');
            console.log('CSS File changed:', cssFilePath);
          } else {
            console.error('CSS file not found:', cssFilePath);
          }
        }
      },
    },
  ],
});
