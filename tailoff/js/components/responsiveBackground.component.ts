import { ElementPrototype } from "../utils/prototypes/element.prototypes";
import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";

ElementPrototype.activateClosest();
ArrayPrototypes.activateFrom();

export class ResponsiveBackgroundComponent {
  constructor() {
    const images = document.querySelectorAll(".js-background-image");
    Array.from(images).forEach((image: HTMLImageElement) => {
      if (image.complete) {
        this.loadImage(image);
      } else {
        image.addEventListener("load", (e) => {
          this.loadImage(e.target as HTMLImageElement);
        });
      }
    });
  }

  private loadImage(image: HTMLImageElement) {
    const hero: HTMLElement = image.closest(".js-background");
    const imgSrc = image.currentSrc || image.src;

    hero.style.backgroundImage = "url(" + imgSrc + ")";

    setTimeout(function () {
      hero.classList.add("is-loaded");
    }, 250);
  }
}
