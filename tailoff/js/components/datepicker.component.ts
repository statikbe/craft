import flatpickr from "flatpickr";
import { DOMHelper } from "../utils/domHelper";
import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
import { SiteLang } from "../utils/site-lang";

ArrayPrototypes.activateFrom();

const lang = SiteLang.getLang();
switch (lang) {
  case "nl":
    const Dutch = require("flatpickr/dist/l10n/nl.js").default.nl;
    flatpickr.localize(Dutch);
    break;
  case "fr":
    const French = require("flatpickr/dist/l10n/fr.js").default.fr;
    flatpickr.localize(French);
    break;
}

export class DatePickerComponent {
  constructor() {
    const pickers = document.querySelectorAll(".js-date-picker");
    this.initDatePickers(pickers);

    DOMHelper.onDynamicContent(
      document.documentElement,
      ".js-date-picker",
      (pickers) => {
        this.initDatePickers(pickers);
      }
    );
  }

  private initDatePickers(pickers) {
    Array.from(pickers).forEach((picker: HTMLElement) => {
      picker.classList.remove("js-time-picker");
      flatpickr(picker, {
        dateFormat: "d/m/Y",
      });
    });
  }
}
