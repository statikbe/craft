import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
import { ScrollHelper } from "../utils/scroll";

ArrayPrototypes.activateFrom();

export class ScrollToAnchorComponent {
  constructor() {
    const scrollLinks = document.querySelectorAll("a.js-smooth-scroll");

    Array.from(scrollLinks).forEach((link: HTMLAnchorElement) => {
      link.addEventListener("click", (e) => {
        const hash = link.getAttribute("href").split("#");
        if (hash.length > 1) {
          const target = document.querySelector(`#${hash[1]}`) as HTMLElement;

          if (target) {
            e.preventDefault();
            ScrollHelper.scrollToY(target, 400);
          }
        }
      });
    });
  }
}
