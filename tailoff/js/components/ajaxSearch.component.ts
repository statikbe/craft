// based on: https://adamsilver.io/articles/building-an-accessible-autocomplete-control/
// import Promise from "promise-polyfill";
import "core-js/modules/es.promise";
import "core-js/modules/es.array.iterator";

import { Ajax } from "../utils/ajax";
import { DOMHelper } from "../utils/domHelper";
import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
import { SiteLang } from "../utils/site-lang";
import { Formatter } from "../utils/formater";

ArrayPrototypes.activateFrom();

export class AjaxSearchComponent {
  constructor() {
    Array.from(
      document.querySelectorAll(
        "[data-s-ajax-search], [data-s-ajax-search-callback]"
      )
    ).forEach((search, index) => {
      if (search.tagName === "INPUT") {
        new AjaxSearch(search as HTMLInputElement, index);
      }
    });

    DOMHelper.onDynamicContent(
      document.documentElement,
      "select[data-s-ajax-search], select[data-s-ajax-search-callback]",
      (search) => {
        Array.from(search).forEach((s: HTMLInputElement, index) => {
          new AjaxSearch(s, index);
        });
      }
    );
  }
}

class AjaxSearch {
  private lang = require(`../i18n/s-ajax-search-${SiteLang.getLang()}.json`);

  private ajaxSearchElement: HTMLDivElement;
  private inputElement: HTMLInputElement;
  private ajaxURL: string;
  private options: Array<HTMLElement> = [];
  private searchCallback = "";
  private ajaxMethod = "GET";
  private ajaxQueryName = "data";
  private dataArray = "";

  private resultTemplate = "";
  private noresultTemplate = "";
  private noresultText = this.lang.nothingFound;

  private autocompleteInputWrapper: HTMLDivElement;
  private ajaxSearchListElement: HTMLUListElement;
  private statusElement: HTMLDivElement;

  private inputKeyUpListener;
  private inputFocusListener;
  private inputKeyDownListener;
  private documentClickListener;

  private hoverOption: HTMLElement;
  private isDisabled = false;

  private keys = {
    esc: 27,
    up: 38,
    left: 37,
    right: 39,
    space: 32,
    enter: 13,
    tab: 9,
    shift: 16,
    down: 40,
    backspace: 8,
  };

