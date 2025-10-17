import { Ajax } from '../utils/ajax';
import { DOMHelper } from '../utils/domHelper';
import { SiteLang } from '../utils/site-lang';
import { Formatter } from '../utils/formater';
import { computePosition, size } from '@floating-ui/dom';
import { ScrollHelper } from '../utils/scroll';

export default class AjaxSearchComponent {
  constructor() {
    document.querySelectorAll('[data-ajax-search], [data-ajax-search-callback]').forEach((search, index) => {
      if (search.tagName === 'INPUT' && !search.hasAttribute('data-ajax-search-initialized')) {
        search.setAttribute('data-ajax-search-initialized', 'true');
        new AjaxSearch(search as HTMLInputElement, index);
      }
    });

    DOMHelper.onDynamicContent(
      document.documentElement,
      '[data-ajax-search], [data-ajax-search-callback]',
      (searches) => {
        const amountOfSearchesOnThePage = document.querySelectorAll('[data-ajax-search-initialized]').length;
        searches.forEach((search, index) => {
          if (search.tagName === 'INPUT' && !search.hasAttribute('data-ajax-search-initialized')) {
            search.setAttribute('data-ajax-search-initialized', 'true');
            new AjaxSearch(search as HTMLInputElement, amountOfSearchesOnThePage + index);
          }
        });
      }
    );
  }
}

class AjaxSearch {
  private siteLang = SiteLang.getLang();
  private lang: { nothingFound: string; showResultsForQuery: string; resultsAvailable: string };
  private xhr: XMLHttpRequest;

  private ajaxSearchElement: HTMLDivElement;
  private inputElement: HTMLInputElement;
  private formElement: HTMLFormElement;
  private ajaxURL: string;
  private options: Array<HTMLElement> = [];

  private searchCallback = '';
  private ajaxMethod = 'GET';
  private ajaxQueryName = 'data';
  private dataArray = '';
  private resultTemplate = '';
  private resultClasses = '';
  private noresultTemplate = '';
  private noresultClasses = '';
  private groupTemplate = '';
  private groupClasses = '';
  private typedTextTemplate = '';
  private typedTextClasses = '';
  private noresultText = '';
  private noTypedOption = false;
  private matchWrapper = 'mark';

  private destinationInput: HTMLInputElement;
  private ajaxLoadResults = false;
  private scrollToResults = true;
  private xhrResults: XMLHttpRequest;
  private loaderAnimationElement: HTMLElement;
  private resultsElement: HTMLElement;
  private minimumCharacters = 3;
  private clearInputOnSelect = false;

  private ajaxSearchListElement: HTMLUListElement;
  private statusElement: HTMLDivElement;

  private inputKeyUpListener;
  private inputFocusListener;
  private inputKeyDownListener;
  private documentClickListener;

  private hoverOption: HTMLElement;
  private isDisabled = false;
  private inDebounce;

  private ajaxSearchElementClass = 'relative';
  private ajaxSearchListElementClass = 'absolute left-0 right-0 z-10 overflow-y-auto top-full';
  private ajaxSearchListItemClass = '';

