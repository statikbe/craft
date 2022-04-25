import { DOMHelper } from '../utils/domHelper';
import { Helper } from '../utils/helper';

export class ScrollParallaxComponent {
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
    new ScrollParallaxElement(el);
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

class ScrollParallaxElement {
  private options = {
    background: false,
    delay: 0,
    orientation: 'up',
    scale: 1.3,
    overflow: true,
    customContainer: null,
  };

  private inView: boolean = false;
  private widthDiff: number;
  private heightDiff: number;
  private lastScrollPosition: number = 0;
  private image: HTMLImageElement;
  private container: HTMLElement;
  private scaleFactor: string = '';
  private windowHeight: number;

  constructor(el: HTMLElement) {
    this.initOptions(el);
    this.initParallax(el);
    const scrollObserver = new IntersectionObserver(
      (entries, observer) => {
        if (!this.inView && entries[0].isIntersecting) {
          this.inView = entries[0].isIntersecting;
          this.proceedRequestAnimationFrame();
        } else {
          this.inView = entries[0].isIntersecting;
        }
      },
      {
        root: null,
        threshold: [0, 1],
      }
    );

    scrollObserver.observe(el);
  }

  private initOptions(el: HTMLElement) {
    if (el.hasAttribute('data-s-parallax-delay')) {
      this.options.delay = parseInt(el.getAttribute('data-s-parallax-delay'));
    }
    if (el.hasAttribute('data-s-parallax-orientation')) {
      this.options.orientation = el.getAttribute('data-s-parallax-orientation');
    }
    if (el.hasAttribute('data-s-parallax-scale')) {
      this.options.scale = parseFloat(el.getAttribute('data-s-parallax-scale'));
    }
    if (el.hasAttribute('data-s-parallax-overflow')) {
      this.options.overflow = el.getAttribute('data-s-parallax-overflow') === 'true';
    }
    if (el.hasAttribute('data-s-parallax-custom-container')) {
      this.options.customContainer = el.getAttribute('data-s-parallax-custom-container');
    }
  }

  private initParallax(el: HTMLElement) {
    const _self = this;

    this.container = this.options.customContainer ? document.querySelector(this.options.customContainer) : el;
    this.image = el.querySelector('img');
    if (this.image) {
      if (this.options.overflow) {
        this.container.style.overflow = 'hidden';
      }
      if (!this.image.classList.contains('lazyload')) {
        if (this.image.complete) {
          this.scaleImage();
        } else {
          this.image.addEventListener('load', (e) => {
            this.scaleImage();
          });
        }
      } else {
        document.addEventListener('lazyloaded', function (e) {
          const img = e.target as HTMLImageElement;
          if (img == _self.image) {
            _self.scaleImage();
          }
        });
      }
      window.addEventListener(
        'resize',
        Helper.debounce(() => {
          _self.scaleImage();
          _self.moveElement();
        }, 100)
      );
    } else {
      console.log('No image found');
    }
  }

  private scaleImage() {
    const initialWidth = this.image.offsetWidth;
    const initialHeight = this.image.offsetHeight;
    this.windowHeight = window.innerHeight;

    if (this.options.background) {
      //calculate the backgrounds-size
      if (this.options.orientation === 'up' || this.options.orientation === 'down') {
      }
    } else {
      this.widthDiff = initialWidth * this.options.scale - initialWidth;
      this.heightDiff = initialHeight * this.options.scale - initialHeight;
      if (this.options.overflow) {
        this.scaleFactor = `scale(${this.options.scale})`;
      }
      this.image.style.transform = `${this.scaleFactor}`;
      this.image.style.willChange = 'transform';
      if (this.options.delay > 0) {
        this.image.style.transition = `transform ${this.options.delay}ms cubic-bezier(0, 0, 0, 1) 0s`;
      }
    }

    this.moveElement();
  }

  private proceedRequestAnimationFrame() {
    if (this.inView) {
      if (this.lastScrollPosition === window.pageYOffset) {
        window.requestAnimationFrame(this.proceedRequestAnimationFrame.bind(this));
        return;
      }

      this.moveElement();

      window.requestAnimationFrame(this.proceedRequestAnimationFrame.bind(this));
      this.lastScrollPosition = window.pageYOffset;
    }
  }

  private moveElement() {
    const scrollPercentage = this.getScrollPercentage();
    if (this.options.background) {
    } else {
      switch (this.options.orientation) {
        case 'up':
          this.image.style.transform = `translateY(${this.heightDiff / 2 - scrollPercentage * this.heightDiff}px) ${
            this.scaleFactor
          }`;
          break;
        case 'down':
          this.image.style.transform = `translateY(${-this.heightDiff / 2 + scrollPercentage * this.heightDiff}px) ${
            this.scaleFactor
          }`;
          break;
        case 'left':
          this.image.style.transform = `translateX(${this.heightDiff / 2 - scrollPercentage * this.heightDiff}px) ${
            this.scaleFactor
          }`;
          break;
        case 'right':
          this.image.style.transform = `translateX(${-this.heightDiff / 2 + scrollPercentage * this.heightDiff}px) ${
            this.scaleFactor
          }`;
          break;
        case 'up-left':
          this.image.style.transform = `translate(${this.heightDiff / 2 - scrollPercentage * this.heightDiff}px, ${
            this.heightDiff / 2 - scrollPercentage * this.heightDiff
          }px) ${this.scaleFactor}`;
          break;
        case 'up-right':
          this.image.style.transform = `translate(${-this.heightDiff / 2 + scrollPercentage * this.heightDiff}px, ${
            this.heightDiff / 2 - scrollPercentage * this.heightDiff
          }px) ${this.scaleFactor}`;
          break;
        case 'down-left':
          this.image.style.transform = `translate(${this.heightDiff / 2 - scrollPercentage * this.heightDiff}px, ${
            -this.heightDiff / 2 + scrollPercentage * this.heightDiff
          }px) ${this.scaleFactor}`;
          break;
        case 'down-right':
          this.image.style.transform = `translate(${-this.heightDiff / 2 + scrollPercentage * this.heightDiff}px, ${
            -this.heightDiff / 2 + scrollPercentage * this.heightDiff
          }px) ${this.scaleFactor}`;
          break;
      }
    }
  }

  private getScrollPercentage() {
    const containerRect = this.container.getBoundingClientRect();
    return (this.windowHeight - containerRect.top) / (this.windowHeight + containerRect.height);
  }
}
