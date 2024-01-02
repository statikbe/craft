/**
 * How to use:
 * Add the attribute "data-s-validate" to your html5 valid form
 *
 * Example:
 * <form data-s-validate="true"></form>
 */

import { SiteLang } from '../utils/site-lang';
import { Formatter } from '../utils/formater';
import { NumberPrototypes } from '../utils/prototypes/number.prototypes';
import { ScrollHelper } from '../utils/scroll';
import { ValidationPlugin, ValidationPluginConstructor } from '../plugins/validation/plugin.interface';
import { ElementPrototype } from '../utils/prototypes/element.prototypes';

NumberPrototypes.activateCountDecimals();
ElementPrototype.activateNearest();

export class ValidationComponent {
  private siteLang = SiteLang.getLang();
  public lang;

  private options = {
    errorClassFormElement: 'form__error', // The class to give the form element ex.: input, select
    errorClassInlineMsg: 'form__msg-error', // The class the inline error message receives
    errorClassContainer: 'form__error-container', // The class to give the container is available
    scrollToError: true, // Scroll to the first error. Will be false if showSummary is set to true.
    scrollSpeed: 400, //speed to scroll to error in ms.
    containerClass: 'form__field', // The container class
    errorPlaceholder: 'form__error-placeholder', // Gives you finer controle over the DOM position of the error message. You need to have a wrapping container class for this to work.
    containerMaxDepth: 1, // If there is no container class, the error message will be added to a parent with a max depth of #
    plugins: [],
  };

  constructor(options: Object = {}) {
    this.getLang().then(() => {
      this.options = { ...this.options, ...options };

      const forms = document.querySelectorAll('[data-s-validate]');
      Array.from(forms).forEach((form, index) => {
        form.setAttribute('novalidate', 'true');
        this.initFormElements(form, index);
        this.initFormSubmit(form);
      });

      this.options.plugins.forEach(
        (plugin: ValidationPluginConstructor | { plugin: ValidationPluginConstructor; options: {} }) => {
          const p = typeof plugin == 'function' ? new plugin(this) : new plugin.plugin(this);
          p.initElement();
        }
      );

      const initialError = document.querySelector('.form__msg-error');
      if (initialError) {
        ScrollHelper.scrollToY((initialError as HTMLObjectElement).parentElement, this.options.scrollSpeed);
      }
    });
  }

  private async getLang() {
    this.lang = await import(`../i18n/s-validation-${this.siteLang}.json`);
  }

  private initFormElements(el: Element, index: number) {
    const elements = el.querySelectorAll('input,textarea,select');
    Array.from(elements).forEach((element, i) => {
      this.initFormElement(element, `${index}-${i}`);
    });
  }

