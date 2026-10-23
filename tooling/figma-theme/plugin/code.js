// Theme export: writes the variables of a design made from the base install starter as JSON, for apply-theme.mjs.
// Plain JS without a build step, so Figma can import it from manifest.json as it is.

// <extract>
// Also run by the exporting-figma-theme skill through the Figma connection: keep this block self-contained.
/**
 * Every local variable whose WEB code syntax is `var(--token)` becomes a token named after that CSS custom property.
 * Theme variables are read in the chosen Theme mode, Breakpoint variables in all three modes, the rest in their default
 * mode. A reference to another variable with a CSS name stays a reference (`alias`), others are resolved to their value.
 */
async function extractTheme(themeModeName) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = await figma.variables.getLocalVariablesAsync();
  const byId = new Map(variables.map(v => [v.id, v]));
  const collectionById = new Map(collections.map(c => [c.id, c]));
  const theme = collections.find(c => c.name === 'Theme');
  const breakpoint = collections.find(c => c.name === 'Breakpoint');
  if (!theme) throw new Error('This file has no "Theme" variable collection.');
  const themeMode = theme.modes.find(m => m.name === themeModeName) || theme.modes.find(m => m.modeId === theme.defaultModeId);

  const cssName = v => {
    const match = ((v.codeSyntax && v.codeSyntax.WEB) || '').match(/^var\((--[\w-]+)\)$/);
    return match ? match[1] : null;
  };
  // The mode to read a variable in: the Theme mode for Theme variables, else the requested mode if its collection has it
  const modeFor = (v, wanted) => {
    const c = collectionById.get(v.variableCollectionId);
    if (c === theme) return themeMode.modeId;
    if (wanted && c.modes.some(m => m.modeId === wanted)) return wanted;
    return c.defaultModeId;
  };
  const toHex = n => Math.round(n * 255).toString(16).padStart(2, '0');
  const format = (value, type) => {
    if (type === 'COLOR') return '#' + toHex(value.r) + toHex(value.g) + toHex(value.b) + (value.a !== undefined && value.a < 1 ? toHex(value.a) : '');
    return value;
  };
  // { alias: '--token' } for a reference to a variable with a CSS name, { value } otherwise
  const resolve = (v, modeId, keepAlias, depth) => {
    const raw = v.valuesByMode[modeId];
    if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
      const target = byId.get(raw.id);
      if (!target || depth > 10) return { value: null };
      if (keepAlias && cssName(target)) return { alias: cssName(target) };
      return resolve(target, modeFor(target, modeId), keepAlias, depth + 1);
    }
    return { value: format(raw, v.resolvedType) };
  };

  const tokens = [];
  for (const v of variables) {
    const name = cssName(v);
    if (!name) continue;
    const collection = collectionById.get(v.variableCollectionId);
    const token = { name, figma: v.name, collection: collection.name, type: v.resolvedType };
    if (breakpoint && collection === breakpoint) {
      token.values = {};
      for (const m of breakpoint.modes) token.values[m.name] = resolve(v, m.modeId, false, 0).value;
    } else {
      Object.assign(token, resolve(v, modeFor(v), true, 0));
    }
    tokens.push(token);
  }
  tokens.sort((a, b) => a.name.localeCompare(b.name));
  return {
    format: 'statik-figma-theme/1',
    file: figma.root.name,
    theme: themeMode.name,
    breakpoints: breakpoint ? breakpoint.modes.map(m => m.name) : [],
    exportedAt: new Date().toISOString(),
    tokens,
  };
}
// </extract>

figma.showUI(__html__, { width: 440, height: 560, themeColors: true });

(async () => {
  const theme = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Theme');
  figma.ui.postMessage({
    type: 'init',
    file: figma.root.name,
    modes: theme ? theme.modes.map(m => m.name) : [],
    defaultMode: theme ? theme.modes.find(m => m.modeId === theme.defaultModeId).name : null,
  });
})();

figma.ui.onmessage = async msg => {
  if (msg.type === 'export') {
    try {
      figma.ui.postMessage({ type: 'result', data: await extractTheme(msg.mode) });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: String(e && e.message ? e.message : e) });
    }
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};