  constructor(input: HTMLInputElement, index) {
    this.inputElement = input;
    this.ajaxURL = this.inputElement.getAttribute("data-s-ajax-search");
    this.searchCallback = this.inputElement.getAttribute(
      "data-s-ajax-search-callback"
    );

    if (this.ajaxURL || this.searchCallback) {
      if (this.ajaxURL) {
        this.ajaxMethod =
          this.inputElement.getAttribute("data-s-ajax-search-methode") != null
            ? this.inputElement.getAttribute("data-s-ajax-search-methode")
            : this.ajaxMethod;

        this.ajaxQueryName =
          this.inputElement.getAttribute("data-s-ajax-search-query") != null
            ? this.inputElement.getAttribute("data-s-ajax-search-query")
            : this.ajaxQueryName;
      }

      this.noresultText =
        this.inputElement.getAttribute("data-s-ajax-search-no-result-text") !=
        null
          ? this.inputElement.getAttribute("data-s-ajax-search-no-result-text")
          : this.noresultText;

      if (
        this.inputElement.getAttribute("data-s-ajax-search-result-template") !=
        null
      ) {
        const template = document.getElementById(
          this.inputElement.getAttribute("data-s-ajax-search-result-template")
        );
        this.resultTemplate = template != null ? template.innerHTML : "";
      }

      if (
        this.inputElement.getAttribute(
          "data-s-ajax-search-no-result-template"
        ) != null
      ) {
        const template = document.getElementById(
          this.inputElement.getAttribute(
            "data-s-ajax-search-no-result-template"
          )
        );
        this.noresultTemplate = template != null ? template.innerHTML : "";
      }

      this.dataArray = this.inputElement.getAttribute(
        "data-s-ajax-search-data"
      );

      this.inputElement.removeAttribute("data-s-ajax-search");
      this.inputElement.setAttribute("aria-controls", `ajaxSearchList${index}`);
      this.inputElement.setAttribute("autocapitalize", "none");
      this.inputElement.setAttribute("autocomplete", "off");
      this.inputElement.setAttribute("aria-autocomplete", "list");
      this.inputElement.setAttribute("aria-expanded", "false");

      this.isDisabled =
        this.inputElement.getAttribute("disabled") != null ? true : false;

      this.ajaxSearchElement = document.createElement("div");
      this.ajaxSearchElement.classList.add("ajax-search");
      if (this.isDisabled) {
        this.ajaxSearchElement.classList.add("disabled");
      }
      this.inputElement.insertAdjacentElement(
        "afterend",
        this.ajaxSearchElement
      );

      this.autocompleteInputWrapper = document.createElement("div");
      this.autocompleteInputWrapper.classList.add("ajax-search__input-wrapper");
      this.autocompleteInputWrapper.insertAdjacentElement(
        "beforeend",
        this.inputElement
      );

      this.ajaxSearchElement.insertAdjacentElement(
        "afterbegin",
        this.autocompleteInputWrapper
      );

      this.inputKeyUpListener = this.onKeyUp.bind(this);
      this.inputElement.addEventListener("keyup", this.inputKeyUpListener);

      this.inputKeyDownListener = this.onKeyDown.bind(this);
      this.inputElement.addEventListener("keydown", this.inputKeyDownListener);

      this.inputFocusListener = this.onFocus.bind(this);
      this.inputElement.addEventListener("focus", this.inputFocusListener);

      this.ajaxSearchListElement = document.createElement("ul");
      this.ajaxSearchListElement.setAttribute("id", `ajaxSearchList${index}`);
      this.ajaxSearchListElement.setAttribute("role", "listbox");
      this.ajaxSearchListElement.classList.add("ajax-search__list");
      this.ajaxSearchListElement.classList.add("hidden");

      this.ajaxSearchElement.insertAdjacentElement(
        "beforeend",
        this.ajaxSearchListElement
      );

      this.statusElement = document.createElement("div");
      this.statusElement.setAttribute("aria-live", "polite");
      this.statusElement.setAttribute("role", "status");
      this.statusElement.classList.add("sr-only");

      this.ajaxSearchElement.insertAdjacentElement(
        "beforeend",
        this.statusElement
      );

      this.documentClickListener = this.onDocumentClick.bind(this);
      document.addEventListener("click", this.documentClickListener);
    } else {
      console.error(
        "No URL defined to make the ajax call for the search. Make sure you give the attribute data-s-ajax-search a value!"
      );
    }
  }

  private onKeyUp(e) {
    switch (e.keyCode) {
      case this.keys.left:
      case this.keys.right:
      case this.keys.space:
      case this.keys.shift:
        break;
      case this.keys.esc:
        this.hideMenu();
        break;
      case this.keys.enter:
        e.preventDefault();
        if (this.hoverOption) {
          const link = this.hoverOption.querySelector("a");
          if (link) {
            link.click();
          }
        }
        break;
      case this.keys.up:
        e.preventDefault();
        // If the first option is focused, set focus to the text box. Otherwise set focus to the previous option.
        if (this.hoverOption) {
          let previousSib = this.hoverOption.previousElementSibling;
          if (this.hoverOption && previousSib) {
            this.highlightOption(previousSib as HTMLElement);
          } else {
            this.highlightOption(
              this.ajaxSearchListElement.lastChild as HTMLElement
            );
          }
        }
        break;
      case this.keys.down:
        e.preventDefault();
        if (
          this.ajaxSearchListElement.classList.contains("hidden") &&
          this.options.length > 0
        ) {
          this.onTextBoxDownPressed(e);
        } else {
          // Focus the next menu option. If it’s the last menu option, do nothing.
          if (this.hoverOption) {
            let nextSib = this.hoverOption.nextElementSibling;
            if (this.hoverOption && nextSib) {
              this.highlightOption(nextSib as HTMLElement);
            } else {
              this.highlightOption(
                this.ajaxSearchListElement.firstChild as HTMLElement
              );
            }
          } else {
            this.highlightOption(
              this.ajaxSearchListElement.firstChild as HTMLElement
            );
          }
        }
        break;
      default:
        this.onTextBoxType(e);
    }
  }

