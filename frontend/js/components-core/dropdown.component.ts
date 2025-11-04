import { DOMHelper } from '../utils/domHelper';
import { computePosition, flip, shift, size, autoUpdate, Placement } from '@floating-ui/dom';

export default class DropdownComponent {
  constructor() {
    // Find all elements with the data-dropdown attribute
    const dropdowns = Array.from(document.querySelectorAll('[data-dropdown]'));
    // Initialize each dropdown
    dropdowns.forEach((dropdown, index) => {
      // Check if the dropdown is already initialized
      if (dropdown.hasAttribute('data-dropdown-initialized')) {
        return;
      }
      new DropdownElement(dropdown as HTMLElement, index);
    });

    DOMHelper.onDynamicContent(document.documentElement, '[data-dropdown]', (dropdowns) => {
      dropdowns.forEach((dropdown) => {
        // Check if the dropdown is already initialized
        if (dropdown.hasAttribute('data-dropdown-initialized')) {
          return;
        }
        new DropdownElement(dropdown as HTMLElement, dropdowns.length);
      });
    });
  }
}

// Class to handle individual dropdown functionality
class DropdownElement {
  private clickListener;
  private keydownListener;
  private scrollListener;
  private clickOutsideListener;
  private buttonElement: HTMLElement;
  private menuElement: HTMLElement;
  private positionElement: HTMLElement;
  private menuItems: Array<HTMLElement>;
  private placement: Placement;
  private strategy: 'fixed' | 'absolute' = 'absolute'; // Positioning strategy

  // Key codes for keyboard navigation

