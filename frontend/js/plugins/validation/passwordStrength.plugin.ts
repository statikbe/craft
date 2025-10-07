import { ValidationPlugin } from './plugin.interface';
import ValidationComponent from '../../components-base/validation.component';
import { Formatter } from '../../utils/formater';
import { DOMHelper } from '../../utils/domHelper';

export class PasswordStrengthPlugin implements ValidationPlugin {
  private validationComponent: ValidationComponent;

  private minLength = 16;
  private maxLength = 160;
  private cases = true;
  private numbers = true;
  private symbols = true;
  private showStrengthIndicator = true;
  private showStrengthIndicatorText = true;
  private strengthIndicator;
  private isValid = false;

  private passwordStrengthScore = 2;

  private cssClasses = {
    strengthIndicatorWrapper: 'strength-indicator__wrapper relative h-2 my-1 rounded-sm border border-black/20',
    strengthIndicator: 'strength-indicator w-0 h-full transition-all duration-300 ease-in-out',
    strengthIndicatorVeryWeak: 'bg-red-200',
    strengthIndicatorWeak: 'bg-red-500',
    strengthIndicatorMedium: 'bg-orange-500',
    strengthIndicatorStrong: 'bg-yellow-500',
    strengthIndicatorVeryStrong: 'bg-green-500',
    strengthIndicatorText: 'strength-indicator__text text-xs text-black/50',
  };

  constructor(validationComponent: ValidationComponent) {
    this.validationComponent = validationComponent;
  }

  public initElement() {
    const passwords = document.querySelectorAll('input[data-strength]');
    Array.from(passwords).forEach((password) => {
      this.initPasswordStrength(password as HTMLInputElement);
    });

    DOMHelper.onDynamicContent(
      document.documentElement,
      'input[data-strength]',
      (passwords: NodeListOf<HTMLInputElement>) => {
        passwords.forEach((password) => {
          this.initPasswordStrength(password);
        });
      }
    );
  }