  constructor(input: HTMLInputElement, index: number) {
    this.inputElement = input;
    this.ajaxURL = this.inputElement.getAttribute('data-ajax-search');
    this.searchCallback = this.inputElement.getAttribute('data-ajax-search-callback');
    this.formElement = this.inputElement.closest('form');

    if (this.siteLang && typeof this.siteLang === 'string') {
      if (/^[a-zA-Z-]+$/.test(this.siteLang)) {
        import(`../i18n/s-ajax-search-${this.siteLang}.json`)
          .then((lang) => {
            this.lang = lang;
            this.noresultText = this.lang.nothingFound;
          })
          .catch((error) => {
            console.error('Error loading language file:', error);
          });
      } else {
        throw new Error(`Invalid siteLang value: ${this.siteLang}`);
      }
    } else {
      const ajaxURLAttribute = this.inputElement.getAttribute('data-ajax-search');
      try {
        this.ajaxURL = new URL(ajaxURLAttribute, window.location.origin).toString();
      } catch {
        console.error('Invalid or missing data-ajax-search attribute. Please provide a valid URL.');
        this.ajaxURL = null;
      }
    }

    if (this.ajaxURL || this.searchCallback) {
      if (this.ajaxURL) {
        this.ajaxMethod =
          this.inputElement.getAttribute('data-ajax-search-method') != null
            ? this.inputElement.getAttribute('data-ajax-search-method')
            : this.ajaxMethod;

        this.ajaxQueryName =
          this.inputElement.getAttribute('data-ajax-search-query') != null
            ? this.inputElement.getAttribute('data-ajax-search-query')
            : this.ajaxQueryName;
      }

      this.noresultText =
        this.inputElement.getAttribute('data-ajax-search-no-result-text') != null
          ? this.inputElement.getAttribute('data-ajax-search-no-result-text')
          : this.noresultText;

      if (this.inputElement.getAttribute('data-ajax-search-result-template') != null) {
        const template = document.getElementById(this.inputElement.getAttribute('data-ajax-search-result-template'));
        this.resultTemplate = template != null ? template.innerHTML : '';
        if (template.hasAttribute('class')) {
          this.resultClasses = template.getAttribute('class').replace('hidden', '');
        }
      }

      if (this.inputElement.getAttribute('data-ajax-search-group-template') != null) {
        const template = document.getElementById(this.inputElement.getAttribute('data-ajax-search-group-template'));
        this.groupTemplate = template != null ? template.innerHTML : '';
        if (template.hasAttribute('class')) {
          this.groupClasses = template.getAttribute('class').replace('hidden', '');
        }
      }

      if (this.inputElement.getAttribute('data-ajax-search-typed-text-template') != null) {
        const template = document.getElementById(
          this.inputElement.getAttribute('data-ajax-search-typed-text-template')
        );
        this.typedTextTemplate = template != null ? template.innerHTML : '';
        if (template.hasAttribute('class')) {
          this.typedTextClasses = template.getAttribute('class').replace('hidden', '');
        }
      }

      if (this.inputElement.getAttribute('data-ajax-search-no-result-template') != null) {
        const template = document.getElementById(this.inputElement.getAttribute('data-ajax-search-no-result-template'));
        this.noresultTemplate = template != null ? template.innerHTML : '';
        if (template.hasAttribute('class')) {
          this.noresultClasses = template.getAttribute('class').replace('hidden', '');
        }
      }

      if (this.inputElement.getAttribute('data-ajax-search-no-typed-option') != null) {
        this.noTypedOption = this.inputElement.getAttribute('data-ajax-search-no-typed-option') === 'true';
      }

      if (this.inputElement.getAttribute('data-ajax-search-destination-input') != null) {
        this.destinationInput = document.querySelector(
          `input[name="${this.inputElement.getAttribute('data-ajax-search-destination-input')}"]`
        ) as HTMLInputElement;
      }

      if (this.inputElement.getAttribute('data-ajax-search-clear-on-select') != null) {
        this.clearInputOnSelect = this.inputElement.getAttribute('data-ajax-search-clear-on-select') === 'true';
      }

      if (this.ajaxLoadResults) {
        this.resultsElement = document.querySelector('[data-ajax-search-results]');
        this.loaderAnimationElement = document.querySelector('[data-ajax-search-loader]');
      }

      this.dataArray = this.inputElement.getAttribute('data-ajax-search-data');

      if (this.inputElement.hasAttribute('data-ajax-search-list-element-class')) {
        this.ajaxSearchListElementClass += ' ' + this.inputElement.getAttribute('data-ajax-search-list-element-class');
      }

      if (this.inputElement.hasAttribute('data-ajax-search-list-item-class')) {
        this.ajaxSearchListItemClass = this.inputElement.getAttribute('data-ajax-search-list-item-class');
      }

      if (this.inputElement.hasAttribute('data-ajax-search-match-wrapper')) {
        this.matchWrapper = this.inputElement.getAttribute('data-ajax-search-match-wrapper');
      }

      this.inputElement.removeAttribute('data-ajax-search');
      this.inputElement.setAttribute('aria-controls', `ajaxSearchList${index}`);
      this.inputElement.setAttribute('autocapitalize', 'none');
      this.inputElement.setAttribute('autocomplete', 'off');
      this.inputElement.setAttribute('aria-autocomplete', 'list');
      this.inputElement.setAttribute('aria-expanded', 'false');

      this.isDisabled = this.inputElement.getAttribute('disabled') != null ? true : false;

      this.ajaxSearchElement = document.createElement('div');
      this.ajaxSearchElement.classList.add(this.ajaxSearchElementClass);
      if (this.isDisabled) {
        this.ajaxSearchElement.classList.add('disabled');
      }
      this.inputElement.insertAdjacentElement('afterend', this.ajaxSearchElement);

      this.inputKeyUpListener = this.onKeyUp.bind(this);
      this.inputElement.addEventListener('keyup', this.inputKeyUpListener);

      this.inputKeyDownListener = this.onKeyDown.bind(this);
      this.inputElement.addEventListener('keydown', this.inputKeyDownListener);

      this.inputFocusListener = this.onFocus.bind(this);
      this.inputElement.addEventListener('focus', this.inputFocusListener);

      this.ajaxSearchListElement = document.createElement('ul');
      this.ajaxSearchListElement.setAttribute('id', `ajaxSearchList${index}`);
      this.ajaxSearchListElement.setAttribute('role', 'listbox');
      this.ajaxSearchListElement.classList.add(...this.ajaxSearchListElementClass.split(' '));
      this.ajaxSearchListElement.classList.add('hidden');

      this.ajaxSearchElement.insertAdjacentElement('beforeend', this.ajaxSearchListElement);

      this.statusElement = document.createElement('div');
      this.statusElement.setAttribute('aria-live', 'polite');
      this.statusElement.setAttribute('role', 'status');
      this.statusElement.classList.add('sr-only');

      this.ajaxSearchElement.insertAdjacentElement('beforeend', this.statusElement);

      this.documentClickListener = this.onDocumentClick.bind(this);
      document.addEventListener('click', this.documentClickListener);
    } else {
      console.error(
        'No URL defined to make the ajax call for the search. Make sure you give the attribute data-ajax-search a value!'
      );
    }
  }

