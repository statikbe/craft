import dynamicImport from 'vite-plugin-dynamic-import';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

export default ({ command }) => ({
  root: '../',
  base: '/craft/examples/',
  publicDir: false,
  build: {
    emptyOutDir: true,
    assetsDir: '',
    manifest: true,
    outDir: './docs/src/public/examples/',
    rollupOptions: {
      input: {
        docs: '../frontend/js/site.ts',
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
          const cssFilePath = path.resolve(__dirname, '../frontend/css/site/main.css');
          if (fs.existsSync(cssFilePath)) {
            const cssContent = fs.readFileSync(cssFilePath, 'utf8');
            const updatedCssContent = cssContent
              .replace(/\n\/\* @source "..\/..\/..\/docs\/src"; \*\//g, '\n@source "../../../docs/src";')
              .replace(
                /\n@source "..\/..\/..\/vendor\/statikbe\/craft-cookie-banner\/src";/g,
                '\n/* @source "../../../vendor/statikbe/craft-cookie-banner/src"; */'
              )
              .replace(/\n@source "..\/..\/..\/templates\/_site";/g, '\n/* @source "../../../templates/_site"; */')
              .replace(
                "\n/* @import './components/flatpickr.css' layer(components); */",
                "\n@import './components/flatpickr.css' layer(components);"
              )
              .replace(
                "\n/* @import './components/leaflet.css' layer(components); */",
                "\n@import './components/leaflet.css' layer(components);"
              )
              .replace(
                "\n/* @import './components/masonry.css' layer(components); */",
                "\n@import './components/masonry.css' layer(components);"
              )
              .replace(
                "\n/* @import './components/range-slider.css' layer(components); */",
                "\n@import './components/range-slider.css' layer(components);"
              )
              .replace(
                "\n/* @import './components/tippy.css' layer(components); */",
                "\n@import './components/tippy.css' layer(components);"
              )
              .replace(
                '\n/* @source "../../js/components-base/ajaxSearch.component.ts"; */',
                '\n@source "../../js/components-base/ajaxSearch.component.ts";'
              )
              .replace(
                '\n/* @source "../../js/components-base/autocomplete.component.ts"; */',
                '\n@source "../../js/components-base/autocomplete.component.ts";'
              )
              .replace(
                '\n/* @source "../../js/components-base/chip.component.ts"; */',
                '\n@source "../../js/components-base/chip.component.ts";'
              )
              .replace(
                '\n/* @source "../../js/components-base/modal.component.ts"; */',
                '\n@source "../../js/components-base/modal.component.ts";'
              )
              .replace('\n/* @source "../../js/plugins/modal"; */', '\n@source "../../js/plugins/modal";')
              .replace(
                '\n/* @source "../../js/components-base/videoBackground.component.ts"; */',
                '\n@source "../../js/components-base/videoBackground.component.ts";'
              )
              .replace(
                '\n/* @source "../../js/components-base/videoToggle.component.ts"; */',
                '\n@source "../../js/components-base/videoToggle.component.ts";'
              )
              .replace(
                '\n/* @source "../../js/plugins/validation/passwordStrength.component.ts"; */',
                '\n@source "../../js/plugins/validation/passwordStrength.component.ts";'
              );
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
          const cssFilePath = path.resolve(__dirname, '../frontend/css/site/main.css');
          if (fs.existsSync(cssFilePath)) {
            const cssContent = fs.readFileSync(cssFilePath, 'utf8');
            const updatedCssContent = cssContent
              .replace(/\n@source "..\/..\/..\/docs\/src";/g, '\n/* @source "../../../docs/src"; */')
              .replace(
                /\n\/\* @source "..\/..\/..\/vendor\/statikbe\/craft-cookie-banner\/src"; \*\//g,
                '\n@source "../../../vendor/statikbe/craft-cookie-banner/src";'
              )
              .replace(/\n\/\* @source "..\/..\/..\/templates\/_site"; \*\//g, '\n@source "../../../templates/_site";')
              .replace(
                "\n@import './components/flatpickr.css' layer(components);",
                "\n/* @import './components/flatpickr.css' layer(components); */"
              )
              .replace(
                "\n@import './components/leaflet.css' layer(components);",
                "\n/* @import './components/leaflet.css' layer(components); */"
              )
              .replace(
                "\n@import './components/masonry.css' layer(components);",
                "\n/* @import './components/masonry.css' layer(components); */"
              )
              .replace(
                "\n@import './components/range-slider.css' layer(components);",
                "\n/* @import './components/range-slider.css' layer(components); */"
              )
              .replace(
                "\n@import './components/tippy.css' layer(components);",
                "\n/* @import './components/tippy.css' layer(components); */"
              )
              .replace(
                '\n@source "../../js/components-base/ajaxSearch.component.ts";',
                '\n/* @source "../../js/components-base/ajaxSearch.component.ts"; */'
              )
              .replace(
                '\n@source "../../js/components-base/autocomplete.component.ts";',
                '\n/* @source "../../js/components-base/autocomplete.component.ts"; */'
              )
              .replace(
                '\n@source "../../js/components-base/chip.component.ts";',
                '\n/* @source "../../js/components-base/chip.component.ts"; */'
              )
              .replace(
                '\n@source "../../js/components-base/modal.component.ts";',
                '\n/* @source "../../js/components-base/modal.component.ts"; */'
              )
              .replace('\n@source "../../js/plugins/modal";', '\n/* @source "../../js/plugins/modal"; */')
              .replace(
                '\n@source "../../js/components-base/videoBackground.component.ts";',
                '\n/* @source "../../js/components-base/videoBackground.component.ts"; */'
              )
              .replace(
                '\n@source "../../js/components-base/videoToggle.component.ts";',
                '\n/* @source "../../js/components-base/videoToggle.component.ts"; */'
              )
              .replace(
                '\n@source "../../js/plugins/validation/passwordStrength.component.ts";',
                '\n/* @source "../../js/plugins/validation/passwordStrength.component.ts"; */'
              );
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
