import { DOMHelper } from '../utils/domHelper';

export default class FormOptionalBlocks {
  constructor() {
    const optionalBlock = Array.from(document.querySelectorAll('[data-optional-block]'));
    optionalBlock.forEach((element, index) => {
      new OptionalBlock(element as HTMLElement, index);
    });

    DOMHelper.onDynamicContent(
      document.documentElement,
      '[data-optional-block]',
      (optionalBlocks: NodeListOf<HTMLElement>) => {
        optionalBlocks.forEach((element, index) => {
          new OptionalBlock(element as HTMLElement, index + Date.now());
        });
      }
    );

    const optionalRequired = Array.from(document.querySelectorAll('[data-optional-required]'));
    optionalRequired.forEach((element, index) => {
      new OptionalRequired(element as HTMLElement, index);
    });

    DOMHelper.onDynamicContent(
      document.documentElement,
      '[data-optional-required]',
      (optionalRequired: NodeListOf<HTMLElement>) => {
        optionalRequired.forEach((element, index) => {
          new OptionalRequired(element as HTMLElement, index + Date.now());
        });
      }
    );
  }
}

class OptionalBlock {
  private changeListener;
  private formElements: Array<Element> = [];
  private element: HTMLElement;
  private controllerValue;
  private clearAllOnHide: boolean = false;

  constructor(element: HTMLElement, index) {
    this.element = element;
    try {
      this.controllerValue = JSON.parse(element.getAttribute('data-optional-block'));
    } catch (error) {
      console.warn(`Error parsing JSON for data-optional-block: ${error}`);
    }

    this.clearAllOnHide = element.getAttribute('data-clear-all-on-hide') ? true : false;
    if (this.controllerValue && typeof this.controllerValue === 'object' && !Array.isArray(this.controllerValue)) {
      Object.keys(this.controllerValue).forEach((key) => {
        this.formElements.push(...Array.from(document.querySelectorAll(`[name="${key}"]`)));
      });
    }

    this.changeListener = this.changeAction.bind(this);
    Array.from(this.formElements).forEach((input: HTMLInputElement) => {
      input.addEventListener('change', this.changeListener);
    });
    this.toggle(new Event('init'));

    this.disableAllFormElements();
  }

  private toggle(event) {
    if (OptionalBlockController.check(this.formElements, this.controllerValue)) {
      this.element.setAttribute('open', '');
    } else {
      this.element.removeAttribute('open');

      let clearElements = [];
      if (this.clearAllOnHide) {
        clearElements = Array.from(this.element.querySelectorAll('input, textarea, select'));
      } else {
        clearElements = Array.from(this.element.querySelectorAll('[data-clear-on-hide]'));
      }

      clearElements.forEach((c: HTMLElement) => {
        if (c.nodeName === 'INPUT') {
          if (c.getAttribute('type').toLowerCase() === 'checkbox' || c.getAttribute('type').toLowerCase() === 'radio') {
            (c as HTMLInputElement).checked = false;
          } else {
            (c as HTMLInputElement).value = '';
          }
        }
      });
    }

    this.disableAllFormElements();
  }

  private disableAllFormElements() {
    const disableElements = this.element.querySelectorAll('input, textarea, select');
    Array.from(disableElements).forEach((d: HTMLElement) => {
      if (!this.element.hasAttribute('open')) {
        if (d.hasAttribute('required')) {
          d.removeAttribute('required');
          d.setAttribute('data-has-required', 'true');
        }
        d.setAttribute('disabled', 'disabled');
      } else {
        if (d.hasAttribute('data-has-required')) {
          d.setAttribute('required', 'required');
          d.removeAttribute('data-has-required');
        }
        d.removeAttribute('disabled');
      }
    });
  }

  private changeAction(event: Event) {
    event.stopPropagation();
    this.toggle(event);
  }
}

class OptionalRequired {
  private element: HTMLElement;
  private controllerValue;
  private formElements: Array<Element> = [];
  private changeListener;

  constructor(element: HTMLElement, index) {
    this.element = element;
    try {
      this.controllerValue = JSON.parse(element.getAttribute('data-optional-required'));
    } catch (error) {
      console.warn(`Error parsing JSON for data-optional-block: ${error}`);
    }

    if (this.controllerValue && typeof this.controllerValue === 'object' && !Array.isArray(this.controllerValue)) {
      Object.keys(this.controllerValue).forEach((key) => {
        this.formElements.push(...Array.from(document.querySelectorAll(`[name="${key}"]`)));
      });
    }

    this.changeListener = this.changeAction.bind(this);
    Array.from(this.formElements).forEach((input: HTMLInputElement) => {
      input.addEventListener('change', this.changeListener);
    });
  }

  private changeAction(event: Event) {
    event.stopPropagation();
    console.log(OptionalBlockController.check(this.formElements, this.controllerValue));

    if (OptionalBlockController.check(this.formElements, this.controllerValue)) {
      this.element.setAttribute('required', '');
    } else {
      this.element.removeAttribute('required');
    }
  }
}

class OptionalBlockController {
  constructor() {}

  public static check(formElements: Array<Element>, controllerValue: any) {
    let showOptional = false;
    formElements.forEach((el: HTMLInputElement) => {
      const inputName = el.getAttribute('name');
      let inputValue = parseInt(el.value) ? parseInt(el.value) : el.value;
      if (controllerValue[inputName] !== undefined) {
        if (!showOptional) {
          if (
            (el as HTMLInputElement).type.toLowerCase() === 'checkbox' ||
            (el as HTMLInputElement).type.toLowerCase() === 'radio'
          ) {
            if (typeof controllerValue[inputName] === 'object') {
              if (controllerValue[inputName].indexOf(inputValue) >= 0 && el.checked) {
                showOptional = true;
              }
            } else {
              if (controllerValue[inputName] === inputValue && el.checked) {
                showOptional = true;
              }
            }
            if (controllerValue[inputName] == 0 && !el.checked) {
              showOptional = true;
            }
          } else {
            if (typeof controllerValue[inputName] === 'object') {
              showOptional = controllerValue[inputName].indexOf(inputValue) >= 0;
            } else {
              showOptional = controllerValue[inputName] === inputValue; // true or false
            }
          }
        }
      } else {
        console.warn(`No controller value found for input name "${inputName}" in optional block.`);
        return;
      }
    });
    return showOptional;
  }
}
