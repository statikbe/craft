#!/usr/bin/env node
/**
 * Copies merge-theme.mjs into plugin/ui.html (between `// <merge>` and `// </merge>`): a Figma plugin UI is one HTML file
 * and can't load other files. Run it after changing merge-theme.mjs.
 *
 *     node tooling/figma-theme/build-ui.mjs           # updates plugin/ui.html
 *     node tooling/figma-theme/build-ui.mjs --check   # exits with 1 when plugin/ui.html is out of date
 */
import { readFileSync, writeFileSync } from 'node:fs';

const uiPath = new URL('./plugin/ui.html', import.meta.url);
const source = readFileSync(new URL('./merge-theme.mjs', import.meta.url), 'utf8')
  .split('\n')
  .filter(line => !line.startsWith('export '))
  .join('\n')
  .trim();

const ui = readFileSync(uiPath, 'utf8');
const block = /\/\/ <merge>\n[\s\S]*?\/\/ <\/merge>/;
if (!block.test(ui)) {
  console.error('plugin/ui.html has no // <merge> … // </merge> block.');
  process.exit(1);
}
const built = ui.replace(
  block,
  () => `// <merge>\n// Generated from ../merge-theme.mjs by build-ui.mjs: edit that file, then run node tooling/figma-theme/build-ui.mjs\n${source}\n// </merge>`,
);

if (process.argv.includes('--check')) {
  if (built !== ui) {
    console.error('plugin/ui.html is out of date: run node tooling/figma-theme/build-ui.mjs');
    process.exit(1);
  }
  console.log('plugin/ui.html is up to date.');
} else {
  writeFileSync(uiPath, built);
  console.log('plugin/ui.html updated.');
}
