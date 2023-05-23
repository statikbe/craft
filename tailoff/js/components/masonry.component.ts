export class MasonryComponent {
  constructor() {
    if ('CSS' in window && CSS.supports('display', 'grid')) {
      this.initGridMasonry();
    }
  }

  private initGridMasonry() {
    window.addEventListener('load', this.resizeAllMasonryItems.bind(this));
    let timeoutDelay = null;
    window.addEventListener('resize', () => {
      clearTimeout(timeoutDelay);
      timeoutDelay = setTimeout(() => {
        this.resizeAllMasonryItems();
      }, 250);
    });
  }

  private resizeAllMasonryItems() {
    const allItems = document.querySelectorAll('.js-masonry-item');
    Array.from(allItems).forEach((item) => {
      this.resizeMasonryItem(item as HTMLElement);
    });
  }

  private resizeMasonryItem(element: HTMLElement) {
    /* Get the grid object, its row-gap, and the size of its implicit rows */
    var grid = element.closest('.js-masonry');
    if (grid) {
      const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap')),
        rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows')),
        gridContent = element.querySelector('.js-masonry-content') as HTMLImageElement;

      if (gridContent) {
        gridContent.style.height = 'auto';
      }

      const rowSpan = Math.ceil(
        (element.querySelector('.js-masonry-content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap)
      );

      element.style.gridRowEnd = 'span ' + rowSpan;
      if (gridContent) {
        gridContent.style.height = element.getBoundingClientRect().height + 'px';
      }
    }
  }
}
