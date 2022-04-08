import { DOMHelper } from '../utils/domHelper';

export class ScrollParallaxComponent {
  private scrollDelay = 200;

  constructor() {
    const scrollAnimationElements = document.querySelectorAll('[data-s-parallax]');
    Array.from(scrollAnimationElements).forEach((el) => {
      this.initParallax(el as HTMLElement);
    });

    DOMHelper.onDynamicContent(document.documentElement, '[data-s-parallax]', (scrollAnimationElements) => {
      scrollAnimationElements.forEach((el) => {
        this.initParallax(el as HTMLElement);
      });
    });
  }

  private initParallax(el: HTMLElement) {
    console.log(el);
    const _self = this;
    window.addEventListener('load', function () {
      const scrollObserver = new IntersectionObserver(
        (entries, observer) => {
          console.log(entries[0].isIntersecting, entries[0].intersectionRatio, entries[0].boundingClientRect.y);
        },
        {
          root: null,
          threshold: [0, 1],
        }
      );

      scrollObserver.observe(el);
    });
  }

  // Borrow code from https://github.com/geosigno/simpleParallax.js/blob/8c8b54e65c179ed0e96a1e057adce1b3efbab79e/src/instances/parallax.js
  // Use requestAnimationFrame and only update the parallax when in viewport
  // Use translate and scale to create the parallax effect
  // Add overflow-hidden to the parent element to prevent the parallax from moving outside the viewport

  // Make it also work with Background Image
  // Borrow code from https://codepen.io/vavik96/full/mPrdmW
  // Get image height and width calculate width or height based on the image ratio and apply to element with background image.
  // animate the bg position to create the parallax effect
}
