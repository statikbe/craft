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
  }
}
