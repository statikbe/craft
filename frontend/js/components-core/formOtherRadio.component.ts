import { DOMHelper } from '../utils/domHelper';

export default class formOtherRadioComponent {
  constructor() {
    const otherRadios = document.querySelectorAll('[data-other-option]');
    Array.from(otherRadios).forEach((or: HTMLElement, index) => {
      this.initOtherRadio(or);
    });

    DOMHelper.onDynamicContent(
      document.documentElement,
      '[data-other-option]',
      (otherRadios: NodeListOf<HTMLElement>) => {
        otherRadios.forEach((or: HTMLElement, index) => {
          this.initOtherRadio(or);
        });
      }
    );
  }

  private initOtherRadio(otherRadio: HTMLElement) {
    const radio = otherRadio.querySelector('input[type=radio]') as HTMLInputElement;
    const input = otherRadio.querySelector('input[type=text]') as HTMLInputElement;

    input.addEventListener('focus', () => {
      radio.checked = true;
    });
    input.addEventListener('blur', () => {
      radio.value = input.value;
      if (radio.required && input.value == '') {
        radio.checked = false;
      }
      let event;
      if (typeof Event === 'function') {
        event = new Event('check-validation');
      } else {
        event = document.createEvent('Event');
        event.initEvent('check-validation', true, true);
      }
      radio.dispatchEvent(event);
    });
  }
}
