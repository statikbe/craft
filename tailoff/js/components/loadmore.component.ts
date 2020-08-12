export class LoadMoreComponent {
  private xhr: XMLHttpRequest;

  constructor() {
    document.addEventListener(
      "click",
      (e) => {
        // loop parent nodes from the target to the delegation node
        for (
          let target = <Element>e.target;
          target && !target.isSameNode(document);
          target = target.parentElement
        ) {
          if (target.matches(".js-load-more")) {
            e.preventDefault();
            this.initAction(target);
            break;
          }
        }
      },
      false
    );
  }

  private initAction(el: Element) {
    el.classList.add("hidden");
    const wrapper = el.getAttribute("data-load-wrapper");
    if (wrapper) {
      this.getNextPage(el.getAttribute("href"), wrapper);
      document
        .querySelector(`#${wrapper} .js-pagination-loader`)
        .classList.remove("hidden");
    } else {
      this.getNextPage(el.getAttribute("href"));
      document
        .querySelector(".js-pagination-loader")
        .classList.remove("hidden");
    }
  }

  private getNextPage(url, wrapper: string = "") {
    const _self = this;
    if (this.xhr) {
      this.xhr.abort();
    }

    this.xhr = new XMLHttpRequest();
    this.xhr.open("GET", url, true);

    this.xhr.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        const responseElement = document.implementation.createHTMLDocument("");
        responseElement.body.innerHTML = this.response;

        if (wrapper !== "") {
          document.querySelector(
            `#${wrapper} .js-pagination`
          ).innerHTML = responseElement.querySelector(
            `#${wrapper} .js-pagination`
          ).innerHTML;

          document
            .querySelector(`#${wrapper} .js-pagination-container`)
            .insertAdjacentHTML(
              "beforeend",
              responseElement.querySelector(
                `#${wrapper} .js-pagination-container`
              ).innerHTML
            );
        } else {
          document.querySelector(
            ".js-pagination"
          ).innerHTML = responseElement.querySelector(
            ".js-pagination"
          ).innerHTML;

          document
            .querySelector(".js-pagination-container")
            .insertAdjacentHTML(
              "beforeend",
              responseElement.querySelector(".js-pagination-container")
                .innerHTML
            );
        }

        // history.pushState("", "New URL: " + url, url);
      } else {
        console.log("Something went wrong when fetching data");
      }
    };

    this.xhr.onerror = function () {
      console.log("There was a connection error");
    };

    this.xhr.send();
  }
}
