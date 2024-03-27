import { DOMHelper } from '../utils/domHelper';
import { computePosition, flip, shift, size, autoUpdate } from '@floating-ui/dom';

export class DropdownComponent {
  constructor() {
    const dropdowns = Array.from(document.querySelectorAll('.js-dropdown'));
    dropdowns.forEach((dropdown, index) => {
      new DropdownElement(dropdown as HTMLElement, index);
    });
  }
}

class DropdownElement {
  private clickListener;
  private keydownListener;
  private scrollListener;
  private buttonElement: HTMLElement;
  private menuElement: HTMLElement;
  private menuItems: Array<HTMLElement>;
  private popper;
  private open = false;

  private TAB_KEYCODE = 9;
  private ESC_KEYCODE = 27;
  private UP_ARROW_KEYCODE = 38;
  private DOWN_ARROW_KEYCODE = 40;

  constructor(element: HTMLElement, index) {
    element.style.position = 'relative';
    element.classList.remove('js-dropdown');
    this.buttonElement = element.querySelector('.js-dropdown-toggle');
    if (!this.buttonElement) {
      console.error('Dropdown button not found');
      return;
    }
    if (this.buttonElement.tagName !== 'BUTTON') {
      console.error('Dropdown button must be a <button> element');
      return;
    }
    this.menuElement = element.querySelector('.js-dropdown-menu');
    if (!this.menuElement) {
      console.error('Dropdown menu not found');
      return;
    }
    this.menuItems = Array.from(this.menuElement.querySelectorAll('a[href],button:not([disabled])'));

    this.menuElement.classList.add('hidden');
    if (this.menuElement.id === '') {
      this.menuElement.id = `dropdown-menu-${index}`;
    }
    this.menuElement.classList.add('fixed');
    this.buttonElement.setAttribute('aria-controls', this.menuElement.id);
    this.buttonElement.setAttribute('aria-expanded', 'false');

    this.clickListener = this.clickAction.bind(this);
    this.keydownListener = this.keydownAction.bind(this);
    this.scrollListener = this.scrollAction.bind(this);
    this.buttonElement.addEventListener('click', this.clickListener);
  }

  private toggleMenu() {
    if (this.menuElement.classList.contains('hidden')) {
      // Open
      this.open = true;
      this.menuElement.classList.remove('hidden');
      this.buttonElement.setAttribute('aria-expanded', 'true');
      this.positionMenu();

      document.addEventListener('click', this.clickListener);
      document.addEventListener('keydown', this.keydownListener);
      document.addEventListener('scroll', this.scrollListener);
    } else {
      // Close
      this.open = false;
      this.menuElement.classList.add('hidden');
      this.buttonElement.setAttribute('aria-expanded', 'false');

      document.removeEventListener('click', this.clickListener);
      document.removeEventListener('keydown', this.keydownListener);
      document.removeEventListener('scroll', this.scrollListener);
    }
  }

  private clickAction(e: Event) {
    e.stopPropagation();
    this.toggleMenu();
  }

  private scrollAction(e: Event) {
    this.positionMenu();
  }

  private keydownAction(event) {
    if (event.keyCode === this.ESC_KEYCODE) {
      event.preventDefault();
      this.buttonElement.focus();
      this.toggleMenu();
    }

    if (event.keyCode === this.UP_ARROW_KEYCODE) {
      event.preventDefault();
      if (this.menuItems[0] !== document.activeElement) {
        const activeMenuIndex = this.menuItems.findIndex((i) => i === document.activeElement);
        if (activeMenuIndex > 0) {
          this.menuItems[activeMenuIndex - 1].focus();
        }
      }
    }

    if (event.keyCode === this.DOWN_ARROW_KEYCODE) {
      event.preventDefault();
      if (this.menuItems[this.menuItems.length - 1] !== document.activeElement) {
        const activeMenuIndex = this.menuItems.findIndex((i) => i === document.activeElement);
        console.log(activeMenuIndex);

        if (activeMenuIndex < this.menuItems.length - 1) {
          this.menuItems[activeMenuIndex + 1].focus();
        }
      }
    }

    if (event.keyCode === this.TAB_KEYCODE && event.shiftKey && this.buttonElement === document.activeElement) {
      this.toggleMenu();
    }

    if (
      event.keyCode === this.TAB_KEYCODE &&
      !event.shiftKey &&
      this.menuItems[this.menuItems.length - 1] === document.activeElement
    ) {
      this.toggleMenu();
    }
  }

  private positionMenu() {
    const _self = this;
    autoUpdate(this.buttonElement, this.menuElement, () => {
      computePosition(this.buttonElement, this.menuElement, {
        strategy: 'fixed',
        placement: 'bottom-start',
        middleware: [
          flip(),
          shift({ padding: 16 }),
          size({
            apply({ availableWidth, availableHeight, elements }) {
              Object.assign(elements.floating.style, {
                minWidth: `${Math.min(_self.buttonElement.clientWidth, availableWidth)}px`,
              });
            },
          }),
        ],
      }).then(({ x, y }) => {
        Object.assign(this.menuElement.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    });
  }
}
