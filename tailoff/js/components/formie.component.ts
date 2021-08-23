import { SiteLang } from '../utils/site-lang';
import { ArrayPrototypes } from '../utils/prototypes/array.prototypes';

ArrayPrototypes.activateFrom();

declare global {
  interface Window {
    FormieTranslations: any;
  }
}

export class FormieComponent {
  public lang = require(`../i18n/formie-${SiteLang.getLang()}.json`);

  constructor() {
    window.FormieTranslations = this.lang;

    Array.from(document.querySelectorAll('select.fui-select')).forEach((element) => {
      const container = element.closest('.fui-input-container');
      container.classList.add('fui-select-container');
    });
  }
}
