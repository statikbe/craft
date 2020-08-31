import { ElementPrototype } from "../utils/prototypes/element.prototypes";
import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
import { DOMHelper } from "../utils/domHelper";

ElementPrototype.activateClosest();
ArrayPrototypes.activateFrom();

export class ResponsiveBackgroundComponent {
  constructor() {
    const _self = this;
    document.addEventListener("lazyloaded", function (e) {
      const img = e.target as HTMLImageElement;
      if (
        img.classList.contains("js-bg-src") ||
        img.hasAttribute("data-bg-target")
      ) {
        _self.loadImage(img);
      }
    });

    const images = document.querySelectorAll(".js-bg-src, [data-bg-target]");
    this.processImages(images);

    DOMHelper.onDynamicContent(
      document.documentElement,
      ".js-bg-src, [data-bg-target]",
      (images) => {
        this.processImages(images);
      }
    );
  }

  private processImages(images: NodeList) {
    Array.from(images).forEach((image: HTMLImageElement) => {
      if (!image.classList.contains("lazyload")) {
        if (image.complete) {
          this.loadImage(image);
        } else {
          image.addEventListener("load", (e) => {
            this.loadImage(e.target as HTMLImageElement);
          });
        }
      }
    });
  }

  private loadImage(image: HTMLImageElement) {
    image.classList.add("hidden");
    let target: HTMLElement = image.closest(".js-bg-target");
    const imgSrc = image.currentSrc || image.src;
    if (target) {
      target.style.backgroundColor = "";
      target.style.backgroundImage = `url("${imgSrc}")`;
      setTimeout(function () {
        target.classList.add("is-loaded");
      }, 250);
    }

    if (image.hasAttribute("data-bg-target")) {
      let targets = document.querySelectorAll(
        `#${image.getAttribute("data-bg-target")}`
      );
      Array.from(targets).forEach((target: HTMLElement) => {
        target.style.backgroundColor = "";
        target.style.backgroundImage = `url("${imgSrc}")`;
        setTimeout(function () {
          target.classList.add("is-loaded");
        }, 250);
      });
    }
  }
}
