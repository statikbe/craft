export class StickyHeader {
  private body: HTMLBodyElement;
  private header: HTMLElement;
  private headerHeight = 0;
  private previousTopPosition = 0;
  private onlyShowOnScrollUp = false;
  private dropInPlace = false;

  constructor() {
    this.body = document.getElementsByTagName("BODY")[0] as HTMLBodyElement;
    this.header = document.querySelector("[data-s-sticky-header]");
    if (this.header) {
      this.onlyShowOnScrollUp =
        this.header.getAttribute("data-only-show-on-scroll-up") !== null &&
        this.header.getAttribute("data-only-show-on-scroll-up") !== "false";
      this.dropInPlace =
        this.header.getAttribute("data-drop-in-place") !== null &&
        this.header.getAttribute("data-drop-in-place") !== "false";
      this.headerHeight = this.header.clientHeight;

      if (!this.onlyShowOnScrollUp) {
        this.header.classList.add("fixed-sticky-header");
        this.body.style.paddingTop = `${this.headerHeight}px`;
      }
      document.addEventListener("scroll", this.onPageScroll.bind(this));
    }
  }

  private onPageScroll(e) {
    const top = window.pageYOffset || document.documentElement.scrollTop;
    if (this.onlyShowOnScrollUp) {
      if (
        top > this.headerHeight &&
        !this.body.classList.contains("header-out-of-view")
      ) {
        this.header.classList.add("invisible");
        this.body.classList.add("header-out-of-view");
        this.body.style.paddingTop = `${this.headerHeight}px`;
      }
      if (
        ((!this.dropInPlace && top <= this.headerHeight) ||
          (this.dropInPlace && top <= 0)) &&
        this.body.classList.contains("header-out-of-view")
      ) {
        this.body.classList.remove("header-out-of-view");
        this.body.style.paddingTop = "";
      }

      if (
        top > this.headerHeight &&
        top < this.previousTopPosition &&
        !this.body.classList.contains("header-slide-in")
      ) {
        this.header.classList.remove("invisible");
        this.body.classList.add("header-slide-in");
      }
      if (
        top > this.headerHeight &&
        top > this.previousTopPosition &&
        this.body.classList.contains("header-slide-in")
      ) {
        this.body.classList.remove("header-slide-in");
      }
    } else {
      if (
        top > this.headerHeight &&
        !this.body.classList.contains("header-out-of-view")
      ) {
        this.body.classList.add("header-out-of-view");
      }
      if (
        top <= this.headerHeight &&
        this.body.classList.contains("header-out-of-view")
      ) {
        this.body.classList.remove("header-out-of-view");
      }
    }

    this.previousTopPosition = top;
  }
}
