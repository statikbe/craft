import { DOMHelper } from '../utils/domHelper';
import { computePosition, flip, shift, size, autoUpdate } from '@floating-ui/dom';

// Main class to initialize all dropdowns on the page
export class DropdownComponent {
  constructor() {
    // Find all elements with the data-dropdown attribute
    const dropdowns = Array.from(document.querySelectorAll('[data-dropdown]'));
    // Initialize each dropdown
    dropdowns.forEach((dropdown, index) => {
      new DropdownElement(dropdown as HTMLElement, index);
    });
  }
}

// Class to handle individual dropdown functionality
class DropdownElement {
  private clickListener;
  private keydownListener;
  private scrollListener;
  private buttonElement: HTMLElement;
  private menuElement: HTMLElement;
  private menuItems: Array<HTMLElement>;
  private popper;
  private open = false;

  // Key codes for keyboard navigation
  private TAB_KEYCODE = 9;
  private ESC_KEYCODE = 27;
  private UP_ARROW_KEYCODE = 38;
  private DOWN_ARROW_KEYCODE = 40;

  constructor(element: HTMLElement, index) {
    element.style.position = 'relative';

    // Find the toggle button within the dropdown
    this.buttonElement = element.querySelector('[data-dropdown-toggle]');
    if (!this.buttonElement) {
      console.error('Dropdown button not found');
      return;
    }
    if (this.buttonElement.tagName !== 'BUTTON') {
      console.error('Dropdown button must be a <button> element');
      return;
    }

    // Find the menu element within the dropdown
    this.menuElement = element.querySelector('[data-dropdown-menu]');
    if (!this.menuElement) {
      console.error('Dropdown menu not found');
      return;
    }

    // Get all interactive elements within the menu
    this.menuItems = Array.from(this.menuElement.querySelectorAll('a[href],button:not([disabled])'));

    // Initially hide the menu
    this.menuElement.classList.add('hidden');

    // Assign an ID to the menu if it doesn't have one
    if (this.menuElement.id === '') {
      this.menuElement.id = `dropdown-menu-${index}`;
    }

    this.menuElement.classList.add('fixed');

    // Set ARIA attributes for accessibility
    this.buttonElement.setAttribute('aria-controls', this.menuElement.id);
    this.buttonElement.setAttribute('aria-expanded', 'false');

    // Bind event listeners
    this.clickListener = this.clickAction.bind(this);
    this.keydownListener = this.keydownAction.bind(this);
    this.scrollListener = this.scrollAction.bind(this);

    // Add click event listener to the button
    this.buttonElement.addEventListener('click', this.clickListener);
  }

  // Toggle the visibility of the dropdown menu
  private toggleMenu() {
    if (this.menuElement.classList.contains('hidden')) {
      // Open the menu
      this.open = true;
      this.menuElement.classList.remove('hidden');
      this.buttonElement.setAttribute('aria-expanded', 'true');
      this.positionMenu();

      // Add global event listeners when menu is open
      document.addEventListener('click', this.clickListener);
      document.addEventListener('keydown', this.keydownListener);
      document.addEventListener('scroll', this.scrollListener);
    } else {
      // Close the menu
      this.open = false;
      this.menuElement.classList.add('hidden');
      this.buttonElement.setAttribute('aria-expanded', 'false');

      // Remove global event listeners when menu is closed
      document.removeEventListener('click', this.clickListener);
      document.removeEventListener('keydown', this.keydownListener);
      document.removeEventListener('scroll', this.scrollListener);
    }
  }

  // Handle click events
  private clickAction(e: Event) {
    e.stopPropagation();
    this.toggleMenu();
  }

  // Handle scroll events
  private scrollAction(e: Event) {
    this.positionMenu();
  }

  // Handle keyboard navigation
  private keydownAction(event) {
    if (event.keyCode === this.ESC_KEYCODE) {
      // Close menu on ESC key
      event.preventDefault();
      this.buttonElement.focus();
      this.toggleMenu();
    }

    if (event.keyCode === this.UP_ARROW_KEYCODE) {
      // Navigate to previous item on UP ARROW
      event.preventDefault();
      if (this.menuItems[0] !== document.activeElement) {
        const activeMenuIndex = this.menuItems.findIndex((i) => i === document.activeElement);
        if (activeMenuIndex > 0) {
          this.menuItems[activeMenuIndex - 1].focus();
        }
      }
    }

    if (event.keyCode === this.DOWN_ARROW_KEYCODE) {
      // Navigate to next item on DOWN ARROW
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
      // Close menu when tabbing backwards from the first item
      this.toggleMenu();
    }

    if (
      event.keyCode === this.TAB_KEYCODE &&
      !event.shiftKey &&
      this.menuItems[this.menuItems.length - 1] === document.activeElement
    ) {
      // Close menu when tabbing forwards from the last item
      this.toggleMenu();
    }
  }

  // Position the menu using Floating UI
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
              // Ensure the menu is at least as wide as the button
              Object.assign(elements.floating.style, {
                minWidth: `${Math.min(_self.buttonElement.clientWidth, availableWidth)}px`,
              });
            },
          }),
        ],
      }).then(({ x, y }) => {
        // Position the menu
        Object.assign(this.menuElement.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    });
  }
}
