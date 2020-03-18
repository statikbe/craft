/**
 * How to use:
 * Add the attribute "data-s-validate" to your html5 valid form
 *
 * Example:
 * <form data-s-validate="true"></form>
 */

import { SiteLang } from "../utils/site-lang";
import { Formatter } from "../utils/formater";
import { nearest } from "../utils/element.prototypes";
import { countDecimals } from "../utils/number.prototypes";

Element.prototype.nearest = nearest;
Number.prototype.countDecimals = countDecimals;

export class ValidationComponent {
  private lang = require(`../i18n/s-validation-${SiteLang.getLang()}.json`);

  constructor() {
    const forms = document.querySelectorAll("[data-s-validate]");
    for (const form of Array.from(forms)) {
      form.setAttribute("novalidate", "true");
      this.initFormElements(form);
      this.initFormSubmit(form);
    }
  }

  private initFormElements(el: Element) {
    const elements = el.querySelectorAll("input,textarea,select");
    for (const element of Array.from(elements)) {
      this.initFormElement(element);
    }
  }

  private initFormElement(el: Element) {
    el.addEventListener("blur", this.checkValidation.bind(this));
    el.addEventListener("check-validation", this.checkValidation.bind(this));
    if (el.tagName === "SELECT") {
      el.addEventListener("change", this.checkValidation.bind(this));
    }
  }

  private initFormSubmit(el: Element) {
    el.addEventListener("submit", function(e) {
      let valid = true;
      const elements = el.querySelectorAll("input,textarea,select");
      for (const element of Array.from(elements)) {
        valid = !(element as HTMLObjectElement).validity.valid ? false : valid;
        element.dispatchEvent(new Event("check-validation"));
      }
      if (!valid) {
        e.preventDefault();
      }
    });
  }

  private checkValidation(e: Event) {
    const errorInputClass = "form__error";
    const errorMsgClass = "form__msg-error";
    const el: HTMLObjectElement = e.target as HTMLObjectElement;
    const validity = el.validity;

    if (!validity.valid) {
      if (
        !el.nextElementSibling ||
        (el.nextElementSibling &&
          !el.nextElementSibling.classList.contains(errorMsgClass) &&
          !el.parentElement.classList.contains("relative"))
      ) {
        el.insertAdjacentHTML(
          "afterend",
          `<div class="${errorMsgClass}"></div>`
        );
      }
      if (
        (el.parentElement.classList.contains("relative") &&
          !el.parentElement.nextElementSibling) ||
        (el.parentElement.nextElementSibling &&
          !el.parentElement.nextElementSibling.classList.contains(
            errorMsgClass
          ))
      ) {
        el.parentElement.insertAdjacentHTML(
          "afterend",
          `<div class="${errorMsgClass}"></div>`
        );
      }

      if (el.classList) {
        el.classList.add(errorInputClass);
      }

      const errorElement = el.nearest(`.${errorMsgClass}`);

      errorElement.innerHTML = this.getErrorMessage(
        validity,
        el.getAttribute("type"),
        el
      );
    } else {
      if (el.classList) {
        el.classList.remove(errorInputClass);
      }
      const errorElement = el.nearest(`.${errorMsgClass}`, 2);
      if (errorElement && errorElement.classList.contains(errorMsgClass)) {
        errorElement.parentNode.removeChild(errorElement);
      }
    }
  }

  private getErrorMessage(
    validity: ValidityState,
    type: string,
    el: HTMLObjectElement
  ) {
    if (validity.badInput && type === "number") return this.lang.type.number;
    if (validity.valueMissing) return this.lang.required;
    if (validity.typeMismatch && type === "email") return this.lang.type.email;
    if (validity.typeMismatch && type === "url") return this.lang.type.url;
    if (validity.typeMismatch && type === "tel") return this.lang.type.tel;
    if (validity.typeMismatch) return this.lang.defaultMessage;
    if (validity.stepMismatch && parseFloat(el.getAttribute("step")) >= 1)
      return this.lang.stepInt;
    if (validity.stepMismatch && parseFloat(el.getAttribute("step")) < 1)
      return Formatter.sprintf(this.lang.stepFloat, {
        max: parseFloat(el.getAttribute("step")).countDecimals()
      });
    if (
      (validity.rangeUnderflow || validity.rangeOverflow) &&
      (type === "number" || type === "range") &&
      el.getAttribute("min") &&
      el.getAttribute("max")
    )
      return Formatter.sprintf(this.lang.range, {
        min: el.getAttribute("min"),
        max: el.getAttribute("max")
      });
    if (
      validity.rangeUnderflow &&
      (type === "number" || type === "range") &&
      el.getAttribute("min")
    )
      return Formatter.sprintf(this.lang.min, { min: el.getAttribute("min") });
    if (
      validity.rangeOverflow &&
      (type === "number" || type === "range") &&
      el.getAttribute("max")
    )
      return Formatter.sprintf(this.lang.max, { min: el.getAttribute("max") });
    return this.lang.defaultMessage;
  }
}
