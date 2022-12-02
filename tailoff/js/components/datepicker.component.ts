// import flatpickr from 'flatpickr';
import { DOMHelper } from '../utils/domHelper';
import { SiteLang } from '../utils/site-lang';

const lang = SiteLang.getLang();

export class DatePickerComponent {
  constructor() {
    const pickers = document.querySelectorAll('.js-date-picker');
    if (pickers.length > 0) {
      this.initDatePickers(pickers);
    }

    DOMHelper.onDynamicContent(document.documentElement, '.js-date-picker', (pickers) => {
      this.initDatePickers(pickers);
    });
  }

  private async initDatePickers(pickers) {
    // @ts-ignore
    const flatpickr = await import('flatpickr');
    // switch (lang) {
    //   case 'nl':
    //     const Dutch = require('flatpickr/dist/l10n/nl.js').default.nl;
    //     flatpickr.default.localize(Dutch);
    //     break;
    //   case 'fr':
    //     const French = require('flatpickr/dist/l10n/fr.js').default.fr;
    //     flatpickr.default.localize(French);
    //     break;
    // }
    Array.from(pickers).forEach((picker: HTMLElement) => {
      picker.classList.remove('js-time-picker');
      flatpickr.default(picker, {
        dateFormat: 'd/m/Y',
        onChange: function (selectedDates, dateStr, instance) {
          instance.input.dispatchEvent(new Event('check-validation'));
          instance.altInput.dispatchEvent(new Event('check-validation'));
        },
      });
    });
  }
}
