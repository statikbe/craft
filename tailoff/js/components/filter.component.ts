import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";

ArrayPrototypes.activateFrom();

export class FilterComponent {
  private options = {
    scrollToTopOfResults: true,
    disableScrollOnMobile: true
  };

  private formElement: HTMLFormElement;
  private submitButtonElement: HTMLButtonElement;
  private filterChangeElements: Array<HTMLElement>;
  private loaderAnimationElement: HTMLElement;
  private resultsElement: HTMLElement;
  private filterMobileToggleButtonElement: HTMLElement;
  private filterMobileCollapseElement: HTMLElement;
  private clearFilterButtonElement: HTMLElement;
  private scrollToElement: HTMLElement;
  private showMoreOptionElements: Array<HTMLElement>;

  constructor(options: Object) {
    this.options = { ...this.options, ...options };

    this.formElement = document.querySelector(".js-filter-form");
    if (this.formElement) {
      this.resultsElement = document.querySelector(".js-filter-results");
      if (!this.resultsElement) {
        console.log(
          "You must have an element with class 'js-filter-results' defined in order for the filter plugin to work."
        );
        return;
      }

      this.submitButtonElement = this.formElement.querySelector(
        ".js-filter-submit"
      );
      if (this.submitButtonElement) {
        this.initSubmitButton();
      }

      this.filterChangeElements = Array.from(
        this.formElement.querySelectorAll("input, select")
      );
      this.initFilterChangeElements();

      this.showMoreOptionElements = Array.from(
        this.formElement.querySelectorAll(".js-filter-show-more")
      );
      if (this.showMoreOptionElements.length > 0) {
        this.initShowMore();
      }
    } else {
      return;
    }

    this.loaderAnimationElement = document.querySelector(".js-filter-loader");
    if (this.loaderAnimationElement) {
      this.initLoader();
    }

    this.filterMobileToggleButtonElement = document.querySelector(
      ".js-filter-mobile-toggle"
    );
    if (this.filterMobileToggleButtonElement) {
      this.filterMobileCollapseElement = document.querySelector(
        ".js-filter-mobile-collapse"
      );
      if (this.filterMobileCollapseElement) {
        this.initFilterToggle();
      }
    }

    this.clearFilterButtonElement = document.querySelector(".js-filter-clear");
    if (this.clearFilterButtonElement) {
      this.initClearFilter();
    }

    this.scrollToElement = document.querySelector(".js-filter-scroll-position");
  }
  private initSubmitButton() {}
  private initFilterChangeElements() {}
  private initLoader() {}
  private initFilterToggle() {}
  private initClearFilter() {}
  private initShowMore() {}
}
