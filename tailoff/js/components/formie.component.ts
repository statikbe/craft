import { ArrayPrototypes } from '../utils/prototypes/array.prototypes';

ArrayPrototypes.activateFrom();

declare global {
  interface Window {
    FormieTranslations: any;
  }
}

export class FormieComponent {
  constructor() {
    Array.from(document.querySelectorAll('select.fui-select')).forEach((element) => {
      const container = element.closest('.fui-input-container');
      container.classList.add('fui-select-container');
    });

    Array.from(document.querySelectorAll('select.fui-select[multiple]')).forEach((element) => {
      setTimeout(() => {
        element.setAttribute('data-s-autocomplete', '');
      }, 0);
    });
  }
}
