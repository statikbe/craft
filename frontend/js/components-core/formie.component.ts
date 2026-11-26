import { DOMHelper } from '../utils/domHelper';
import { ArrayPrototypes } from '../utils/prototypes/array.prototypes';

ArrayPrototypes.activateFrom();

declare global {
  interface Window {
    FormieTranslations: any;
  }
}

export default class FormieComponent {
  // Multi-select dropdowns get data-autocomplete server-side (modules/statik/src/Statik.php)
  constructor() {
    DOMHelper.onDynamicContent(document.documentElement, '[data-formie-message-success]', (messages) => {
      (messages[0] as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    });
  }
}
