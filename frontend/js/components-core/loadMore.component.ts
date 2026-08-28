import { DOMHelper } from '../utils/domHelper';

export default class LoadMoreComponent {
  constructor() {
    const loadMoreWrappers = document.querySelectorAll('[data-load-more]');
    loadMoreWrappers.forEach((wrapper) => {
      new LoadMore(wrapper as HTMLElement);
    });

    DOMHelper.onDynamicContent(document.documentElement, '[data-load-more]', (wrappers) => {
      wrappers.forEach((wrapper) => {
        new LoadMore(wrapper as HTMLElement);
      });
    });
  }
}

class LoadMore {
  private wrapperElement: HTMLElement;
  private pagination: HTMLElement;
  private loader: HTMLElement;
  private trigger: HTMLElement;
  private infiniteScroll = false;

  constructor(private element: HTMLElement) {
    this.wrapperElement = element;
    this.pagination = document.getElementById(this.element.getAttribute('data-load-more-pagination'));
    this.loader = document.getElementById(this.element.getAttribute('data-load-more-loader'));
    this.trigger = document.getElementById(this.element.getAttribute('data-load-more-trigger'));
    this.infiniteScroll = this.element.getAttribute('data-load-more-infinite-scroll') === 'true' ? true : false;

    if (this.wrapperElement && this.pagination && this.loader && this.trigger) {
      this.trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadMore();
      });
    } else {
      console.error('One or more elements are missing in order for the LoadMore component to work');
    }

    if (this.infiniteScroll) {
      this.initInfiniteScroll();
    }
  }

  private initInfiniteScroll() {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const loading = this.loadMore();
            if (loading) {
              observer.unobserve(entry.target);
            }
            loading.finally(() => {
              observer.observe(entry.target);
            });
          }
        });
      },
      {
        rootMargin: '10% 0% 10% 0%',
        threshold: [0, 0.5, 1],
      }
    );
    observer.observe(this.pagination);
  }

  private async loadMore() {
    const url = this.trigger.getAttribute('href');
    this.loader.classList.remove('hidden');
    this.trigger.classList.add('hidden');
    try {
      const response = await fetch(url, { method: 'GET' });

      if (!response.ok) {
        console.log('Something went wrong when fetching data');
        return;
      }

      const responseText = await response.text();
      const parser = new DOMParser();
      const responseElement = parser.parseFromString(responseText, 'text/html');
      const children = responseElement.querySelector(
        `[data-load-more="${this.wrapperElement.getAttribute('data-load-more')}"]`
      )?.children;
      Array.from(children).forEach((child) => {
        this.wrapperElement.appendChild(child);
      });

      const nextPageTrigger = responseElement.getElementById(this.trigger.id);
      if (nextPageTrigger) {
        const nextPageLink = (nextPageTrigger as HTMLAnchorElement).href;
        this.trigger.setAttribute('href', nextPageLink);
      } else {
        this.pagination.parentElement?.removeChild(this.pagination);
        this.wrapperElement.dispatchEvent(new CustomEvent('loadmore.finished'));
      }

      this.wrapperElement.dispatchEvent(
        new CustomEvent('loadmore.loaded', { detail: { elements: Array.from(children) } })
      );
      this.loader.classList.add('hidden');
      this.trigger.classList.remove('hidden');
    } catch (error) {
      console.log('There was a connection error', error);
      this.loader.classList.add('hidden');
      this.trigger.classList.remove('hidden');
    }
  }
}
