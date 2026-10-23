#!/usr/bin/env node
/**
 * Applies a Figma theme export (the Theme export plugin, or the exporting-figma-theme skill) to theme.css.
 *
 *     node tooling/figma-theme/apply-theme.mjs figma-theme.json             # shows what would change
 *     node tooling/figma-theme/apply-theme.mjs figma-theme.json --write     # changes theme.css
 *     options: --css <path> (default frontend/css/site/theme.css), --add-missing (add tokens theme.css doesn't have)
 *
 * Figma is the source of truth: every token with a CSS name gets Figma's value, also where theme.css had a formula.
 * Tokens Figma only approximates (SKIP) are left alone and reported.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SKIP = {
  '--container-md': 'Figma has the container width per breakpoint; the CSS containers are set in main.css',
  '--width-form': 'Figma has a fixed width; CSS uses a fraction of the column (calc(100% * 2 / 3))',
  '--height-hero-medium': 'Figma uses pixels for the screen height; CSS uses svh',
  '--height-hero-full': 'Figma uses pixels for the screen height; CSS uses svh',
};
// Responsive overrides in @layer theme: these variants get the Tablet value, the rest the Desktop value
const TABLET_VARIANTS = ['xs', 'sm', 'md'];
const NEW_TABLET_VARIANT = 'md';
const NEW_DESKTOP_VARIANT = 'lg';

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
if (data.format !== 'statik-figma-theme/1') {
  console.error(`Unknown format "${data.format}": export again with the Theme export plugin.`);
  process.exit(1);
}
const lines = readFileSync(cssPath, 'utf8').split('\n');

// --- Read theme.css: declarations in @theme, and per @variant inside @layer theme ---
const theme = new Map(); // name -> line index
const variants = new Map(); // variant -> { close: line index, decls: Map(name -> line index) }
let themeClose = -1;
let layerRootClose = -1;
const stack = [];
lines.forEach((line, i) => {
  const decl = line.match(/^\s*(--[\w-]+)\s*:/);
  const context = stack.map(s => s.label);
  if (decl) {
    if (context.length === 1 && context[0] === '@theme') theme.set(decl[1], i);
    const variant = context.length === 3 && context[0] === '@layer theme' && context[2].startsWith('@variant ') ? context[2].slice(9) : null;
    if (variant) variants.get(variant).decls.set(decl[1], i);
  }
  for (const ch of line.replace(/\/\*.*?\*\//g, '')) {
    if (ch === '{') {
      const label = line.slice(0, line.indexOf('{')).trim();
      stack.push({ label });
      if (stack.length === 3 && stack[0].label === '@layer theme' && label.startsWith('@variant ')) variants.set(label.slice(9), { close: -1, decls: new Map() });
    } else if (ch === '}') {
      const closed = stack.pop();
      const depth = stack.length;
      if (closed && depth === 0 && closed.label === '@theme') themeClose = i;
      if (closed && depth === 1 && stack[0].label === '@layer theme' && closed.label === ':root') layerRootClose = i;
      if (closed && depth === 2 && closed.label.startsWith('@variant ')) variants.get(closed.label.slice(9)).close = i;
    }
  }
});
if (themeClose < 0) {
  console.error(`No @theme block found in ${cssPath}.`);
  process.exit(1);
}

// --- Values ---
const valueOf = i => lines[i].replace(/^\s*--[\w-]+\s*:\s*/, '').replace(/;\s*(\/\*.*\*\/)?\s*$/, '').trim();
const formatNumber = (name, px) => {
  if (px === null || px === undefined) return null;
  if (px >= 999) return 'calc(infinity * 1px)';
  if (/^--(spacing|radius)-/.test(name) && Number.isInteger(px / 4)) return `--spacing(${px / 4})`;
  return `${Math.round(px * 100) / 100}px`;
};
const formatFont = (family, current) => {
  const generic = /^(serif|sans-serif|monospace|system-ui|cursive)$/;
  const fallback = current && current.includes(',') ? current.slice(current.indexOf(',') + 1).trim() : current && generic.test(current) ? current : 'sans-serif';
  return `"${family}", ${fallback}`;
};
const format = (token, raw, current) => {
  if (raw && typeof raw === 'object' && raw.alias) return `var(${raw.alias})`;
  const value = raw && typeof raw === 'object' ? raw.value : raw;
  if (value === null || value === undefined) return null;
  if (token.type === 'COLOR') return value;
  if (token.type === 'FLOAT') return formatNumber(token.name, value);
  if (token.type === 'STRING' && token.name.startsWith('--font-')) return formatFont(value, current);
  return String(value);
};