  private onKeyUp(e) {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case ' ':
      case 'Shift':
        break;
      case 'Escape':
        this.hideMenu();
        break;
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (this.hoverOption) {
          const link = this.hoverOption.querySelector('a');
          if (link) {
            link.click();
          }
          const button = this.hoverOption.querySelector('button');
          if (button) {
            button.click();
          }
          if (this.destinationInput) {
            this.destinationInput.value = this.hoverOption.getAttribute('data-value');
            this.destinationInput.dispatchEvent(new Event('jschange'));
            this.inputElement.value = this.hoverOption.innerText.trim();
            this.hideMenu();
          }
          this.clear();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        // If the first option is focused, set focus to the text box. Otherwise set focus to the previous option.
        if (this.hoverOption) {
          let previousSib = this.hoverOption.previousElementSibling;
          if (this.hoverOption && previousSib) {
            this.highlightOption(previousSib as HTMLElement);
          } else {
            this.highlightOption(this.ajaxSearchListElement.lastChild as HTMLElement);
          }
        } else {
          this.highlightOption(this.ajaxSearchListElement.lastChild as HTMLElement);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (this.ajaxSearchListElement.classList.contains('hidden') && this.options.length > 0) {
          this.onTextBoxDownPressed(e);
        } else {
          // Focus the next menu option. If it’s the last menu option, do nothing.
          if (this.hoverOption) {
            let nextSib = this.hoverOption.nextElementSibling;
            if (this.hoverOption && nextSib) {
              this.highlightOption(nextSib as HTMLElement);
            } else {
              this.highlightOption(this.ajaxSearchListElement.firstChild as HTMLElement);
            }
          } else {
            this.highlightOption(this.ajaxSearchListElement.firstChild as HTMLElement);
          }
        }
        break;
      default:
        if (this.inDebounce) {
          clearInterval(this.inDebounce);
        }
        this.inDebounce = setTimeout(() => {
          this.onTextBoxType(e);
        }, 300);
    }
  }

  private onKeyDown(e) {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        break;
      case 'Tab':
        // Hide the menu.
        this.hideMenu();
        break;
    }
  }

  private onFocus(e) {
    if (this.inputElement.value.trim().length > 0) {
      if (this.searchCallback) {
        window[this.searchCallback](this.inputElement.value.trim().toLowerCase()).then((data) => {
          this.showData(data);
        });
      } else {
        this.getData(this.inputElement.value.trim().toLowerCase());
      }
    }
  }

  private onDocumentClick(e) {
    if (!this.ajaxSearchElement.contains(e.target)) {
      this.hideMenu();
    } else {
      this.clear();
    }
  }

  private onTextBoxType(e) {
    // only show options if user typed something
    if (this.inputElement.value.trim().length >= this.minimumCharacters) {
      if (this.searchCallback) {
        if (typeof window[this.searchCallback] === 'function') {
          const result = window[this.searchCallback](this.inputElement.value.trim().toLowerCase());
          if (result instanceof Promise) {
            result
              .then((data) => {
                this.showData(data);
              })
              .catch((error) => {
                console.error('Error in search callback promise:', error);
              });
          } else {
            console.error('The search callback did not return a promise.');
          }
        } else {
          console.error(`The search callback "${this.searchCallback}" is not defined or is not a function.`);
        }
      } else {
        this.getData(this.inputElement.value.trim().toLowerCase());
      }
    } else {
      this.hideMenu();
      if (this.destinationInput) {
        this.destinationInput.value = '';
        this.destinationInput.dispatchEvent(new Event('jschange'));
      }
    }
  }

