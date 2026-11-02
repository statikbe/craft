/**
 * Merges a Figma theme export (format statik-figma-theme/1) into the text of theme.css. Shared by apply-theme.mjs (CLI)
 * and the Figma plugin: build-ui.mjs copies this file into plugin/ui.html, so keep it plain JavaScript without imports.
 * Only the `export` line at the bottom is dropped there.
 *
 * Figma is the source of truth: every token with a CSS name gets Figma's value, also where theme.css had a formula.
 * Tokens Figma only approximates (SKIP) are left alone and reported.
 */
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

/**
 * @param {string} css The current theme.css
 * @param {object} data The Figma export
 * @param {{addMissing?: boolean}} options addMissing: add tokens theme.css doesn't have, at the end of @theme
 * @returns {{css: string, changes: object[], unchanged: string[], skipped: object[], missing: object[], notes: string[]}}
 */
function mergeTheme(css, data, options = {}) {
  const addMissing = !!options.addMissing;
  if (!data || data.format !== 'statik-figma-theme/1') {
    throw new Error(`Unknown format "${data && data.format}": export again with the Theme export plugin.`);
  }
  const lines = css.split('\n');

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
  if (themeClose < 0) throw new Error('No @theme block found: is this frontend/css/site/theme.css?');

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
    inserts.push({ at: themeClose, text: ['', '  /* Added from Figma (tooling/figma-theme) */', ...missing.filter(m => m.value !== null).map(m => `  ${m.name}: ${m.value};`)] });
  }
  // Several new variant blocks at the same place: keep them in variant order
  inserts.sort((a, b) => b.at - a.at || (b.text[0] > a.text[0] ? 1 : -1));
  for (const { at, text } of inserts) lines.splice(at, 0, ...text);

  return { css: lines.join('\n'), changes, unchanged, skipped, missing, notes };
}

export { mergeTheme, SKIP };
