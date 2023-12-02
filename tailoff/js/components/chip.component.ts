import { A11yUtils } from '../utils/a11y';
import { SiteLang } from '../utils/site-lang';
import { computePosition, flip, shift, size, autoUpdate } from '@floating-ui/dom';

export class ChipComponent {
  constructor() {
    const chips = Array.from(document.querySelectorAll('[data-s-chip]'));
    chips.forEach((chip, index) => {
      new ChipElement(chip as HTMLElement, index);
    });
  }
}

class ChipElement {
  private siteLang = SiteLang.getLang();
  private lang;
  private element: HTMLElement;
  private triggerWrapperElement: HTMLDivElement;
  private triggerElement: HTMLButtonElement;
  private triggerTextElement: HTMLElement;
  private triggerClearElement: HTMLButtonElement;
  private modalElement: HTMLElement;
  private modalCloseElement: HTMLButtonElement;
  private modalClearElement: HTMLButtonElement;
  private bubbleElement: HTMLDivElement;
  private toggleListener;
  private changeListener;
  private externalChangeListener;
  private clearListener;
  private escapeListener;
  private clickOutsideListener;
  private name: string;
  private selected: string;
  private index: Number;
  private showClearInButton: boolean;
  private showClearInModal: boolean;
  private showCloseButton: boolean;
  private showBubble: boolean;
  private closeOnChange: boolean;
  private prefixId: string;

  private modalMinWidth = 300;

  constructor(element: HTMLElement, index) {
    this.element = element;
    this.index = index;

    this.showClearInButton = this.element.hasAttribute('data-s-chip-show-clear-in-button')
      ? this.element.getAttribute('data-s-chip-show-clear-in-button') === 'true'
      : true;
    this.showClearInModal = this.element.hasAttribute('data-s-chip-show-clear-in-modal')
      ? this.element.getAttribute('data-s-chip-show-clear-in-modal') === 'true'
      : true;
    this.showCloseButton = this.element.hasAttribute('data-s-chip-show-close-button')
      ? this.element.getAttribute('data-s-chip-show-close-button') === 'true'
      : true;
    this.showBubble = this.element.hasAttribute('data-s-chip-show-bubble')
      ? this.element.getAttribute('data-s-chip-show-bubble') === 'true'
      : true;
    this.closeOnChange = this.element.hasAttribute('data-s-chip-close-on-change')
      ? this.element.getAttribute('data-s-chip-close-on-change') === 'true'
      : true;
    this.prefixId = this.element.hasAttribute('data-s-chip-prefix')
      ? this.element.getAttribute('data-s-chip-prefix')
      : '';

    this.toggleListener = this.toggleAction.bind(this);
    this.changeListener = this.changeAction.bind(this);
    this.externalChangeListener = this.externalChangeAction.bind(this);
    this.clearListener = this.clearAction.bind(this);
    this.escapeListener = this.escapeAction.bind(this);
    this.clickOutsideListener = this.clickOutsideAction.bind(this);

    this.name = element.getAttribute('data-s-chip');

    this.getLang().then(() => {
      this.initComponents();
      this.initInputs();
      this.selected = this.getSelected();
      this.initTrigger();
      this.initModal();
      if (this.showBubble) {
        this.setBubbleCount();
      }
    });
  }

  private async getLang() {
    this.lang = await import(`../i18n/s-chip-${this.siteLang}.json`);
  }

