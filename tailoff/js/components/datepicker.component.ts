import flatpickr from "flatpickr";
import { Dutch } from "flatpickr/dist/l10n/nl.js";
import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
require("flatpickr/dist/themes/light.css");

ArrayPrototypes.activateFrom();

export class DatePickerComponent {
  constructor() {
    const pickers = document.querySelectorAll(".js-date-picker");

    Array.from(pickers).forEach((picker) => {
      flatpickr(picker, {
        dateFormat: "d/m/Y",
        locale: Dutch,
      });
    });
  }
}
/**
 * TODO: Switch the locale in function of the sites lang.
 */
