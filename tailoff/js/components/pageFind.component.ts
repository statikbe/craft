//You can borrow code and inspiration from http://www.calilighting.com/assets/js/filter/find5.js

import { Helper } from "../utils/helper";

export class PageFindComponent {
  private inputElement: HTMLInputElement;
  private resultsElement: HTMLElement;
  private nextElement: HTMLElement;
  private previousElement: HTMLElement;
  private clearElement: HTMLElement;
  private currentElement: HTMLElement;
  private totalElement: HTMLElement;
  private highlights = [];

  private currentIndex = 1;
  private searchTotal = 0;

  private options = {
    highlightClasses: ["bg-yellow-500"],
    currentHighlightClasses: ["bg-red-500"],
  };

  constructor() {
    const findForm = document.querySelector(
      "form.js-find-form"
    ) as HTMLFormElement;

    if (findForm) {
      this.initFind(findForm);
    }

    // Uncomment to test the hidden event callback.
    // Array.from(document.querySelectorAll("p.hidden")).forEach((el) => {
    //   el.addEventListener("show", () => {
    //     el.classList.remove("hidden");
    //   });
    // });
  }

  private initFind(form: HTMLFormElement) {
    this.inputElement = document.querySelector(".js-find-input");
    this.resultsElement = document.querySelector(".js-page-find-results");
    this.nextElement = document.querySelector(".js-page-find-next");
    this.previousElement = document.querySelector(".js-page-find-prev");
    this.clearElement = document.querySelector(".js-page-find-clear");
    this.currentElement = this.resultsElement.querySelector(".js-current-find");
    this.totalElement = this.resultsElement.querySelector(".js-total-find");

    this.resultsElement.classList.add("hidden");

    this.inputElement.addEventListener(
      "keyup",
      Helper.debounce((event) => {
        let key = event.keyCode;
        if (key === 13) return;
        this.onFind(event);
      }, 500)
    );
    this.nextElement.addEventListener("click", this.gotoNext.bind(this));
    this.previousElement.addEventListener("click", this.gotoPrev.bind(this));
    this.clearElement.addEventListener("click", this.onClear.bind(this));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.gotoNext();
    });
  }

  private onFind(event: Event) {
    this.clearHighlights();

    const mainStr = document.body.textContent;
    const findValue = mainStr.includes(this.inputElement.value);

    if (!findValue) {
      this.resultsElement.classList.add("hidden");
      return false;
    }

    let query = this.inputElement.value;

    query = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    this.searchTotal = (mainStr.match(new RegExp(query, "gi")) || []).length;

    this.resultsElement.classList.remove("hidden");
    this.totalElement.innerText = `${this.searchTotal}`;
    this.currentElement.innerText = `1`;
    this.currentIndex = 1;

    this.highlightWord(this.inputElement.value);
    this.scrollToQuery(this.highlights[this.currentIndex - 1]);
  }

  private highlightWord(word: string, node?: any) {
    if (!node) node = document.body;

    for (
      let childNode = node.firstChild;
      childNode;
      childNode = childNode.nextSibling
    ) {
      if (childNode.nodeType == 3) {
        // text node
        let n = childNode;
        let match_pos = 0;

        match_pos = n.nodeValue.toLowerCase().indexOf(word.toLowerCase()); // Ver 5.3b - Using toLowerCase().indexOf instead

        if (match_pos > -1) {
          // if we found a match
          let before = n.nodeValue.substr(0, match_pos); // split into a part before the match
          let middle = n.nodeValue.substr(match_pos, word.length); // the matched word to preserve case
          let after = document.createTextNode(
            n.nodeValue.substr(match_pos + word.length)
          ); // and the part after the match
          let highlightSpan = document.createElement("span"); // create a span in the middle

          highlightSpan.classList.add(...this.options.highlightClasses);
          highlightSpan.appendChild(document.createTextNode(middle)); // insert word as textNode in new span
          n.nodeValue = before; // Turn node data into before
          n.parentNode.insertBefore(after, n.nextSibling); // insert after
          n.parentNode.insertBefore(highlightSpan, n.nextSibling); // insert new span
          this.highlights.push(highlightSpan); // add new span to highlightWords array
          highlightSpan.id = "highlight_span" + this.highlights.length;
          childNode = childNode.nextSibling; // Advance to next node or we get stuck in a loop because we created a span (child)
        }
      } // if not text node then it must be another element
      else {
        // nodeType 1 = element
        if (childNode.nodeType == 1) {
          this.highlightWord(word, childNode);
        }
      }
    }
  }

  private clearHighlights() {
    this.highlights.forEach((highlight) => {
      highlight.outerHTML = highlight.innerText;
    });

    this.highlights = [];
  }

  private onClear() {
    this.clearHighlights();
    this.inputElement.value = "";
    this.resultsElement.classList.add("hidden");
  }

  private gotoNext() {
    this.highlights[this.currentIndex - 1].classList.add(
      ...this.options.highlightClasses
    );
    this.highlights[this.currentIndex - 1].classList.remove(
      ...this.options.currentHighlightClasses
    );
    this.currentIndex++;

    if (this.currentIndex > this.searchTotal) {
      this.currentIndex = 1;
    }

    this.currentElement.innerText = `${this.currentIndex}`;
    this.scrollToQuery(this.highlights[this.currentIndex - 1]);
  }

  private gotoPrev() {
    this.highlights[this.currentIndex - 1].classList.add(
      ...this.options.highlightClasses
    );
    this.highlights[this.currentIndex - 1].classList.remove(
      ...this.options.currentHighlightClasses
    );
    this.currentIndex--;

    if (this.currentIndex < 1) {
      this.currentIndex = this.searchTotal;
    }
    this.currentElement.innerText = `${this.currentIndex}`;
    this.scrollToQuery(this.highlights[this.currentIndex - 1]);
  }

  private scrollToQuery(element: HTMLElement) {
    const hiddenElement = this.isElementHidden(element);
    if (hiddenElement) {
      let event;
      if (typeof Event === "function") {
        event = new Event("show");
      } else {
        event = document.createEvent("Event");
        event.initEvent("show", true, true);
      }
      hiddenElement.dispatchEvent(event);
    }

    element.classList.add(...this.options.currentHighlightClasses);
    element.classList.remove(...this.options.highlightClasses);
    const top = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const elementTopOffset = element.offsetTop;

    if (elementTopOffset - top > windowHeight || elementTopOffset < top) {
      document.documentElement.scrollTop = elementTopOffset - windowHeight / 2;
    }
  }

  private isElementHidden(element) {
    if (window.getComputedStyle(element).display === "none") {
      return element;
    } else {
      if (element.parentElement) {
        return this.isElementHidden(element.parentElement);
      } else {
        return false;
      }
    }
  }
}
