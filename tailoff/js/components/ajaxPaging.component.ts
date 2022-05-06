export class AjaxPagingComponent {
  constructor() {
    const pagings = document.querySelectorAll('.js-ajax-paging');
    Array.from(pagings).forEach((paging) => {
      const pagination = new AjaxPaging(paging);
    });
  }
}

class AjaxPaging {
  private paging: HTMLElement;
  private pagingId = '';
  private loaderBlock: HTMLElement;
  private contentBlock: HTMLElement;
  private linksBlock: HTMLElement;
  private xhr: XMLHttpRequest;
  private scrollToTop = false;

  constructor(paging) {
    this.paging = paging;
    this.init();
  }

  private init() {
    this.pagingId = this.paging.getAttribute('id');
    this.loaderBlock = this.paging.querySelector('.js-ajax-paging-loader');
    this.contentBlock = this.paging.querySelector('.js-ajax-paging-content');
    this.linksBlock = this.paging.querySelector('.js-ajax-paging-links');

    if (this.pagingId === null) {
      throw new Error('AjaxPaging: The paging element must have an id');
    }
    if (!this.contentBlock) {
      throw new Error('AjaxPaging: The paging element must need an element with class js-ajax-paging-content');
    }
    if (!this.linksBlock) {
      throw new Error('AjaxPaging: The paging element must need an element with class js-ajax-paging-links');
    }

    document.addEventListener(
      'click',
      (e) => {
        // loop parent nodes from the target to the delegation node
        for (let target = <Element>e.target; target && !target.isSameNode(document); target = target.parentElement) {
          if (target.matches(`#${this.pagingId} .js-ajax-paging-links a`)) {
            e.preventDefault();
            const href = (target as HTMLAnchorElement).href;
            if (href != 'javascript:void(0);') {
              this.showLoading();
              this.getFilterData((target as HTMLAnchorElement).href);
            }
            break;
          }
        }
      },
      false
    );
  }

  private showLoading() {
    this.contentBlock.innerHTML = '';
    this.linksBlock.innerHTML = '';
    if (this.loaderBlock) {
      this.loaderBlock.classList.remove('hidden');
    }
  }

  private hideLoading() {
    if (this.loaderBlock) {
      this.loaderBlock.classList.add('hidden');
    }
  }

  private getFilterData(url) {
    const _self = this;
    if (this.xhr) {
      this.xhr.abort();
    }

    this.xhr = new XMLHttpRequest();
    this.xhr.open('GET', url, true);

    this.xhr.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        const responseElement = document.implementation.createHTMLDocument('');
        responseElement.body.innerHTML = this.response;
        const resultsBlock = responseElement.getElementById(_self.pagingId);
        if (resultsBlock) {
          _self.contentBlock.innerHTML = resultsBlock.querySelector('.js-ajax-paging-content').innerHTML;
          _self.linksBlock.innerHTML = resultsBlock.querySelector('.js-ajax-paging-links').innerHTML;
          _self.hideLoading();
        } else {
          console.error('Could not find data on returned page.');
        }
      } else {
        console.error('Something went wrong when fetching data.');
      }
    };

    this.xhr.onerror = function () {
      console.error('There was a connection error.');
    };

    this.xhr.send();
  }
}