  constructor(dropdown: HTMLElement, index: number, placement: Placement = 'bottom-start') {
    // Find the toggle button within the dropdown
    if (!dropdown.hasAttribute('data-dropdown-trigger')) {
      console.error(
        'Please add data-dropdown-trigger to the dropdown element. Example: <div data-dropdown data-dropdown-trigger="button-id"><button id="button-id">Toggle</button><div>Menu</div></div>',
        dropdown
      );
      return;
    }
    this.buttonElement = document.getElementById(dropdown.getAttribute('data-dropdown-trigger'));
    if (!this.buttonElement) {
      console.error('Dropdown triggerbutton not found');
      return;
    }
    if (this.buttonElement.tagName !== 'BUTTON') {
      console.error('Dropdown button must be a <button> element');
      return;
    }

    // Find the menu element within the dropdown
    this.menuElement = dropdown;

    // Get placement from data attribute or use default
    const placementAttr = dropdown.getAttribute('data-dropdown-placement');
    this.placement = (placementAttr as Placement) || placement;

    if (dropdown.hasAttribute('data-dropdown-position-element')) {
      this.positionElement = document.getElementById(dropdown.getAttribute('data-dropdown-position-element'));
      if (!this.positionElement) {
        console.error('Position element not found for dropdown');
        return;
      }
    } else {
      this.positionElement = this.buttonElement;
    }

    if (dropdown.hasAttribute('data-dropdown-strategy')) {
      const strategy = dropdown.getAttribute('data-dropdown-strategy');
      if (strategy === 'absolute' || strategy === 'fixed') {
        this.strategy = strategy as 'absolute' | 'fixed';
      } else {
        console.error('Invalid data-dropdown-strategy value. Use "absolute" or "fixed".');
        return;
      }
    }

    // Get all interactive elements within the menu
    this.menuItems = Array.from(
      this.menuElement.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled])'
      )
    );

    // Initially hide the menu
    this.menuElement.classList.add('hidden');

    // Assign an ID to the menu if it doesn't have one
    if (this.menuElement.id === '') {
      this.menuElement.id = `dropdown-menu-${index}`;
    }

    // Set ARIA attributes for accessibility
    this.buttonElement.setAttribute('aria-controls', this.menuElement.id);
    this.buttonElement.setAttribute('aria-expanded', 'false');

    this.menuElement.classList.add(this.strategy);

    // Bind event listeners
    this.clickListener = this.clickAction.bind(this);
    this.keydownListener = this.keydownAction.bind(this);
    this.scrollListener = this.scrollAction.bind(this);
    this.clickOutsideListener = this.clickOutsideAction.bind(this);

    // Add click event listener to the button
    this.buttonElement.addEventListener('click', this.clickListener);

    if (this.menuElement.hasAttribute('open')) {
      this.positionMenu();
      this.buttonElement.setAttribute('aria-expanded', 'true');
      document.addEventListener('click', this.clickOutsideListener);
      document.addEventListener('keydown', this.keydownListener);
      document.addEventListener('scroll', this.scrollListener);
    }
    // Add data-dropdown-initialized attribute to prevent re-initialization
    dropdown.setAttribute('data-dropdown-initialized', 'true');
  }

  // Toggle the visibility of the dropdown menu
  private toggleMenu() {
    if (this.menuElement.getAttribute('open') === null) {
      // Open the menu
      this.menuElement.setAttribute('open', '');
      this.buttonElement.setAttribute('aria-expanded', 'true');
      this.positionMenu();

      // Add global event listeners when menu is open
      document.addEventListener('click', this.clickOutsideListener);
      document.addEventListener('keydown', this.keydownListener);
      document.addEventListener('scroll', this.scrollListener);
    } else {
      // Close the menu
      this.menuElement.removeAttribute('open');
      this.buttonElement.setAttribute('aria-expanded', 'false');

      // Remove global event listeners when menu is closed
      document.removeEventListener('click', this.clickOutsideListener);
      document.removeEventListener('keydown', this.keydownListener);
      document.removeEventListener('scroll', this.scrollListener);
    }
  }

  // Handle click events
  private clickAction(event: Event) {
    // event.stopPropagation();
    this.toggleMenu();
  }

  private clickOutsideAction(event: Event) {
    if (
      !this.menuElement.contains(event.target as Node) &&
      event.target !== this.buttonElement &&
      this.menuElement.hasAttribute('open')
    ) {
      this.toggleMenu();
    }
  }

  // Handle scroll events
  private scrollAction(e: Event) {
    this.positionMenu();
  }

  // Handle keyboard navigation
  private keydownAction(event) {
    if (event.key === 'Escape') {
      // Close menu on ESC key
      event.preventDefault();
      this.buttonElement.focus();
      this.toggleMenu();
    }

    if (event.key === 'ArrowUp') {
      // Navigate to previous item on UP ARROW
      event.preventDefault();
      if (this.menuItems[0] !== document.activeElement) {
        const activeMenuIndex = this.menuItems.findIndex((i) => i === document.activeElement);
        if (activeMenuIndex > 0) {
          this.menuItems[activeMenuIndex - 1].focus();
        }
      }
    }

    if (event.key === 'ArrowDown') {
      // Navigate to next item on DOWN ARROW
      event.preventDefault();
      if (this.menuItems[this.menuItems.length - 1] !== document.activeElement) {
        const activeMenuIndex = this.menuItems.findIndex((i) => i === document.activeElement);

        if (activeMenuIndex < this.menuItems.length - 1) {
          this.menuItems[activeMenuIndex + 1].focus();
        }
      }
    }

    if (event.key === 'Tab' && event.shiftKey && this.buttonElement === document.activeElement) {
      // Close menu when tabbing backwards from the first item
      this.toggleMenu();
    }

    if (
      event.key === 'Tab' &&
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
    autoUpdate(this.positionElement, this.menuElement, () => {
      computePosition(this.positionElement, this.menuElement, {
        strategy: _self.strategy,
        placement: _self.placement,
        middleware: [
          flip(),
          shift({ padding: 16 }),
          size({
            apply({ availableWidth, availableHeight, elements }) {
              // Ensure the menu is at least as wide as the button
              Object.assign(elements.floating.style, {
                minWidth: `${Math.min(_self.positionElement.clientWidth, availableWidth)}px`,
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
