import { DOMHelper } from '../utils/domHelper';

export class LoadMoreComponent {
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

  private getNextPage(url, wrapper: string = '') {
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
        const children = responseElement.querySelector(`#${wrapper} .js-pagination-container`).children;
        let container = document.querySelector('.js-pagination-container');

        if (wrapper !== '') {
          document.querySelector(`#${wrapper} .js-pagination`).innerHTML = responseElement.querySelector(
            `#${wrapper} .js-pagination`
          ).innerHTML;

          container = document.querySelector(`#${wrapper} .js-pagination-container`);
        } else {
          document.querySelector('.js-pagination').innerHTML =
            responseElement.querySelector('.js-pagination').innerHTML;
        }

        const elements = Array.from(children);

        Array.from(children).forEach((child) => {
          container.appendChild(child);
        });

        document.querySelector('.js-pagination-container').dispatchEvent(
          new CustomEvent('pagination.loaded', {
            detail: { elements: elements },
          })
        );

        // history.pushState("", "New URL: " + url, url);
      } else {
        console.log('Something went wrong when fetching data');
      }
    };

    this.xhr.onerror = function () {
      console.log('There was a connection error');
    };

    this.xhr.send();
  }
}
