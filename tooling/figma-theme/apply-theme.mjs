#!/usr/bin/env node
/**
 * Applies a Figma theme export (JSON from the Theme export plugin or the exporting-figma-theme skill) to theme.css.
 * The plugin can also download theme.css itself; both use merge-theme.mjs.
 *
 *     node tooling/figma-theme/apply-theme.mjs figma-theme.json             # shows what would change
 *     node tooling/figma-theme/apply-theme.mjs figma-theme.json --write     # changes theme.css
 *     options: --css <path> (default frontend/css/site/theme.css), --add-missing (add tokens theme.css doesn't have)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mergeTheme } from './merge-theme.mjs';

const args = process.argv.slice(2);
const jsonPath = args.find(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--css');
if (!jsonPath) {
  console.error('Usage: node tooling/figma-theme/apply-theme.mjs <figma-theme.json> [--write] [--add-missing] [--css <theme.css>]');
  process.exit(1);
}
const cssPath = resolve(args.includes('--css') ? args[args.indexOf('--css') + 1] : 'frontend/css/site/theme.css');
const write = args.includes('--write');
const addMissing = args.includes('--add-missing');

const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
let result;
try {
  result = mergeTheme(readFileSync(cssPath, 'utf8'), data, { addMissing });
} catch (e) {
  console.error(`${cssPath}: ${e.message}`);
  process.exit(1);
}
const { changes, unchanged, skipped, missing, notes } = result;

// --- Report ---
const pad = (s, n) => (s.length >= n ? s : s + ' '.repeat(n - s.length));
console.log(`\nFigma file "${data.file}", Theme mode "${data.theme}", exported ${data.exportedAt}`);
console.log(`${cssPath}\n`);
if (changes.length) {
  console.log(`Changes (${changes.length}):`);
  const width = Math.min(44, Math.max(...changes.map(c => c.name.length)));
  for (const c of changes) console.log(`  ${pad(c.name, width)}  ${c.old}  →  ${c.value}${c.where !== '@theme' ? `   (${c.where})` : ''}`);
} else {
  console.log('No changes: theme.css already matches Figma.');
}
console.log(`\nUnchanged: ${unchanged.length}`);
if (skipped.length) {
  console.log(`\nSkipped (${skipped.length}), Figma only approximates these:`);
  for (const s of skipped) console.log(`  ${s.name}: ${s.reason}`);
}
if (missing.length) {
  console.log(`\n${addMissing ? 'Added' : 'Not in theme.css'} (${missing.length})${addMissing ? '' : ', add them with --add-missing or by hand'}:`);
  for (const m of missing) console.log(`  ${m.name}: ${m.value}   (${m.figma})`);
}
if (notes.length) {
  console.log('\nNotes:');
  for (const n of notes) console.log(`  - ${n}`);
}
if (write) {
  writeFileSync(cssPath, result.css);
  console.log(`\nWritten to ${cssPath}.`);
} else {
  console.log('\nDry run: nothing written. Add --write to change theme.css.');
}
