import { ElementPrototype } from "../utils/prototypes/element.prototypes";
import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";

ElementPrototype.activateClosest();
ArrayPrototypes.activateFrom();

export class ResponsiveBackgroundComponent {
  constructor() {
    const images = document.querySelectorAll(".js-hero-image");
    Array.from(images).forEach(image => {
      image.addEventListener("load", e => {
        const el: HTMLImageElement = e.target as HTMLImageElement;
        const hero: HTMLElement = el.closest(".js-hero");
        const imgSrc = el.currentSrc || el.src;

        hero.style.backgroundImage = "url(" + imgSrc + ")";

        setTimeout(function() {
          hero.classList.add("is-loaded");
        }, 250);
      });
    });
  }
}
