// based on: https://adamsilver.io/articles/building-an-accessible-autocomplete-control/

import { DOMHelper } from "../utils/domHelper";
import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
import { SiteLang } from "../utils/site-lang";

ArrayPrototypes.activateFrom();
ArrayPrototypes.activateFind();

interface AutocompleteOption {
  text: string;
  value: string;
}

export class AutocompleteComponent {
  constructor() {
    Array.from(document.querySelectorAll("[data-s-autocomplete]")).forEach(
      (autocomplete, index) => {
        if (autocomplete.tagName === "SELECT") {
          new Autocomplete(autocomplete as HTMLSelectElement, index);
        }
      }
    );

    DOMHelper.onDynamicContent(
      document.documentElement,
      "select[data-s-autocomplete]",
      (autocompletes) => {
        Array.from(autocompletes).forEach((ac: HTMLSelectElement, index) => {
          new Autocomplete(ac, index);
        });
      }
    );
  }
}

class Autocomplete {
  private lang = require(`../i18n/s-autocomplete-${SiteLang.getLang()}.json`);

  private autocompleteListIndex: number = 0;

  private selectElement: HTMLSelectElement;
  private autocompleteElement: HTMLDivElement;
  private inputElement: HTMLInputElement;
  private autocompleteSelectElement: HTMLDivElement;
  private autocompleteInputWrapper: HTMLDivElement;
  private autocompletePlaceholderElement: HTMLDivElement;
  private autocompleteListElement: HTMLUListElement;
  private statusElement: HTMLDivElement;
  private freeTypeOption: HTMLOptionElement;

  private options: Array<AutocompleteOption> = new Array<AutocompleteOption>();
  private selectedOptions: Array<AutocompleteOption> = new Array<AutocompleteOption>();

  private inputKeyUpListener;
  private inputKeyDownListener;
  private inputFocusListener;
  private inputBlurListener;
  private documentClickListener;
  private menuClickListener;
  // private menuKeyDownListener;
  private clearOptionClickListener;
  private clearOptionKeyDownListener;

  private selectMutationObserver: MutationObserver;

  private hoverOption: HTMLElement;
  private isMultiple = false;
  private isDisabled = false;
  private isFreeType = false;

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

