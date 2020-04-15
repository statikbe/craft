// based on: https://adamsilver.io/articles/building-an-accessible-autocomplete-control/

import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";

ArrayPrototypes.activateFrom();

export class AutocompleteComponent {
  private autocompleteElement: HTMLDivElement;
  private inputElement: HTMLInputElement;
  private autocompleteListElement: HTMLUListElement;
  private statusElement: HTMLDivElement;

  constructor() {
    Array.from(document.querySelectorAll("[data-s-autocomplete]")).forEach(
      (autocomplete, index) => {
        if (autocomplete.tagName === "SELECT") {
          this.initAutocomplete(autocomplete as HTMLSelectElement, index);
        }
      }
    );
  }

  private initAutocomplete(autocomplete: HTMLSelectElement, index) {
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
    autocomplete.classList.forEach(c => {
      this.inputElement.classList.add(c);
    });

    this.autocompleteElement.insertAdjacentElement(
      "beforeend",
      this.inputElement
    );

    const icon = document.createElement("span");
    icon.classList.add("icon");
    icon.classList.add("icon--arrow-down");
    icon.setAttribute("aria-hidden", "true");

    this.autocompleteElement.insertAdjacentElement("beforeend", icon);

    this.autocompleteListElement = document.createElement("ul");
    this.autocompleteListElement.setAttribute("id", `autocompleteList${index}`);
    this.autocompleteListElement.setAttribute("role", "listbox");
    this.autocompleteListElement.classList.add("hidden");

    this.autocompleteElement.insertAdjacentElement(
      "beforeend",
      this.autocompleteListElement
    );

    Array.from(autocomplete.querySelectorAll("option")).forEach(option => {
      const item = document.createElement("li");
      item.setAttribute("role", "option");
      item.setAttribute("tabindex", "-1");
      item.setAttribute("aria-selected", "false");
      item.setAttribute("data-option-value", option.value);
      item.innerText = option.innerText;

      this.autocompleteListElement.insertAdjacentElement("beforeend", item);
    });

    this.statusElement = document.createElement("div");
    this.statusElement.setAttribute("aria-live", "polite");
    this.statusElement.setAttribute("role", "status");
    this.statusElement.classList.add("hidden");

    this.autocompleteElement.insertAdjacentElement(
      "beforeend",
      this.statusElement
    );

    autocomplete.insertAdjacentElement("afterend", this.autocompleteElement);

    autocomplete.setAttribute("aria-hidden", "true");
    autocomplete.setAttribute("tabindex", "-1");
    autocomplete.classList.add("hidden");
  }
}
