import { FormPrototypes } from '../utils/prototypes/form.prototypes';
import { ScrollHelper } from '../utils/scroll';
import { DOMHelper } from '../utils/domHelper';
import { ElementPrototype } from '../utils/prototypes/element.prototypes';

FormPrototypes.activateSerialize();
ElementPrototype.activateNearest();

export default class FilterComponent {
  private options = {
    scrollToTopOfResults: true,
    disableScrollOnMobile: true,
  };

  private formElement: HTMLFormElement; // .js-filter-form
  private submitButtonElement: HTMLButtonElement; // <button type="submit"></button>
  private filterChangeElements: Array<HTMLElement>; // input and select
  private loaderAnimationElement: HTMLElement; // .js-filter-loader
  private ariaLiveElement: HTMLElement; // .js-filter-aria-live
  private resultsElement: HTMLElement; // .js-filter-results
  private extraInfoElement: HTMLElement; // .js-filter-extra-info
  private filterMobileToggleButtonElement: HTMLElement; // .js-filter-mobile-toggle
  private filterMobileCollapseElement: HTMLElement; // .js-filter-mobile-collapse
  private clearFilterButtonElement: HTMLElement; // .js-filter-clear
  private scrollToElement: HTMLElement; // .js-filter-scroll-position
  private showMoreOptionElements: Array<HTMLElement>; // .js-filter-show-more
  private paginationElement: HTMLElement; // .js-filter-pagination
  private getFilterTimeout: NodeJS.Timeout;

  private xhr: XMLHttpRequest;
  private screenWidth;
  private mobileBreakpoint = 819;
  private scrollSpeed = 500;

  private jsChange;

  constructor(options: Object = {}) {
    this.options = { ...this.options, ...options };

    this.jsChange = document.createEvent('HTMLEvents');
    this.jsChange.initEvent('jschange', false, true);

    this.formElement = document.querySelector('.js-filter-form');

    if (this.formElement) {
      this.formElement.addEventListener('submit', (e) => {
        e.preventDefault();
        this.getFormAction();
      });

      this.resultsElement = document.querySelector('.js-filter-results');
      this.extraInfoElement = document.querySelector('.js-filter-extra-info');

      if (!this.resultsElement) {
        console.log(
          "You must have an element with class 'js-filter-results' defined in order for the filter plugin to work."
        );
        return;
      }

      this.ariaLiveElement = document.querySelector('.js-filter-aria-live');
      if (!this.ariaLiveElement) {
        console.log(
          "You must have an element with class 'js-filter-aria-live' defined in order for the filter plugin to work."
        );
        return;
      }

      this.submitButtonElement = this.formElement.querySelector('button[type=submit]');

      if (this.submitButtonElement) {
        this.initSubmitButton();
      }

      this.filterChangeElements = Array.from(
        this.formElement.querySelectorAll('input:not(.no-hook), select:not(.no-hook)')
      );
      this.initFilterChangeElements(this.filterChangeElements);

      this.showMoreOptionElements = Array.from(this.formElement.querySelectorAll('.js-filter-show-more'));
      if (this.showMoreOptionElements.length > 0) {
        this.initShowMore();
      }

      DOMHelper.onDynamicContent(
        document.documentElement,
        '.js-filter-form input:not(.no-hook), .js-filter-form select:not(.no-hook)',
        (inputs) => {
          this.initFilterChangeElements(Array.from(inputs));
        }
      );

      DOMHelper.onDynamicContent(document.documentElement, '.js-filter-clear', (inputs) => {
        this.clearFilterButtonElement = inputs[0];
        this.initClearFilter();
      });
    } else {
      return;
    }

    this.loaderAnimationElement = document.querySelector('.js-filter-loader');
    if (this.loaderAnimationElement) {
      this.initLoader();
    }

    this.filterMobileToggleButtonElement = document.querySelector('.js-filter-mobile-toggle');
    if (this.filterMobileToggleButtonElement) {
      this.filterMobileCollapseElement = document.querySelector('.js-filter-mobile-collapse');
      if (this.filterMobileCollapseElement) {
        this.initFilterToggle();
      }
    }

    this.clearFilterButtonElement = document.querySelector('.js-filter-clear');
    if (this.clearFilterButtonElement) {
      this.initClearFilter();
    }

    this.initReloadedClicks();

    this.scrollToElement = document.querySelector('.js-filter-scroll-position');
  }