  private onTextBoxDownPressed(e) {
    this.showMenu();
    if (this.options.length > 0) {
      this.highlightOption(this.options[0] as HTMLElement);
    }
  }

  private showMenu() {
    this.ajaxSearchListElement.classList.remove('hidden');
    this.inputElement.setAttribute('aria-expanded', 'true');
    this.inputElement.dispatchEvent(new CustomEvent('ajaxSearchShowMenu', { bubbles: true }));
    this.positionMenu();
  }

  private hideMenu() {
    this.ajaxSearchListElement.classList.add('hidden');
    this.inputElement.setAttribute('aria-expanded', 'false');
    this.inputElement.removeAttribute('aria-activedescendant');
    this.inputElement.dispatchEvent(new CustomEvent('ajaxSearchHideMenu', { bubbles: true }));
  }

  private positionMenu() {
    const _self = this;
    computePosition(this.ajaxSearchElement, this.ajaxSearchListElement, {
      placement: 'bottom-start',
      middleware: [
        size({
          apply({ availableWidth, availableHeight, elements }) {
            // Do things with the data, e.g.
            Object.assign(elements.floating.style, {
              maxWidth: `${availableWidth}px`,
              maxHeight: `${availableHeight}px`,
            });
          },
        }),
      ],
    }).then(({ x, y }) => {
      Object.assign(_self.ajaxSearchListElement.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  }

  private getData(query: string, callback: Function = null) {
    if (this.xhr) {
      this.xhr.abort();
    }

    if (!this.ajaxURL || typeof this.ajaxURL !== 'string' || !this.ajaxURL.trim()) {
      console.error('Invalid or missing ajaxURL. Please provide a valid URL.');
      return;
    }

    let data = null;
    let url = this.ajaxURL;
    if (this.ajaxMethod == 'GET') {
      if (this.ajaxQueryName === '') {
        url += query;
      } else {
        if (url.indexOf('?') < 0) {
          url += `?${this.ajaxQueryName}=${encodeURIComponent(query)}`;
        } else {
          url += `&${this.ajaxQueryName}=${encodeURIComponent(query)}`;
        }
      }
    }
    if (this.ajaxMethod == 'POST') {
      data = {};
      data[this.ajaxQueryName] = query;
    }

    this.xhr = Ajax.call({
      url: url,
      data: data,
      method: this.ajaxMethod,
      xhr: this.xhr,
      success: (data) => {
        if (!Array.isArray(data)) {
          data = [data];
        }
        this.showData(data);
      },
      error: (e) => {
        console.error(e);
        this.showData(null);
      },
    });
  }

  private showData(data) {
    this.ajaxSearchListElement.innerHTML = '';
    if (this.dataArray) {
      this.dataArray.split('.').forEach((param) => {
        if (data) {
          data = data[param];
        }
      });
    }

    if (data) {
      data.forEach((info) => {
        if (info.group) {
          this.addDataToList(info.group, this.groupTemplate, this.groupClasses);
          info.data.forEach((linkData) => {
            this.addDataToList(linkData, this.resultTemplate, this.resultClasses);
          });
        } else {
          this.addDataToList(info, this.resultTemplate, this.resultClasses);
        }
      });
      this.updateStatus(data.length);
    }

    if (!data || data.length == 0) {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      if (this.noresultClasses.length > 0) {
        const itemClasses = this.noresultClasses.trim().split(' ');
        if (itemClasses.length > 0) {
          li.classList.add(...itemClasses);
        }
      }
      if (this.noresultTemplate == '') {
        li.innerText = this.noresultText;
      } else {
        li.innerHTML = this.noresultTemplate;
      }
      this.ajaxSearchListElement.insertAdjacentElement('beforeend', li);
    }

    if (!this.noTypedOption) {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      if (this.ajaxSearchListItemClass.length > 0 && this.typedTextClasses.length == 0) {
        const itemClasses = this.ajaxSearchListItemClass.trim().split(' ');
        if (itemClasses.length > 0) {
          li.classList.add(...itemClasses);
        }
      }
      if (this.typedTextClasses.length > 0) {
        const itemClasses = this.typedTextClasses.trim().split(' ');
        if (itemClasses.length > 0) {
          li.classList.add(...itemClasses);
        }
      }
      let template = this.typedTextTemplate;
      if (template) {
        const matches = this.typedTextTemplate.match(/%%(.*)%%/gi);
        if (matches) {
          matches.forEach((match) => {
            template = template.replace(match, this.inputElement.value.trim());
          });
        }
      } else {
        template = `${this.lang.showResultsForQuery} ${this.inputElement.value.trim()}`;
      }
      const link = document.createElement('a');
      link.href =
        this.formElement.action + '?' + this.inputElement.name + '=' + this.inputElement.value.trim().toLowerCase();
      link.insertAdjacentHTML('afterbegin', template);
      if (this.ajaxLoadResults) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.getResultsData(link.href);
          this.hideMenu();
        });
        this.formElement.addEventListener('submit', (e) => {
          e.preventDefault();
          this.getResultsData(link.href);
          this.hideMenu();
        });
      }
      li.insertAdjacentElement('afterbegin', link);
      this.ajaxSearchListElement.insertAdjacentElement('beforeend', li);
    }

    this.showMenu();
  }

