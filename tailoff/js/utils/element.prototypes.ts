declare global {
  interface Element {
    nearest(selector: string, maxDepth?: number): Element;
    msMatchesSelector;
  }
}

if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

//Element.prototype.nearest = nearest;
export function nearest(selector: string, maxDepth: number = -1): Element {
  let el = this;
  const depth = maxDepth > 0 ? maxDepth : -1;
  let i = 0;

  do {
    if (el.matches(selector)) return el;
    el = el.parentElement || el.parentNode;
    const child = el.querySelector(selector);
    if (child) return child;
    i++;
  } while (el !== null && el.nodeType === 1 && (depth < 0 || i < depth));
  return null;
}