  private initSubmitButton() {
    this.submitButtonElement.addEventListener('click', (event) => {
      event.preventDefault();
      this.getFormAction();
    });
  }

  private initFilterChangeElements(elements) {
    elements.forEach((el) => {
      el.addEventListener('change', () => {
        this.getFormAction();
      });
      el.addEventListener('jschange', (e) => {
        this.getFormAction();
      });
    });
  }

  private initLoader() {
    if (!this.loaderAnimationElement.classList.contains('hidden')) {
      this.loaderAnimationElement.classList.add('hidden');
    }
  }
  private initFilterToggle() {
    this.filterMobileToggleButtonElement.setAttribute('role', 'button');
    this.filterMobileToggleButtonElement.classList.add('open');
    this.filterMobileToggleButtonElement.setAttribute('aria-expanded', 'true');
    this.filterMobileToggleButtonElement.setAttribute('aria-controls', 'filterMobileCollapseArea');

    this.filterMobileCollapseElement.setAttribute('id', 'filterMobileCollapseArea');
    this.filterMobileCollapseElement.setAttribute('role', 'region');

    window.addEventListener('resize', this.checkMobileCollapse.bind(this));
    this.checkMobileCollapse();

    this.filterMobileToggleButtonElement.addEventListener('click', (e) => {
      e.preventDefault();
      this.openFilterMobileToggle(this.filterMobileCollapseElement.classList.contains('hidden'));
    });
  }

  private checkMobileCollapse() {
    if (window.innerWidth !== this.screenWidth || !this.screenWidth) {
      this.screenWidth = window.innerWidth;
      this.openFilterMobileToggle(this.screenWidth > this.mobileBreakpoint);
    }
  }

  private openFilterMobileToggle(open: boolean) {
    if (open) {
      this.filterMobileCollapseElement.classList.remove('hidden');
      this.filterMobileToggleButtonElement.classList.add('open');
      this.filterMobileToggleButtonElement.setAttribute('aria-expanded', 'true');

      const resizeEvent = document.createEvent('HTMLEvents');
      resizeEvent.initEvent('resize', false, true);
      window.dispatchEvent(resizeEvent);
    } else {
      this.filterMobileCollapseElement.classList.add('hidden');
      this.filterMobileToggleButtonElement.classList.remove('open');
      this.filterMobileToggleButtonElement.setAttribute('aria-expanded', 'false');
    }
  }

  private initClearFilter() {
    this.clearFilterButtonElement.setAttribute('role', 'button');
    this.clearFilterButtonElement.addEventListener('click', (e) => {
      e.preventDefault();

      this.clearForm();
      this.showLoading();
      this.getFilterData(window.location.origin + window.location.pathname, true);
    });
    this.checkClearButtonStatus();
  }

  private checkClearButtonStatus() {
    const formData = new FormData(this.formElement);
    let isEmpty = true;
    formData.forEach((value, key) => {
      if (value !== '' && value !== undefined) {
        isEmpty = false;
      }
    });

    if (this.clearFilterButtonElement) {
      if (isEmpty) {
        if (!this.clearFilterButtonElement.hasAttribute('data-s-always-show')) {
          this.clearFilterButtonElement.classList.add('hidden');
        }
      } else {
        this.clearFilterButtonElement.classList.remove('hidden');
      }
    }
  }

  private initShowMore() {
    this.showMoreOptionElements.forEach((el) => {
      el.querySelector('button').addEventListener('click', (e) => {
        e.preventDefault();
        Array.from(el.parentElement.querySelectorAll('.js-filter-extra-content')).forEach((extra, index) => {
          extra.classList.remove('hidden');
          if (index == 0) {
            extra.querySelector('input').focus();
          }
        });
        el.parentNode.removeChild(el);
      });
    });
  }

  private initReloadedClicks() {
    document.addEventListener(
      'click',
      (e) => {
        // loop parent nodes from the target to the delegation node
        for (let target = <Element>e.target; target && !target.isSameNode(document); target = target.parentElement) {
          if (target.matches('.js-filter-pagination a')) {
            e.preventDefault();
            const href = (target as HTMLAnchorElement).href;
            if (href != 'javascript:void(0);') {
              this.showLoading();
              this.getFilterData((target as HTMLAnchorElement).href);
            }
            break;
          }
          if (target.matches('.js-clear-filter-element')) {
            e.preventDefault();
            const data = JSON.parse(target.getAttribute('data-filter-elements'));
            this.clearElements(data);
            break;
          }
        }
      },
      false
    );

    window.addEventListener('popstate', (event) => {
      this.showLoading();
      this.getFilterData(window.location.href, false, false);
    });
  }

