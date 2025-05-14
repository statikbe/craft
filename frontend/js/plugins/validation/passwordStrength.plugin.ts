import { ValidationPlugin } from "./plugin.interface";
import { ValidationComponent } from "../../components/validation.component";
import { Formatter } from "../../utils/formater";

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

  constructor(validationComponent: ValidationComponent) {
    this.validationComponent = validationComponent;
  }

  public initElement() {
    const passwords = document.querySelectorAll("input[data-s-strength]");

    Array.from(passwords).forEach((password) => {
      this.initPasswordStrength(password as HTMLInputElement);
    });
  }

  private initPasswordStrength(password: HTMLInputElement) {
    this.minLength = password.dataset.sMinLength
      ? parseInt(password.dataset.sMinLength, 10)
      : this.minLength;
    this.maxLength = password.dataset.sMaxLength
      ? parseInt(password.dataset.sMaxLength, 10)
      : this.maxLength;
    this.cases = password.dataset.sCases
      ? password.dataset.sCases === "true"
      : this.cases;
    this.numbers = password.dataset.sNumbers
      ? password.dataset.sNumbers === "true"
      : this.numbers;
    this.symbols = password.dataset.sSymbols
      ? password.dataset.sSymbols === "true"
      : this.symbols;
    this.showStrengthIndicator = password.dataset.sShowStrengthIndicator
      ? password.dataset.sShowStrengthIndicator === "true"
      : this.showStrengthIndicator;
    this.showStrengthIndicatorText = password.dataset.sShowStrengthIndicatorText
      ? password.dataset.sShowStrengthIndicatorText === "true"
      : this.showStrengthIndicatorText;

    if (this.showStrengthIndicatorText) {
      const strengthIndicatorText = document.createElement("div");
      strengthIndicatorText.classList.add("strength-indicator-text");
      strengthIndicatorText.innerHTML = Formatter.sprintf(
        this.validationComponent.lang.strength,
        {
          min: this.minLength,
          cases: this.cases ? "1" : "0",
          numbers: this.numbers ? "1" : "0",
          symbols: this.symbols ? "1" : "0",
          max: this.maxLength,
        }
      );

      password.parentNode.insertBefore(
        strengthIndicatorText,
        password.nextSibling
      );
    }
    if (this.showStrengthIndicator) {
      this.strengthIndicator = document.createElement("div");
      this.strengthIndicator.classList.add("strength-indicator");

      const strengthIndicatorWrapper = document.createElement("div");
      strengthIndicatorWrapper.classList.add("strength-indicator-wrapper");
      strengthIndicatorWrapper.appendChild(this.strengthIndicator);
      password.parentNode.insertBefore(
        strengthIndicatorWrapper,
        password.nextSibling
      );

      this.passwordStrengthScore +=
        (this.cases ? 1 : 0) + (this.numbers ? 1 : 0) + (this.symbols ? 1 : 0);
    }

    password.addEventListener("invalid", (e) => {
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
      const hasSpecial = this.symbols
        ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue)
        : true;
      const isLongEnough = passwordValue.length >= this.minLength;
      const isShortEnough = passwordValue.length <= this.maxLength;

      if (this.showStrengthIndicator) {
        const currentStrength =
          (passwordValue.length > 0 ? 1 : 0) +
          (hasUpperCase ? 1 : 0) +
          (hasNumber ? 1 : 0) +
          (hasSpecial ? 1 : 0) +
          (isLongEnough ? 1 : 0);
        const strengthPercentage =
          (currentStrength / this.passwordStrengthScore) * 100;
        this.strengthIndicator.classList.remove(
          "very-weak",
          "weak",
          "medium",
          "strong",
          "very-strong"
        );
        this.isValid = false;
        if (isShortEnough) {
          this.strengthIndicator.style.width = strengthPercentage + "%";
          if (strengthPercentage <= 20) {
            this.strengthIndicator.classList.add("very-weak");
          } else if (strengthPercentage <= 40) {
            this.strengthIndicator.classList.add("weak");
          } else if (strengthPercentage <= 60) {
            this.strengthIndicator.classList.add("medium");
          } else if (strengthPercentage <= 80) {
            this.strengthIndicator.classList.add("strong");
          } else {
            this.strengthIndicator.classList.add("very-strong");
            this.isValid = true;
          }
        } else {
          this.strengthIndicator.style.width = "100%";
          this.strengthIndicator.classList.add("weak");
        }
      }
    };

    const checkValidation = (e) => {
      if (!this.isValid) {
        if (this.showStrengthIndicatorText) {
          password.setCustomValidity(
            this.validationComponent.lang.defaultMessage
          );
        } else {
          password.setCustomValidity(
            Formatter.sprintf(this.validationComponent.lang.strength, {
              min: this.minLength,
              cases: this.cases ? "1" : "0",
              numbers: this.numbers ? "1" : "0",
              symbols: this.symbols ? "1" : "0",
              max: this.maxLength,
            })
          );
        }
        password.reportValidity();
      } else {
        password.setCustomValidity("");
        password.reportValidity();
      }
    };

    password.addEventListener("keyup", checkStrength);
    password.addEventListener("change", checkValidation);
  }
}
