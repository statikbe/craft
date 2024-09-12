// based on: https://adamsilver.io/articles/building-an-accessible-autocomplete-control/
// import Promise from "promise-polyfill";

import { Ajax } from '../utils/ajax';
import { DOMHelper } from '../utils/domHelper';
import { SiteLang } from '../utils/site-lang';
import { Formatter } from '../utils/formater';
import { computePosition, size, shift, flip } from '@floating-ui/dom';

export class AjaxSearchComponent {
  constructor() {
    Array.from(document.querySelectorAll('[data-s-ajax-search], [data-s-ajax-search-callback]')).forEach(
      (search, index) => {
        if (search.tagName === 'INPUT') {
          new AjaxSearch(search as HTMLInputElement, index);
        }
      }
    );
  }
}

class AjaxSearch {
  private siteLang = SiteLang.getLang();
  private lang;

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
  private noresultTemplate = '';
  private groupTemplate = '';
  private typedTextTemplate = '';
  private noresultText = '';
  private noTypedOption = false;
  private destinationInput: HTMLInputElement;
  private ajaxLoadResults = false;
  private scrollToResults = true;
  private xhrResults: XMLHttpRequest;
  private loaderAnimationElement: HTMLElement; // .js-search-loader
  private resultsElement: HTMLElement; // .js-search-results
  private minimumCharacters = 3;
  private clearInputOnSelect = false;

  private autocompleteInputWrapper: HTMLDivElement;
  private ajaxSearchListElement: HTMLUListElement;
  private statusElement: HTMLDivElement;

  private inputKeyUpListener;
  private inputFocusListener;
  private inputKeyDownListener;
  private documentClickListener;

  private hoverOption: HTMLElement;
  private isDisabled = false;
  private inDebounce;

  private keys = {
    esc: 27,
    up: 38,
    left: 37,
    right: 39,
    space: 32,
    enter: 13,
    tab: 9,
    shift: 16,
    down: 40,
    backspace: 8,
  };

