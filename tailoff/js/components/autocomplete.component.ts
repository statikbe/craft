// based on: https://adamsilver.io/articles/building-an-accessible-autocomplete-control/

import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
import { SiteLang } from "../utils/site-lang";

ArrayPrototypes.activateFrom();

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
  }
}

class Autocomplete {
  private lang = require(`../i18n/s-autocomplete-${SiteLang.getLang()}.json`);

  private selectElement: HTMLSelectElement;
  private autocompleteElement: HTMLDivElement;
  private inputElement: HTMLInputElement;
  private autocompleteSelectElement: HTMLDivElement;
  private autocompleteInputWrapper: HTMLDivElement;
  private autocompletePlaceholderElement: HTMLDivElement;
  private autocompleteListElement: HTMLUListElement;
  private statusElement: HTMLDivElement;

  private options: Array<AutocompleteOption> = new Array<AutocompleteOption>();
  private selectedOptions: Array<AutocompleteOption> = new Array<
    AutocompleteOption
  >();

  private inputKeyUpListener;
  private inputKeyDownListener;
  private inputFocusListener;
  private inputBlurListener;
  private documentClickListener;
  private menuClickListener;
  private menuKeyDownListener;

  private hoverOption: HTMLElement;
  private isMultiple = false;

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
    this.selectElement = autocomplete;
    this.autocompleteElement = document.createElement("div");
    this.autocompleteElement.classList.add("autocomplete");

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
      this.inputElement.focus();
    });

    this.autocompletePlaceholderElement = document.createElement("div");
    this.autocompletePlaceholderElement.classList.add(
      "autocomplete__placeholder"
    );
    this.autocompletePlaceholderElement.setAttribute("aria-hidden", "true");

    this.autocompleteInputWrapper = document.createElement("div");
    this.autocompleteInputWrapper.classList.add("autocomplete__input-wrapper");
    this.autocompleteInputWrapper.insertAdjacentElement(
      "beforeend",
      this.autocompletePlaceholderElement
    );
    this.autocompleteSelectElement.insertAdjacentElement(
      "beforeend",
      this.autocompleteInputWrapper
    );

    this.inputElement = document.createElement("input");
    this.inputElement.setAttribute("aria-owns", `autocompleteList${index}`);
    this.inputElement.setAttribute("autocapitalize", "none");
    this.inputElement.setAttribute("type", "text");
    this.inputElement.setAttribute("autocomplete", "off");
    this.inputElement.setAttribute("aria-autocomplete", "list");
    this.inputElement.setAttribute("role", "combobox");
    // this.inputElement.setAttribute("id", "");
    this.inputElement.setAttribute("aria-expanded", "false");
    this.inputElement.size = 1;

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

    const icon = document.createElement("span");
    icon.classList.add("autocomplete__dropdown-icon");
    icon.setAttribute("aria-hidden", "true");

    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    this.autocompleteSelectElement.insertAdjacentElement("beforeend", icon);

    this.autocompleteListElement = document.createElement("ul");
    this.autocompleteListElement.setAttribute("id", `autocompleteList${index}`);
    this.autocompleteListElement.setAttribute("role", "listbox");
    this.autocompleteListElement.classList.add("hidden");

    this.menuClickListener = this.onMenuClick.bind(this);
    this.autocompleteListElement.addEventListener(
      "click",
      this.menuClickListener
    );

    this.menuKeyDownListener = this.onMenuKeyDown.bind(this);
    this.autocompleteListElement.addEventListener(
      "keydown",
      this.menuKeyDownListener
    );

    this.autocompleteElement.insertAdjacentElement(
      "beforeend",
      this.autocompleteListElement
    );

    Array.from(this.selectElement.querySelectorAll("option")).forEach(
      (option) => {
        if (option.value != "") {
          this.options.push({
            text: option.innerText,
            value: option.value,
          });
        } else {
          this.autocompletePlaceholderElement.innerText = option.innerText;
        }
      }
    );
    this.fillList(this.options);

    this.statusElement = document.createElement("div");
    this.statusElement.setAttribute("aria-live", "polite");
    this.statusElement.setAttribute("role", "status");
    this.statusElement.classList.add("hidden");

    this.autocompleteElement.insertAdjacentElement(
      "beforeend",
      this.statusElement
    );

    this.selectElement.insertAdjacentElement(
      "afterend",
      this.autocompleteElement
    );

    this.selectElement.setAttribute("aria-hidden", "true");
    this.selectElement.setAttribute("tabindex", "-1");
    this.selectElement.classList.add("hidden");

    if (this.selectElement.getAttribute("multiple") !== null) {
      this.isMultiple = true;
    }

    this.documentClickListener = this.onDocumentClick.bind(this);
    document.addEventListener("click", this.documentClickListener);
  }

  private fillList(optionList: Array<AutocompleteOption>) {
    this.autocompleteListElement.innerHTML = "";

    optionList.forEach((option) => {
      const item = document.createElement("li");
      item.setAttribute("role", "option");
      item.setAttribute("tabindex", "-1");
      item.setAttribute("aria-selected", "false");
      item.setAttribute("data-option-value", option.value);
      item.innerText = option.text;

      item.addEventListener("mouseover", (e) => {
        this.highlightOption(e.currentTarget || e.target);
      });

      this.autocompleteListElement.insertAdjacentElement("beforeend", item);
    });
  }

  private onKeyUp(e) {
    switch (e.keyCode) {
      case this.keys.up:
      case this.keys.left:
      case this.keys.right:
      case this.keys.enter:
      case this.keys.space:
      case this.keys.tab:
      case this.keys.shift:
        break;
      case this.keys.esc:
        this.hideMenu();
        break;
      case this.keys.down:
        this.onTextBoxDownPressed(e);
        break;
      default:
        this.onTextBoxType(e);
    }
  }

  private onKeyDown(e) {
    switch (e.keyCode) {
      case this.keys.enter:
        e.preventDefault();
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
      case this.keys.tab:
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
      } else {
        if (
          this.selectedOptions.length > 0 &&
          this.inputElement.value !== this.selectedOptions[0].text
        ) {
          this.inputElement.value = this.selectedOptions[0].text;
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
    this.fillList(options);
    // update the live region
    this.updateStatus(options.length);
    this.showMenu();
  }

  private onTextBoxDownPressed(e) {
    let options = this.options;
    if (this.inputElement.value.trim().length > 0) {
      options = this.getOptions(this.inputElement.value.trim().toLowerCase());
    }
    this.fillList(options);
    this.showMenu();
    if (options.length > 0) {
      // highlight the first option
      const option = this.getOption(options[0].value);
      this.highlightOption(option);
    }
  }

  private onMenuClick(e) {
    let item = e.target.closest("[role=option]");
    if (!item) return;

    this.selectOption(item);
  }

  private onMenuKeyDown(e) {
    switch (e.keyCode) {
      case this.keys.up:
        e.preventDefault();
        // If the first option is focused, set focus to the text box. Otherwise set focus to the previous option.
        if (this.hoverOption && this.hoverOption.previousElementSibling) {
          this.highlightOption(this.hoverOption.previousElementSibling);
        } else {
          this.highlightOption(null);
          this.inputElement.focus();
          if (this.inputElement.value === "") {
            this.hideMenu();
          }
        }
        break;
      case this.keys.down:
        e.preventDefault();
        // Focus the next menu option. If it’s the last menu option, do nothing.
        if (this.hoverOption && this.hoverOption.nextElementSibling) {
          this.highlightOption(this.hoverOption.nextElementSibling);
        }
        break;
      case this.keys.enter:
      case this.keys.space:
        e.preventDefault();
        // Select the currently highlighted option and focus the text box.
        this.selectOption(this.hoverOption);
        break;
      case this.keys.esc:
        // Hide the menu and focus the text box.
        this.hideMenu();
        this.inputElement.focus();
        break;
      case this.keys.tab:
        // Hide the menu.
        this.hideMenu();
        break;
      default:
        this.inputElement.focus();
    }
  }

  private toggleMenu() {
    if (this.isMultiple && this.inputElement.value === "") {
      this.fillList(
        this.options.filter((o) => this.selectedOptions.indexOf(o) < 0)
      );
    }
    this.autocompleteListElement.classList.toggle("hidden");
  }

  private showMenu() {
    if (this.isMultiple && this.inputElement.value === "") {
      this.fillList(
        this.options.filter((o) => this.selectedOptions.indexOf(o) < 0)
      );
    }
    this.autocompleteListElement.classList.remove("hidden");
  }

  private hideMenu() {
    this.autocompleteListElement.classList.add("hidden");
    this.highlightOption(null);
  }

  private showPlaceholder() {
    this.autocompletePlaceholderElement.classList.remove("hidden");
  }

  private hidePlaceholder() {
    this.autocompletePlaceholderElement.classList.add("hidden");
  }

  private selectOption(option: HTMLElement) {
    const value = option.getAttribute("data-option-value");
    if (this.isMultiple) {
      this.inputElement.value = "";
      this.inputElement.size = 1;
      this.selectedOptions = [
        ...this.selectedOptions,
        this.options.find((o) => o.value == value),
      ];
      this.showSelectedOptions();
    } else {
      this.selectElement.value = value;
      this.inputElement.value = option.innerText;
      this.selectedOptions = [this.options.find((o) => o.value == value)];
    }
    this.hideMenu();
    this.hidePlaceholder();
    this.inputElement.focus();
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
      selection.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.classList.add("text");
      text.innerHTML = so.text;
      selection.insertAdjacentElement("beforeend", text);
      const closeBtn = document.createElement("span");
      closeBtn.classList.add("icon");
      closeBtn.classList.add("icon--clear");
      closeBtn.setAttribute("data-value", so.value);
      closeBtn.addEventListener("click", (e) => {
        const target = (e.currentTarget || e.target) as HTMLElement;
        const value = target.getAttribute("data-value");

        this.selectedOptions = this.selectedOptions.filter(
          (so) => so.value !== value
        );
        this.showSelectedOptions();
      });
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
  }

  private updateStatus(nbr: number) {
    this.statusElement.innerText = `${nbr} ${this.lang.resultsAvailable}`;
  }

  private getOption(value: string) {
    return this.autocompleteListElement.querySelector(
      `[data-option-value="${value}"]`
    );
  }

  private highlightOption(option) {
    if (this.hoverOption) {
      this.hoverOption.setAttribute("aria-selected", "false");
    }
    if (option) {
      option.setAttribute("aria-selected", "true");
      option.focus();
    }
    this.hoverOption = option;
  }

  private getOptions(value) {
    if (this.isMultiple) {
      return this.options
        .filter((o) => this.selectedOptions.indexOf(o) < 0)
        .filter(
          (o) => o.text.trim().toLowerCase().indexOf(value.toLowerCase()) > -1
        );
    } else {
      return this.options.filter(
        (o) => o.text.trim().toLowerCase().indexOf(value.toLowerCase()) > -1
      );
    }
  }
}
