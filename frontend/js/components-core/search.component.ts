import { DOMHelper } from '../utils/domHelper';

export default class SearchComponent {
  constructor() {
    const searchElement = document.querySelector('[data-search-trigger]') as HTMLElement;
    if (searchElement) {
      this.initSearch(searchElement);
    }

    DOMHelper.onDynamicContent(
      document.documentElement,
      '[data-search-trigger]',
      (elements: NodeListOf<HTMLElement>) => {
        elements.forEach((el) => {
          this.initSearch(el);
        });
      }
    );
  }

  private initSearch(searchElement: HTMLElement) {
    let form = searchElement.closest('form') as HTMLFormElement;
    if (searchElement.getAttribute('data-search-trigger').length > 0) {
      form = document.getElementById(searchElement.getAttribute('data-search-trigger')) as HTMLFormElement;
    }

    if (searchElement && form) {
      const input = form.querySelector('input[type=search]') as HTMLInputElement;

      let hideBlock = null;
      if (searchElement.getAttribute('data-search-hide').length > 0) {
        hideBlock = document.getElementById(searchElement.getAttribute('data-search-hide'));
      }
      const closeButton = form.querySelector('[data-search-close]') as HTMLElement;
      const animated = searchElement.hasAttribute('data-search-animated') ? true : false;

      searchElement.setAttribute('tabindex', '0');
      searchElement.setAttribute('role', 'button');
      searchElement.setAttribute('aria-expanded', 'false');
      searchElement.addEventListener('click', (e) => {
        e.preventDefault();
        if (hideBlock) {
          hideBlock.classList.add(animated ? 'search-hide' : 'hidden');
        }
        animated ? form.classList.add('search-show') : form.classList.remove('hidden');
        searchElement.setAttribute('aria-expanded', 'true');
        input.focus();
      });

      if (closeButton) {
        closeButton.addEventListener('click', (e) => {
          e.preventDefault();
          if (hideBlock) {
            hideBlock.classList.remove(animated ? 'search-hide' : 'hidden');
          }
          animated ? form.classList.remove('search-show') : form.classList.add('hidden');
          searchElement.setAttribute('aria-expanded', 'false');
          searchElement.focus();
        });
      }

      input.addEventListener('keyup', (e) => {
        if (searchElement.getAttribute('aria-expanded') == 'true' && e.key === 'Escape') {
          if (hideBlock) {
            hideBlock.classList.remove(animated ? 'search-hide' : 'hidden');
          }
          animated ? form.classList.remove('search-show') : form.classList.add('hidden');
          searchElement.setAttribute('aria-expanded', 'false');
          searchElement.focus();
        }
      });
    }
  }
}
