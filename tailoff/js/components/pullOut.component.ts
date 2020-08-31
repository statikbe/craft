import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
import breakOut from "../../tailwind/break-out";

ArrayPrototypes.activateFrom();

export class PullOutComponent {
  constructor() {
    if (document.querySelectorAll(".js-pull-out").length > 0) {
      this.pullOutBlocks();
      window.addEventListener("resize", this.pullOutBlocks);
    }
  }

  private pullOutBlocks() {
    Array.from(document.querySelectorAll(".js-pull-out")).forEach(
      (block: HTMLElement) => {
        const direction = block.getAttribute("data-direction");

        if (direction) {
          const max = block.getAttribute("data-max")
            ? parseInt(block.getAttribute("data-max"))
            : window.innerWidth;

          const breakpoint = block.getAttribute("data-breakpoint")
            ? parseInt(block.getAttribute("data-breakpoint"))
            : 0;

          const rect = block.parentElement.getBoundingClientRect();
          const offset = {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft,
          };

          if (window.innerWidth > breakpoint) {
            switch (direction) {
              case "left":
                block.style.marginLeft = `-${Math.min(offset.left, max)}px`;
                break;
              case "right":
                const rightOffset =
                  window.innerWidth -
                  (offset.left + block.parentElement.clientWidth);
                block.style.marginRight = `-${Math.min(rightOffset, max)}px`;
                break;
              default:
                break;
            }
          } else {
            if (block.style.marginLeft) {
              block.style.marginLeft = "";
            }
            if (block.style.marginRight) {
              block.style.marginRight = "";
            }
          }
        } else {
          console.error(
            "You must have a data element with name 'data-direction' defined in order for the pull out plugin to work."
          );
        }
      }
    );
  }
}
