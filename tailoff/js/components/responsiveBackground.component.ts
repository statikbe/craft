import { ElementPrototype } from "../utils/prototypes/element.prototypes";
import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";

ElementPrototype.activateClosest();
ArrayPrototypes.activateFrom();

export class ResponsiveBackgroundComponent {
  constructor() {
    const images = document.querySelectorAll(".js-bg-src");
    Array.from(images).forEach((image: HTMLImageElement) => {
      image.classList.add("hidden");
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
    const target: HTMLElement = image.closest(".js-bg-target");
    const imgSrc = image.currentSrc || image.src;

    target.style.backgroundImage = "url(" + imgSrc + ")";

    setTimeout(function () {
      target.classList.add("is-loaded");
    }, 250);
  }
}
