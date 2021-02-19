import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
import { DOMHelper } from "../utils/domHelper";

ArrayPrototypes.activateFrom();

export class PullOutComponent {
  constructor() {
    if (document.querySelectorAll(".js-pull-out").length > 0) {
      this.pullOutBlocks();
      window.addEventListener("resize", this.pullOutBlocks);
    }

    DOMHelper.onDynamicContent(
      document.documentElement,
      ".js-pull-out",
      (pullOuts) => {
        this.pullOutBlocks();
      }
    );
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

          const noContent = block.getAttribute("data-no-content")
            ? block.getAttribute("data-no-content") == "true"
            : false;

          const rect = block.parentElement.getBoundingClientRect();
          const offset = {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft,
          };

          const paddingLeft = parseInt(
            window
              .getComputedStyle(block.parentElement, null)
              .getPropertyValue("padding-left")
          );
          const paddingRight = parseInt(
            window
              .getComputedStyle(block.parentElement, null)
              .getPropertyValue("padding-right")
          );

          if (window.innerWidth > breakpoint) {
            switch (direction) {
              case "both":
              case "left":
                block.style.marginLeft = `-${
                  Math.min(offset.left, max) + paddingLeft
                }px`;
                if (noContent) {
                  block.style.width = `${
                    Math.min(offset.left, max) + rect.width
                  }px`;
                }
                if (direction != "both") break;
              case "both":
              case "right":
                const rightOffset =
                  window.innerWidth -
                  (offset.left + block.parentElement.clientWidth);
                block.style.marginRight = `-${
                  Math.min(rightOffset, max) + paddingRight
                }px`;
                if (noContent) {
                  block.style.width = `${
                    Math.min(rightOffset, max) + rect.width
                  }px`;
                }
                if (direction != "both") break;
              case "both":
                if (noContent) {
                  block.style.width = `${
                    Math.min(rightOffset, max) * 2 + rect.width
                  }px`;
                }
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
            if (noContent) {
              block.style.width = `${rect.width}px`;
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
