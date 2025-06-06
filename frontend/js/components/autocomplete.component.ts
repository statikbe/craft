// based on: https://adamsilver.io/articles/building-an-accessible-autocomplete-control/

import { DOMHelper } from '../utils/domHelper';
import { SiteLang } from '../utils/site-lang';
import { computePosition, flip } from '@floating-ui/dom';

interface AutocompleteOption {
  text: string;
  value: string;
  class: string;
}

export default class AutocompleteComponent {
  constructor() {
    Array.from(document.querySelectorAll('[data-autocomplete]')).forEach((autocomplete) => {
      if (autocomplete.tagName === 'SELECT') {
        new Autocomplete(autocomplete as HTMLSelectElement);
      }
    });

    DOMHelper.onDynamicContent(
      document.documentElement,
      'select[data-autocomplete]',
      (autocompletes) => {
        Array.from(autocompletes).forEach((ac: HTMLSelectElement) => {
          new Autocomplete(ac);
        });
      },
      'data-autocomplete'
    );

    DOMHelper.onDynamicContent(
      document.documentElement,
      'select[data-autocomplete-init]',
      (autocompletes) => {
        Array.from(autocompletes).forEach((ac: HTMLSelectElement) => {
          const oldList = document.getElementById(`autocompleteList${ac.getAttribute('data-autocomplete-init')}`);
          if (oldList) {
            oldList.remove();
          }
        });
      },
      false,
      true
    );
  }
}

class Autocomplete {
  private siteLang = SiteLang.getLang();
  private lang;

  private autocompleteListIndex: string = '';

  private selectElement: HTMLSelectElement;
  private autocompleteElement: HTMLDivElement;
  private inputElement: HTMLInputElement;
  private autocompleteSelectElement: HTMLDivElement;
  private autocompleteInputWrapper: HTMLDivElement;
  private autocompletePlaceholderElement: HTMLDivElement;
  private autocompleteListElement: HTMLUListElement;
  private autocompleteListReference: HTMLElement;
  private statusElement: HTMLDivElement;
  private freeTypeOption: HTMLOptionElement;

  private options: Array<AutocompleteOption> = new Array<AutocompleteOption>();
  private selectedOptions: Array<AutocompleteOption> = new Array<AutocompleteOption>();

  private inputKeyUpListener;
  private inputKeyDownListener;
  private inputFocusListener;
  private inputBlurListener;
  private documentClickListener;
  private menuClickListener;
  // private menuKeyDownListener;
  private clearOptionClickListener;
  private clearOptionKeyDownListener;

  private selectMutationObserver: MutationObserver;

  private hoverOption: HTMLElement;
  private isMultiple = false;
  private isDisabled = false;
  private isFreeType = false;

  private cssClasses = {
    autocomplete: 'relative',
    autocompleteListCore:
      'max-h-[12em] overflow-y-scroll absolute left-0 right-0 top-full z-999 max-w-content w-full min-w-full',
    autocompleteList: 'autocomplete__list bg-white shadow-xl',
    autocompleteOption:
      'autocomplete__option py-1 px-2 flex items-center justify-between focus:shadow-none focus:outline-none cursor-pointer hover:bg-primary hover:text-primary-contrast hover:after:bg-primary-contrast [&.highlight]:bg-primary [&.highlight]:text-primary-contrast [&.highlight]:after:bg-primary-contrast aria-selected:text-gray-500 aria-selected:after:block',
    autocompleteOptionAfter:
      'after:hidden after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/check.svg")]',
    autocompleteSelectCore: 'flex p-0',
    autocompleteSelect: 'autocomplete__select',
    autocompleteSelectInput:
      'autocomplete__input bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none',
    autocompleteSelectPlaceholder:
      'autocomplete__placeholder overflow-hidden text-ellipsis whitespace-nowrap opacity-25',
    autocompleteDropDownIcon: 'autocomplete__dropdown-icon flex items-center px-2 text-black',
    autocompleteDropDownIconAfter:
      'after:block after:shrink-0 after:w-[1.5em] after:h-[1.5em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/chevron-down.svg")]',
    autocompleteSelectionCore: 'flex overflow-hidden',
    autocompleteSelection: 'autocomplete__selection rounded-sm bg-primary text-primary-contrast',
    autocompleteSelectionText: 'autocomplete__selection-text px-2',
    autocompleteSelectionCloseBtn:
      'autocomplete__selection-close px-1 border-l-1 border-white cursor-pointer focus:bg-primary-700 hover:bg-primary-700',
    autocompleteSelectionCloseBtnAfter:
      'after:block after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/clear.svg")]',
    autocompleteInputWrapper:
      'autocomplete__input-wrapper flex items-center gap-2 flex-wrap p-2 w-[1px] flex-1 [&.has-placeholder]:flex-nowrap',
  };

