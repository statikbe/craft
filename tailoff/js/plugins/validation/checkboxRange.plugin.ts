import { ValidationPlugin } from "./plugin.interface";
import { ValidationComponent } from "../../components/validation.component";
import { Formatter } from "../../utils/formater";

export class CheckboxRangePlugin implements ValidationPlugin {
  private validationComponent: ValidationComponent;

  constructor(validationComponent: ValidationComponent) {
    this.validationComponent = validationComponent;
  }

  public initElement() {
    const checkboxes = document.querySelectorAll("input[type=checkbox]");

    Array.from(checkboxes).forEach((checkbox: HTMLInputElement) => {
      if (checkbox.hasAttribute("min") || checkbox.hasAttribute("max")) {
        this.initCheckboxGroup(checkbox);
      }
    });
  }

  private initCheckboxGroup(checkbox: HTMLInputElement) {
    checkbox.addEventListener("change", this.validateCheckboxGroup.bind(this));
    checkbox.addEventListener(
      "check-validation",
      this.validateCheckboxGroup.bind(this)
    );

    checkbox.addEventListener("invalid", (e) => {
      e.preventDefault();
      this.validationComponent.checkValidation(e);
    });
  }

  private validateCheckboxGroup(e) {
    const checkbox = e.target as HTMLInputElement;

    const group = Array.from(
      checkbox
        .closest("form")
        .querySelectorAll(`input[name='${checkbox.name}']`)
    );
    const numberOfChecked = group.filter((c: HTMLInputElement) => c.checked)
      .length;
    if (
      checkbox.hasAttribute("min") &&
      checkbox.hasAttribute("max") &&
      parseInt(checkbox.getAttribute("min")) > numberOfChecked &&
      parseInt(checkbox.getAttribute("max")) < numberOfChecked
    ) {
      checkbox.setCustomValidity(
        Formatter.sprintf(this.validationComponent.lang.range, {
          min: checkbox.getAttribute("min"),
          max: checkbox.getAttribute("max"),
        })
      );
    } else if (
      checkbox.hasAttribute("min") &&
      parseInt(checkbox.getAttribute("min")) > numberOfChecked
    ) {
      checkbox.setCustomValidity(
        Formatter.sprintf(this.validationComponent.lang.minGroup, {
          min: checkbox.getAttribute("min"),
        })
      );
    } else if (
      checkbox.hasAttribute("max") &&
      parseInt(checkbox.getAttribute("max")) < numberOfChecked
    ) {
      checkbox.setCustomValidity(
        Formatter.sprintf(this.validationComponent.lang.maxGroup, {
          max: checkbox.getAttribute("max"),
        })
      );
    } else {
      checkbox.setCustomValidity("");
    }
    checkbox.reportValidity();
    this.validationComponent.checkValidation(e);
  }
}