  constructor(autocomplete: HTMLSelectElement, index) {
    this.autocompleteListIndex = index;
    this.selectElement = autocomplete;
    autocomplete.removeAttribute("data-s-autocomplete");

    this.selectMutationObserver = new MutationObserver(
      this.selectMutation.bind(this)
    );
    this.selectMutationObserver.observe(this.selectElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    this.isDisabled =
      this.selectElement.getAttribute("disabled") != null ? true : false;
    this.isFreeType =
      this.selectElement.getAttribute("free-type") != null ? true : false;
    this.isMultiple =
      this.selectElement.getAttribute("multiple") != null ? true : false;

    this.selectElement.addEventListener("jschange", () => {
      if (this.selectElement.value == "") {
        this.selectedOptions = [];
        this.inputElement.value = "";
        this.inputElement.size = Math.max(
          this.inputElement.value.length + 1,
          1
        );
        this.showPlaceholder();
        this.fillList(this.options);
      }
      if (this.isMultiple) {
        const selectedOptions = Array.from(this.selectElement.selectedOptions);
        this.selectedOptions = this.options.filter((o) => {
          if (selectedOptions.find((so) => so.value == o.value)) {
            return o;
          }
        });
        this.showSelectedOptions();
      }
    });

    this.autocompleteElement = document.createElement("div");
    this.autocompleteElement.classList.add("autocomplete");
    if (this.isDisabled) {
      this.autocompleteElement.classList.add("disabled");
    }

    this.autocompleteSelectElement = document.createElement("div");
    this.autocompleteSelectElement.classList.add("autocomplete__select");
    this.autocompleteElement.insertAdjacentElement(
      "beforeend",
      this.autocompleteSelectElement
    );
    Array.from(this.selectElement.classList).forEach((c) => {
      this.autocompleteSelectElement.classList.add(c);
    });

    this.autocompleteSelectElement.addEventListener("click", () => {
      if (!this.isDisabled) {
        this.hidePlaceholder();
        this.inputElement.focus();
        this.showMenu();
      }
    });

    this.autocompletePlaceholderElement = document.createElement("div");
    this.autocompletePlaceholderElement.classList.add(
      "autocomplete__placeholder"
    );
    this.autocompletePlaceholderElement.setAttribute("aria-hidden", "true");

    this.autocompleteInputWrapper = document.createElement("div");
    this.autocompleteInputWrapper.classList.add("autocomplete__input-wrapper");
    this.autocompleteInputWrapper.classList.add("has-placeholder");
    this.autocompleteInputWrapper.insertAdjacentElement(
      "beforeend",
      this.autocompletePlaceholderElement
    );
    this.autocompleteSelectElement.insertAdjacentElement(
      "beforeend",
      this.autocompleteInputWrapper
    );

    this.inputElement = document.createElement("input");
    this.inputElement.setAttribute("aria-controls", `autocompleteList${index}`);
    this.inputElement.setAttribute("autocapitalize", "none");
    this.inputElement.setAttribute("type", "text");
    this.inputElement.setAttribute("autocomplete", "off");
    this.inputElement.setAttribute("aria-autocomplete", "list");
    this.inputElement.setAttribute("role", "combobox");
    this.inputElement.setAttribute("aria-expanded", "false");
    this.inputElement.classList.add("no-hook");
    this.inputElement.size = 1;
    if (this.selectElement.hasAttribute("id")) {
      this.inputElement.setAttribute(
        "id",
        this.selectElement.getAttribute("id")
      );
      this.selectElement.removeAttribute("id");
    }

    this.inputKeyUpListener = this.onKeyUp.bind(this);
    this.inputElement.addEventListener("keyup", this.inputKeyUpListener);

    this.inputKeyDownListener = this.onKeyDown.bind(this);
    this.inputElement.addEventListener("keydown", this.inputKeyDownListener);

    this.inputFocusListener = this.onFocus.bind(this);
    this.inputElement.addEventListener("focus", this.inputFocusListener);

    this.inputBlurListener = this.onBlur.bind(this);
    this.inputElement.addEventListener("blur", this.inputBlurListener);

    this.autocompleteInputWrapper.insertAdjacentElement(
      "beforeend",
      this.inputElement
    );

    const icon = document.createElement("button");
    icon.classList.add("autocomplete__dropdown-icon");
    icon.setAttribute("aria-label", "Open");
    icon.setAttribute("tabindex", "-1");

    icon.addEventListener("click", (e) => {
      e.preventDefault();
      if (!this.isDisabled) {
        e.stopPropagation();
        this.toggleMenu();
        this.inputElement.focus();
      }
    });

    this.autocompleteSelectElement.insertAdjacentElement("beforeend", icon);

    this.autocompleteListElement = document.createElement("ul");
    this.autocompleteListElement.setAttribute("id", `autocompleteList${index}`);
    this.autocompleteListElement.setAttribute("role", "listbox");
    this.autocompleteListElement.classList.add("hidden");
    if (this.isMultiple) {
      this.autocompleteListElement.setAttribute("aria-multiselectable", "true");
    }

    this.menuClickListener = this.onMenuClick.bind(this);
    this.autocompleteListElement.addEventListener(
      "click",
      this.menuClickListener
    );

    this.autocompleteElement.insertAdjacentElement(
      "beforeend",
      this.autocompleteListElement
    );

    Array.from(this.selectElement.querySelectorAll("option")).forEach(
      (option, index) => {
        if (option.value !== "") {
          this.options.push({
            text: option.innerText,
            value: option.value,
          });

          if (option.selected) {
            this.selectedOptions.push(this.options[this.options.length - 1]);

            if (!this.isMultiple) {
              this.hidePlaceholder();
              this.inputElement.value = option.innerText;
              this.inputElement.size = Math.max(
                this.inputElement.value.length + 1,
                1
              );
            }
          }
        } else {
          if (index === 0) {
            this.autocompletePlaceholderElement.innerText = option.innerText;
          }
        }
      }
    );
    this.fillList(this.options);

    if (this.isFreeType) {
      this.freeTypeOption = document.createElement("option");
      this.selectElement.insertAdjacentElement(
        "afterbegin",
        this.freeTypeOption
      );
    }

    this.statusElement = document.createElement("div");
    this.statusElement.setAttribute("aria-live", "polite");
    this.statusElement.setAttribute("role", "status");
    this.statusElement.classList.add("sr-only");

    this.autocompleteElement.insertAdjacentElement(
      "beforeend",
      this.statusElement
    );

    this.selectElement.insertAdjacentElement(
      "afterend",
      this.autocompleteElement
    );

    const wrapperStyles = window.getComputedStyle(
      this.autocompleteInputWrapper
    );
    this.inputElement.style.maxWidth = `${
      this.autocompleteInputWrapper.clientWidth -
      parseFloat(wrapperStyles.paddingLeft) -
      parseFloat(wrapperStyles.paddingRight)
    }px`;

    this.selectElement.setAttribute("aria-hidden", "true");
    this.selectElement.setAttribute("tabindex", "-1");
    this.selectElement.classList.add("hidden");

    if (this.isMultiple) {
      this.clearOptionClickListener = this.onClickClearOption.bind(this);
      this.clearOptionKeyDownListener = this.onKeyDownClearOption.bind(this);
      if (this.selectedOptions.length > 0) {
        this.hidePlaceholder();
        this.showSelectedOptions();
      }
    }

    this.documentClickListener = this.onDocumentClick.bind(this);
    document.addEventListener("click", this.documentClickListener);
  }

  private selectMutation(mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
      } else if (mutation.type === "attributes") {
        switch (mutation.attributeName) {
          case "disabled":
            this.isDisabled =
              this.selectElement.getAttribute("disabled") != null
                ? true
                : false;
            if (this.isDisabled) {
              this.autocompleteElement.classList.add("disabled");
            } else {
              this.autocompleteElement.classList.remove("disabled");
            }
            break;
        }
      }
    }
  }

  private fillList(optionList: Array<AutocompleteOption>) {
    this.autocompleteListElement.innerHTML = "";

    optionList.forEach((option, index) => {
      const item = document.createElement("li");
      item.setAttribute("role", "option");
      item.setAttribute("data-option-value", option.value);
      item.setAttribute("id", `option-${this.autocompleteListIndex}-${index}`);

      if (this.selectedOptions.find((o) => o.value == option.value)) {
        item.setAttribute("aria-selected", "true");
      } else {
        item.setAttribute("aria-selected", "false");
      }
      item.innerText = option.text;
      this.autocompleteListElement.insertAdjacentElement("beforeend", item);
    });
    // update the live region
    this.updateStatus(optionList.length);
  }

  private onKeyUp(e) {
    switch (e.keyCode) {
      case this.keys.left:
      case this.keys.right:
      case this.keys.space:
      case this.keys.shift:
        break;
      case this.keys.esc:
        if (this.autocompleteListElement.classList.contains("hidden")) {
          this.inputElement.value = "";
        } else {
          this.hideMenu();
        }
        break;
      case this.keys.enter:
        e.preventDefault();
        // Select the currently highlighted option and focus the text box.
        if (this.hoverOption) {
          this.selectOption(this.hoverOption);
        }
        break;
      case this.keys.tab:
        // Hide the menu.
        this.hideMenu();
        break;
      case this.keys.up:
        e.preventDefault();
        // If the first option is focused, set focus to the text box. Otherwise set focus to the previous option.
        if (this.hoverOption) {
          let previousSib = this.hoverOption.previousElementSibling;
          if (this.hoverOption && previousSib) {
            if (previousSib.classList.contains("currently-selected-divider")) {
              previousSib =
                previousSib.previousElementSibling ||
                (this.autocompleteListElement.lastChild as Element);
            }
            this.highlightOption(previousSib as HTMLElement);
          } else {
            this.highlightOption(
              this.autocompleteListElement.lastChild as HTMLElement
            );
          }
        }
        break;
      case this.keys.down:
        e.preventDefault();
        if (this.autocompleteListElement.classList.contains("hidden")) {
          this.onTextBoxDownPressed(e);
        } else {
          // Focus the next menu option. If it’s the last menu option, do nothing.
          if (this.hoverOption) {
            let nextSib = this.hoverOption.nextElementSibling;
            if (this.hoverOption && nextSib) {
              if (nextSib.classList.contains("currently-selected-divider")) {
                nextSib =
                  nextSib.nextElementSibling ||
                  (this.autocompleteListElement.lastChild as Element);
              }
              this.highlightOption(nextSib as HTMLElement);
            } else {
              this.highlightOption(
                this.autocompleteListElement.firstChild as HTMLElement
              );
            }
          } else {
            this.highlightOption(
              this.autocompleteListElement.firstChild as HTMLElement
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
      case this.keys.enter:
        e.preventDefault();
        // if (this.isFreeType) {
        //   this.hideMenu();
        // }
        break;
      case this.keys.backspace:
        if (
          this.inputElement.value == "" &&
          this.isMultiple &&
          this.selectedOptions.length > 0
        ) {
          this.selectedOptions.pop();
          this.showSelectedOptions();
        }
        break;
      case this.keys.left:
        if (this.isMultiple && this.selectedOptions.length > 0) {
          const closeBtn = Array.from(
            this.autocompleteInputWrapper.querySelectorAll(".close-btn")
          ).pop() as HTMLElement;
          closeBtn.focus();
        }
        break;
      case this.keys.tab:
        if (this.hoverOption) {
          this.selectOption(this.hoverOption);
        }
        this.hideMenu();
        break;
    }
    this.inputElement.size = Math.max(this.inputElement.value.length + 1, 1);
  }

  private onFocus(e) {
    this.hidePlaceholder();
    this.autocompleteSelectElement.classList.add(
      "autocomplete__select--focused"
    );
    this.inputElement.size = Math.max(this.inputElement.value.length + 1, 1);
  }

  private onBlur(e) {
    if (this.inputElement.value == "") {
      this.showPlaceholder();
    }
    this.autocompleteSelectElement.classList.remove(
      "autocomplete__select--focused"
    );
    if (this.isMultiple) {
      if (this.selectedOptions.length > 0) {
        this.hidePlaceholder();
      }
    } else {
      if (this.inputElement.value == "" && this.selectedOptions.length > 0) {
        this.selectedOptions = [];
        this.selectElement.value = null;
        this.fillList(this.options);
        if ("createEvent" in document) {
          const evt = document.createEvent("HTMLEvents");
          evt.initEvent("change", false, true);
          this.selectElement.dispatchEvent(evt);
        }
      } else {
        if (
          !this.isFreeType &&
          this.selectedOptions.length > 0 &&
          this.inputElement.value !== this.selectedOptions[0].text
        ) {
          this.inputElement.value = this.selectedOptions[0].text;
          this.inputElement.size = Math.max(
            this.inputElement.value.length + 1,
            1
          );
        }
        if (
          !this.isFreeType &&
          this.selectedOptions.length == 0 &&
          this.inputElement.value !== ""
        ) {
          this.inputElement.value = "";
          this.inputElement.size = Math.max(
            this.inputElement.value.length + 1,
            1
          );
        }
      }
    }
  }

  private onDocumentClick(e) {
    if (!this.autocompleteElement.contains(e.target)) {
      this.hideMenu();
    }
  }

  private onTextBoxType(e) {
    // only show options if user typed something
    let options = this.options;
    if (this.inputElement.value.trim().length > 0) {
      options = this.getOptions(this.inputElement.value.trim().toLowerCase());
    }
    if (this.isFreeType) {
      const optionMatch = options.find(
        (o) =>
          o.value === this.inputElement.value.trim() ||
          o.text === this.inputElement.value.trim()
      );
      if (optionMatch) {
        this.inputElement.value = optionMatch.text;
        this.selectedOptions = [optionMatch];
        this.selectElement.value = optionMatch.text;
      } else {
        if (this.inputElement.value.trim() !== "") {
          options.unshift({
            text: this.inputElement.value.trim(),
            value: this.inputElement.value.trim(),
          });
          this.freeTypeOption.value = this.inputElement.value.trim();
          this.freeTypeOption.innerText = this.inputElement.value.trim();
          this.selectElement.value = this.inputElement.value.trim();
          this.selectedOptions = [this.freeTypeOption];
        }
      }
    }

    this.fillList(options);
    this.showMenu();
  }

  private onTextBoxDownPressed(e) {
    let options = this.options;
    // if (this.inputElement.value.trim().length > 0) {
    //   options = this.getOptions(this.inputElement.value.trim().toLowerCase());
    // }
    if (this.isFreeType) {
      const optionMatch = options.find(
        (o) => o.text === this.inputElement.value.trim()
      );
      if (optionMatch) {
        this.inputElement.value = optionMatch.text;
        this.selectedOptions = [optionMatch];
        this.selectElement.value = optionMatch.text;
      } else {
        if (this.inputElement.value.trim() !== "") {
          options.unshift({
            text: this.inputElement.value.trim(),
            value: this.inputElement.value.trim(),
          });
        }
      }
    }
    this.fillList(options);
    this.showMenu();
    if (options.length > 0) {
      // highlight the first option
      const option = this.getOption(options[0].value);
      this.highlightOption(option as HTMLElement);
    }
  }

  private onMenuClick(e) {
    let item = e.target.closest("[role=option]");
    if (!item) return;

    this.selectOption(item);
  }

  private toggleMenu() {
    // if (this.isMultiple && this.inputElement.value === "") {
    //   this.fillList(
    //     this.options.filter((o) => this.selectedOptions.indexOf(o) < 0)
    //   );
    // }
    this.autocompleteListElement.classList.toggle("hidden");
    if (this.autocompleteListElement.classList.contains("hidden")) {
      this.inputElement.setAttribute("aria-expanded", "false");
      this.inputElement.removeAttribute("aria-activedescendant");
    } else {
      this.inputElement.setAttribute("aria-expanded", "true");
    }
  }

  private showMenu() {
    this.autocompleteListElement.classList.remove("hidden");
    this.inputElement.setAttribute("aria-expanded", "true");
  }

  private hideMenu() {
    this.autocompleteListElement.classList.add("hidden");
    this.inputElement.setAttribute("aria-expanded", "false");
    this.inputElement.removeAttribute("aria-activedescendant");
    this.highlightOption(null);
  }

  private showPlaceholder() {
    this.autocompletePlaceholderElement.classList.remove("hidden");
    this.autocompleteInputWrapper.classList.add("has-placeholder");
  }

  private hidePlaceholder() {
    this.autocompletePlaceholderElement.classList.add("hidden");
    this.autocompleteInputWrapper.classList.remove("has-placeholder");
  }

  private selectOption(option: HTMLElement) {
    const value = option.getAttribute("data-option-value");
    const optionElements = Array.from(
      this.autocompleteListElement.querySelectorAll("[role=option]")
    );
    optionElements.forEach((o) => {
      o.setAttribute("aria-selected", "false");
    });
    if (this.isMultiple) {
      this.inputElement.value = "";
      this.inputElement.size = 1;
      if (this.selectedOptions.find((so) => so.value == value)) {
        this.selectedOptions = this.selectedOptions.filter(
          (so) => so.value !== value
        );
      } else {
        this.selectedOptions = [
          ...this.selectedOptions,
          this.options.find((o) => o.value == value),
        ];
      }
      this.showSelectedOptions();
    } else {
      this.selectElement.value = value;
      if ("createEvent" in document) {
        const evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        this.selectElement.dispatchEvent(evt);
      }
      this.inputElement.value = option.innerText;
      if (this.isFreeType) {
        this.selectedOptions = [{ text: option.innerText, value: value }];
      } else {
        this.selectedOptions = [this.options.find((o) => o.value == value)];
      }
    }

    optionElements.forEach((o) => {
      if (
        this.selectedOptions.find(
          (so) => so.value == o.getAttribute("data-option-value")
        )
      ) {
        o.setAttribute("aria-selected", "true");
      }
    });
    this.hideMenu();
    this.hidePlaceholder();
    this.inputElement.focus();
    this.inputElement.size = Math.max(this.inputElement.value.length + 1, 1);
  }

  private showSelectedOptions() {
    Array.from(
      this.autocompleteInputWrapper.querySelectorAll(".autocomplete__selection")
    ).forEach((s) => {
      s.parentElement.removeChild(s);
    });

    [...this.selectedOptions].reverse().forEach((so) => {
      const selection = document.createElement("div");
      selection.classList.add("autocomplete__selection");
      const text = document.createElement("span");
      text.classList.add("text");
      text.innerHTML = so.text;
      selection.insertAdjacentElement("beforeend", text);
      const closeBtn = document.createElement("button");
      closeBtn.classList.add("close-btn");
      closeBtn.setAttribute("data-value", so.value);
      closeBtn.setAttribute(
        "aria-label",
        `${this.lang.removeOption} ${so.text}`
      );
      closeBtn.setAttribute("role", "button");
      closeBtn.addEventListener("click", this.clearOptionClickListener);
      closeBtn.addEventListener("keydown", this.clearOptionKeyDownListener);
      selection.insertAdjacentElement("beforeend", closeBtn);
      this.autocompleteInputWrapper.insertAdjacentElement(
        "afterbegin",
        selection
      );
    });

    Array.from(this.selectElement.querySelectorAll("option")).forEach((o) => {
      o.selected =
        this.selectedOptions.find((so) => so.value == o.value) !== undefined;
    });

    if ("createEvent" in document) {
      const evt = document.createEvent("HTMLEvents");
      evt.initEvent("change", false, true);
      this.selectElement.dispatchEvent(evt);
    }
  }

  private onClickClearOption(e) {
    const target = (e.currentTarget || e.target) as HTMLElement;
    const value = target.getAttribute("data-value");

    this.selectedOptions = this.selectedOptions.filter(
      (so) => so.value !== value
    );
    this.showSelectedOptions();
  }

  private onKeyDownClearOption(e) {
    const closeBtns: Array<HTMLElement> = Array.from(
      this.autocompleteInputWrapper.querySelectorAll(".close-btn")
    );
    const index = closeBtns.indexOf(e.currentTarget || e.target);
    const value = (e.currentTarget || e.target).getAttribute("data-value");

    switch (e.keyCode) {
      case this.keys.left:
        if (index > 0) {
          closeBtns[index - 1].focus();
        }
        break;
      case this.keys.right:
        if (index < closeBtns.length - 1) {
          closeBtns[index + 1].focus();
        }
        if (index == closeBtns.length - 1) {
          this.inputElement.focus();
        }
        break;
      case this.keys.enter:
        e.preventDefault();
        this.selectedOptions = this.selectedOptions.filter(
          (so) => so.value !== value
        );
        this.showSelectedOptions();
        this.inputElement.focus();
        break;
    }
  }

  private updateStatus(nbr: number) {
    if (this.statusElement) {
      this.statusElement.innerText = `${nbr} ${this.lang.resultsAvailable}`;
    }
  }

  private getOption(value: string) {
    return this.autocompleteListElement.querySelector(
      `[data-option-value="${value}"]`
    );
  }

  private highlightOption(option: HTMLElement) {
    if (this.hoverOption) {
      this.hoverOption.classList.remove("highlight");
    }
    if (option) {
      option.classList.add("highlight");
      this.autocompleteListElement.scrollTop = option.offsetTop;
      this.inputElement.setAttribute("aria-activedescendant", option.id);
    }
    this.hoverOption = option;
  }

  private getOptions(value) {
    return this.options.filter(
      (o) => o.text.trim().toLowerCase().indexOf(value.toLowerCase()) > -1
    );
  }
}
