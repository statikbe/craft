import { DOMHelper } from '../utils/domHelper';
import { Helper } from '../utils/helper';

export class ScrollParallaxComponent {
  constructor() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery && !mediaQuery.matches) {
      this.initParallax();
    }

    mediaQuery.addEventListener('change', () => {
      if (!mediaQuery.matches) {
        this.initParallax();
      }
    });
  }

  private initParallax() {
    const scrollAnimationElements = document.querySelectorAll('[data-s-parallax]');
    Array.from(scrollAnimationElements).forEach((el) => {
      new ScrollParallaxElement(el as HTMLElement);
    });
  }
}

class ScrollParallaxElement {
  private options = {
    background: false,
    delay: 0,
    orientation: 'up',
    scale: 1.3,
    overflow: true,
    breakpoint: -1,
    customContainer: null,
    ratio: '',
    from: null,
    to: null,
    animationDuration: 10000,
  };

  private inView: boolean = false;
  private widthDiff: number;
  private heightDiff: number;
  private lastScrollPosition: number = 0;
  private parallaxElement: HTMLElement;
  private targetElement: HTMLElement;
  private container: HTMLElement;
  private scaleFactor: string = '';
  private windowHeight: number;
  private query = null;
  private enableParallax = true;
  private scrollObserver: IntersectionObserver;
  private bgImageWidth: number;
  private bgImageHeight: number;
  private isPixelUnit = false;
  private elementAnimation = null;
  private coords = { top: 0, left: 0 };

  constructor(el: HTMLElement) {
    this.parallaxElement = el;
    this.initOptions();
    this.setQueryOptions();
    this.windowHeight = window.innerHeight;

    if (window.innerWidth >= this.options.breakpoint && this.enableParallax) {
      this.initParallax();
    }

    window.addEventListener('resize', () => {
      if (this.query) {
        this.setQueryOptions();
      }

      if (this.enableParallax) {
        Helper.debounce(() => {
          this.scaleElement();
          this.moveElement();
        }, 100)();
      } else {
        if (this.targetElement) {
          this.targetElement.removeAttribute('style');
        }
      }
    });
  }

