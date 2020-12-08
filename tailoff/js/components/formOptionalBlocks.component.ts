import { DOMHelper } from "../utils/domHelper";
import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";

ArrayPrototypes.activateFrom();

export class FormOptionalBlocks {
  constructor() {
    const optionalBlock = Array.from(
      document.querySelectorAll(".js-form-optional-block")
    );
    optionalBlock.forEach((element, index) => {
      new OptionalBlock(element as HTMLElement, index);
    });

    DOMHelper.onDynamicContent(
      document.documentElement,
      ".js-form-optional-block",
      (optionalBlocks) => {
        Array.from(optionalBlocks).forEach((ob: HTMLElement, index) => {
          new OptionalBlock(ob, index);
        });
      }
    );
  }
}

class OptionalBlock {
  private changeListener;
  private input;
  private element: HTMLElement;
  private controllerValue;
  private clearAllOnHide: boolean = false;

  constructor(element: HTMLElement, index) {
    this.element = element;
    element.classList.remove("js-form-optional-block");
    this.controllerValue = element.getAttribute("data-controller-value");
    const controllerName = element.getAttribute("data-controller-name");
    this.clearAllOnHide = element.getAttribute("data-clear-all-on-hide")
      ? true
      : false;

    if (!this.controllerValue || !controllerName) {
      console.error(
        `Make sure you define "data-controller-value" and "data-controller-name" on your optional block`
      );
      return;
    }

    this.input = document.getElementsByName(controllerName);

    this.changeListener = this.changeAction.bind(this);
    Array.from(this.input).forEach((input: HTMLInputElement) => {
      input.addEventListener("change", this.changeListener);
    });

    this.disableAllFormElements();
  }

  private toggle(event) {
    const inputValue = event.target.value;
    let isVisible = this.controllerValue.indexOf("" + inputValue) < 0; // true or false
    if ((event.target as HTMLInputElement).type.toLowerCase() === "checkbox") {
      isVisible = !(event.target as HTMLInputElement).checked;
    }
    if (isVisible) {
      this.element.classList.add("hidden");

      let clearElements = [];
      if (this.clearAllOnHide) {
        clearElements = Array.from(
          this.element.querySelectorAll("input, textarea, select")
        );
      } else {
        clearElements = Array.from(
          this.element.querySelectorAll("[data-clear-on-hide]")
        );
      }

      clearElements.forEach((c: HTMLElement) => {
        if (c.nodeName === "INPUT") {
          if (
            c.getAttribute("type").toLowerCase() === "checkbox" ||
            c.getAttribute("type").toLowerCase() === "radio"
          ) {
            (c as HTMLInputElement).checked = false;
          } else {
            (c as HTMLInputElement).value = "";
          }
        }
      });
    } else {
      this.element.classList.remove("hidden");
    }

    this.disableAllFormElements();
  }

  private disableAllFormElements() {
    const disableElements = this.element.querySelectorAll(
      "input, textarea, select"
    );
    Array.from(disableElements).forEach((d: HTMLElement) => {
      if (this.element.classList.contains("hidden")) {
        if (d.hasAttribute("required")) {
          d.removeAttribute("required");
          d.setAttribute("data-has-required", "true");
        }
        d.setAttribute("disabled", "disabled");
      } else {
        if (d.hasAttribute("data-has-required")) {
          d.setAttribute("required", "required");
          d.removeAttribute("data-has-required");
        }
        d.removeAttribute("disabled");
      }
    });
  }

  private changeAction(event: Event) {
    event.stopPropagation();
    this.toggle(event);
  }
}
