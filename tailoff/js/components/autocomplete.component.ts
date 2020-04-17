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
  private autocompleteListElement: HTMLUListElement;
  private statusElement: HTMLDivElement;

  private options: Array<AutocompleteOption> = new Array<AutocompleteOption>();

  private inputKeyUpListener;
  private inputKeyDownListener;
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
  };

  constructor(autocomplete: HTMLSelectElement, index) {
    this.selectElement = autocomplete;
    this.autocompleteElement = document.createElement("div");
    this.autocompleteElement.classList.add("autocomplete");

    this.inputElement = document.createElement("input");
    this.inputElement.setAttribute("aria-owns", `autocompleteList${index}`);
    this.inputElement.setAttribute("autocapitalize", "none");
    this.inputElement.setAttribute("type", "text");
    this.inputElement.setAttribute("autocomplete", "off");
    this.inputElement.setAttribute("aria-autocomplete", "list");
    this.inputElement.setAttribute("role", "combobox");
    // this.inputElement.setAttribute("id", "");
    this.inputElement.setAttribute("aria-expanded", "false");
    this.selectElement.classList.forEach((c) => {
      this.inputElement.classList.add(c);
    });

    this.inputKeyUpListener = this.onKeyUp.bind(this);
    this.inputElement.addEventListener("keyup", this.inputKeyUpListener);

    this.inputKeyDownListener = this.onKeyDown.bind(this);
    this.inputElement.addEventListener("keydown", this.inputKeyDownListener);

    this.autocompleteElement.insertAdjacentElement(
      "beforeend",
      this.inputElement
    );

    const icon = document.createElement("span");
    icon.classList.add("icon");
    icon.classList.add("icon--arrow-down");
    icon.setAttribute("aria-hidden", "true");

    icon.addEventListener("click", () => {
      this.toggleMenu();
    });

    this.autocompleteElement.insertAdjacentElement("beforeend", icon);

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
          this.inputElement.setAttribute("placeholder", option.innerText);
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

    if (this.selectElement.getAttribute("multiple")) {
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
      case this.keys.space:
      case this.keys.enter:
      case this.keys.tab:
      case this.keys.shift:
        // ignore otherwise the menu will show
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
      case this.keys.tab:
        // hide menu
        break;
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
    this.autocompleteListElement.classList.toggle("hidden");
  }

  private showMenu() {
    this.autocompleteListElement.classList.remove("hidden");
  }

  private hideMenu() {
    this.autocompleteListElement.classList.add("hidden");
    this.highlightOption(null);
  }

  private selectOption(option: HTMLElement) {
    const value = option.getAttribute("data-option-value");
    this.selectElement.value = value;
    this.inputElement.value = option.innerText;
    this.hideMenu();
    this.inputElement.focus();
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
    return this.options.filter(
      (o) => o.text.trim().toLowerCase().indexOf(value.toLowerCase()) > -1
    );
  }
}