  private initOptions() {
    if (this.parallaxElement.hasAttribute('data-s-parallax-delay')) {
      this.options.delay = parseInt(this.parallaxElement.getAttribute('data-s-parallax-delay'));
    }
    if (this.parallaxElement.hasAttribute('data-s-parallax-orientation')) {
      this.options.orientation = this.parallaxElement.getAttribute('data-s-parallax-orientation');
    }
    if (this.parallaxElement.hasAttribute('data-s-parallax-scale')) {
      this.options.scale = parseFloat(this.parallaxElement.getAttribute('data-s-parallax-scale'));
      this.isPixelUnit = this.parallaxElement.getAttribute('data-s-parallax-scale').indexOf('px') > 0;
    }
    if (this.parallaxElement.hasAttribute('data-s-parallax-overflow')) {
      this.options.overflow = this.parallaxElement.getAttribute('data-s-parallax-overflow') === 'true';
    }
    if (this.parallaxElement.hasAttribute('data-s-parallax-custom-container')) {
      this.options.customContainer = this.parallaxElement.getAttribute('data-s-parallax-custom-container');
    }
    if (this.parallaxElement.hasAttribute('data-s-parallax-breakpoint')) {
      this.options.breakpoint = parseInt(this.parallaxElement.getAttribute('data-s-parallax-breakpoint'));
    }
    if (this.parallaxElement.hasAttribute('data-s-parallax-background')) {
      this.options.background = this.parallaxElement.getAttribute('data-s-parallax-background') === 'true';
    }
    if (this.parallaxElement.hasAttribute('data-s-parallax-ratio')) {
      this.options.ratio = this.parallaxElement.getAttribute('data-s-parallax-ratio');
    }
    if (
      this.parallaxElement.hasAttribute('data-s-parallax-from') &&
      this.parallaxElement.hasAttribute('data-s-parallax-to')
    ) {
      try {
        this.options.from = JSON.parse(this.parallaxElement.getAttribute('data-s-parallax-from'));
        this.options.to = JSON.parse(this.parallaxElement.getAttribute('data-s-parallax-to'));
      } catch (error) {
        console.error(error);
      }
    }
    const parallaxData = this.parallaxElement.getAttribute('data-s-parallax');
    if (parallaxData != 'true') {
      try {
        this.query = JSON.parse(parallaxData);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private initParallax() {
    const _self = this;

    if (this.options.from && this.options.to) {
      this.elementAnimation = this.parallaxElement.animate([this.options.from, this.options.to], {
        duration: this.options.animationDuration,
        iterations: 1,
      });
      this.elementAnimation.pause();
      this.container = this.options.customContainer
        ? document.querySelector(this.options.customContainer)
        : this.parallaxElement.parentElement;
      this.startMove();
    } else {
      if (this.options.background) {
        if (this.options.ratio) {
          this.initBackgroundImage();
        } else {
          if (this.parallaxElement.style.backgroundImage) {
            this.initBackgroundImage();
          } else {
            const mutationObserver: MutationObserver = new MutationObserver((mutationsList) => {
              for (let mutation of mutationsList) {
                if (mutation.attributeName === 'style') {
                  this.initBackgroundImage();
                }
              }
            });
            mutationObserver.observe(this.parallaxElement, {
              attributes: true,
              childList: false,
              subtree: false,
            });
          }
        }
      } else {
        this.container = this.options.customContainer
          ? document.querySelector(this.options.customContainer)
          : this.parallaxElement;
        this.targetElement = this.parallaxElement.children[0] as HTMLElement;
        if (this.targetElement) {
          if (this.options.overflow) {
            this.container.style.overflow = 'hidden';
          }
          if (this.targetElement.tagName === 'IMG') {
            if ((this.targetElement as HTMLImageElement).complete) {
              this.scaleElement();
            } else {
              this.targetElement.addEventListener('load', (e) => {
                this.scaleElement();
              });
            }
            if (this.targetElement.hasAttribute('loading')) {
              this.targetElement.style.clip = 'auto';
            }
          } else {
            this.scaleElement();
          }

          this.startMove();
        } else {
          console.error('No image or element found');
        }
      }
    }

    this.coords = this.getCoords(this.container);
  }

  private initBackgroundImage() {
    this.container = this.parallaxElement;
    this.targetElement = this.parallaxElement;
    const _self = this;
    if (this.options.ratio) {
      const ratio = this.options.ratio.split(':');
      this.bgImageWidth = parseInt(ratio[0]);
      this.bgImageHeight = parseInt(ratio[1]);
      this.calculateBackgroundDiff();
      this.scaleElement();
    } else {
      const imageSrc = this.parallaxElement.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2');
      const tmpImage = new Image();
      tmpImage.onload = function () {
        _self.bgImageWidth = tmpImage.width;
        _self.bgImageHeight = tmpImage.height;
        _self.calculateBackgroundDiff();
        _self.scaleElement();
      };
      tmpImage.src = imageSrc;
    }

    this.startMove();
  }

  private calculateBackgroundDiff() {
    let neededWidth = this.parallaxElement.offsetWidth;
    let neededHeight = this.parallaxElement.offsetHeight;

    switch (this.options.orientation) {
      case 'up':
      case 'down':
        if (this.isPixelUnit) {
          neededHeight += this.options.scale;
        } else {
          neededHeight *= this.options.scale;
        }
        break;
      case 'left':
      case 'right':
        if (this.isPixelUnit) {
          neededWidth += this.options.scale;
        } else {
          neededWidth *= this.options.scale;
        }
        break;
      case 'up-left':
      case 'up-right':
      case 'down-left':
      case 'down-right':
        if (this.isPixelUnit) {
          neededWidth += this.options.scale;
          neededHeight += this.options.scale;
        } else {
          neededWidth *= this.options.scale;
          neededHeight *= this.options.scale;
        }
        break;
    }

    this.widthDiff = neededWidth - this.parallaxElement.offsetWidth;
    this.heightDiff = neededHeight - this.parallaxElement.offsetHeight;
  }

  private setBackgroundSize() {
    const neededRatio =
      (this.parallaxElement.offsetWidth + this.widthDiff) / (this.parallaxElement.offsetHeight + this.heightDiff);
    const bgImageRatio = this.bgImageWidth / this.bgImageHeight;
    if (neededRatio > bgImageRatio) {
      this.parallaxElement.style.backgroundSize = `${this.parallaxElement.offsetWidth + this.widthDiff}px auto`;
    } else {
      this.parallaxElement.style.backgroundSize = `auto ${this.parallaxElement.offsetHeight + this.heightDiff}px`;
    }
  }

  private startMove() {
    this.moveElement();

    this.scrollObserver = new IntersectionObserver(
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
    this.scrollObserver.observe(this.container);
  }

  private destroyParallax() {
    if (this.scrollObserver) {
      this.scrollObserver.unobserve(this.parallaxElement);
    }
    this.inView = false;
  }

  private setQueryOptions() {
    if (this.query) {
      let queryHit = null;
      this.query.forEach((q) => {
        if (q.breakpoint <= window.innerWidth) {
          queryHit = q;
        }
      });
      if (queryHit && queryHit.breakpoint != this.options.breakpoint) {
        if (queryHit.parallax !== false) {
          if (!this.enableParallax) {
            this.initParallax();
          }
          this.options.breakpoint = queryHit.breakpoint;
          this.options.orientation = queryHit.parallax.orientation ?? this.options.orientation;
          this.options.scale = parseFloat(queryHit.parallax.scale) ?? this.options.scale;
          this.isPixelUnit = queryHit.parallax.scale
            ? typeof queryHit.parallax.scale === 'string' && queryHit.parallax.scale.indexOf('px') > 0
            : false;

          this.options.delay = queryHit.parallax.delay ?? this.options.delay;
          this.options.overflow =
            queryHit.parallax.overflow != undefined ? queryHit.parallax.overflow : this.options.overflow;
          this.options.background =
            queryHit.parallax.background != undefined ? queryHit.parallax.background : this.options.background;
          this.enableParallax = queryHit.parallax === false ? false : true;

          if (this.container) {
            if (this.options.overflow) {
              this.container.style.overflow = 'hidden';
            } else {
              this.container.style.overflow = '';
            }
          }
        }

        if (!queryHit.parallax) {
          this.enableParallax = false;
          this.destroyParallax();
        }
      }
    }
  }

  private scaleElement() {
    const initialWidth = this.targetElement.offsetWidth;
    const initialHeight = this.targetElement.offsetHeight;
    let scaleFactor = this.options.scale;
    if (this.isPixelUnit) {
      scaleFactor = (initialHeight + scaleFactor) / initialHeight;
    }

    this.windowHeight = window.innerHeight;

    if (this.options.background) {
      this.setBackgroundSize();
    } else {
      this.widthDiff = initialWidth * scaleFactor - initialWidth;
      this.heightDiff = initialHeight * scaleFactor - initialHeight;
      if (this.options.overflow) {
        this.scaleFactor = `scale(${scaleFactor})`;
      } else {
        this.scaleFactor = '';
      }
      this.targetElement.style.transform = `${this.scaleFactor}`;
      this.targetElement.style.willChange = 'transform';
      if (this.options.delay > 0) {
        this.targetElement.style.transition = `transform ${this.options.delay}ms cubic-bezier(0, 0, 0, 1) 0s`;
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

    if (this.elementAnimation) {
      this.elementAnimation.currentTime = Math.round(scrollPercentage * this.options.animationDuration);
    } else {
      switch (this.options.orientation) {
        case 'up':
          if (this.options.background) {
            this.targetElement.style.backgroundPosition = `center -${scrollPercentage * this.heightDiff}px`;
          } else {
            this.targetElement.style.transform = `translateY(${
              this.heightDiff / 2 - scrollPercentage * this.heightDiff
            }px) ${this.scaleFactor}`;
          }
          break;
        case 'down':
          if (this.options.background) {
            this.targetElement.style.backgroundPosition = `center ${
              scrollPercentage * this.heightDiff - this.heightDiff
            }px`;
          } else {
            this.targetElement.style.transform = `translateY(${
              -this.heightDiff / 2 + scrollPercentage * this.heightDiff
            }px) ${this.scaleFactor}`;
          }
          break;
        case 'left':
          if (this.options.background) {
            this.targetElement.style.backgroundPosition = `-${scrollPercentage * this.widthDiff}px center`;
          } else {
            this.targetElement.style.transform = `translateX(${
              this.heightDiff / 2 - scrollPercentage * this.heightDiff
            }px) ${this.scaleFactor}`;
          }
          break;
        case 'right':
          if (this.options.background) {
            this.targetElement.style.backgroundPosition = `${
              scrollPercentage * this.widthDiff - this.widthDiff
            }px center`;
          } else {
            this.targetElement.style.transform = `translateX(${
              -this.heightDiff / 2 + scrollPercentage * this.heightDiff
            }px) ${this.scaleFactor}`;
          }
          break;
        case 'up-left':
          if (this.options.background) {
            this.targetElement.style.backgroundPosition = `-${scrollPercentage * this.widthDiff}px -${
              scrollPercentage * this.heightDiff
            }px`;
          } else {
            this.targetElement.style.transform = `translate(${
              this.heightDiff / 2 - scrollPercentage * this.heightDiff
            }px, ${this.heightDiff / 2 - scrollPercentage * this.heightDiff}px) ${this.scaleFactor}`;
          }
          break;
        case 'up-right':
          if (this.options.background) {
            this.targetElement.style.backgroundPosition = `${scrollPercentage * this.widthDiff - this.widthDiff}px -${
              scrollPercentage * this.heightDiff
            }px`;
          } else {
            this.targetElement.style.transform = `translate(${
              -this.heightDiff / 2 + scrollPercentage * this.heightDiff
            }px, ${this.heightDiff / 2 - scrollPercentage * this.heightDiff}px) ${this.scaleFactor}`;
          }
          break;
        case 'down-left':
          if (this.options.background) {
            this.targetElement.style.backgroundPosition = `-${scrollPercentage * this.widthDiff}px ${
              scrollPercentage * this.heightDiff - this.heightDiff
            }px`;
          } else {
            this.targetElement.style.transform = `translate(${
              this.heightDiff / 2 - scrollPercentage * this.heightDiff
            }px, ${-this.heightDiff / 2 + scrollPercentage * this.heightDiff}px) ${this.scaleFactor}`;
          }
          break;
        case 'down-right':
          if (this.options.background) {
            this.targetElement.style.backgroundPosition = `${scrollPercentage * this.widthDiff - this.widthDiff}px ${
              scrollPercentage * this.heightDiff - this.heightDiff
            }px`;
          } else {
            this.targetElement.style.transform = `translate(${
              -this.heightDiff / 2 + scrollPercentage * this.heightDiff
            }px, ${-this.heightDiff / 2 + scrollPercentage * this.heightDiff}px) ${this.scaleFactor}`;
          }
          break;
      }
    }
  }

  private getScrollPercentage() {
    const containerRect = this.container.getBoundingClientRect();

    if (this.coords.top < this.windowHeight) {
      return Math.max((this.coords.top - containerRect.top) / (this.coords.top + containerRect.height), 0);
    }

    return Math.max((this.windowHeight - containerRect.top) / (this.windowHeight + containerRect.height), 0);
  }

  private getCoords(elem) {
    // crossbrowser version
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
  }
}
