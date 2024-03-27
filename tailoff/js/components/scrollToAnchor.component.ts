import { DOMHelper } from '../utils/domHelper';
import { ScrollHelper } from '../utils/scroll';

export class ScrollToAnchorComponent {
  constructor() {
    const scrollLinks = document.querySelectorAll('a.js-smooth-scroll');
    const scrollLinksAttr = document.querySelectorAll('.js-smooth-scroll-attr');

    Array.from(scrollLinks).forEach((link: HTMLAnchorElement) => {
      this.initScrollTo(link);
    });

    Array.from(scrollLinksAttr).forEach((link: HTMLAnchorElement) => {
      this.initScrollToDataAttr(link);
    });
  }

  private initScrollTo(link: HTMLAnchorElement) {
    link.classList.remove('js-smooth-scroll');
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href').split('#');
      if (hash.length > 1) {
        const target = document.querySelector(`#${hash[1]}`) as HTMLElement;

        if (target) {
          e.preventDefault();
          ScrollHelper.scrollToY(target, 400);
        }
      }
    });
  }

  private initScrollToDataAttr(link: HTMLElement) {
    link.classList.remove('js-smooth-scroll-attr');
    link.addEventListener('click', (e) => {
      console.log(link);

      const hash = link.getAttribute('data-scrollId');
      if (hash.length > 1) {
        const target = document.querySelector(`#${hash}`) as HTMLElement;

        if (target) {
          e.preventDefault();
          ScrollHelper.scrollToY(target, 400);
        }
      }
    });
  }
}
