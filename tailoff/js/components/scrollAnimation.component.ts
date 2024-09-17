import { DOMHelper } from "../utils/domHelper";

export class ScrollAnimationComponent {
  private rootMargin = "-50px";
  private scrollDelay = 200;

  constructor() {
    const _self = this;
    window.addEventListener("load", function () {
      const scrollObserver = new IntersectionObserver(
        (entries, observer) => {
          let delayIndex = 0;
          entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              el.classList.add("scrolled");
              if (el.classList.contains("scroll-delay")) {
                el.style.transitionDelay = `${
                  _self.scrollDelay * delayIndex
                }ms`;
                delayIndex++;
              }
              observer.unobserve(el);
            }
          });
        },
        {
          rootMargin: _self.rootMargin,
        }
      );

      const scrollAnimationElements = document.querySelectorAll(".scroll-ani");
      Array.from(scrollAnimationElements).forEach((el) => {
        scrollObserver.observe(el);
      });

      DOMHelper.onDynamicContent(
        document.documentElement,
        ".scroll-ani",
        (scrollAnimationElements) => {
          scrollAnimationElements.forEach((el) => {
            scrollObserver.observe(el);
          });
        }
      );
    });
  }
}