  private initComponents() {
    this.modalElement = document.createElement('div');
    while (this.element.childNodes.length > 0) {
      this.modalElement.appendChild(this.element.childNodes[0]);
    }
    this.modalElement.classList.add('hidden');
    this.modalElement.classList.add('chip__modal');
    this.element.insertAdjacentElement('afterbegin', this.modalElement);

    this.triggerWrapperElement = document.createElement('div');
    this.triggerWrapperElement.classList.add('chip__trigger-wrapper');

    this.triggerElement = document.createElement('button');
    this.triggerElement.type = 'button';
    this.triggerElement.classList.add('chip__trigger');
    this.triggerTextElement = document.createElement('span');
    this.triggerElement.insertAdjacentElement('beforeend', this.triggerTextElement);
    this.triggerElement.addEventListener('jschange', this.externalChangeListener);

    this.triggerWrapperElement.insertAdjacentElement('beforeend', this.triggerElement);

    if (this.prefixId.length > 0) {
      const prefixElement = document.getElementById(this.prefixId);
      if (prefixElement) {
        this.triggerElement.insertAdjacentElement('afterbegin', prefixElement);
      }
    }

    if (this.showClearInButton) {
      this.triggerClearElement = document.createElement('button');
      this.triggerClearElement.type = 'button';
      this.triggerClearElement.classList.add('hidden');
      this.triggerClearElement.classList.add('chip__trigger-clear');
      this.triggerClearElement.ariaLabel = this.lang.clear;
      const clearLabel = document.createElement('span');
      clearLabel.innerHTML = this.lang.clear;
      this.triggerClearElement.insertAdjacentElement('beforeend', clearLabel);
      this.triggerWrapperElement.insertAdjacentElement('beforeend', this.triggerClearElement);
    }

    if (this.showBubble) {
      this.bubbleElement = document.createElement('div');
      this.bubbleElement.classList.add('chip__bubble');
      this.bubbleElement.classList.add('hidden');
      this.triggerWrapperElement.insertAdjacentElement('beforeend', this.bubbleElement);
    }

    this.element.insertAdjacentElement('afterbegin', this.triggerWrapperElement);

    if (this.showCloseButton) {
      this.modalCloseElement = document.createElement('button');
      this.modalCloseElement.type = 'button';
      this.modalCloseElement.classList.add('chip__modal-close');
      this.modalCloseElement.ariaLabel = this.lang.modalClose;
      const closeLabel = document.createElement('span');
      closeLabel.innerHTML = this.lang.modalClose;
      this.modalCloseElement.insertAdjacentElement('beforeend', closeLabel);
      this.modalElement.insertAdjacentElement('afterbegin', this.modalCloseElement);
    }

    if (this.showClearInModal) {
      this.modalClearElement = document.createElement('button');
      this.modalClearElement.type = 'button';
      this.modalClearElement.classList.add('chip__modal-clear');
      this.modalClearElement.ariaLabel = this.lang.modalClear;
      if (this.element.hasAttribute('data-s-chip-modal-clear-label')) {
        this.modalClearElement.innerText = this.element.getAttribute('data-s-chip-modal-clear-label');
      }
      this.modalElement.insertAdjacentElement('beforeend', this.modalClearElement);
    }
  }

  private initTrigger() {
    this.triggerElement.setAttribute('aria-haspopup', 'dialog');
    if (this.showBubble) {
      this.triggerTextElement.innerText = this.name;
      this.triggerElement.setAttribute('aria-label', `${this.name}, ${this.lang.triggerNotSelectedLabel}`);
    } else {
      this.setTriggerLabel();
      this.setTriggerText();
    }
    this.setTriggerState();
    this.triggerElement.addEventListener('click', this.toggleListener);
    if (this.showClearInButton) {
      this.triggerClearElement.addEventListener('click', this.clearListener);
    }
  }

  private initModal() {
    this.modalElement.setAttribute('aria-modal', 'true');
    this.modalElement.setAttribute('role', 'dialog');
    const heading = this.modalElement.querySelector('h1,h2');
    const id = `chip-${this.index}-heading`;
    heading.id = id;
    this.modalElement.setAttribute('aria-labelledby', id);
    this.modalElement.setAttribute('tabindex', '-1');
  }

  private initInputs() {
    const inputs = this.modalElement.querySelectorAll('input');
    Array.from(inputs).forEach((input) => {
      const labelElement = this.modalElement.querySelector(`label[for=${input.id}]`);
      if (labelElement) {
        input.setAttribute('data-s-chip-input-label', labelElement.innerHTML.trim());
      }
    });
  }

  private toggleModal() {
    if (this.modalElement.classList.contains('hidden')) {
      this.modalElement.classList.remove('hidden');
      this.trapFocus();
      this.modalElement.addEventListener('change', this.changeListener);
      this.modalElement.addEventListener('jschange', this.changeListener);
      if (this.showCloseButton) this.modalCloseElement.addEventListener('click', this.toggleListener);
      if (this.showClearInModal) this.modalClearElement.addEventListener('click', this.clearListener);

      document.addEventListener('click', this.clickOutsideListener);
      document.addEventListener('keydown', this.escapeListener);
      this.positionModal();
    } else {
      this.modalElement.classList.add('hidden');
      this.modalElement.removeEventListener('change', this.changeListener);
      this.modalElement.removeEventListener('jschange', this.changeListener);
      if (this.showCloseButton) this.modalCloseElement.removeEventListener('click', this.toggleListener);
      if (this.showClearInModal) this.modalClearElement.removeEventListener('click', this.clearListener);

      document.removeEventListener('click', this.clickOutsideListener);
      document.removeEventListener('keydown', this.escapeListener);
      window.removeEventListener('resize', this.positionModal.bind(this));
    }
  }

  private trapFocus() {
    A11yUtils.keepFocus(this.modalElement);
    this.modalElement.focus();
  }

