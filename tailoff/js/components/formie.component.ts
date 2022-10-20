import { SiteLang } from '../utils/site-lang';
import { ArrayPrototypes } from '../utils/prototypes/array.prototypes';

ArrayPrototypes.activateFrom();

declare global {
  interface Window {
    FormieTranslations: any;
  }
}

export class FormieComponent {
  private siteLang = SiteLang.getLang();
  // public lang = require(`../i18n/formie-${this.siteLang}.json`);
  public lang = import(`../i18n/formie-${this.siteLang}.json`).then((module) => module.default);

  constructor() {
    window.FormieTranslations = this.lang;

    Array.from(document.querySelectorAll('select.fui-select')).forEach((element) => {
      const container = element.closest('.fui-input-container');
      container.classList.add('fui-select-container');
    });
  }
}