  constructor(input: HTMLInputElement, index) {
    this.getLang().then(() => {
      this.noresultText = this.lang.nothingFound;
    });

    this.inputElement = input;
    this.ajaxURL = this.inputElement.getAttribute('data-s-ajax-search');
    this.searchCallback = this.inputElement.getAttribute('data-s-ajax-search-callback');
    this.formElement = this.inputElement.closest('form');

    if (this.ajaxURL || this.searchCallback) {
      if (this.ajaxURL) {
        this.ajaxMethod =
          this.inputElement.getAttribute('data-s-ajax-search-methode') != null
            ? this.inputElement.getAttribute('data-s-ajax-search-methode')
            : this.ajaxMethod;

        this.ajaxQueryName =
          this.inputElement.getAttribute('data-s-ajax-search-query') != null
            ? this.inputElement.getAttribute('data-s-ajax-search-query')
            : this.ajaxQueryName;
      }

      this.noresultText =
        this.inputElement.getAttribute('data-s-ajax-search-no-result-text') != null
          ? this.inputElement.getAttribute('data-s-ajax-search-no-result-text')
          : this.noresultText;

      if (this.inputElement.getAttribute('data-s-ajax-search-result-template') != null) {
        const template = document.getElementById(this.inputElement.getAttribute('data-s-ajax-search-result-template'));
        this.resultTemplate = template != null ? template.innerHTML : '';
      }

      if (this.inputElement.getAttribute('data-s-ajax-search-group-template') != null) {
        const template = document.getElementById(this.inputElement.getAttribute('data-s-ajax-search-group-template'));
        this.groupTemplate = template != null ? template.innerHTML : '';
      }

      if (this.inputElement.getAttribute('data-s-ajax-search-typed-text-template') != null) {
        const template = document.getElementById(
          this.inputElement.getAttribute('data-s-ajax-search-typed-text-template')
        );
        this.typedTextTemplate = template != null ? template.innerHTML : '';
      }

      if (this.inputElement.getAttribute('data-s-ajax-search-no-result-template') != null) {
        const template = document.getElementById(
          this.inputElement.getAttribute('data-s-ajax-search-no-result-template')
        );
        this.noresultTemplate = template != null ? template.innerHTML : '';
      }

      if (this.inputElement.getAttribute('data-s-ajax-search-no-typed-option') != null) {
        this.noTypedOption = this.inputElement.getAttribute('data-s-ajax-search-no-typed-option') ? true : false;
      }

      if (this.inputElement.getAttribute('data-s-ajax-search-destination-input') != null) {
        this.destinationInput = document.querySelector(
          `input[name="${this.inputElement.getAttribute('data-s-ajax-search-destination-input')}"]`
        ) as HTMLInputElement;
      }

      if (this.inputElement.getAttribute('data-s-ajax-search-clear-on-select') != null) {
        this.clearInputOnSelect = this.inputElement.getAttribute('data-s-ajax-search-clear-on-select') ? true : false;
      }

      if (this.ajaxLoadResults) {
        this.resultsElement = document.querySelector('.js-search-results');
        this.loaderAnimationElement = document.querySelector('.js-search-loader');
      }

      this.dataArray = this.inputElement.getAttribute('data-s-ajax-search-data');

      this.inputElement.removeAttribute('data-s-ajax-search');
      this.inputElement.setAttribute('aria-controls', `ajaxSearchList${index}`);
      this.inputElement.setAttribute('autocapitalize', 'none');
      this.inputElement.setAttribute('autocomplete', 'off');
      this.inputElement.setAttribute('aria-autocomplete', 'list');
      this.inputElement.setAttribute('aria-expanded', 'false');

      this.isDisabled = this.inputElement.getAttribute('disabled') != null ? true : false;

      this.ajaxSearchElement = document.createElement('div');
      this.ajaxSearchElement.classList.add('ajax-search');
      if (this.isDisabled) {
        this.ajaxSearchElement.classList.add('disabled');
      }
      this.inputElement.insertAdjacentElement('afterend', this.ajaxSearchElement);

      this.autocompleteInputWrapper = document.createElement('div');
      this.autocompleteInputWrapper.classList.add('ajax-search__input-wrapper');
      this.autocompleteInputWrapper.insertAdjacentElement('beforeend', this.inputElement);

      this.ajaxSearchElement.insertAdjacentElement('afterbegin', this.autocompleteInputWrapper);

      this.inputKeyUpListener = this.onKeyUp.bind(this);
      this.inputElement.addEventListener('keyup', this.inputKeyUpListener);

      this.inputKeyDownListener = this.onKeyDown.bind(this);
      this.inputElement.addEventListener('keydown', this.inputKeyDownListener);

      this.inputFocusListener = this.onFocus.bind(this);
      this.inputElement.addEventListener('focus', this.inputFocusListener);

      this.ajaxSearchListElement = document.createElement('ul');
      this.ajaxSearchListElement.setAttribute('id', `ajaxSearchList${index}`);
      this.ajaxSearchListElement.setAttribute('role', 'listbox');
      this.ajaxSearchListElement.classList.add('ajax-search__list');
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
        'No URL defined to make the ajax call for the search. Make sure you give the attribute data-s-ajax-search a value!'
      );
    }
  }

  private async getLang() {
    this.lang = await import(`../i18n/s-ajax-search-${this.siteLang}.json`);
  }

  private onKeyUp(e) {
    switch (e.keyCode) {
      case this.keys.left:
      case this.keys.right:
      case this.keys.space:
      case this.keys.shift:
        break;
      case this.keys.esc:
        this.hideMenu();
        break;
      case this.keys.enter:
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
      case this.keys.up:
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
      case this.keys.down:
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
    switch (e.keyCode) {
      case this.keys.enter:
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        break;
      case this.keys.tab:
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
        if (window[this.searchCallback]) {
          window[this.searchCallback](this.inputElement.value.trim().toLowerCase()).then((data) => {
            this.showData(data);
          });
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
    this.positionMenu();
  }

  private hideMenu() {
    this.ajaxSearchListElement.classList.add('hidden');
    this.inputElement.setAttribute('aria-expanded', 'false');
    this.inputElement.removeAttribute('aria-activedescendant');
  }

  private positionMenu() {
    const _self = this;
    computePosition(this.autocompleteInputWrapper, this.ajaxSearchListElement, {
      placement: 'bottom-start',
      // middleware: [flip()],
      middleware: [
        // shift(),
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

    let data = null;
    let url = this.ajaxURL;
    if (this.ajaxMethod == 'GET') {
      if (this.ajaxQueryName === '') {
        url += query;
      } else {
        if (url.indexOf('?') < 0) {
          url += `?${this.ajaxQueryName}=${query}`;
        } else {
          url += `&${this.ajaxQueryName}=${query}`;
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
          this.addDataToList(info.group, this.groupTemplate);
          info.data.forEach((linkData) => {
            this.addDataToList(linkData, this.resultTemplate);
          });
        } else {
          this.addDataToList(info, this.resultTemplate);
        }
      });
      this.updateStatus(data.length);
    }

    if (!data || data.length == 0) {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
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

  private addDataToList(info, template) {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    if (template == '') {
      li.innerText = info;
    } else {
      li.innerHTML = Formatter.parseTemplate(template, info);
    }
    const emptyElements = li.querySelectorAll('.js-remove-when-empty');
    Array.from(emptyElements).forEach((element) => {
      if (element.textContent == '' || element.textContent.indexOf('%') >= 0) {
        element.parentElement.removeChild(element);
      }
    });

    const link = li.querySelector('a');
    if (link) {
      link.setAttribute('tabindex', '-1');
    }
    if (this.destinationInput) {
      li.setAttribute('data-value', info[this.inputElement.getAttribute('data-s-ajax-search-destination-value')]);
      li.addEventListener('click', (e) => {
        this.destinationInput.value = info[this.inputElement.getAttribute('data-s-ajax-search-destination-value')];
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
      this.hoverOption.classList.remove('highlight');
    }
    if (option) {
      option.classList.add('highlight');
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
        const responseElement = document.implementation.createHTMLDocument('');
        responseElement.body.innerHTML = this.response;
        const resultsBlock = responseElement.querySelector('.js-search-results');

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