  private positionModal() {
    const _self = this;
    autoUpdate(this.triggerElement, this.modalElement, () => {
      computePosition(this.triggerElement, this.modalElement, {
        strategy: 'fixed',
        placement: 'bottom-start',
        middleware: [
          flip(),
          shift({ padding: 16 }),
          size({
            apply({ availableWidth, availableHeight, elements }) {
              // Do things with the data, e.g.
              Object.assign(elements.floating.style, {
                minWidth: `${Math.min(_self.modalMinWidth, availableWidth)}px`,
              });
            },
          }),
        ],
      }).then(({ x, y }) => {
        Object.assign(this.modalElement.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    });
  }

  private getTriggerText() {
    const count = this.getCount();
    switch (count) {
      case 0:
        return this.name;
      case 1:
        return this.selected;
      default:
        return `${this.selected} +${count - 1}`;
    }
  }

  private getTriggerLabel() {
    const count = this.getCount();
    switch (count) {
      case 0:
        return `${this.name}, ${this.lang.triggerNotSelectedLabel}`;
      case 1:
        return `${this.selected}, ${this.name}, ${this.lang.triggerSelectedLabel}`;
      default:
        return `${this.selected} +${count - 1}, ${this.name}, ${this.lang.triggerSelectedLabel}`;
    }
  }

  private setTriggerText() {
    const text = new DOMParser().parseFromString(this.getTriggerText(), "text/html");
    this.triggerTextElement.innerText = text.documentElement.textContent;
  }

  private setTriggerLabel() {
    const label = this.getTriggerLabel();
    this.triggerElement.setAttribute('aria-label', label);
  }

  private setBubbleCount() {
    const count = this.getCount();
    if (count > 0) {
      this.bubbleElement.innerText = `${count}`;
      this.bubbleElement.classList.remove('hidden');
      this.bubbleElement.classList.add('flex');
    } else {
      this.bubbleElement.classList.add('hidden');
      this.bubbleElement.classList.remove('flex');
    }
  }

  private getSelected() {
    const checked = this.modalElement.querySelector('input:checked');
    return checked ? checked.getAttribute('data-s-chip-input-label') : '';
  }

  private getCount() {
    const checked = this.modalElement.querySelectorAll('input:checked');
    return checked.length;
  }

  private setTriggerState() {
    if (this.selected && this.selected.length > 0) {
      this.element.classList.add('active');
      if (this.showClearInButton) {
        this.triggerClearElement.classList.remove('hidden');
      }
    } else {
      this.element.classList.remove('active');
      if (this.showClearInButton) {
        this.triggerClearElement.classList.add('hidden');
      }
    }
  }

  private toggleAction() {
    this.toggleModal();
  }

  private changeAction(event: Event) {
    const element = event.target as HTMLInputElement;
    const label = element.getAttribute('data-s-chip-input-label');

    if (element.checked) {
      if (element.getAttribute('type') === 'checkbox') {
        if (!this.selected) {
          this.selected = label;
        }
      } else {
        this.selected = label;
      }
    } else {
      if (this.selected === label) {
        this.selected = this.getSelected();
      }
    }

    if (this.showBubble) {
      this.setBubbleCount();
    } else {
      this.setTriggerText();
      this.setTriggerLabel();
    }
    this.setTriggerState();

    if (this.closeOnChange) {
      this.toggleModal();
    }
  }

  private externalChangeAction() {
    if (this.getCount() === 0) {
      this.selected = '';
    } else {
      this.selected = this.getSelected();
    }
    if (this.showBubble) {
      this.setBubbleCount();
    } else {
      this.setTriggerText();
      this.setTriggerLabel();
    }
    this.setTriggerState();
  }

  private clearAction(event) {
    const changeEvent = new Event('jschange', { bubbles: true });
    const checkedInputs = this.modalElement.querySelectorAll('input:checked');
    Array.from(checkedInputs).forEach((input: HTMLInputElement) => {
      input.checked = false;
      input.dispatchEvent(changeEvent);
    });
    this.selected = '';
    const input = this.modalElement.querySelector('input');
    input.dispatchEvent(changeEvent);

    if (this.showBubble) {
      this.setBubbleCount();
    } else {
      this.setTriggerText();
      this.setTriggerLabel();
    }
    this.setTriggerState();
  }

  private escapeAction(event) {
    if (event.keyCode === 27 || event.key === 'Escape') {
      this.toggleModal();
    }
  }

  private clickOutsideAction(event) {
    if (this.element.contains(event.target)) {
      return;
    }
    this.toggleModal();
  }
}