  private getFilterData(url, clearPage = false, pushState = true) {
    if (this.getFilterTimeout) {
      clearTimeout(this.getFilterTimeout);
    }

    this.getFilterTimeout = setTimeout(() => {
      const _self = this;
      if (this.xhr) {
        this.xhr.abort();
      }

      // Scroll to the scrollToElement or loader. To prevent a weird footer show on windows.
      this.scrollToStart();

      // Go back to page 1 when set changes
      if (clearPage) {
        const regexResult = window.location.pathname.match(/([^\?\s]+\/)([p][0-9]{1,3}.?)(.*)/);

        if (regexResult && regexResult[1]) {
          url = regexResult[1] + '?' + this.formElement.serialize();
        }
      }

      this.xhr = new XMLHttpRequest();
      this.xhr.open('GET', url, true);

      this.xhr.onload = function () {
        if (this.status >= 200 && this.status < 400) {
          const responseElement = document.implementation.createHTMLDocument('');
          responseElement.body.innerHTML = this.response;
          const resultsBlock = responseElement.querySelector('.js-filter-results');
          if (resultsBlock) {
            _self.resultsElement.innerHTML = resultsBlock.innerHTML;

            const scripts = _self.resultsElement.querySelectorAll('script');
            if (scripts.length > 0) {
              Array.from(scripts).forEach((script) => {
                eval(script.innerHTML);
              });
            }

            _self.ariaLiveElement.innerHTML = responseElement.querySelector('.js-filter-aria-live').innerHTML;

            if (pushState) {
              history.pushState('', 'New URL: ' + url, url);
            }

            _self.scrollToStart();

            _self.hideLoading();
            _self.styleClear();
          } else {
            console.error('Could not find data on returned page.');
          }
          const extraInfoBlock = responseElement.querySelector('.js-filter-extra-info');
          if (extraInfoBlock) {
            _self.extraInfoElement.innerHTML = extraInfoBlock.innerHTML;
          }

          _self.checkClearButtonStatus();
        } else {
          console.error('Something went wrong when fetching data.');
        }
      };

      this.xhr.onerror = function () {
        console.error('There was a connection error.');
      };

      this.xhr.send();
    }, 100);
  }

  private scrollToStart() {
    if (this.options.scrollToTopOfResults) {
      if (this.scrollToElement) {
        if (window.innerWidth < this.mobileBreakpoint) {
          if (!this.options.disableScrollOnMobile) {
            ScrollHelper.scrollToY(this.scrollToElement, this.scrollSpeed);
          }
        } else {
          ScrollHelper.scrollToY(this.scrollToElement, this.scrollSpeed);
        }
      } else {
        if (this.loaderAnimationElement) {
          if (window.innerWidth < this.mobileBreakpoint) {
            if (!this.options.disableScrollOnMobile) {
              ScrollHelper.scrollToY(this.loaderAnimationElement, this.scrollSpeed);
            }
          } else {
            ScrollHelper.scrollToY(this.loaderAnimationElement, this.scrollSpeed);
          }
        }
      }
    }
  }

  private getFormAction() {
    this.showLoading();
    let url = this.formElement.getAttribute('action') + '?' + this.formElement.serialize();
    if (this.formElement.getAttribute('action') === '') {
      url = window.location.origin + window.location.pathname + '?' + this.formElement.serialize();
    }
    this.getFilterData(url, true);
  }

  private showLoading() {
    if (this.loaderAnimationElement) {
      this.loaderAnimationElement.classList.remove('hidden');
      // this.loaderAnimationElement.focus(); //This fucks up the scroll to for some reason.
      this.resultsElement.classList.add('hidden');
    }
  }

  private hideLoading() {
    if (this.loaderAnimationElement) {
      this.loaderAnimationElement.classList.add('hidden');
      this.resultsElement.classList.remove('hidden');
      this.ariaLiveElement.focus();
    }
  }

