import { ValidationPlugin } from "./plugin.interface";
import { ValidationComponent } from "../../components/validation.component";

export class PasswordConfirmPlugin implements ValidationPlugin {
  private validationComponent: ValidationComponent;

  constructor(validationComponent: ValidationComponent) {
    this.validationComponent = validationComponent;
  }

  public initElement() {
    const confirmPassword = document.querySelectorAll("input[data-s-confirm]");
    Array.from(confirmPassword).forEach((confirm) => {
      this.initConfirmPassword(confirm as HTMLInputElement);
    });
  }

  private initConfirmPassword(confirm: HTMLInputElement) {
    const origin = document.querySelector(
      confirm.getAttribute("data-s-confirm")
    ) as HTMLInputElement;

    if (!origin) {
      console.error("Make sure your data-s-confirm element exists.");
    } else {
      confirm.addEventListener("invalid", (e) => {
        e.preventDefault();
        this.validationComponent.checkValidation(e);
      });
      const checkEqualto = (e) => {
        const passwordValue = origin.value;
        const passwordValueConfirm = confirm.value;

        if (
          passwordValue != passwordValueConfirm &&
          passwordValueConfirm != ""
        ) {
          confirm.setCustomValidity(this.validationComponent.lang.equalto);
          confirm.reportValidity();
        } else {
          confirm.setCustomValidity("");
          confirm.reportValidity();
        }
      };
      confirm.addEventListener("blur", checkEqualto);
      origin.addEventListener("blur", checkEqualto);
    }
  }
}
