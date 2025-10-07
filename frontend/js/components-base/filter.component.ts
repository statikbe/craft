import { FormPrototypes } from '../utils/prototypes/form.prototypes';
import { ScrollHelper } from '../utils/scroll';
import { DOMHelper } from '../utils/domHelper';
import { ElementPrototype } from '../utils/prototypes/element.prototypes';

FormPrototypes.activateSerialize();
ElementPrototype.activateNearest();

export default class FilterComponent {
  constructor(options: Object = {}) {
    const forms = document.querySelectorAll('form[data-filter]');
    if (forms.length === 0) {
      console.warn(
        'No forms found with data-filter attribute. Please add data-filter="filterResults" to your form element.'
      );
      return;
    }

    forms.forEach((form) => {
      new FilterForm(form as HTMLFormElement);
    });

    DOMHelper.onDynamicContent(document.documentElement, 'form[data-filter]', (forms) => {
      forms.forEach((form) => {
        if (form instanceof HTMLFormElement) {
          new FilterForm(form);
        }
      });
    });
  }
}

class FilterForm {
  private formElement: HTMLFormElement;
  private submitButtonElement: HTMLButtonElement;
  private filterChangeElements: Array<HTMLElement>;
  private loaderAnimationElement: HTMLElement;
  private ariaLiveElement: HTMLElement;
  private resultsElement: HTMLElement;
  private extraInfoElements: Array<HTMLElement>;
  private filterMobileToggleButtonElement: HTMLElement;
  private filterMobileCollapseElement: HTMLElement;
  private clearFilterButtonElements: Array<HTMLElement>;
  private scrollToElement: HTMLElement;
  private getFilterTimeout: NodeJS.Timeout;

  private xhr: XMLHttpRequest;
  private screenWidth;
  private mobileBreakpoint = 819;
  private scrollSpeed = 500;
  private scrollOnNewResults = true;
  private disableScrollOnMobile = true;

  private jsChange = new CustomEvent('jschange', {
    bubbles: false,
    cancelable: true,
  });
  private _fetchAbortController: AbortController | null = null;

