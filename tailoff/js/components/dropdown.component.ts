import { DOMHelper } from "../utils/domHelper";
import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
import { ElementPrototype } from "../utils/prototypes/element.prototypes";

ArrayPrototypes.activateFrom();
ElementPrototype.activateClosest();

export class DropdownComponent {
  constructor() {
    const dropdowns = Array.from(document.querySelectorAll(".js-dropdown"));
    dropdowns.forEach((dropdown, index) => {
      new DropdownElement(dropdown as HTMLElement, index);
    });

    DOMHelper.onDynamicContent(
      document.documentElement,
      ".js-dropdown",
      (dropdowns) => {
        Array.from(dropdowns).forEach((dropdown, index) => {
          new DropdownElement(dropdown as HTMLElement, index);
        });
      }
    );
  }
}

class DropdownElement {
  private clickListener;
  private keydownListener;
  private scrollListener;
  private buttonElement: HTMLElement;
  private menuElement: HTMLElement;
  private menuItems: Array<HTMLElement>;
  private popper;
  private open = false;

  private TAB_KEYCODE = 9;
  private ESC_KEYCODE = 27;
  private UP_ARROW_KEYCODE = 38;
  private DOWN_ARROW_KEYCODE = 40;

  constructor(element: HTMLElement, index) {
    element.style.position = "relative";
    element.classList.remove("js-dropdown");
    this.buttonElement = element.querySelector(".js-dropdown-toggle");
    this.menuElement = element.querySelector(".js-dropdown-menu");
    this.menuItems = Array.from(
      this.menuElement.querySelectorAll("a[href],button:not([disabled])")
    );

    this.menuElement.classList.add("hidden");
    this.buttonElement.setAttribute("role", "button");
    this.buttonElement.setAttribute("aria-expanded", "false");

    this.clickListener = this.clickAction.bind(this);
    this.keydownListener = this.keydownAction.bind(this);
    this.scrollListener = this.scrollAction.bind(this);
    this.buttonElement.addEventListener("click", this.clickListener);
  }

  private toggleMenu() {
    if (this.menuElement.classList.contains("hidden")) {
      // Open
      this.open = true;
      this.menuElement.classList.remove("hidden");
      this.buttonElement.setAttribute("aria-expanded", "true");
      this.positionMenu();

      document.addEventListener("click", this.clickListener);
      document.addEventListener("keydown", this.keydownListener);
      document.addEventListener("scroll", this.scrollListener);
    } else {
      // Close
      this.open = false;
      this.menuElement.classList.add("hidden");
      this.buttonElement.setAttribute("aria-expanded", "false");

      document.removeEventListener("click", this.clickListener);
      document.removeEventListener("keydown", this.keydownListener);
      document.removeEventListener("scroll", this.scrollListener);
    }
  }

  private clickAction(e: Event) {
    e.stopPropagation();
    this.toggleMenu();
  }

  private scrollAction(e: Event) {
    this.positionMenu();
  }

  private keydownAction(event) {
    if (event.keyCode === this.ESC_KEYCODE) {
      event.preventDefault();
      this.buttonElement.focus();
      this.toggleMenu();
    }

    if (event.keyCode === this.UP_ARROW_KEYCODE) {
      event.preventDefault();
      if (this.menuItems[0] !== document.activeElement) {
        const activeMenuIndex = this.menuItems.findIndex(
          (i) => i === document.activeElement
        );
        if (activeMenuIndex > 0) {
          this.menuItems[activeMenuIndex - 1].focus();
        }
      }
    }

    if (event.keyCode === this.DOWN_ARROW_KEYCODE) {
      event.preventDefault();
      if (
        this.menuItems[this.menuItems.length - 1] !== document.activeElement
      ) {
        const activeMenuIndex = this.menuItems.findIndex(
          (i) => i === document.activeElement
        );
        console.log(activeMenuIndex);

        if (activeMenuIndex < this.menuItems.length - 1) {
          this.menuItems[activeMenuIndex + 1].focus();
        }
      }
    }

    if (
      event.keyCode === this.TAB_KEYCODE &&
      event.shiftKey &&
      this.buttonElement === document.activeElement
    ) {
      this.toggleMenu();
    }

    if (
      event.keyCode === this.TAB_KEYCODE &&
      !event.shiftKey &&
      this.menuItems[this.menuItems.length - 1] === document.activeElement
    ) {
      this.toggleMenu();
    }
  }

  private positionMenu() {
    this.menuElement.style.position = "absolute";
    this.menuElement.style.top = "0px";
    this.menuElement.style.left = "0px";
    this.menuElement.style.willChange = "transform";

    const buttonRect = this.buttonElement.getBoundingClientRect();
    const menuRect = this.menuElement.getBoundingClientRect();

    let leftPos = this.buttonElement.offsetLeft;

    if (buttonRect.left + menuRect.width > window.screen.width) {
      leftPos =
        this.buttonElement.offsetLeft + buttonRect.width - menuRect.width;
    }

    if (
      buttonRect.height + menuRect.height + buttonRect.top >
      window.screen.height
    ) {
      this.menuElement.style.transform = `translate(${leftPos}px, ${-menuRect.height}px)`;
    } else {
      this.menuElement.style.transform = `translate(${leftPos}px, ${
        this.buttonElement.offsetTop + buttonRect.height
      }px)`;
    }
  }
}
