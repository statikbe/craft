import { ValidationPlugin } from "./plugin.interface";
import { ValidationComponent } from "../../components/validation.component";

export class CountdownPlugin implements ValidationPlugin {
  constructor() {}

  public initElement() {
    const countdowns = document.querySelectorAll("[data-s-countdown]");
    Array.from(countdowns).forEach((countdown) => {
      this.initCountdown(countdown);
    });
  }

  private initCountdown(countdown: Element) {
    const countdownNotifier = document.querySelector(
      countdown.getAttribute("data-s-countdown")
    );
    const countdownNotifierChange = countdownNotifier
      ? countdownNotifier.querySelector("span")
      : null;
    const maxLength = parseInt(countdown.getAttribute("maxlength"));
    if (!countdownNotifier || !countdownNotifierChange || !maxLength) {
      console.error(
        "Make sure your data-s-countdown element exists and it has a child span."
      );
    } else {
      countdown.addEventListener("keyup", (e) => {
        const valLength = (e.target as HTMLTextAreaElement).value.length;
        if (valLength > 0) {
          countdownNotifier.classList.remove("hidden");
          countdownNotifierChange.innerHTML = `${
            maxLength - valLength
          }/${maxLength}`;
        } else {
          countdownNotifier.classList.add("hidden");
        }
      });
    }
  }
}
