import { Ajax } from "../utils/ajax";
import { DOMHelper } from "../utils/domHelper";

export class SiteComponent {
  constructor() {
    const copyButtons = document.querySelectorAll(".js-copy-selector");
    if (copyButtons) {
      Array.from(copyButtons).forEach((button: HTMLElement) => {
        this.initCopyButton(button);
      });

      DOMHelper.onDynamicContent(
        document.documentElement,
        ".js-copy-selector",
        (copyButtons) => {
          Array.from(copyButtons).forEach((button: HTMLElement) => {
            this.initCopyButton(button);
          });
        }
      );
    }

    const retestButtons = document.querySelectorAll(".js-retest-btn");
    if (retestButtons) {
      Array.from(retestButtons).forEach((button: HTMLElement) => {
        this.initRetestButton(button);
      });

      DOMHelper.onDynamicContent(
        document.documentElement,
        ".js-retest-btn",
        (retestButtons) => {
          Array.from(retestButtons).forEach((button: HTMLElement) => {
            this.initRetestButton(button);
          });
        }
      );
    }
  }

  private initCopyButton(button: HTMLElement) {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const target = button.parentElement.querySelector("pre") as HTMLElement;
      const text = target.innerText;
      navigator.clipboard.writeText(text).then(() => {
        button.classList.add("copied");
        setTimeout(() => {
          button.classList.remove("copied");
        }, 2000);
      });
    });
  }

  private initRetestButton(button: HTMLElement) {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const url = button.getAttribute("data-url");
      const api = button.getAttribute("data-api");
      const element = button.getAttribute("data-element");
      const apiUrl = `${api}?url=${url}`;
      button.classList.add("testing");
      Ajax.call({
        url: apiUrl,
        method: "GET",
        success: (response) => {
          button.classList.remove("testing");
          const responseElement =
            document.implementation.createHTMLDocument("");
          responseElement.body.innerHTML = response;
          const oldElement = document.getElementById(element);
          const newElement = responseElement.getElementById(element);
          if (newElement) {
            oldElement.innerHTML = newElement.innerHTML;
          } else {
            oldElement.innerHTML = "No more errors found";
          }
        },
        error: (response) => {
          button.classList.remove("testing");
          console.log(response);
        },
      });
    });
  }
}
