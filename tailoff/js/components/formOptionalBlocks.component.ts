import { DOMHelper } from '../utils/domHelper';

export class FormOptionalBlocks {
  constructor() {
    const optionalBlock = Array.from(document.querySelectorAll('.js-form-optional-block'));
    optionalBlock.forEach((element, index) => {
      new OptionalBlock(element as HTMLElement, index);
    });

    const optionalRequired = Array.from(document.querySelectorAll('.js-form-optional-required'));
    optionalRequired.forEach((element, index) => {
      new OptionalRequired(element as HTMLElement, index);
    });
  }
}

class OptionalBlock {
  private changeListener;
  private input;
  private element: HTMLElement;
  private controllerValue;
  private clearAllOnHide: boolean = false;

  constructor(element: HTMLElement, index) {
    this.element = element;
    element.classList.remove('js-form-optional-block');
    try {
      this.controllerValue = JSON.parse(element.getAttribute('data-controller-value'));
    } catch (error) {
      this.controllerValue = element.getAttribute('data-controller-value');
    }

    const controllerName = element.getAttribute('data-controller-name');
    this.clearAllOnHide = element.getAttribute('data-clear-all-on-hide') ? true : false;

    if (this.controllerValue == undefined || !controllerName) {
      console.error(`Make sure you define"data-controller-name" on your optional block`);
      return;
    }

    this.input = document.getElementsByName(controllerName);

    this.changeListener = this.changeAction.bind(this);
    Array.from(this.input).forEach((input: HTMLInputElement) => {
      input.addEventListener('change', this.changeListener);
    });

    this.disableAllFormElements();
  }

  private toggle(event) {
    let inputValue = parseInt(event.target.value);
    if (isNaN(event.target.value)) {
      inputValue = event.target.value;
    }

    let showOptional = event.target.value.length > 0;
    if (this.controllerValue) {
      showOptional =
        typeof this.controllerValue === 'object'
          ? this.controllerValue.indexOf(inputValue) >= 0
          : this.controllerValue === inputValue; // true or false
    }

    if ((event.target as HTMLInputElement).type.toLowerCase() === 'checkbox') {
      showOptional = false;
      Array.from(this.input).forEach((input: HTMLInputElement) => {
        if (typeof this.controllerValue === 'object') {
          if (this.controllerValue.indexOf(parseInt(input.value)) >= 0 && input.checked) showOptional = true;
        } else {
          if (this.controllerValue === parseInt(input.value) && input.checked) showOptional = true;
        }
        if (this.controllerValue == 0 && !input.checked) showOptional = true;
      });
    }
    if (showOptional) {
      this.element.classList.remove('hidden');
    } else {
      this.element.classList.add('hidden');

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
      if (this.element.classList.contains('hidden')) {
        if (d.hasAttribute('required')) {
          d.removeAttribute('required');
          d.setAttribute('data-has-required', 'true');
        }
        d.setAttribute('disabled', 'disabled');
      } else {
        if (d.closest('[data-controller-value]') == this.element) {
          if (d.hasAttribute('data-has-required')) {
            d.setAttribute('required', 'required');
            d.removeAttribute('data-has-required');
          }
          d.removeAttribute('disabled');
        }
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
  private input;
  private changeListener;

  constructor(element: HTMLElement, index) {
    this.element = element;
    element.classList.remove('js-form-optional-required');
    try {
      this.controllerValue = JSON.parse(element.getAttribute('data-required-value'));
    } catch (error) {
      this.controllerValue = element.getAttribute('data-required-value');
    }

    const controllerName = element.getAttribute('data-controller-name');

    if (!controllerName) {
      console.error(`Make sure you define"data-controller-name" on your optional block`);
      return;
    }

    this.input = document.getElementsByName(controllerName);
    this.changeListener = this.changeAction.bind(this);
    Array.from(this.input).forEach((input: HTMLInputElement) => {
      input.addEventListener('change', this.changeListener);
    });
  }

  private changeAction(event: Event) {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;

    switch (input.type.toLowerCase()) {
      case 'radio':
      case 'checkbox':
        if (this.controllerValue === false) {
          if (input.checked) {
            this.element.removeAttribute('required');
          } else {
            this.element.setAttribute('required', '');
          }
        } else if (this.controllerValue === true) {
          if (input.checked) {
            this.element.setAttribute('required', '');
          } else {
            this.element.removeAttribute('required');
          }
        }
        break;
      default:
        if (this.controllerValue === input.value) {
          this.element.setAttribute('required', '');
        } else {
          this.element.removeAttribute('required');
        }
        break;
    }
  }
}
