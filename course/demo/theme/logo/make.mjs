import opentype from 'opentype.js';
import fs from 'fs';
const dir = process.argv[2];
const brico = opentype.loadSync(dir + '/fonts/f1.ttf');
const fig = opentype.loadSync(dir + '/fonts/f2.ttf');
const G = '#1f4d3a', G2 = '#2f6b50', T = '#c0511f', SUN = '#e2683a', C = '#f4f1e8';

function word(font, text, x, baseline, size, maxW, letterSpacing = 0) {
  let w = font.getAdvanceWidth(text, size, { letterSpacing });
  if (maxW && w > maxW) { size = size * maxW / w; w = maxW; }
  const p = font.getPath(text, x, baseline, size, { letterSpacing });
  return { d: p.toPathData(2), w, size, bb: p.getBoundingBox() };
}

// Mark: disk with sun, two hills and a winding path, centred at (cx, cy), radius r
function mark(cx, cy, r, id) {
  const s = r / 50; // designed for r = 50 at (0,0)
  const t = (x, y) => `${(cx + x * s).toFixed(2)} ${(cy + y * s).toFixed(2)}`;
  const back = `M${t(-52, 8)} C${t(-30, -10)} ${t(-12, -12)} ${t(6, 0)} C${t(20, -12)} ${t(38, -14)} ${t(54, -2)} L${t(54, 54)} L${t(-52, 54)} Z`;
  const front = `M${t(-52, 22)} C${t(-24, 4)} ${t(18, 6)} ${t(54, 26)} L${t(54, 54)} L${t(-52, 54)} Z`;
  const path = `M${t(-6, 50)} C${t(-2, 40)} ${t(18, 38)} ${t(10, 30)} C${t(4, 24)} ${t(-8, 22)} ${t(2, 15)}`;
  return `<defs><clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${G}"/>
  <g clip-path="url(#${id})">
    <circle cx="${t(14, -16).split(' ')[0]}" cy="${t(14, -16).split(' ')[1]}" r="${(13 * s).toFixed(2)}" fill="${SUN}"/>
    <path d="${back}" fill="${G2}"/>
    <path d="${front}" fill="${C}"/>
    <path d="${path}" fill="none" stroke="${G}" stroke-width="${(4.2 * s).toFixed(2)}" stroke-linecap="round"/>
  </g>`;
}

// Logo, viewBox 273 x 111 (same proportions as the base install logo)
function logo(textColor, deColor, file) {
  const x = 118, maxW = 273 - x - 1;
  const de = word(fig, 'DE', x + 1, 25, 19, null, 0.16);
  const l1 = word(brico, 'Heide', x, 60, 42, maxW);
  const l2 = word(brico, 'stappers', x, 97, l1.size, maxW);
  const size = Math.min(l1.size, l2.size);
  const a = word(brico, 'Heide', x, 60, size), b = word(brico, 'stappers', x, 97, size);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="273" height="111" viewBox="0 0 273 111">
  <title>De Heidestappers</title>
  ${mark(52, 55.5, 50, 'hs-' + file.replace(/\W/g, ''))}
  <path d="${de.d}" fill="${deColor}"/>
  <path d="${a.d}" fill="${textColor}"/>
  <path d="${b.d}" fill="${textColor}"/>
</svg>
`;
  fs.writeFileSync(dir + '/' + file, svg);
  console.log(file, 'size', size.toFixed(1), 'widths', a.w.toFixed(1), b.w.toFixed(1), 'bbox stappers', JSON.stringify(b.bb));
}
logo(G, T, 'logo.svg');
logo('#ffffff', '#f0a27f', 'logo-white.svg');

fs.writeFileSync(dir + '/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="87" height="87" viewBox="0 0 87 87">
  <title>De Heidestappers</title>
  ${mark(43.5, 43.5, 43.5, 'hs-fav')}
</svg>
`);