  constructor(form: HTMLFormElement) {
    this.formElement = form;
    this.formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      this.getFormAction();
    });

    this.resultsElement = document.getElementById(this.formElement.getAttribute('data-filter'));
    if (!this.resultsElement) {
      console.warn('You must provide the id of the result block in order for the filter plugin to work.');
      return;
    }

    this.mobileBreakpoint = parseInt(
      this.formElement.getAttribute('data-filter-mobile-breakpoint') || this.mobileBreakpoint.toString(),
      10
    );
    this.scrollSpeed = parseInt(
      this.formElement.getAttribute('data-filter-scroll-speed') || this.scrollSpeed.toString(),
      10
    );

    this.scrollOnNewResults =
      this.formElement.getAttribute('data-filter-scroll-on-new-results') !== 'false' &&
      this.formElement.getAttribute('data-filter-scroll-on-new-results') !== '0';
    this.disableScrollOnMobile =
      this.formElement.getAttribute('data-filter-disable-scroll-on-mobile') === 'true' ||
      this.formElement.getAttribute('data-filter-disable-scroll-on-mobile') === '1';

    if (this.formElement.hasAttribute('data-filter-extra')) {
      this.extraInfoElements = [];
      const extraIds = this.formElement.getAttribute('data-filter-extra').split(',');
      extraIds.forEach((id) => {
        const extraElement = document.getElementById(id.trim());
        if (extraElement) {
          this.extraInfoElements.push(extraElement);
        } else {
          console.warn(`Extra info element with id ${id.trim()} not found.`);
        }
      });
    }

    this.ariaLiveElement = document.getElementById(this.formElement.getAttribute('data-filter-aria-live'));
    if (!this.ariaLiveElement) {
      console.log(
        'You must have an element defined in the data-filter-aria-live attribute defined in order for the filter plugin to work.'
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

    DOMHelper.onDynamicContent(this.formElement, 'input:not(.no-hook), select:not(.no-hook)', (inputs) => {
      this.initFilterChangeElements(Array.from(inputs));
    });

    this.loaderAnimationElement = document.getElementById(this.formElement.getAttribute('data-filter-loader'));
    if (this.loaderAnimationElement) {
      this.initLoader();
    }

    this.filterMobileToggleButtonElement = document.getElementById(
      this.formElement.getAttribute('data-filter-mobile-toggle')
    );
    if (this.filterMobileToggleButtonElement) {
      this.filterMobileCollapseElement = document.getElementById(
        this.formElement.getAttribute('data-filter-mobile-collapse')
      );
      if (this.filterMobileCollapseElement) {
        this.initFilterToggle();
      }
    }

    if (this.formElement.hasAttribute('data-filter-clear')) {
      const clearButtons = this.formElement.getAttribute('data-filter-clear').split(',');
      if (clearButtons.length > 0) {
        this.clearFilterButtonElements = [];
        clearButtons.forEach((id) => {
          const clearButtonElement = document.getElementById(id.trim());
          if (clearButtonElement) {
            this.clearFilterButtonElements.push(clearButtonElement);
            this.initClearButton(clearButtonElement);
          } else {
            console.warn(`Clear filter button with id '${id.trim()}' not found.`);
          }
        });
      }
    }

    if (this.formElement.hasAttribute('data-filter-clear')) {
      this.getClearButtons().forEach((clearButtonElement) => {
        this.initClearButton(clearButtonElement);
      });
      this.checkClearButtonStatus();

      const clearSelectors = this.formElement
        .getAttribute('data-filter-clear')
        .split(',')
        .map((id) => '#' + id.trim())
        .join(', ');
      DOMHelper.onDynamicContent(document.documentElement, clearSelectors, (buttons) => {
        buttons.forEach((button) => {
          if (button instanceof HTMLElement) {
            this.initClearButton(button);
          }
        });
      });
    }

    DOMHelper.onDynamicContent(document.documentElement, '[data-filter-clear-elements]', (clearElements) => {
      clearElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.addEventListener('click', (e) => {
            e.preventDefault();
            const data = JSON.parse(element.getAttribute('data-filter-clear-elements'));
            this.clearElements(data);
          });
        }
      });
    });

    if (this.formElement.hasAttribute('data-filter-pagination')) {
      const links = document.querySelectorAll('#' + this.formElement.getAttribute('data-filter-pagination') + ' a');
      this.initPagingLinks(links);
      DOMHelper.onDynamicContent(
        document.documentElement,
        '#' + this.formElement.getAttribute('data-filter-pagination') + ' a',
        (links) => {
          this.initPagingLinks(links);
        }
      );
    }

    this.scrollToElement = document.getElementById(this.formElement.getAttribute('data-filter-scroll-position'));
    if (!this.scrollToElement) {
      this.scrollToElement = this.resultsElement;
    }

    window.addEventListener('popstate', (event) => {
      this.showLoading();
      this.getFilterData(window.location.href, false, false);
    });

    this.styleClear();
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
    this.filterMobileToggleButtonElement.setAttribute(
      'aria-controls',
      this.formElement.getAttribute('data-filter') + '-filterMobileCollapseArea'
    );

    this.filterMobileCollapseElement.setAttribute(
      'id',
      this.formElement.getAttribute('data-filter') + '-filterMobileCollapseArea'
    );
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
      window.dispatchEvent(new CustomEvent('resize', { bubbles: false, cancelable: true }));
    } else {
      this.filterMobileCollapseElement.classList.add('hidden');
      this.filterMobileToggleButtonElement.classList.remove('open');
      this.filterMobileToggleButtonElement.setAttribute('aria-expanded', 'false');
    }
  }

  private getClearButtons() {
    const clearFilterButtonElements = [];
    if (this.formElement.hasAttribute('data-filter-clear')) {
      const clearButtons = this.formElement.getAttribute('data-filter-clear').split(',');
      if (clearButtons.length > 0) {
        clearButtons.forEach((id) => {
          const clearButtonElement = document.getElementById(id.trim());
          if (clearButtonElement) {
            clearFilterButtonElements.push(clearButtonElement);
          }
        });
      }
    }
    return clearFilterButtonElements;
  }

  private initClearButton(buttonElement: HTMLElement) {
    buttonElement.addEventListener('click', (e) => {
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

    this.getClearButtons().forEach((clearFilterButtonElement) => {
      this.toggleClearButtonVisibility(clearFilterButtonElement, isEmpty);
    });
  }

  private toggleClearButtonVisibility(clearFilterButtonElement: HTMLElement, isEmpty: boolean) {
    if (clearFilterButtonElement) {
      if (isEmpty) {
        if (!clearFilterButtonElement.hasAttribute('data-always-show')) {
          clearFilterButtonElement.classList.add('hidden');
        }
      } else {
        clearFilterButtonElement.classList.remove('hidden');
      }
    }
  }

  private initPagingLinks(links) {
    links.forEach((link) => {
      if (link instanceof HTMLAnchorElement) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.showLoading();
          this.getFilterData(link.href, false, true);
        });
      }
    });
  }

  private getFilterData(url, clearPage = false, pushState = true) {
    if (this.getFilterTimeout) {
      clearTimeout(this.getFilterTimeout);
    }

    // --- fetch version ---
    this.getFilterTimeout = setTimeout(() => {
      // AbortController for fetch cancellation (optional)
      if (this.xhr && typeof this.xhr.abort === 'function') {
        this.xhr.abort();
      }
      if (this._fetchAbortController) {
        this._fetchAbortController.abort();
      }
      this._fetchAbortController = new AbortController();

      this.scrollToStart();

      if (clearPage) {
        const regexResult = window.location.pathname.match(/([^\?\s]+\/)([p][0-9]{1,3}.?)(.*)/);
        if (regexResult && regexResult[1]) {
          url = regexResult[1] + '?' + this.formElement.serialize();
        }
      }

      fetch(url, { signal: this._fetchAbortController.signal })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Something went wrong when fetching data.');
          }
          const text = await response.text();
          const responseElement = document.implementation.createHTMLDocument('');
          responseElement.body.innerHTML = text;
          const resultsBlock = responseElement.getElementById(this.formElement.getAttribute('data-filter'));
          if (resultsBlock) {
            this.resultsElement.innerHTML = resultsBlock.innerHTML;

            const ariaLiveBlock = responseElement.getElementById(
              this.formElement.getAttribute('data-filter-aria-live')
            );
            if (ariaLiveBlock) {
              this.ariaLiveElement.innerHTML = ariaLiveBlock.innerHTML;
            }

            if (pushState) {
              history.pushState('', 'New URL: ' + url, url);
            }

            if (this.formElement.hasAttribute('data-filter-clear')) {
              const clearIds = this.formElement.getAttribute('data-filter-clear').split(',');
              clearIds.forEach((id) => {
                const clearButtonElement = resultsBlock.querySelector('#' + id.trim()) as HTMLElement;
                if (clearButtonElement) {
                  this.initClearButton(clearButtonElement);
                }
              });
            }

            this.scrollToStart();
            this.hideLoading();
            this.styleClear();
          } else {
            console.error('Could not find data on returned page.');
          }

          if (this.formElement.hasAttribute('data-filter-extra')) {
            const extraIds = this.formElement.getAttribute('data-filter-extra').split(',');
            extraIds.forEach((id) => {
              const extraElementIncomming = responseElement.getElementById(id.trim());
              const extraElementCurrent = this.extraInfoElements.find((el) => el.id === id.trim());
              if (extraElementIncomming && extraElementCurrent) {
                extraElementCurrent.innerHTML = extraElementIncomming.innerHTML;
              }
            });
          }

          this.checkClearButtonStatus();
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error(err.message || 'There was a connection error.');
          }
        });
    }, 100);
  }

  private scrollToStart() {
    if (this.scrollOnNewResults) {
      if (this.scrollToElement) {
        if (window.innerWidth < this.mobileBreakpoint) {
          if (!this.disableScrollOnMobile) {
            ScrollHelper.scrollToY(this.scrollToElement, this.scrollSpeed);
          }
        } else {
          ScrollHelper.scrollToY(this.scrollToElement, this.scrollSpeed);
        }
      } else {
        if (this.loaderAnimationElement) {
          if (window.innerWidth < this.mobileBreakpoint) {
            if (!this.disableScrollOnMobile) {
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

    document.dispatchEvent(
      new CustomEvent('filterElementsCleared', {
        bubbles: false,
        cancelable: true,
      })
    );
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
    this.getClearButtons().forEach((clearFilterButtonElement) => {
      if (
        (clearFilterButtonElement && clearFilterButtonElement.hasAttribute('data-active-class')) ||
        clearFilterButtonElement.hasAttribute('data-inactive-class')
      ) {
        const activeClasses = clearFilterButtonElement.hasAttribute('data-active-class')
          ? clearFilterButtonElement.getAttribute('data-active-class').split(' ')
          : '';
        const inactiveClasses = clearFilterButtonElement.hasAttribute('data-inactive-class')
          ? clearFilterButtonElement.getAttribute('data-inactive-class').split(' ')
          : '';

        if (this.hasActiveFilter()) {
          if (activeClasses.length > 0) {
            clearFilterButtonElement.classList.add(...activeClasses);
          }
          if (inactiveClasses.length > 0) {
            clearFilterButtonElement.classList.remove(...inactiveClasses);
          }
        } else {
          if (activeClasses.length > 0) {
            clearFilterButtonElement.classList.remove(...activeClasses);
          }
          if (inactiveClasses.length > 0) {
            clearFilterButtonElement.classList.add(...inactiveClasses);
          }
        }
      }
    });
  }

  private hasActiveFilter(): boolean {
    let active = false;
    const elements = Array.from(this.formElement.elements);
    elements.forEach((el) => {
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
        const type = (el.getAttribute('type') || '').toLowerCase();

        switch (type) {
          case 'text':
          case 'password':
          case 'textarea':
          case 'hidden':
            if (el.getAttribute('value') !== '') {
              active = true;
            }
            break;

          case 'radio':
          case 'checkbox':
            if ((el as HTMLInputElement).checked) {
              active = true;
            }
            break;

          case 'select-one':
          case 'select-multi':
            if (el.getAttribute('selectedIndex') !== '-1') {
              active = true;
            }
            break;
        }
      }
    });
    return active;
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

    document.dispatchEvent(
      new CustomEvent('filterFormCleared', {
        bubbles: false,
        cancelable: true,
      })
    );

    this.styleClear();
    this.checkClearButtonStatus();
  }
}