  private clearElements(elements: Array<{ name: string; value: string }>) {
    elements.forEach((element) => {
      if (element.value) {
        const el = this.formElement.querySelector(
          `input[name='${element.name}'][value='${element.value}']`
        ) as HTMLInputElement;
        if (el) {
          el.checked = false;
          this.clearElement(el);
        } else {
          const el = this.formElement.querySelector(`select[name='${element.name}']`) as HTMLSelectElement;
          if (el) {
            if (el.type == 'select-multiple') {
              Array.from(el.selectedOptions).forEach((option) => {
                if (option.value == element.value) {
                  option.selected = false;
                }
              });
            } else {
              el.value = '';
            }
            this.clearElement(el);
          }
        }
      } else {
        const el =
          (this.formElement.querySelector(`input[name='${element.name}']`) as HTMLInputElement) ??
          (this.formElement.querySelector(`select[name='${element.name}']`) as HTMLSelectElement);
        el.value = '';
        this.clearElement(el);
      }
    });
    this.getFormAction();

    const filterElementsCleared = document.createEvent('HTMLEvents');
    filterElementsCleared.initEvent('filterElementsCleared', false, true);
    document.dispatchEvent(filterElementsCleared);
    this.checkClearButtonStatus();
  }

  private clearElement(el: HTMLElement) {
    el.dispatchEvent(this.jsChange);
    const chipButton = el.nearest('button[aria-haspopup]');
    if (chipButton) {
      chipButton.dispatchEvent(this.jsChange);
    }
  }

  private styleClear() {
    if (
      this.clearFilterButtonElement &&
      this.clearFilterButtonElement.getAttribute('data-active-class') &&
      this.clearFilterButtonElement.getAttribute('data-inactive-class')
    ) {
      let active = true;
      const elements = Array.from(this.formElement.elements);
      elements.forEach((el) => {
        if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
          const type = el.getAttribute('type').toLowerCase();

          switch (type) {
            case 'text':
            case 'password':
            case 'textarea':
            case 'hidden':
              if (el.getAttribute('value') !== '') {
                active = false;
              }
              break;

            case 'radio':
            case 'checkbox':
              if ((el as HTMLInputElement).checked) {
                active = false;
              }
              break;

            case 'select-one':
            case 'select-multi':
              if (el.getAttribute('selectedIndex') !== '-1') {
                active = false;
              }
              break;
          }
        }
      });

      if (active) {
        this.clearFilterButtonElement.classList.remove(
          this.clearFilterButtonElement.getAttribute('data-inactive-class')
        );
        this.clearFilterButtonElement.classList.add(this.clearFilterButtonElement.getAttribute('data-active-class'));
      } else {
        this.clearFilterButtonElement.classList.remove(this.clearFilterButtonElement.getAttribute('data-active-class'));
        this.clearFilterButtonElement.classList.add(this.clearFilterButtonElement.getAttribute('data-inactive-class'));
      }
    }
  }

  private clearForm() {
    this.formElement.reset();
    const elements = Array.from(this.formElement.elements);

    elements.forEach((el) => {
      if (el.tagName === 'INPUT') {
        const type = el.getAttribute('type').toLowerCase();

        switch (type) {
          case 'text':
          case 'password':
          case 'textarea':
          case 'hidden':
            el.setAttribute('value', '');
            break;

          case 'radio':
          case 'checkbox':
            if ((el as HTMLInputElement).checked) {
              (el as HTMLInputElement).checked = false;
            }
            break;

          case 'select-one':
          case 'select-multi':
            el.setAttribute('selectedIndex', '-1');
            el.setAttribute('value', '');
            el.dispatchEvent(this.jsChange);
            break;

          default:
            break;
        }
      }
      if (el.tagName === 'SELECT') {
        el.setAttribute('selectedIndex', '-1');
        (el as HTMLSelectElement).value = '';
        el.dispatchEvent(this.jsChange);
      }
      if (el.tagName === 'BUTTON' && el.hasAttribute('aria-haspopup')) {
        el.dispatchEvent(this.jsChange);
      }
      this.clearElement(el as HTMLElement);
    });

    const filterFormCleared = document.createEvent('HTMLEvents');
    filterFormCleared.initEvent('filterFormCleared', false, true);
    document.dispatchEvent(filterFormCleared);

    this.styleClear();
    this.checkClearButtonStatus();
  }
}