  private initFormElement(el: Element, uniqueIndex: string) {
    if (el.getAttribute('novalidate') === null) {
      el.addEventListener('blur', this.checkValidation.bind(this));
      el.addEventListener('check-validation', this.checkValidation.bind(this));
      el.setAttribute('data-unique-id', 's-validate-' + uniqueIndex);

      if (
        el.tagName === 'SELECT' ||
        (el.tagName === 'INPUT' &&
          (el.getAttribute('type').toLowerCase() === 'checkbox' || el.getAttribute('type').toLowerCase() === 'radio'))
      ) {
        el.addEventListener('change', this.checkValidation.bind(this));
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

        if (this.options.scrollToError) {
          if (!(element as HTMLObjectElement).validity.valid && !scrolled) {
            scrolled = true;
            const fieldContainer = element.closest(`.${this.options.containerClass}`);
            if (fieldContainer) {
              ScrollHelper.scrollToY(fieldContainer as HTMLObjectElement, this.options.scrollSpeed);
            } else {
              ScrollHelper.scrollToY(element.parentElement as HTMLObjectElement, this.options.scrollSpeed);
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

  public checkValidation(e: Event) {
    const el: HTMLObjectElement = e.target as HTMLObjectElement;
    let readOnly = false;
    //Make sure readonly fields like flatpicker keeps working.
    if (el.hasAttribute('readonly')) {
      readOnly = true;
      el.removeAttribute('readonly');
    }

    const validity = el.validity;
    const fieldContainer = el.closest(`.${this.options.containerClass}`);
    let replacedElement = el.parentElement.querySelector('.form__replaced-element');
    if (fieldContainer) {
      replacedElement = fieldContainer.querySelector('.form__replaced-element');
    }

    if (el.getAttribute('disabled') == null) {
      if (!validity.valid) {
        if (fieldContainer) {
          fieldContainer.classList.add(this.options.errorClassContainer);
          if (!fieldContainer.querySelector(`.${this.options.errorClassInlineMsg}`)) {
            const fieldErrorPlaceholder = fieldContainer.querySelector(`.${this.options.errorPlaceholder}`);

            if (fieldErrorPlaceholder) {
              fieldErrorPlaceholder.classList.add(this.options.errorClassInlineMsg);
              fieldErrorPlaceholder.setAttribute('role', 'alert');
            } else {
              fieldContainer.insertAdjacentHTML(
                'beforeend',
                `<div class="${this.options.errorClassInlineMsg}" role="alert"></div>`
              );
            }
          }
        } else {
          if (
            !el.nextElementSibling ||
            (el.nextElementSibling && !el.nextElementSibling.classList.contains(this.options.errorClassInlineMsg))
          ) {
            el.insertAdjacentHTML('afterend', `<div class="${this.options.errorClassInlineMsg}" role="alert"></div>`);
          }
        }

        if (el.classList) {
          el.classList.add(this.options.errorClassFormElement);
          el.setAttribute('aria-invalid', 'true');
        }
        if (replacedElement) {
          replacedElement.classList.add(this.options.errorClassFormElement);
          replacedElement.setAttribute('aria-invalid', 'true');
        }

        let errorElement = el.nearest(`.${this.options.errorClassInlineMsg}`, this.options.containerMaxDepth);
        if (fieldContainer) {
          errorElement = fieldContainer.querySelector(`.${this.options.errorClassInlineMsg}`);
        }

        errorElement.innerHTML = this.getErrorMessage(validity, el.getAttribute('type'), el);
        el.setAttribute('aria-describedby', el.getAttribute('data-unique-id'));
        errorElement.setAttribute('id', el.getAttribute('data-unique-id'));
      } else {
        if (el.type !== 'hidden') {
          if (el.classList) {
            el.classList.remove(this.options.errorClassFormElement);
            el.removeAttribute('aria-invalid');
          }
          if (replacedElement) {
            replacedElement.classList.remove(this.options.errorClassFormElement);
            replacedElement.removeAttribute('aria-invalid');
          }
          el.removeAttribute('aria-describedby');
          let errorElement = el.nearest(`.${this.options.errorClassInlineMsg}`, this.options.containerMaxDepth);
          if (fieldContainer) {
            fieldContainer.classList.remove(this.options.errorClassContainer);
            errorElement = fieldContainer.querySelector(`.${this.options.errorClassInlineMsg}`);
          }
          if (errorElement && errorElement.classList.contains(this.options.errorClassInlineMsg)) {
            if (errorElement.classList.contains(this.options.errorPlaceholder)) {
              errorElement.classList.remove(this.options.errorClassInlineMsg);
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
    let extraMsg = el.getAttribute('data-s-extra-message');
    extraMsg = extraMsg ? `<br />${extraMsg}` : '';

    if (validity.badInput && type === 'number') return this.lang.type.number + extraMsg;
    if (validity.valueMissing) return this.lang.required + extraMsg;
    if (validity.typeMismatch && type === 'email') return this.lang.type.email + extraMsg;
    if (validity.typeMismatch && type === 'url') return this.lang.type.url + extraMsg;
    if (validity.typeMismatch && type === 'tel') return this.lang.type.tel + extraMsg;
    if (validity.typeMismatch) return this.lang.defaultMessage + extraMsg;
    if (validity.stepMismatch && parseFloat(el.getAttribute('step')) >= 1) return this.lang.stepInt + extraMsg;
    if (validity.stepMismatch && parseFloat(el.getAttribute('step')) < 1)
      return (
        Formatter.sprintf(this.lang.stepFloat, {
          max: parseFloat(el.getAttribute('step')).countDecimals(),
        }) + extraMsg
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
        }) + extraMsg
      );
    if (validity.rangeUnderflow && (type === 'number' || type === 'range') && el.getAttribute('min'))
      return Formatter.sprintf(this.lang.min, { min: el.getAttribute('min') }) + extraMsg;
    if (validity.rangeOverflow && (type === 'number' || type === 'range') && el.getAttribute('max'))
      return Formatter.sprintf(this.lang.max, { min: el.getAttribute('max') }) + extraMsg;
    if (validity.tooShort) {
      return (
        Formatter.sprintf(this.lang.minlength, {
          min: el.getAttribute('minlength'),
        }) + extraMsg
      );
    }
    if (validity.customError) {
      return el.validationMessage;
    }
    if (extraMsg) return extraMsg;
    return this.lang.defaultMessage;
  }
}
