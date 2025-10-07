import { SiteLang } from '../utils/site-lang';
import { Formatter } from '../utils/formater';
import { NumberPrototypes } from '../utils/prototypes/number.prototypes';
import { ElementPrototype } from '../utils/prototypes/element.prototypes';
import { DOMHelper } from '../utils/domHelper';

NumberPrototypes.activateCountDecimals();
ElementPrototype.activateNearest();

export default class ValidationComponent {
  private siteLang = SiteLang.getLang();
  public lang;

  private options = {
    plugins: [],
  };

  constructor(options: Object = {}) {
    this.getLang().then(() => {
      this.options = { ...this.options, ...options };

      const forms = document.querySelectorAll('form[data-validate]');
      Array.from(forms).forEach((form, index) => {
        new FormValidation(form as HTMLFormElement, index, this);
      });

      DOMHelper.onDynamicContent(
        document.documentElement,
        'form[data-validate]',
        (forms: NodeListOf<HTMLFormElement>) => {
          forms.forEach((form, index) => {
            new FormValidation(form as HTMLFormElement, index + Date.now(), this);
          });
        }
      );

      this.options.plugins.forEach((plugin: any | { plugin: any; options: {} }) => {
        const p = typeof plugin.module == 'function' ? new plugin.module(this) : new plugin.module.plugin(this);
        p.initElement();
      });
    });
  }

  private async getLang() {
    this.lang = await import(`../i18n/s-validation-${this.siteLang}.json`);
  }

  public checkValidation(e: Event) {
    const el: HTMLObjectElement = e.target as HTMLObjectElement;
    let readOnly = false;
    //Make sure readonly fields like flatpicker keeps working.
    if (el.hasAttribute('readonly')) {
      readOnly = true;
      el.removeAttribute('readonly');
    }

    const validity = el.validity;
    let elementWrapper = el.closest('[data-validate-wrapper]');
    if (!elementWrapper) {
      elementWrapper = el.parentElement;
      elementWrapper.setAttribute('data-validate-wrapper', '');
    }

    if (el.getAttribute('disabled') == null) {
      if (!validity.valid) {
        if (!elementWrapper.querySelector('[role="alert"]')) {
          const fieldErrorPlaceholder = elementWrapper.querySelector('[data-error-placeholder]');
          if (fieldErrorPlaceholder) {
            fieldErrorPlaceholder.setAttribute('role', 'alert');
            fieldErrorPlaceholder.id = 'error-' + el.getAttribute('data-unique-id');
          } else {
            elementWrapper.insertAdjacentHTML(
              'beforeend',
              `<div class="" id="${'error-' + el.getAttribute('data-unique-id')}" role="alert"></div>`
            );
          }
        }
        el.setAttribute('aria-invalid', 'true');
        el.setAttribute('aria-errormessage', 'error-' + el.getAttribute('data-unique-id'));

        const errorElement = elementWrapper.querySelector('[role="alert"]');
        errorElement.innerHTML = this.getErrorMessage(validity, el.getAttribute('type'), el);
      } else {
        if (el.type !== 'hidden') {
          if (el.hasAttribute('aria-errormessage')) {
            el.removeAttribute('aria-invalid');
            el.removeAttribute('aria-errormessage');
          }
          const errorElement = elementWrapper.querySelector('[role="alert"]');
          if (errorElement) {
            if (errorElement.classList.contains('[data-error-placeholder]')) {
              errorElement.removeAttribute('role');
              errorElement.innerHTML = '';
            } else {
              errorElement.parentNode.removeChild(errorElement);
            }
          }
        }
      }
    }

    if (readOnly) {
      el.setAttribute('readonly', 'readonly');
    }
  }

  private getErrorMessage(validity: ValidityState, type: string, el: HTMLObjectElement) {
    const extraMsg = el.getAttribute('data-extra-message');
    const extraMsgAppend = extraMsg ? `<br />${extraMsg}` : '';

    if (validity.badInput && type === 'number') return this.lang.type.number + extraMsgAppend;
    if (validity.valueMissing) return this.lang.required + extraMsgAppend;
    if (validity.typeMismatch && type === 'email') return this.lang.type.email + extraMsgAppend;
    if (validity.typeMismatch && type === 'url') return this.lang.type.url + extraMsgAppend;
    if (validity.typeMismatch && type === 'tel') return this.lang.type.tel + extraMsgAppend;
    if (validity.typeMismatch) return this.lang.defaultMessage + extraMsgAppend;
    if (validity.stepMismatch && parseFloat(el.getAttribute('step')) >= 1) return this.lang.stepInt + extraMsgAppend;
    if (validity.stepMismatch && parseFloat(el.getAttribute('step')) < 1)
      return (
        Formatter.sprintf(this.lang.stepFloat, {
          max: parseFloat(el.getAttribute('step')).countDecimals(),
        }) + extraMsgAppend
      );
    if (
      (validity.rangeUnderflow || validity.rangeOverflow) &&
      (type === 'number' || type === 'range') &&
      el.getAttribute('min') &&
      el.getAttribute('max')
    )
      return (
        Formatter.sprintf(this.lang.range, {
          min: el.getAttribute('min'),
          max: el.getAttribute('max'),
        }) + extraMsgAppend
      );
    if (validity.rangeUnderflow && (type === 'number' || type === 'range') && el.getAttribute('min'))
      return Formatter.sprintf(this.lang.min, { min: el.getAttribute('min') }) + extraMsgAppend;
    if (validity.rangeOverflow && (type === 'number' || type === 'range') && el.getAttribute('max'))
      return Formatter.sprintf(this.lang.max, { min: el.getAttribute('max') }) + extraMsgAppend;
    if (validity.tooShort) {
      return (
        Formatter.sprintf(this.lang.minlength, {
          min: el.getAttribute('minlength'),
        }) + extraMsgAppend
      );
    }
    if (validity.customError) {
      return el.validationMessage;
    }
    if (extraMsg) return extraMsg;
    return this.lang.defaultMessage;
  }
}