  private initPasswordStrength(password: HTMLInputElement) {
    this.minLength = password.dataset.minLength ? parseInt(password.dataset.minLength, 10) : this.minLength;
    this.maxLength = password.dataset.maxLength ? parseInt(password.dataset.maxLength, 10) : this.maxLength;
    this.cases = password.dataset.cases ? password.dataset.cases === 'true' : this.cases;
    this.numbers = password.dataset.numbers ? password.dataset.numbers === 'true' : this.numbers;
    this.symbols = password.dataset.symbols ? password.dataset.symbols === 'true' : this.symbols;
    this.showStrengthIndicator = password.dataset.showStrengthIndicator
      ? password.dataset.showStrengthIndicator === 'true'
      : this.showStrengthIndicator;
    this.showStrengthIndicatorText = password.dataset.showStrengthIndicatorText
      ? password.dataset.showStrengthIndicatorText === 'true'
      : this.showStrengthIndicatorText;

    const datasetKeys = Object.keys(password.dataset);
    datasetKeys.forEach((key) => {
      if (this.cssClasses[key]) {
        this.cssClasses[key] = password.dataset[key];
      }
    });

    if (this.showStrengthIndicatorText) {
      const strengthIndicatorText = document.createElement('div');
      strengthIndicatorText.classList.add(...this.cssClasses.strengthIndicatorText.split(' '));
      strengthIndicatorText.innerHTML = Formatter.sprintf(this.validationComponent.lang.strength, {
        min: this.minLength,
        cases: this.cases ? '1' : '0',
        numbers: this.numbers ? '1' : '0',
        symbols: this.symbols ? '1' : '0',
        max: this.maxLength,
      });

      password.parentNode.insertBefore(strengthIndicatorText, password.nextSibling);
    }
    if (this.showStrengthIndicator) {
      this.strengthIndicator = document.createElement('div');
      this.strengthIndicator.classList.add(...this.cssClasses.strengthIndicator.split(' '));

      const strengthIndicatorWrapper = document.createElement('div');
      strengthIndicatorWrapper.classList.add(...this.cssClasses.strengthIndicatorWrapper.split(' '));
      strengthIndicatorWrapper.appendChild(this.strengthIndicator);
      password.parentNode.insertBefore(strengthIndicatorWrapper, password.nextSibling);

      this.passwordStrengthScore += (this.cases ? 1 : 0) + (this.numbers ? 1 : 0) + (this.symbols ? 1 : 0);
    }

    password.addEventListener('invalid', (e) => {
      e.preventDefault();
      this.validationComponent.checkValidation(e);
    });

    const checkStrength = (e) => {
      const passwordValue = password.value;

      //test if value has at least one uppercase letter
      const hasUpperCase = this.cases ? /[A-Z]/.test(passwordValue) : true;
      //test if value has at least one number
      const hasNumber = this.numbers ? /\d/.test(passwordValue) : true;
      //test if value has at least one special character
      const hasSpecial = this.symbols ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue) : true;
      const isLongEnough = passwordValue.length >= this.minLength;
      const isShortEnough = passwordValue.length <= this.maxLength;

      if (this.showStrengthIndicator) {
        const currentStrength =
          (passwordValue.length > 0 ? 1 : 0) +
          (hasUpperCase ? 1 : 0) +
          (hasNumber ? 1 : 0) +
          (hasSpecial ? 1 : 0) +
          (isLongEnough ? 1 : 0);
        const strengthPercentage = (currentStrength / this.passwordStrengthScore) * 100;
        this.strengthIndicator.classList.remove(
          ...this.cssClasses.strengthIndicatorVeryWeak.split(' '),
          ...this.cssClasses.strengthIndicatorWeak.split(' '),
          ...this.cssClasses.strengthIndicatorMedium.split(' '),
          ...this.cssClasses.strengthIndicatorStrong.split(' '),
          ...this.cssClasses.strengthIndicatorVeryStrong.split(' ')
        );
        this.isValid = false;
        if (isShortEnough) {
          this.strengthIndicator.style.width = strengthPercentage + '%';
          if (strengthPercentage <= 20) {
            this.strengthIndicator.classList.add(...this.cssClasses.strengthIndicatorVeryWeak.split(' '));
          } else if (strengthPercentage <= 40) {
            this.strengthIndicator.classList.add(...this.cssClasses.strengthIndicatorWeak.split(' '));
          } else if (strengthPercentage <= 60) {
            this.strengthIndicator.classList.add(...this.cssClasses.strengthIndicatorMedium.split(' '));
          } else if (strengthPercentage <= 80) {
            this.strengthIndicator.classList.add(...this.cssClasses.strengthIndicatorStrong.split(' '));
          } else {
            this.strengthIndicator.classList.add(...this.cssClasses.strengthIndicatorVeryStrong.split(' '));
            this.isValid = true;
          }
        } else {
          this.strengthIndicator.style.width = '100%';
          this.strengthIndicator.classList.add(...this.cssClasses.strengthIndicatorWeak.split(' '));
        }
      }
    };

    const checkValidation = (e) => {
      if (!this.isValid) {
        if (this.showStrengthIndicatorText) {
          password.setCustomValidity(this.validationComponent.lang.defaultMessage);
        } else {
          password.setCustomValidity(
            Formatter.sprintf(this.validationComponent.lang.strength, {
              min: this.minLength,
              cases: this.cases ? '1' : '0',
              numbers: this.numbers ? '1' : '0',
              symbols: this.symbols ? '1' : '0',
              max: this.maxLength,
            })
          );
        }
        password.reportValidity();
      } else {
        password.setCustomValidity('');
        password.reportValidity();
      }
    };

    password.addEventListener('keyup', checkStrength);
    password.addEventListener('change', checkValidation);
  }
}
