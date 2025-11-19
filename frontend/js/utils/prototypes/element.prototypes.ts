declare global {
  interface Element {
    nearest(selector: string, maxDepth?: number, maxSelector?: string): Element;
    msMatchesSelector;
  }
}

export class ElementPrototype {
  constructor() {}

  public static activateMatches() {
    if (!Element.prototype.matches) {
      Element.prototype.matches =
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
    }
  }

  public static activateNearest() {
    this.activateMatches();
    Element.prototype.nearest = function (
      selector: string,
      maxDepth: number = -1,
      maxSelector: ""
    ): Element {
      let el = this;
      const depth = maxDepth > 0 ? maxDepth : -1;
      let i = 0;

      do {
        if (el.matches(selector)) return el;
        el = el.parentElement || el.parentNode;
        const child = el.querySelector(selector);
        if (child) return child;
        i++;
      } while (
        el !== null &&
        el.nodeType === 1 &&
        (depth < 0 || i < depth) &&
        (maxSelector === "" || !el.matches(maxSelector))
      );
      return null;
    };
  }

  public static activateClosest() {
    this.activateMatches();
    if (!Element.prototype.closest) {
      Element.prototype.closest = function (s) {
        var el = this;

        do {
          if (el.matches(s)) return el;
          el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
      };
    }
  }
}

//Element.prototype.nearest = nearest;
// export function nearest(selector: string, maxDepth: number = -1): Element {
//   let el = this;
//   const depth = maxDepth > 0 ? maxDepth : -1;
//   let i = 0;

//   do {
//     if (el.matches(selector)) return el;
//     el = el.parentElement || el.parentNode;
//     const child = el.querySelector(selector);
//     if (child) return child;
//     i++;
//   } while (el !== null && el.nodeType === 1 && (depth < 0 || i < depth));
//   return null;
// }
