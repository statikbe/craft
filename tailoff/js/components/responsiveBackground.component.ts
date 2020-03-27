import { ElementPrototype } from "../utils/prototypes/element.prototypes";
import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";

ElementPrototype.activateClosest();
ArrayPrototypes.activateFrom();

export class ResponsiveBackgroundComponent {
  constructor() {
    const images = document.querySelectorAll(".js-bg-src");
    Array.from(images).forEach(image => {
      image.classList.add("sr-only");
      image.addEventListener("load", e => {
        const el: HTMLImageElement = e.target as HTMLImageElement;
        const target: HTMLElement = el.closest(".js-bg-target");
        const imgSrc = el.currentSrc || el.src;

        target.style.backgroundImage = "url(" + imgSrc + ")";

        setTimeout(function() {
          target.classList.add("is-loaded");
        }, 250);
      });
    });
  }
}
