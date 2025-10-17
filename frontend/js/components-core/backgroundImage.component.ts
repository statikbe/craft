import { DOMHelper } from '../utils/domHelper';

export default class BackgroundImageComponent {
  constructor() {
    const imageWrappers = document.querySelectorAll('[data-bg-image]');
    this.processImages(imageWrappers);

    DOMHelper.onDynamicContent(document.documentElement, '[data-bg-image]', (wrappers: NodeListOf<HTMLElement>) => {
      this.processImages(wrappers);
    });
  }

  private processImages(wrappers: NodeList) {
    Array.from(wrappers).forEach((wrapper: HTMLImageElement) => {
      let image = wrapper.querySelector('img');
      if (!image && wrapper.getAttribute('data-bg-image').length > 0) {
        image = document.getElementById(wrapper.getAttribute('data-bg-image')) as HTMLImageElement;
      }

      if (image.complete) {
        this.loadImage(wrapper, image);
      } else {
        if (image.hasAttribute('loading')) {
          image.classList.remove('sr-only');
        }
        image.addEventListener('load', (e) => {
          this.loadImage(wrapper, e.target as HTMLImageElement);
        });
      }
    });
  }

  private loadImage(wrapper: HTMLElement, image: HTMLImageElement) {
    image.classList.add('hidden');
    const imgSrc = image.currentSrc || image.src;
    if (wrapper) {
      wrapper.style.backgroundColor = '';
      wrapper.style.backgroundImage = `url("${imgSrc}")`;
      setTimeout(function () {
        wrapper.classList.add('is-loaded');
      }, 250);
    }
  }
}
