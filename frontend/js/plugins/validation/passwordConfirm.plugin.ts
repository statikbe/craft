import { ValidationPlugin } from './plugin.interface';
import ValidationComponent from '../../components-base/validation.component';
import { DOMHelper } from '../../utils/domHelper';

export class PasswordConfirmPlugin implements ValidationPlugin {
  private validationComponent: ValidationComponent;

  constructor(validationComponent: ValidationComponent) {
    this.validationComponent = validationComponent;
  }

  public initElement() {
    const confirmPassword = document.querySelectorAll('input[data-confirm]');
    Array.from(confirmPassword).forEach((confirm) => {
      this.initConfirmPassword(confirm as HTMLInputElement);
    });

    DOMHelper.onDynamicContent(
      document.documentElement,
      'input[data-confirm]',
      (confirmPassword: NodeListOf<HTMLInputElement>) => {
        confirmPassword.forEach((confirm) => {
          this.initConfirmPassword(confirm);
        });
      }
    );
  }

  private initConfirmPassword(confirm: HTMLInputElement) {
    const origin = document.getElementById(confirm.getAttribute('data-confirm')) as HTMLInputElement;

    if (!origin) {
      console.warn('Make sure your data-confirm element exists.');
    } else {
      confirm.addEventListener('invalid', (e) => {
        e.preventDefault();
        this.validationComponent.checkValidation(e);
      });
      const checkEqualto = (e) => {
        const passwordValue = origin.value;
        const passwordValueConfirm = confirm.value;

        if (passwordValue != passwordValueConfirm && passwordValueConfirm != '') {
          confirm.setCustomValidity(this.validationComponent.lang.equalto);
          confirm.reportValidity();
        } else {
          confirm.setCustomValidity('');
          confirm.reportValidity();
        }
      };
      confirm.addEventListener('blur', checkEqualto);
      origin.addEventListener('blur', checkEqualto);
    }
  }
}