  private onKeyDown(e) {
    switch (e.keyCode) {
      case this.keys.tab:
        // Hide the menu.
        this.hideMenu();
        break;
    }
  }

  private onFocus(e) {
    if (this.inputElement.value.trim().length > 0) {
      if (this.searchCallback) {
        window[this.searchCallback](
          this.inputElement.value.trim().toLowerCase()
        ).then((data) => {
          this.showData(data);
        });
      } else {
        this.getData(this.inputElement.value.trim().toLowerCase());
      }
    }
  }

  private onDocumentClick(e) {
    if (!this.ajaxSearchElement.contains(e.target)) {
      this.hideMenu();
    }
  }

  private onTextBoxType(e) {
    // only show options if user typed something
    if (this.inputElement.value.trim().length > 0) {
      if (this.searchCallback) {
        if (window[this.searchCallback]) {
          window[this.searchCallback](
            this.inputElement.value.trim().toLowerCase()
          ).then((data) => {
            this.showData(data);
          });
        }
      } else {
        this.getData(this.inputElement.value.trim().toLowerCase());
      }
    } else {
      this.hideMenu();
    }
  }

  private onTextBoxDownPressed(e) {
    this.showMenu();
    if (this.options.length > 0) {
      this.highlightOption(this.options[0] as HTMLElement);
    }
  }

  private showMenu() {
    this.ajaxSearchListElement.classList.remove("hidden");
    this.inputElement.setAttribute("aria-expanded", "true");
  }

  private hideMenu() {
    this.ajaxSearchListElement.classList.add("hidden");
    this.inputElement.setAttribute("aria-expanded", "false");
    this.inputElement.removeAttribute("aria-activedescendant");
  }

  private getData(query: string, callback: Function = null) {
    let xhr = null;
    let data = null;
    let url = this.ajaxURL;
    if (this.ajaxMethod == "GET") {
      if (this.ajaxQueryName === "") {
        url += query;
      } else {
        if (url.indexOf("?") < 0) {
          url += `?${this.ajaxQueryName}=${query}`;
        } else {
          url += `&${this.ajaxQueryName}=${query}`;
        }
      }
    }
    if (this.ajaxMethod == "POST") {
      data = {};
      data[this.ajaxQueryName] = query;
    }

    xhr = Ajax.call({
      url: url,
      data: data,
      method: this.ajaxMethod,
      xhr: xhr,
      success: (data) => {
        if (!Array.isArray(data)) {
          data = [data];
        }
        this.showData(data);
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  private showData(data) {
    this.ajaxSearchListElement.innerHTML = "";
    if (this.dataArray) {
      this.dataArray.split(".").forEach((param) => {
        if (data) {
          data = data[param];
        }
      });
    }
    data.forEach((info) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      if (this.resultTemplate == "") {
        li.innerText = info;
      } else {
        li.innerHTML = Formatter.parseTemplate(this.resultTemplate, info);
      }
      const link = li.querySelector("a");
      if (link) {
        link.setAttribute("tabindex", "-1");
      }
      this.ajaxSearchListElement.insertAdjacentElement("beforeend", li);
    });
    this.updateStatus(data.length);
    if (data.length == 0) {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      if (this.noresultTemplate == "") {
        li.innerText = this.noresultText;
      } else {
        li.innerHTML = this.noresultTemplate;
      }
      this.ajaxSearchListElement.insertAdjacentElement("beforeend", li);
    }
    this.showMenu();
  }

  private updateStatus(nbr: number) {
    if (this.statusElement) {
      this.statusElement.innerText = `${nbr} ${this.lang.resultsAvailable}`;
    }
  }

  private highlightOption(option: HTMLElement) {
    if (this.hoverOption) {
      this.hoverOption.classList.remove("highlight");
    }
    if (option) {
      option.classList.add("highlight");
      this.ajaxSearchListElement.scrollTop = option.offsetTop;
      this.inputElement.setAttribute("aria-activedescendant", option.id);
    }
    this.hoverOption = option;
  }
}
