import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
import { ElementPrototype } from "../utils/prototypes/element.prototypes";

ArrayPrototypes.activateFrom();
ElementPrototype.activateClosest();

export class IndeterminateChecksComponent {
  constructor() {
    Array.from(document.querySelectorAll("ul.js-indeterminate-checks")).forEach(
      (list: HTMLUListElement, index) => {
        new IndeterminateChecks(list, index);
      }
    );
  }
}

class IndeterminateChecks {
  private mainList: HTMLUListElement;
  private mainListIndex = 0;
  private jsChange;

  constructor(element: HTMLUListElement, index) {
    this.mainList = element;
    this.mainListIndex = index;

    this.jsChange = document.createEvent("HTMLEvents");
    this.jsChange.initEvent("jschange", false, true);

    this.init();
  }

  private init() {
    this.initSubLists();
    this.initToggles();
    this.initCheckboxes();
  }

  private initCheckboxes() {
    Array.from(this.mainList.querySelectorAll("input[type=checkbox]")).forEach(
      (checkbox: HTMLInputElement) => {
        checkbox.addEventListener("change", this.onCheckboxChange.bind(this));
        if (checkbox.checked) {
          this.checkUp(checkbox);
        }
      }
    );
  }

  private initSubLists() {
    Array.from(
      this.mainList.querySelectorAll("ul.js-indeterminate-sub-list")
    ).forEach((list: HTMLUListElement, index) => {
      const subLevelID = `jsIndeterminateSubList${this.mainListIndex}-${index}`;
      list.setAttribute("id", subLevelID);
    });
  }

  private onCheckboxChange(e) {
    this.checkUp(e.target);
    this.checkDown(e.target);

    if (e.target.checked) {
      const listItem = e.target.closest("li") as HTMLLIElement;
      const subList = listItem.querySelector("ul");
      if (subList && subList.classList.contains("hidden")) {
        subList.classList.remove("hidden");
        const toggle = listItem.querySelector(".js-indeterminate-toggle");
        toggle.setAttribute("aria-expanded", "true");
      }
    }
  }

  private checkUp(check: HTMLInputElement) {
    const list = check.closest("ul.js-indeterminate-sub-list");
    if (list) {
      let nbrOfUnchecked = 0;
      let nbrOfChecked = 0;
      let nbrOfIndeterminate = 0;
      Array.from(
        this.mainList.querySelectorAll(
          `#${list.getAttribute("id")} > li > *:not(ul) input`
        )
      ).forEach((input: HTMLInputElement) => {
        if (input.checked || input.indeterminate) {
          if (input.indeterminate) {
            nbrOfIndeterminate++;
          } else {
            nbrOfChecked++;
          }
        } else {
          nbrOfUnchecked++;
        }
      });

      const parentInput = list
        .closest("li")
        .querySelector("input[type=checkbox]") as HTMLInputElement;

      if (
        nbrOfUnchecked === 0 &&
        nbrOfIndeterminate === 0 &&
        nbrOfChecked > 0
      ) {
        parentInput.indeterminate = false;
        parentInput.checked = true;
      } else {
        if (nbrOfChecked > 0 || nbrOfIndeterminate > 0) {
          parentInput.indeterminate = true;
          parentInput.checked = false;
        } else {
          parentInput.indeterminate = false;
          parentInput.checked = false;
        }
      }

      parentInput.dispatchEvent(this.jsChange);

      this.checkUp(parentInput);
    }
  }

  private checkDown(check: HTMLInputElement) {
    const subList = check.closest("li").querySelector("ul");
    if (subList) {
      Array.from(subList.querySelectorAll("input[type=checkbox]")).forEach(
        (input: HTMLInputElement) => {
          input.checked = check.checked;
          input.dispatchEvent(this.jsChange);
        }
      );
    }
  }

  private initToggles() {
    const toggles = Array.from(
      this.mainList.querySelectorAll(".js-indeterminate-toggle")
    );
    if (toggles.length > 0) {
      toggles.forEach((toggle, index) => {
        toggle.addEventListener("click", this.onToggleClick.bind(this));
        toggle.setAttribute("aria-expanded", "false");
        // toggle.setAttribute(
        //   "aria-controls",
        //   toggle.closest("li").querySelector("ul").getAttribute("id")
        // );
      });

      if (
        this.mainList.getAttribute("data-s-indeterminate-toggle-open") != null
      ) {
        if (
          this.mainList.getAttribute("data-s-indeterminate-toggle-open") ==
          "false"
        ) {
          Array.from(this.mainList.querySelectorAll("ul")).forEach((list) => {
            const toggle = list
              .closest("li")
              .querySelector(".js-indeterminate-toggle");
            toggle.setAttribute("aria-expanded", "true");

            if (
              this.mainList.getAttribute("data-s-indeterminate-open-checked")
            ) {
              if (list.querySelectorAll("input:checked").length === 0) {
                list.classList.add("hidden");
                toggle.setAttribute("aria-expanded", "false");
              }
            } else {
              list.classList.add("hidden");
              toggle.setAttribute("aria-expanded", "false");
            }
          });
        }
      }
    }
  }

  private onToggleClick(e) {
    e.preventDefault();
    this.toggleLevel(e.target);
  }

  private toggleLevel(toggle: HTMLElement) {
    if (!toggle.classList.contains("js-indeterminate-toggle")) {
      toggle = toggle.closest(".js-indeterminate-toggle");
    }
    const listItem = toggle.closest("li") as HTMLLIElement;
    const subList = listItem.querySelector("ul");
    if (subList.classList.contains("hidden")) {
      subList.classList.remove("hidden");
      toggle.setAttribute("aria-expanded", "true");
    } else {
      subList.classList.add("hidden");
      toggle.setAttribute("aria-expanded", "false");
    }
  }
}
