export default class StickyHeaderComponent {
  constructor() {
    let lastScrollTop = window.scrollY;
    let scrollingUp = false;

    document.addEventListener('scroll', () => {
      const currentScrollTop = window.scrollY;
      if (currentScrollTop < lastScrollTop && currentScrollTop > 0) {
        if (!scrollingUp) {
          scrollingUp = true;
          this.scrollingUp();
        }
      } else {
        if (scrollingUp) {
          this.scrollingDown();
        }
        scrollingUp = false;
      }
      lastScrollTop = currentScrollTop;
    });
  }

  private scrollingUp() {
    Array.from(document.querySelectorAll('[data-sticky-header-reveal]')).forEach((element) => {
      element.setAttribute('data-show', '');
    });
  }

  private scrollingDown() {
    Array.from(document.querySelectorAll('[data-sticky-header-reveal]')).forEach((element) => {
      element.removeAttribute('data-show');
    });
  }
}