  private addDataToList(info, template, classes = '') {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    if (this.ajaxSearchListItemClass.length > 0 && classes.length == 0) {
      const itemClasses = this.ajaxSearchListItemClass.trim().split(' ');
      if (itemClasses.length > 0) {
        li.classList.add(...itemClasses);
      }
    }
    if (classes.length > 0) {
      const itemClasses = classes.trim().split(' ');
      if (itemClasses.length > 0) {
        li.classList.add(...itemClasses);
      }
    }
    if (template == '') {
      li.innerText = info;
    } else {
      li.innerHTML = Formatter.parseTemplate(template, info);
    }

    if (this.inputElement.value.trim() && this.matchWrapper.length > 0) {
      const query = this.inputElement.value.trim();
      const regex = new RegExp(`(${encodeURIComponent(query)})`, 'gi');
      li.innerHTML = li.innerHTML.replace(regex, `<${this.matchWrapper}>$1</${this.matchWrapper}>`);
    }

    const link = li.querySelector('a');
    if (link) {
      link.setAttribute('tabindex', '-1');
    }
    if (this.destinationInput) {
      li.setAttribute('data-value', info[this.inputElement.getAttribute('data-ajax-search-destination-value')]);
      li.addEventListener('click', (e) => {
        this.destinationInput.value = info[this.inputElement.getAttribute('data-ajax-search-destination-value')];
        this.inputElement.value = li.innerText;
        this.destinationInput.dispatchEvent(new Event('jschange'));
        this.hideMenu();
      });
    }
    this.ajaxSearchListElement.insertAdjacentElement('beforeend', li);
  }

  private updateStatus(nbr: number) {
    if (this.statusElement) {
      this.statusElement.innerText = `${nbr} ${this.lang.resultsAvailable}`;
    }
  }

  private highlightOption(option: HTMLElement) {
    if (this.hoverOption) {
      this.hoverOption.removeAttribute('aria-selected');
    }
    if (option) {
      option.setAttribute('aria-selected', 'true');
      this.ajaxSearchListElement.scrollTop = option.offsetTop;
      this.inputElement.setAttribute('aria-activedescendant', option.id);
    }
    this.hoverOption = option;
  }

  private getResultsData(url) {
    const _self = this;
    if (this.xhrResults) {
      this.xhrResults.abort();
    }

    this.xhrResults = new XMLHttpRequest();
    this.xhrResults.open('GET', url, true);

    this.showLoading();

    this.xhrResults.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        if (!this.response || typeof this.response !== 'string') {
          console.error('Invalid response received.');
          return;
        }
        const responseElement = document.implementation.createHTMLDocument('');
        responseElement.body.innerHTML = this.response;
        const resultsBlock = responseElement.querySelector('[data-ajax-search-results]');

        if (resultsBlock) {
          _self.resultsElement.innerHTML = resultsBlock.innerHTML;
          history.pushState('', 'New URL: ' + url, url);
          _self.hideLoading();

          if (_self.scrollToResults) {
            ScrollHelper.scrollToY(_self.resultsElement, 500);
          }
        } else {
          console.error('Could not find data on returned page.');
        }
      } else {
        console.error('Something went wrong when fetching data.');
      }
    };

    this.xhrResults.onerror = function () {
      console.error('There was a connection error.');
    };

    this.xhrResults.send();
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
    }
  }

  private clear() {
    if (this.clearInputOnSelect) {
      this.inputElement.value = '';
      this.hideMenu();
    }
  }
}
