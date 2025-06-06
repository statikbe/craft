import { DOMHelper } from '../utils/domHelper';

export default class LoadMoreComponent {
  private xhr: XMLHttpRequest;
  private infiniteScroll = false;

  constructor() {
    document.addEventListener(
      'click',
      (e) => {
        // loop parent nodes from the target to the delegation node
        for (let target = <Element>e.target; target && !target.isSameNode(document); target = target.parentElement) {
          if (target.matches('.js-load-more')) {
            e.preventDefault();
            this.initAction(target);
            break;
          }
        }
      },
      false
    );

    if (this.infiniteScroll || document.querySelector('.js-infinite-scroll')) {
      this.initInfiniteScroll();

      DOMHelper.onDynamicContent(document.documentElement, '.js-pagination', () => {
        this.initInfiniteScroll();
      });
    }
  }

  private initInfiniteScroll() {
    Array.from(document.querySelectorAll('.js-pagination.js-infinite-scroll')).forEach((el) => {
      const observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const loadMoreButton = entry.target.querySelector('.js-load-more');
              if (loadMoreButton) {
                this.initAction(loadMoreButton);
              }
            }
          });
        },
        {
          rootMargin: '10% 0% 10% 0%',
          threshold: [0, 0.5, 1],
        }
      );
      observer.observe(el);
    });
  }

  private initAction(el: Element) {
    el.classList.add('hidden');
    const wrapper = el.getAttribute('data-load-wrapper');
    if (wrapper) {
      this.getNextPage(el.getAttribute('href'), wrapper);
      document.querySelector(`#${wrapper} .js-pagination-loader`).classList.remove('hidden');
    } else {
      this.getNextPage(el.getAttribute('href'));
      document.querySelector('.js-pagination-loader').classList.remove('hidden');
    }
  }

  private async getNextPage(url: string, wrapper: string = '') {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        console.log('Something went wrong when fetching data');
        return;
      }

      const text = await response.text();
      const responseElement = document.implementation.createHTMLDocument('');
      responseElement.body.innerHTML = text;
      const children = responseElement.querySelector(`#${wrapper} .js-pagination-container`)?.children;
      let container = document.querySelector('.js-pagination-container');

      if (wrapper !== '') {
        const pagination = responseElement.querySelector(`#${wrapper} .js-pagination`);
        if (pagination) {
          const targetPagination = document.querySelector(`#${wrapper} .js-pagination`);
          if (targetPagination) {
            targetPagination.innerHTML = pagination.innerHTML;
          }
        }
        container = document.querySelector(`#${wrapper} .js-pagination-container`);
      } else {
        const pagination = responseElement.querySelector('.js-pagination');
        if (pagination) {
          const targetPagination = document.querySelector('.js-pagination');
          if (targetPagination) {
            targetPagination.innerHTML = pagination.innerHTML;
          }
        }
      }

      if (children && container) {
        const elements = Array.from(children);
        elements.forEach((child) => {
          container.appendChild(child);
        });

        document.querySelector('.js-pagination-container')?.dispatchEvent(
          new CustomEvent('pagination.loaded', {
            detail: { elements: elements },
          })
        );
      }
    } catch (error) {
      console.log('There was a connection error');
    }
  }
}