  constructor(autocomplete: HTMLSelectElement) {
    autocomplete.removeAttribute('data-autocomplete');
    autocomplete.setAttribute('data-autocomplete-init', '');
    this.getLang();
    this.init(autocomplete);
  }

  private init(autocomplete: HTMLSelectElement) {
    this.autocompleteListIndex = DOMHelper.getPathTo(autocomplete);
    autocomplete.setAttribute('data-autocomplete-init', this.autocompleteListIndex);
    this.selectElement = autocomplete;

    this.selectMutationObserver = new MutationObserver(this.selectMutation.bind(this));
    this.selectMutationObserver.observe(this.selectElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    const datasetKeys = Object.keys(this.selectElement.dataset);
    datasetKeys.forEach((key) => {
      if (this.cssClasses[key]) {
        this.cssClasses[key] = this.selectElement.dataset[key];
      }
    });

    this.isDisabled = this.selectElement.getAttribute('disabled') != null ? true : false;
    this.isFreeType = this.selectElement.getAttribute('free-type') != null ? true : false;
    this.isMultiple = this.selectElement.getAttribute('multiple') != null ? true : false;

    this.selectElement.addEventListener('jschange', () => {
      if (this.selectElement.value == '') {
        this.selectedOptions = [];
        this.inputElement.value = '';
        this.inputElement.size = Math.max(this.inputElement.value.length + 1, 1);
        this.showPlaceholder();
        this.fillList(this.options);
      }
      if (this.isMultiple) {
        this.setOptions();
        const selectedOptions = Array.from(this.selectElement.selectedOptions);
        this.selectedOptions = this.options.filter((o) => {
          if (selectedOptions.find((so) => so.value == o.value)) {
            return o;
          }
        });
        this.showSelectedOptions();
        this.fillList(this.options);
      }
    });

    this.autocompleteElement = document.createElement('div');
    this.autocompleteElement.classList.add(...this.cssClasses.autocomplete.split(' '));
    if (this.isDisabled) {
      this.autocompleteElement.classList.add('disabled');
    }

    this.autocompleteSelectElement = document.createElement('div');
    this.autocompleteSelectElement.classList.add('autocomplete__select');
    this.autocompleteSelectElement.classList.add(...this.cssClasses.autocompleteSelectCore.split(' '));
    this.autocompleteSelectElement.classList.add(...this.cssClasses.autocompleteSelect.split(' '));
    this.autocompleteElement.insertAdjacentElement('beforeend', this.autocompleteSelectElement);
    Array.from(this.selectElement.classList).forEach((c) => {
      this.autocompleteSelectElement.classList.add(c);
    });

    this.autocompleteListReference = autocomplete.hasAttribute('data-autocomplete-reference')
      ? document.querySelector(autocomplete.getAttribute('data-autocomplete-reference'))
      : this.autocompleteElement;

    this.autocompleteSelectElement.addEventListener('click', () => {
      if (!this.isDisabled) {
        this.hidePlaceholder();
        this.inputElement.focus();
        this.showMenu();
      }
    });

    this.autocompletePlaceholderElement = document.createElement('div');
    this.autocompletePlaceholderElement.classList.add(...this.cssClasses.autocompleteSelectPlaceholder.split(' '));
    this.autocompletePlaceholderElement.setAttribute('aria-hidden', 'true');

    this.autocompleteInputWrapper = document.createElement('div');
    this.autocompleteInputWrapper.classList.add(...this.cssClasses.autocompleteInputWrapper.split(' '));
    this.autocompleteInputWrapper.classList.add('has-placeholder');
    this.autocompleteInputWrapper.insertAdjacentElement('beforeend', this.autocompletePlaceholderElement);
    this.autocompleteSelectElement.insertAdjacentElement('beforeend', this.autocompleteInputWrapper);

    this.inputElement = document.createElement('input');
    this.inputElement.setAttribute('aria-controls', `autocompleteList${this.autocompleteListIndex}`);
    this.inputElement.setAttribute('autocapitalize', 'none');
    this.inputElement.setAttribute('type', 'text');
    this.inputElement.setAttribute('autocomplete', 'off');
    this.inputElement.setAttribute('aria-autocomplete', 'list');
    this.inputElement.setAttribute('role', 'combobox');
    this.inputElement.setAttribute('aria-expanded', 'false');
    this.inputElement.setAttribute('data-dont-validate', 'true');
    this.inputElement.classList.add('no-hook');
    this.inputElement.classList.add(...this.cssClasses.autocompleteSelectInput.split(' '));
    this.inputElement.size = 1;
    if (this.selectElement.hasAttribute('id')) {
      this.inputElement.setAttribute('id', this.selectElement.getAttribute('id'));
      this.selectElement.removeAttribute('id');
    }

    this.inputKeyUpListener = this.onKeyUp.bind(this);
    this.inputElement.addEventListener('keyup', this.inputKeyUpListener);

    this.inputKeyDownListener = this.onKeyDown.bind(this);
    this.inputElement.addEventListener('keydown', this.inputKeyDownListener);

    this.inputFocusListener = this.onFocus.bind(this);
    this.inputElement.addEventListener('focus', this.inputFocusListener);

    this.inputBlurListener = this.onBlur.bind(this);
    this.inputElement.addEventListener('blur', this.inputBlurListener);

    this.autocompleteInputWrapper.insertAdjacentElement('beforeend', this.inputElement);

    const icon = document.createElement('button');
    icon.classList.add(...this.cssClasses.autocompleteDropDownIcon.split(' '));
    icon.classList.add(...this.cssClasses.autocompleteDropDownIconAfter.split(' '));
    icon.setAttribute('aria-label', 'Open');
    icon.setAttribute('tabindex', '-1');
    icon.setAttribute('type', 'button');

    icon.addEventListener('click', (e) => {
      e.preventDefault();
      if (!this.isDisabled) {
        e.stopPropagation();
        this.toggleMenu();
        this.inputElement.focus();
      }
    });

    this.autocompleteSelectElement.insertAdjacentElement('beforeend', icon);

    this.autocompleteListElement = document.createElement('ul');
    this.autocompleteListElement.setAttribute('id', `autocompleteList${this.autocompleteListIndex}`);
    this.autocompleteListElement.setAttribute('role', 'listbox');
    this.autocompleteListElement.classList.add(...this.cssClasses.autocompleteListCore.split(' '));
    this.autocompleteListElement.classList.add(...this.cssClasses.autocompleteList.split(' '));
    this.autocompleteListElement.classList.add('hidden');
    if (this.isMultiple) {
      this.autocompleteListElement.setAttribute('aria-multiselectable', 'true');
    }

    this.menuClickListener = this.onMenuClick.bind(this);
    this.autocompleteListElement.addEventListener('click', this.menuClickListener);

    this.autocompleteListReference.insertAdjacentElement('beforeend', this.autocompleteListElement);

    this.setOptions();
    this.fillList(this.options);

    if (this.isFreeType) {
      this.freeTypeOption = document.createElement('option');
      this.selectElement.insertAdjacentElement('afterbegin', this.freeTypeOption);
    }

    this.statusElement = document.createElement('div');
    this.statusElement.setAttribute('aria-live', 'polite');
    this.statusElement.setAttribute('role', 'status');
    this.statusElement.classList.add('sr-only');

    this.autocompleteElement.insertAdjacentElement('beforeend', this.statusElement);

    this.selectElement.insertAdjacentElement('afterend', this.autocompleteElement);

    const wrapperStyles = window.getComputedStyle(this.autocompleteInputWrapper);
    this.inputElement.style.maxWidth = `${
      this.autocompleteInputWrapper.clientWidth -
      parseFloat(wrapperStyles.paddingLeft) -
      parseFloat(wrapperStyles.paddingRight)
    }px`;

    this.selectElement.setAttribute('aria-hidden', 'true');
    this.selectElement.setAttribute('tabindex', '-1');
    this.selectElement.classList.add('hidden');

    if (this.isMultiple) {
      this.clearOptionClickListener = this.onClickClearOption.bind(this);
      this.clearOptionKeyDownListener = this.onKeyDownClearOption.bind(this);
      if (this.selectedOptions.length > 0) {
        this.hidePlaceholder();
        this.showSelectedOptions();
      }
    }

    this.documentClickListener = this.onDocumentClick.bind(this);
    document.addEventListener('click', this.documentClickListener);
  }

  private getLang() {
    if (this.siteLang && typeof this.siteLang === 'string') {
      if (/^[a-zA-Z-]+$/.test(this.siteLang)) {
        import(`../i18n/s-autocomplete-${this.siteLang}.json`)
          .then((lang) => {
            this.lang = lang;
          })
          .catch((error) => {
            console.error('Error loading language file:', error);
          });
      } else {
        throw new Error(`Invalid siteLang value: ${this.siteLang}`);
      }
    }
  }

  private selectMutation(mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
      } else if (mutation.type === 'attributes') {
        switch (mutation.attributeName) {
          case 'disabled':
            this.isDisabled = this.selectElement.getAttribute('disabled') != null ? true : false;
            if (this.isDisabled) {
              this.autocompleteElement.classList.add('disabled');
            } else {
              this.autocompleteElement.classList.remove('disabled');
            }
            break;
          case 'class':
            this.autocompleteSelectElement.classList.remove(
              ...Array.from(this.autocompleteSelectElement.classList).filter((c) => c !== 'autocomplete__select')
            );
            this.autocompleteSelectElement.classList.add(
              ...Array.from(this.selectElement.classList).filter((c) => c !== 'hidden')
            );
            this.autocompleteSelectElement.classList.add(...this.cssClasses.autocompleteSelectCore.split(' '));
            this.autocompleteSelectElement.classList.add(...this.cssClasses.autocompleteSelect.split(' '));
            break;
        }
      }
    }
  }

  private setOptions() {
    this.options = [];
    Array.from(this.selectElement.querySelectorAll('option')).forEach((option, index) => {
      if (option.value !== '') {
        this.options.push({
          text: option.innerText,
          value: option.value,
          class: option.getAttribute('class') || '',
        });

        if (option.selected) {
          this.selectedOptions.push(this.options[this.options.length - 1]);

          if (!this.isMultiple) {
            this.hidePlaceholder();
            this.inputElement.value = option.innerText;
            this.inputElement.size = Math.max(this.inputElement.value.length + 1, 1);
          }
        }
      } else {
        if (index === 0) {
          this.autocompletePlaceholderElement.innerText = option.innerText;
        }
      }
    });
  }

  private fillList(optionList: Array<AutocompleteOption>) {
    this.autocompleteListElement.innerHTML = '';

    optionList.forEach((option, index) => {
      const item = document.createElement('li');
      item.setAttribute('role', 'option');
      item.setAttribute('data-option-value', option.value);
      item.setAttribute('id', `option-${this.autocompleteListIndex}-${index}`);
      item.setAttribute('class', option.class);
      item.classList.add(...this.cssClasses.autocompleteOption.split(' '));
      item.classList.add(...this.cssClasses.autocompleteOptionAfter.split(' '));

      if (this.selectedOptions.find((o) => o.value == option.value)) {
        item.setAttribute('aria-selected', 'true');
      } else {
        item.setAttribute('aria-selected', 'false');
      }
      item.innerText = option.text;
      this.autocompleteListElement.insertAdjacentElement('beforeend', item);
    });
    // update the live region
    this.updateStatus(optionList.length);
  }

  private onKeyUp(e) {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case ' ':
      case 'Shift':
        break;
      case 'Escape':
        if (this.autocompleteListElement.classList.contains('hidden')) {
          this.inputElement.value = '';
        } else {
          this.hideMenu();
        }
        break;
      case 'Enter':
        e.preventDefault();
        // Select the currently highlighted option and focus the text box.
        if (this.hoverOption) {
          this.selectOption(this.hoverOption);
        }
        break;
      case 'Tab':
        // Hide the menu.
        this.hideMenu();
        break;
      case 'ArrowUp':
        e.preventDefault();
        // If the first option is focused, set focus to the text box. Otherwise set focus to the previous option.
        if (this.autocompleteListElement.classList.contains('hidden')) {
          this.onTextBoxDownPressed(e);
        } else {
          if (this.hoverOption) {
            let previousSib = this.hoverOption.previousElementSibling;
            if (this.hoverOption && previousSib) {
              if (previousSib.classList.contains('currently-selected-divider')) {
                previousSib = previousSib.previousElementSibling || (this.autocompleteListElement.lastChild as Element);
              }
              this.highlightOption(previousSib as HTMLElement);
            } else {
              this.highlightOption(this.autocompleteListElement.lastChild as HTMLElement);
            }
          } else {
            this.highlightOption(this.autocompleteListElement.lastChild as HTMLElement);
          }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (this.autocompleteListElement.classList.contains('hidden')) {
          this.onTextBoxDownPressed(e);
        } else {
          // Focus the next menu option. If it’s the last menu option, do nothing.
          if (this.hoverOption) {
            let nextSib = this.hoverOption.nextElementSibling;
            if (this.hoverOption && nextSib) {
              if (nextSib.classList.contains('currently-selected-divider')) {
                nextSib = nextSib.nextElementSibling || (this.autocompleteListElement.lastChild as Element);
              }
              this.highlightOption(nextSib as HTMLElement);
            } else {
              this.highlightOption(this.autocompleteListElement.firstChild as HTMLElement);
            }
          } else {
            this.highlightOption(this.autocompleteListElement.firstChild as HTMLElement);
          }
        }
        break;
      default:
        this.onTextBoxType(e);
    }
  }

  private onKeyDown(e) {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (this.isFreeType) {
          this.hideMenu();
        }
        break;
      case 'Backspace':
        if (this.inputElement.value == '' && this.isMultiple && this.selectedOptions.length > 0) {
          this.selectedOptions.pop();
          this.showSelectedOptions();
        }
        break;
      case 'ArrowLeft':
        if (this.isMultiple && this.selectedOptions.length > 0) {
          const closeBtn = Array.from(
            this.autocompleteInputWrapper.querySelectorAll('.close-btn')
          ).pop() as HTMLElement;
          closeBtn.focus();
        }
        break;
      case 'Tab':
        if (this.hoverOption) {
          this.selectOption(this.hoverOption);
        }
        this.hideMenu();
        break;
    }
    this.inputElement.size = Math.max(this.inputElement.value.length + 1, 1);
  }

  private onFocus(e) {
    this.hidePlaceholder();
    this.autocompleteSelectElement.classList.add('autocomplete__select--focused');
    this.inputElement.size = Math.max(this.inputElement.value.length + 1, 1);
  }

  private onBlur(e) {
    if (this.inputElement.value == '') {
      this.showPlaceholder();
    }
    this.autocompleteSelectElement.classList.remove('autocomplete__select--focused');
    if (this.isMultiple) {
      if (this.selectedOptions.length > 0) {
        this.hidePlaceholder();
      }
    } else {
      if (this.inputElement.value == '' && this.selectedOptions.length > 0) {
        this.selectedOptions = [];
        this.selectElement.value = null;
        this.fillList(this.options);
        this.selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        if (
          !this.isFreeType &&
          this.selectedOptions.length > 0 &&
          this.inputElement.value !== this.selectedOptions[0].text
        ) {
          this.inputElement.value = this.selectedOptions[0].text;
          this.inputElement.size = Math.max(this.inputElement.value.length + 1, 1);
        }
        if (!this.isFreeType && this.selectedOptions.length == 0 && this.inputElement.value !== '') {
          this.inputElement.value = '';
          this.inputElement.size = Math.max(this.inputElement.value.length + 1, 1);
        }
      }
    }
  }

  private onDocumentClick(e) {
    if (!this.autocompleteElement.contains(e.target)) {
      this.hideMenu();
    }
  }

  private onTextBoxType(e) {
    // only show options if user typed something
    let options = this.options;
    if (this.inputElement.value.trim().length > 0) {
      options = this.getOptions(this.inputElement.value.trim().toLowerCase());
    }
    if (this.isFreeType) {
      const optionMatch = options.find(
        (o) => o.value === this.inputElement.value.trim() || o.text === this.inputElement.value.trim()
      );
      if (optionMatch) {
        this.inputElement.value = optionMatch.text;
        this.selectedOptions = [optionMatch];
        this.selectElement.value = optionMatch.text;
      } else {
        if (this.inputElement.value.trim() !== '') {
          options.unshift({
            text: this.inputElement.value.trim(),
            value: this.inputElement.value.trim(),
            class: '',
          });
          this.freeTypeOption.value = this.inputElement.value.trim();
          this.freeTypeOption.innerText = this.inputElement.value.trim();
          this.selectElement.value = this.inputElement.value.trim();
          this.selectedOptions = [
            { text: this.freeTypeOption.textContent, value: this.freeTypeOption.value, class: '' },
          ];
        }
      }
    }

    this.fillList(options);
    this.showMenu();
  }

  private onTextBoxDownPressed(e) {
    let options = this.options;
    // if (this.inputElement.value.trim().length > 0) {
    //   options = this.getOptions(this.inputElement.value.trim().toLowerCase());
    // }
    if (this.isFreeType) {
      const optionMatch = options.find((o) => o.text === this.inputElement.value.trim());
      if (optionMatch) {
        this.inputElement.value = optionMatch.text;
        this.selectedOptions = [optionMatch];
        this.selectElement.value = optionMatch.text;
      } else {
        if (this.inputElement.value.trim() !== '') {
          options.unshift({
            text: this.inputElement.value.trim(),
            value: this.inputElement.value.trim(),
            class: '',
          });
        }
      }
    }
    this.fillList(options);
    this.showMenu();
    if (options.length > 0) {
      // highlight the first option
      let option = this.getOption(options[0].value);
      if (e.key == 'ArrowUp') {
        option = this.getOption(options[options.length - 1].value);
      }
      this.highlightOption(option as HTMLElement);
    }
  }

  private onMenuClick(e) {
    let item = e.target.closest('[role=option]');
    if (!item) return;

    this.selectOption(item);
  }

  private toggleMenu() {
    this.autocompleteListElement.classList.toggle('hidden');
    if (this.autocompleteListElement.classList.contains('hidden')) {
      this.inputElement.setAttribute('aria-expanded', 'false');
      this.inputElement.removeAttribute('aria-activedescendant');
    } else {
      this.inputElement.setAttribute('aria-expanded', 'true');
      this.positionMenu();
    }
  }

  private showMenu() {
    this.highlightOption(null);
    this.autocompleteListElement.classList.remove('hidden');
    this.inputElement.setAttribute('aria-expanded', 'true');
    this.positionMenu();
    this.selectElement.dispatchEvent(new CustomEvent('autocompleteShowMenu', { bubbles: true }));
  }

  private hideMenu() {
    this.autocompleteListElement.classList.add('hidden');
    this.inputElement.setAttribute('aria-expanded', 'false');
    this.inputElement.removeAttribute('aria-activedescendant');
    this.selectElement.dispatchEvent(new CustomEvent('autocompleteHideMenu', { bubbles: true }));
  }

  private positionMenu() {
    const _self = this;
    computePosition(this.autocompleteElement, this.autocompleteListElement, {
      placement: 'bottom-start',
      middleware: [flip()],
    }).then(({ x, y }) => {
      Object.assign(this.autocompleteListElement.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  }

  private showPlaceholder() {
    this.autocompletePlaceholderElement.classList.remove('hidden');
    this.autocompleteInputWrapper.classList.add('has-placeholder');
  }

  private hidePlaceholder() {
    this.autocompletePlaceholderElement.classList.add('hidden');
    this.autocompleteInputWrapper.classList.remove('has-placeholder');
  }

  private selectOption(option: HTMLElement) {
    const value = option.getAttribute('data-option-value');
    const optionElements = Array.from(this.autocompleteListElement.querySelectorAll('[role=option]'));
    optionElements.forEach((o) => {
      o.setAttribute('aria-selected', 'false');
    });
    if (this.isMultiple) {
      this.inputElement.value = '';
      this.inputElement.size = 1;
      if (this.selectedOptions.find((so) => so.value == value)) {
        this.selectedOptions = this.selectedOptions.filter((so) => so.value !== value);
      } else {
        this.selectedOptions = [...this.selectedOptions, this.options.find((o) => o.value == value)];
      }
      this.showSelectedOptions();
    } else {
      this.selectElement.value = value;
      this.selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      this.inputElement.value = option.innerText;
      if (this.isFreeType) {
        this.selectedOptions = [{ text: option.innerText, value: value, class: '' }];
      } else {
        this.selectedOptions = [this.options.find((o) => o.value == value)];
      }
    }

    optionElements.forEach((o) => {
      if (this.selectedOptions.find((so) => so.value == o.getAttribute('data-option-value'))) {
        o.setAttribute('aria-selected', 'true');
      }
    });
    this.hideMenu();
    this.hidePlaceholder();

    this.hoverOption = null;
    this.inputElement.focus();
    this.inputElement.size = Math.max(this.inputElement.value.length + 1, 1);
  }

  private showSelectedOptions() {
    Array.from(this.autocompleteInputWrapper.querySelectorAll('.autocomplete__selection')).forEach((s) => {
      s.parentElement.removeChild(s);
    });

    [...this.selectedOptions].reverse().forEach((so) => {
      const selection = document.createElement('div');
      selection.classList.add('autocomplete__selection');
      selection.classList.add(...this.cssClasses.autocompleteSelectionCore.split(' '));
      selection.classList.add(...this.cssClasses.autocompleteSelection.split(' '));
      const text = document.createElement('span');
      text.classList.add('text');
      text.classList.add(...this.cssClasses.autocompleteSelectionText.split(' '));
      text.innerHTML = so.text;
      selection.insertAdjacentElement('beforeend', text);
      const closeBtn = document.createElement('button');
      closeBtn.classList.add('close-btn');
      closeBtn.classList.add(...this.cssClasses.autocompleteSelectionCloseBtn.split(' '));
      closeBtn.classList.add(...this.cssClasses.autocompleteSelectionCloseBtnAfter.split(' '));
      closeBtn.setAttribute('data-value', so.value);
      closeBtn.setAttribute('aria-label', `${this.lang.removeOption} ${so.text}`);
      closeBtn.setAttribute('role', 'button');
      closeBtn.addEventListener('click', this.clearOptionClickListener);
      closeBtn.addEventListener('keydown', this.clearOptionKeyDownListener);
      selection.insertAdjacentElement('beforeend', closeBtn);
      this.autocompleteInputWrapper.insertAdjacentElement('afterbegin', selection);
    });

    Array.from(this.selectElement.querySelectorAll('option')).forEach((o) => {
      o.selected = this.selectedOptions.find((so) => so.value == o.value) !== undefined;
    });

    if (this.selectedOptions.length > 0) {
      this.hidePlaceholder();
    }

    this.selectElement.dispatchEvent(new Event('change', { bubbles: true }));
  }

  private onClickClearOption(e) {
    const target = (e.currentTarget || e.target) as HTMLElement;
    const value = target.getAttribute('data-value');

    this.selectedOptions = this.selectedOptions.filter((so) => so.value !== value);
    this.showSelectedOptions();
    this.fillList(this.options);
  }

  private onKeyDownClearOption(e) {
    const closeBtns: Array<HTMLElement> = Array.from(this.autocompleteInputWrapper.querySelectorAll('.close-btn'));
    const index = closeBtns.indexOf(e.currentTarget || e.target);
    const value = (e.currentTarget || e.target).getAttribute('data-value');

    switch (e.key) {
      case 'ArrowLeft':
        if (index > 0) {
          closeBtns[index - 1].focus();
        }
        break;
      case 'ArrowRight':
        if (index < closeBtns.length - 1) {
          closeBtns[index + 1].focus();
        }
        if (index == closeBtns.length - 1) {
          this.inputElement.focus();
        }
        break;
    }
  }

  private updateStatus(nbr: number) {
    if (this.statusElement) {
      this.statusElement.innerText = `${nbr} ${this.lang.resultsAvailable}`;
    }
  }

  private getOption(value: string) {
    return this.autocompleteListElement.querySelector(`[data-option-value="${value}"]`);
  }

  private highlightOption(option: HTMLElement) {
    if (this.hoverOption) {
      this.hoverOption.classList.remove('highlight');
    }
    if (option) {
      option.classList.add('highlight');
      this.autocompleteListElement.scrollTop = option.offsetTop;
      this.inputElement.setAttribute('aria-activedescendant', option.id);
    }
    this.hoverOption = option;
  }

  private getOptions(value) {
    return this.options.filter(
      (o) =>
        o.text.trim().toLowerCase().indexOf(value.toLowerCase()) > -1 ||
        o.text
          .trim()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .indexOf(value.toLowerCase()) > -1
    );
  }
}
