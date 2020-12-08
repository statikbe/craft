import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";

ArrayPrototypes.activateFrom();

export class SearchComponent {
  constructor() {
    const trigger = document.querySelector(".js-search-trigger") as HTMLElement;
    const form = document.querySelector(".js-search-form");
    if (trigger && form) {
      const input = form.querySelector(
        "input[type=search]"
      ) as HTMLInputElement;
      const hideBlock = document.querySelector(".js-search-hide");
      const closeButton = document.querySelector(
        ".js-search-close"
      ) as HTMLElement;

      const animated = trigger.classList.contains("js-search-animated");

      trigger.setAttribute("tabindex", "0");
      trigger.setAttribute("role", "button");
      trigger.setAttribute("aria-expanded", "false");
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        hideBlock.classList.add(animated ? "search-hide" : "hidden");
        animated
          ? form.classList.add("search-show")
          : form.classList.remove("hidden");
        trigger.setAttribute("aria-expanded", "true");
        input.focus();
      });

      closeButton.addEventListener("click", (e) => {
        e.preventDefault();
        hideBlock.classList.remove(animated ? "search-hide" : "hidden");
        animated
          ? form.classList.remove("search-show")
          : form.classList.add("hidden");
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
      });
    }

    // document.addEventListener("keyup", (e) => {
    //   const key = e.key || e.keyCode;
    //   if (
    //     (trigger.getAttribute("aria-expanded") == "true" && key === "Escape") ||
    //     key === "Esc" ||
    //     key === 27
    //   ) {
    //     hideBlock.classList.remove(animated ? "search-hide" : "hidden");
    //     animated
    //       ? form.classList.remove("search-show")
    //       : form.classList.add("hidden");
    //     trigger.setAttribute("aria-expanded", "false");
    //     trigger.focus();
    //   }
    // });
  }
}
