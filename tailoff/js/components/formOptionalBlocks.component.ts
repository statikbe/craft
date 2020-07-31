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

    this.input = <NodeListOf<HTMLInputElement>>(
      document.getElementsByName(controllerName)
    );

    this.changeListener = this.changeAction.bind(this);
    this.input.forEach((input) => {
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
        d.setAttribute("disabled", "disabled");
      } else {
        d.removeAttribute("disabled");
      }
    });
  }

  private changeAction(event: Event) {
    event.stopPropagation();
    this.toggle(event);
  }
}
