import { DOMHelper } from '../utils/domHelper';
import { ScrollHelper } from '../utils/scroll';

export default class ScrollToAnchorComponent {
  constructor() {
    // Find all elements with the data-smooth-scroll attribute
    const scrollLinks = document.querySelectorAll('[data-smooth-scroll]');
    scrollLinks.forEach((link: HTMLAnchorElement) => {
      // Initialize smooth scrolling for each link
      this.initScrollToDataAttr(link);
    });
  }

  private initScrollToDataAttr(link: HTMLElement) {
    // Add a click event listener to the link
    link.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default link behavior

      // Get the ID of the target element from the href attribute
      const targetId = link.getAttribute('href')?.slice(1);
      if (targetId) {
        // Find the target element by its ID
        const target = document.getElementById(targetId) as HTMLElement;
        if (target) {
          // Get the scroll duration from the data-scroll-duration attribute
          // If the attribute is not present, use a default of 400 milliseconds
          const scrollDuration = parseInt(link.getAttribute('data-scroll-duration') || '400', 10);

          // Scroll smoothly to the target element using the specified duration
          ScrollHelper.scrollToY(target, scrollDuration);
        }
      }
    });
  }
}
