/**
 * How to use this component:
 * Add the attribute "data-s-toggle" to your element, with a value of the selector for the targeted element.
 * You can add a second attribute of "data-s-toggle-class" if you want an other class than the default "toggle-open" class.
 *
 * Example:
 * <a href="#" data-s-toggle="body" data-s-toggle-class="flyout-open">Toggle</a>
 */

import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";

ArrayPrototypes.activateFrom();

export class ToggleComponent {
  constructor() {
    const triggers = document.querySelectorAll("[data-s-toggle]");
    Array.from(triggers).forEach(t => {
      this.initToggleTrigger(t);
    });
  }

  private initToggleTrigger(el: Element) {
    const target = el.getAttribute("data-s-toggle");
    const changeClass = el.getAttribute("data-s-toggle-class") ?? "toggle-open";
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    el.setAttribute("aria-expanded", "false");
    el.addEventListener("click", e => {
      e.preventDefault();
      this.toggleAction(el, target, changeClass);
    });
  }

  private toggleAction(el, target, changeClass) {
    el.setAttribute(
      "aria-expanded",
      el.getAttribute("aria-expanded") === "true" ? "false" : "true"
    );
    const targetElement = document.querySelectorAll(target);
    Array.from(targetElement).forEach(t => {
      if (t.classList) {
        if (t.classList.contains(changeClass)) {
          t.classList.remove(changeClass);
        } else {
          t.classList.add(changeClass);
        }
      }
    });
  }
}
