export default class AjaxPagingComponent {
  /**
   * Initializes AjaxPagingComponent by finding all elements with the [data-ajax-paging] attribute
   * and creating an AjaxPaging instance for each. This enables AJAX-based pagination functionality.
   */
  constructor() {
    const pagings = document.querySelectorAll('[data-ajax-paging]');
    Array.from(pagings).forEach((paging: HTMLElement) => {
      new AjaxPaging(paging);
    });
  }
}

class AjaxPaging {
  private paging: HTMLElement;
  private pagingId: string | null;
  private loaderBlock: HTMLElement | null;
  private contentBlock: HTMLElement | null;
  private linksBlock: HTMLElement | null;

  constructor(paging: HTMLElement) {
    this.paging = paging;
    this.init();
  }

  private init() {
    this.pagingId = this.paging.getAttribute('id');
    this.loaderBlock = this.paging.querySelector('[data-ajax-paging-loader]');
    this.contentBlock = this.paging.querySelector('[data-ajax-paging-content]');
    this.linksBlock = this.paging.querySelector('[data-ajax-paging-links]');

    if (this.pagingId === null) {
      throw new Error(`AjaxPaging: The paging element must have an id. Element: ${this.paging.outerHTML}`);
    }
    if (!this.contentBlock) {
      throw new Error('AjaxPaging: The paging element must need an element with attribute data-ajax-paging-content');
    }
    if (!this.linksBlock) {
      throw new Error('AjaxPaging: The paging element must need an element with attribute data-ajax-paging-links');
    }

    this.linksBlock.addEventListener(
      'click',
      async (e) => {
        const clickedElement = e.target as Element;
        if (
          clickedElement instanceof HTMLAnchorElement &&
          clickedElement.closest(`#${this.pagingId} [data-ajax-paging-links]`)
        ) {
          e.preventDefault();
          const href = clickedElement.href;
          if (href !== 'javascript:void(0);') {
            this.showLoading();
            try {
              await this.getFilterData(href);
            } catch (error) {
              console.error('Error fetching filter data:', error);
              this.hideLoading();
            }
          }
        }
      },
      false
    );
  }

  private showLoading() {
    if (this.contentBlock) {
      this.contentBlock.innerHTML = '';
    }
    if (this.linksBlock) {
      this.linksBlock.textContent = '';
    }

    if (this.loaderBlock) {
      this.loaderBlock.classList.remove('hidden');
    }
  }

  private hideLoading() {
    if (this.loaderBlock) {
      this.loaderBlock.classList.add('hidden');
    }
  }

  private async getFilterData(url: string) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Something went wrong when fetching data. Status: ${response.status} ${response.statusText}`);
        return;
      }

      const responseText = await response.text();
      const parser = new DOMParser();
      const responseElement = parser.parseFromString(responseText, 'text/html');
      const resultsBlock = responseElement.getElementById(this.pagingId);

      if (resultsBlock) {
        const contentElement = resultsBlock.querySelector('[data-ajax-paging-content]');
        const linksElement = resultsBlock.querySelector('[data-ajax-paging-links]');
        if (contentElement && linksElement) {
          if (this.contentBlock && this.linksBlock) {
            this.contentBlock.innerHTML = contentElement.innerHTML;
            this.linksBlock.innerHTML = linksElement.innerHTML;
            this.hideLoading();
          } else {
            console.error('Content or links block is not initialized.');
          }
        } else {
          console.error('Required elements are missing in the returned data.');
        }
      } else {
        console.error('Could not find data on returned page.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`There was a connection error: ${errorMessage}`, error);
    }
  }
}
