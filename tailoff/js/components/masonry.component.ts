import { ElementPrototype } from "../utils/prototypes/element.prototypes";
import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";

ElementPrototype.activateClosest();
ArrayPrototypes.activateFrom();

export class MasonryComponent {
  constructor() {
    if ("CSS" in window && CSS.supports("display", "grid")) {
      this.initGridMasonry();
    } else {
      /**
       * Remove the code below when we decide not to support sucky browsers like IE11
       * And also remove all the related functions
       */
      this.initFlexMasonry();
    }
  }

  private initGridMasonry() {
    window.addEventListener("load", this.resizeAllMasonryItems.bind(this));
    let timeoutDelay = null;
    window.addEventListener("resize", () => {
      clearTimeout(timeoutDelay);
      timeoutDelay = setTimeout(() => {
        this.resizeAllMasonryItems();
      }, 250);
    });
  }

  private resizeAllMasonryItems() {
    const allItems = document.querySelectorAll(".js-masonry-item");
    Array.from(allItems).forEach(item => {
      this.resizeMasonryItem(item as HTMLElement);
    });
  }

  private resizeMasonryItem(element: HTMLElement) {
    /* Get the grid object, its row-gap, and the size of its implicit rows */
    var grid = element.closest(".js-masonry");
    if (grid) {
      const rowGap = parseInt(
          window.getComputedStyle(grid).getPropertyValue("grid-row-gap")
        ),
        rowHeight = parseInt(
          window.getComputedStyle(grid).getPropertyValue("grid-auto-rows")
        ),
        gridContent = element.querySelector(
          ".js-masonry-content"
        ) as HTMLImageElement;

      if (gridContent) {
        gridContent.style.height = "auto";
      }

      const rowSpan = Math.ceil(
        (element.querySelector(".js-masonry-content").getBoundingClientRect()
          .height +
          rowGap) /
          (rowHeight + rowGap)
      );

      element.style.gridRowEnd = "span " + rowSpan;
      if (gridContent) {
        gridContent.style.height =
          element.getBoundingClientRect().height + "px";
      }
    }
  }

  private initFlexMasonry() {
    window.addEventListener("load", this.rerenderFlexMasonry.bind(this));
    let timeoutDelay = null;
    window.addEventListener("resize", () => {
      clearTimeout(timeoutDelay);
      timeoutDelay = setTimeout(() => {
        this.rerenderFlexMasonry();
      }, 250);
    });
  }

  private rerenderFlexMasonry() {
    Array.from(document.querySelectorAll(".js-masonry")).forEach(
      (masonry: HTMLElement) => {
        masonry.style.height = null;
        const items = Array.from(masonry.querySelectorAll(".js-masonry-item"));
        items.forEach((item: HTMLElement) => {
          item.style.height = null;
          item.style.flexBasis = null;
        });

        const NrOfColumns = Math.round(
          masonry.offsetWidth / items[0].clientWidth
        );
        const columns = Array.from(new Array(NrOfColumns)).map(() => {
          return {
            items: new Array(),
            outerHeight: 0
          };
        });

        items.forEach((item: HTMLElement) => {
          const style = getComputedStyle(item);
          item.style.height = `${parseInt(style.paddingTop) +
            (item.querySelector(".js-masonry-content") as HTMLElement)
              .offsetHeight +
            parseInt(style.paddingBottom)}px`;

          const minOuterHeight = Math.min(...columns.map(c => c.outerHeight));
          const column = columns.find(c => c.outerHeight == minOuterHeight);
          column.items.push(item);
          column.outerHeight +=
            parseInt(item.style.height) +
            parseInt(style.paddingTop) +
            parseInt(style.paddingBottom);
        });

        const masonryHeight = Math.max(...columns.map(c => c.outerHeight));

        let order = 0;
        columns.forEach(col => {
          col.items.forEach((item: HTMLElement) => {
            item.style.order = `${order++}`;
          });
          // set flex-basis of the last cell to fill the
          // leftover space at the bottom of the column
          // to prevent the first cell of the next column
          // to be rendered at the bottom of this column
          col.items[col.items.length - 1].style.flexBasis =
            col.items[col.items.length - 1].offsetHeight +
            masonryHeight -
            col.outerHeight -
            1 +
            "px";
        });

        masonry.style.height = masonryHeight + 1 + "px";
      }
    );
  }
}
