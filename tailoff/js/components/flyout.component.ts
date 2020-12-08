import { A11yUtils } from "../utils/a11y";
import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";

ArrayPrototypes.activateFrom();

export class FlyoutComponent {
  private modalElement: HTMLElement;
  private bodyElement: HTMLBodyElement;
  private flyoutToggleButtonElement: HTMLElement;
  private flyoutCloseButtonElement: HTMLElement;

  private keyDownListener;

  private keys = {
    esc: 27,
  };

  private animationTime = 300; //This would be better with a transitionend event, but IE does not support this.

  constructor() {
    this.bodyElement = document.getElementsByTagName(
      "BODY"
    )[0] as HTMLBodyElement;
    this.modalElement = document.getElementById("flyout");
    this.flyoutToggleButtonElement = document.querySelector(
      ".js-flyout-toggle"
    );
    if (this.modalElement && this.flyoutToggleButtonElement) {
      this.flyoutToggleButtonElement.setAttribute("role", "button");
      this.flyoutToggleButtonElement.setAttribute("aria-expanded", "false");
      this.flyoutCloseButtonElement = this.modalElement.querySelector(
        ".js-flyout-close"
      );
      this.flyoutCloseButtonElement.setAttribute("aria-expanded", "true");

      this.bodyElement.classList.add("flyout-enabled");

      const hiddenElements = Array.from(
        this.modalElement.querySelectorAll(".hidden")
      );
      hiddenElements.forEach((el) => {
        if (el.nodeName === "A") {
          el.classList.add("disabled");
        } else {
          el.setAttribute("disabled", "");
        }
        el.removeAttribute("tabindex");
      });

      document.addEventListener(
        "click",
        (e) => {
          for (
            let target = <Element>e.target;
            target && !target.isSameNode(document);
            target = target.parentElement
          ) {
            if (target.matches(".js-flyout-close")) {
              e.preventDefault();
              this.closeFlyout();
              break;
            }
          }
        },
        false
      );

      this.flyoutToggleButtonElement.addEventListener("click", (e) => {
        e.preventDefault();
        this.modalElement.classList.remove("invisible");
        this.bodyElement.classList.add("flyout-active");
        this.flyoutCloseButtonElement.focus();

        this.keyDownListener = this.onKeyDown.bind(this);
        document.addEventListener("keydown", this.keyDownListener);
      });

      A11yUtils.keepFocus(this.modalElement, true);
    }
  }

  private onKeyDown(e) {
    switch (e.keyCode) {
      case this.keys.esc:
        e.preventDefault();
        this.closeFlyout();
        break;
    }
  }

  private closeFlyout() {
    console.log("close");

    this.bodyElement.classList.remove("flyout-active");
    this.flyoutToggleButtonElement.focus();
    setTimeout(() => {
      this.modalElement.classList.add("invisible");
    }, this.animationTime);
    document.removeEventListener("keydown", this.keyDownListener);
  }
}