// --- Plan the changes ---
const replace = new Map(); // line index -> new value
const inserts = []; // { at, text }
const changes = [];
const unchanged = [];
const skipped = [];
const missing = [];
const notes = [];
const indentOf = i => lines[i].match(/^\s*/)[0];
// The same size written differently (4rem, 64px, --spacing(16)) is not a change
const toPx = v => {
  let m;
  if ((m = v.match(/^--spacing\((-?[\d.]+)\)$/))) return +m[1] * 4;
  if ((m = v.match(/^(-?[\d.]+)px$/))) return +m[1];
  if ((m = v.match(/^(-?[\d.]+)rem$/))) return +m[1] * 16;
  if (v === 'calc(infinity * 1px)') return Infinity;
  if (v === '0') return 0;
  return null;
};
const same = (a, b) => a === b || a.toLowerCase() === b.toLowerCase() || (toPx(a) !== null && toPx(a) === toPx(b));
const setDecl = (i, name, value, where) => {
  const old = valueOf(i);
  if (same(old, value)) return unchanged.push(name);
  replace.set(i, value);
  changes.push({ name, where, old, value });
};
const variantInserts = new Map(); // variant -> [lines]
const addOverride = (variant, name, value) => {
  if (!variantInserts.has(variant)) variantInserts.set(variant, []);
  variantInserts.get(variant).push(`${name}: ${value};`);
  changes.push({ name, where: `@variant ${variant}`, old: '(none)', value });
};

for (const token of data.tokens) {
  const { name } = token;
  if (SKIP[name]) {
    skipped.push({ name, reason: SKIP[name] });
    continue;
  }
  if (!theme.has(name)) {
    const value = token.values ? format(token, token.values.Desktop) : format(token, token.alias ? token : token.value);
    missing.push({ name, value, figma: token.figma });
    continue;
  }
  const line = theme.get(name);
  if (token.values) {
    const { Mobile, Tablet, Desktop } = token.values;
    const mobileName = `${name}-mobile`;
    if (theme.has(mobileName)) {
      // A token pair, as for section spacing: the plain token is desktop, -mobile the small screens
      setDecl(line, name, format(token, Desktop), '@theme');
      setDecl(theme.get(mobileName), mobileName, format(token, Mobile), '@theme');
      if (Tablet !== Desktop) notes.push(`${name}: Figma's Tablet value (${Tablet}) differs from Desktop (${Desktop}); CSS has no tablet token, so it uses the Desktop value.`);
      continue;
    }
    // Mobile first: Mobile in @theme, existing overrides updated, new overrides where the bigger screens differ
    setDecl(line, name, format(token, Mobile), '@theme');
    const existing = [...variants].filter(([, v]) => v.decls.has(name));
    for (const [variant, v] of existing) {
      setDecl(v.decls.get(name), name, format(token, TABLET_VARIANTS.includes(variant) ? Tablet : Desktop), `@variant ${variant}`);
    }
    if (!existing.length) {
      if (Tablet !== Mobile) addOverride(NEW_TABLET_VARIANT, name, format(token, Tablet));
      if (Desktop !== Tablet) addOverride(NEW_DESKTOP_VARIANT, name, format(token, Desktop));
    }
    continue;
  }
  const value = format(token, token.alias ? token : token.value, valueOf(line));
  if (value === null) {
    notes.push(`${name}: no value in Figma, left alone.`);
    continue;
  }
  setDecl(line, name, value, '@theme');
  if (token.type === 'STRING' && name.startsWith('--font-') && replace.has(line)) {
    notes.push(`${name} is now ${token.value}: load it with "yarn --cwd frontend googlefonts" and import css/site/base/fonts.css in main.css.`);
  }
}

// --- Apply ---
for (const [i, value] of replace) {
  lines[i] = lines[i].replace(/^(\s*--[\w-]+\s*:\s*).*?;/, `$1${value};`);
}
for (const [variant, decls] of variantInserts) {
  const block = variants.get(variant);
  if (block && block.close >= 0) {
    const indent = indentOf(block.close) + '  ';
    inserts.push({ at: block.close, text: decls.map(d => indent + d) });
  } else if (layerRootClose >= 0) {
    const indent = indentOf(layerRootClose) + '  ';
    inserts.push({ at: layerRootClose, text: [`${indent}@variant ${variant} {`, ...decls.map(d => `${indent}  ${d}`), `${indent}}`] });
  } else {
    inserts.push({ at: lines.length, text: ['', '/* Responsive theme variables */', '@layer theme {', '  :root {', `    @variant ${variant} {`, ...decls.map(d => `      ${d}`), '    }', '  }', '}'] });
  }
}
if (addMissing && missing.length) {
  inserts.push({ at: themeClose, text: ['', '  /* Added from Figma (tooling/figma-theme/apply-theme.mjs) */', ...missing.filter(m => m.value !== null).map(m => `  ${m.name}: ${m.value};`)] });
}
// Several new variant blocks at the same place: keep them in variant order
inserts.sort((a, b) => b.at - a.at || (b.text[0] > a.text[0] ? 1 : -1));
for (const { at, text } of inserts) lines.splice(at, 0, ...text);

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
  writeFileSync(cssPath, lines.join('\n'));
  console.log(`\nWritten to ${cssPath}.`);
} else {
  console.log('\nDry run: nothing written. Add --write to change theme.css.');
}
