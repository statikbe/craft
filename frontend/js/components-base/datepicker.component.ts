import { DOMHelper } from '../utils/domHelper';
import { SiteLang } from '../utils/site-lang';
// import { Dutch } from 'flatpickr/dist/l10n/nl.js';
// import { French } from 'flatpickr/dist/l10n/fr.js';

const lang = SiteLang.getLang();

export default class DatePickerComponent {
  constructor() {
    const pickers = document.querySelectorAll('[data-date-picker]');
    if (pickers.length > 0) {
      this.initDatePickers(pickers);
    }

    DOMHelper.onDynamicContent(document.documentElement, '[data-date-picker]', (pickers: NodeListOf<HTMLElement>) => {
      this.initDatePickers(pickers);
    });
  }

  private async initDatePickers(pickers) {
    const flatpickr = await import('flatpickr');
    // switch (lang) {
    //   case 'nl':
    //     flatpickr.default.localize(Dutch);
    //     break;
    //   case 'fr':
    //     flatpickr.default.localize(French);
    //     break;
    // }
    Array.from(pickers).forEach((picker: HTMLElement) => {
      picker.classList.remove('js-time-picker');
      flatpickr.default(picker, {
        dateFormat: 'd/m/Y',
        onChange: function (selectedDates, dateStr, instance) {
          instance.input.dispatchEvent(new Event('check-validation'));
          if (instance.altInput) {
            instance.altInput.dispatchEvent(new Event('check-validation'));
          }
        },
      });
    });
  }
}
