import { DOMHelper } from '../utils/domHelper';

export default class ResponsiveBackgroundComponent {
  constructor() {
    const _self = this;
    const images = document.querySelectorAll('.js-bg-src, [data-bg-target]');
    this.processImages(images);
  }

  private processImages(images: NodeList) {
    Array.from(images).forEach((image: HTMLImageElement) => {
      // if (!image.classList.contains('lazyload')) {
      if (image.complete) {
        this.loadImage(image);
      } else {
        if (image.hasAttribute('loading')) {
          image.classList.remove('sr-only');
        }
        image.addEventListener('load', (e) => {
          this.loadImage(e.target as HTMLImageElement);
        });
      }
      // }
    });
  }

  private loadImage(image: HTMLImageElement) {
    image.classList.add('hidden');
    let target: HTMLElement = image.closest('.js-bg-target');
    const imgSrc = image.currentSrc || image.src;
    if (target) {
      target.style.backgroundColor = '';
      target.style.backgroundImage = `url("${imgSrc}")`;
      setTimeout(function () {
        target.classList.add('is-loaded');
      }, 250);
    }

    if (image.hasAttribute('data-bg-target')) {
      let targets = document.querySelectorAll(`#${image.getAttribute('data-bg-target')}`);
      Array.from(targets).forEach((target: HTMLElement) => {
        target.style.backgroundColor = '';
        target.style.backgroundImage = `url("${imgSrc}")`;
        setTimeout(function () {
          target.classList.add('is-loaded');
        }, 250);
      });
    }
  }
}
