export class BreadCrumbComponent {
  private breadcrumb: HTMLElement | null;
  private screenWidth: number;
  private breadcrumbItems: Element[];
  private currentBreadCrumb: Element;
  private parentBreadCrumb: Element;
  private middleBreadcrumbItems: Element[];
  private mergedBreadcrumbs: string;
  private breadCrumbWrapper: Element;

  constructor() {
    // Check if the breadcrumb component exists
    this.breadcrumb = document.querySelector('[data-breadcrumb]');

    if (this.breadcrumb) {
      this.initBreadcrumb();
    }
  }

  private initBreadcrumb() {
    this.screenWidth = window.innerWidth;
    this.breadCrumbWrapper = document.querySelector('[data-breadcrumb-wrapper]');
    this.breadcrumbItems = Array.from(this.breadcrumb.querySelectorAll('li'));
    this.currentBreadCrumb = this.breadcrumb.querySelector('li:last-child');
    this.parentBreadCrumb = this.breadcrumb.querySelector('li:nth-last-child(2)');
    this.middleBreadcrumbItems = this.breadcrumbItems.slice(1, -1);

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      const dropdown = this.breadcrumb.querySelector('.breadcrumb__dropdown');

      if (width <= 349) {
        // On mobile remove all breadcrumb items except the parent breadcrumb
        this.breadcrumbItems.forEach((item, index) => {
          if (index !== this.breadcrumbItems.length - 2) {
            item.classList.add('hidden');
          } else {
            item.classList.remove('hidden');
            item.classList.add('breadcrumb__return-btn');
          }
        });

        if (dropdown) {
          dropdown.classList.add('hidden');
        }
      } else if (width > 350 && width < 980) {
        if (dropdown) {
          dropdown.classList.remove('hidden');
        }

        this.breadcrumbItems.forEach((item) => {
          item.classList.remove('hidden');
          item.classList.remove('breadcrumb__return-btn');
        });

        if (this.middleBreadcrumbItems.length >= 2) {
          const anchors = this.middleBreadcrumbItems.map((item) => item.querySelector('a'));
          this.middleBreadcrumbItems.forEach((item) => item.classList.add('hidden'));
          const mergedBreadcrumbs = `
                <li class="breadcrumb__dropdown js-dropdown">
                    <button type="button" class="js-dropdown-toggle">...</button>
                    <ul class="js-dropdown-menu">
                        ${anchors
                          .map(
                            (anchor) => `
                            <li>
                                <a href="${anchor.href}">${anchor.textContent}</a>
                            </li>`
                          )
                          .join('')}
                    </ul>
                </li>
              `;

          if (!this.mergedBreadcrumbs) {
            this.currentBreadCrumb.insertAdjacentHTML('beforebegin', mergedBreadcrumbs);
            this.mergedBreadcrumbs = mergedBreadcrumbs;
          }
        }
      }
    });

    observer.observe(this.breadCrumbWrapper);
  }
}

// 1. Show only parent breadcrumb on mobile view
// 2. Hide the middle breadcrumb items on large screens