class FormValidation {
  private scrollToError = true; // Default scroll to the first error
  private validationComponent;

  constructor(form: HTMLFormElement, index, validationComponent: ValidationComponent = new ValidationComponent()) {
    this.validationComponent = validationComponent;
    form.setAttribute('novalidate', 'true');
    this.initFormElements(form, index);
    this.initFormSubmit(form);

    this.scrollToError = form.getAttribute('data-scroll-to-error') === 'false' ? false : true;

    const initialError = document.querySelector('[aria-invalid="true"]');
    if (initialError && this.scrollToError) {
      window.scrollTo({
        top: (initialError as HTMLObjectElement).parentElement.offsetTop - 100,
        behavior: 'smooth',
      });
    }
  }

  private initFormElements(el: Element, index: number) {
    const elements = el.querySelectorAll('input,textarea,select');
    Array.from(elements).forEach((element, i) => {
      this.initFormElement(element, `${index}-${i}`);
    });
  }

  private initFormElement(el: Element, uniqueIndex: string) {
    if (el.getAttribute('novalidate') === null) {
      el.addEventListener('blur', this.validationComponent.checkValidation.bind(this.validationComponent));
      el.addEventListener('check-validation', this.validationComponent.checkValidation.bind(this.validationComponent));
      el.setAttribute('data-unique-id', 'validate-' + uniqueIndex);

      if (
        el.tagName === 'SELECT' ||
        (el.tagName === 'INPUT' &&
          (el.getAttribute('type').toLowerCase() === 'checkbox' || el.getAttribute('type').toLowerCase() === 'radio'))
      ) {
        el.addEventListener('change', this.validationComponent.checkValidation.bind(this.validationComponent));
      }
    }
  }

  private initFormSubmit(el: Element) {
    el.addEventListener('onFormieValidate', (e) => {
      this.submitForm(e, el);
    });
    el.addEventListener('submit', (e) => {
      this.submitForm(e, el);
    });
  }

  private submitForm(e: Event, el: Element) {
    let valid = true;
    let scrolled = false;
    const elements = el.querySelectorAll('input:not([data-dont-validate]),textarea:not(.g-recaptcha-response),select');

    Array.from(elements).forEach((element, index) => {
      if (element.getAttribute('disabled') == null) {
        if (element.getAttribute('data-unique-id') === null) {
          this.initFormElement(element, `live-${document.querySelectorAll('[data-unique-id]').length + index}`);
        }

        element.dispatchEvent(new Event('check-validation'));

        if (element.hasAttribute('readonly')) {
          element.removeAttribute('readonly');
          valid = !(element as HTMLObjectElement).validity.valid ? false : valid;
          element.setAttribute('readonly', 'readonly');
        } else {
          valid = !(element as HTMLObjectElement).validity.valid ? false : valid;
        }

        if (this.scrollToError) {
          if (!(element as HTMLObjectElement).validity.valid && !scrolled) {
            scrolled = true;
            const elementWrapper = element.closest(`[data-validate-wrapper]`) as HTMLObjectElement;
            if (elementWrapper) {
              window.scrollTo({
                top: elementWrapper.offsetTop - 100,
                behavior: 'smooth',
              });
            } else {
              window.scrollTo({
                top: (element as HTMLObjectElement).parentElement.offsetTop - 100,
                behavior: 'smooth',
              });
            }
          }
        }
        if (index === 0) {
          (element as HTMLElement).focus();
        }
      }
    });

    if (!valid) {
      e.preventDefault();
    } else {
      const submitButton = el.querySelector('button[type=submit]');
      const recaptchaElements = el.querySelectorAll('.g-recaptcha-response');
      if (recaptchaElements.length == 0) {
        submitButton.setAttribute('disabled', 'true');
      }
      submitButton.classList.add('is-submitted');
      el.dispatchEvent(new Event('valid-submit'));
    }
  }
}
