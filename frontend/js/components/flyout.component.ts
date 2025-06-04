import { A11yUtils } from '../utils/a11y';
import { DOMHelper } from '../utils/domHelper';

export default class FlyoutComponent {
  constructor() {
    const flyoutTriggers = document.querySelectorAll('button[data-flyout]');
    if (flyoutTriggers.length) {
      flyoutTriggers.forEach((flyoutTrigger) => {
        new Flyout(flyoutTrigger as HTMLElement);
      });
    }

    DOMHelper.onDynamicContent(document.documentElement, 'button[data-flyout]', (flyoutTriggers) => {
      flyoutTriggers.forEach((flyoutTrigger) => {
        new Flyout(flyoutTrigger as HTMLElement);
      });
    });
  }
}

class Flyout {
  private modalElement: HTMLElement;
  private flyoutToggleButtonElement: HTMLElement;
  private flyoutCloseButtons: NodeListOf<HTMLElement>;
  private keyDownListener;

  constructor(flyoutTrigger) {
    this.flyoutToggleButtonElement = flyoutTrigger;
    this.modalElement = document.getElementById(flyoutTrigger.getAttribute('data-flyout'));
    if (this.modalElement && this.flyoutToggleButtonElement) {
      this.flyoutToggleButtonElement.setAttribute('aria-expanded', 'false');
      this.flyoutToggleButtonElement.setAttribute('aria-controls', this.modalElement.id);
      this.flyoutCloseButtons = document.querySelectorAll(
        `[data-flyout-close="${flyoutTrigger.getAttribute('data-flyout')}"]`
      ) as NodeListOf<HTMLElement>;
      Array.from(this.flyoutCloseButtons).forEach((button) => {
        button.setAttribute('aria-expanded', 'true');
        button.setAttribute('aria-controls', this.modalElement.id);
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.closeFlyout();
        });
        button.style.transition = 'none'; // Disable transition for immediate effect
        if (button.hasAttribute('data-flyout-close-inactive-class')) {
          button.classList.add(...button.getAttribute('data-flyout-close-inactive-class').split(' '));
        }
      });

      const hiddenElements = Array.from(this.modalElement.querySelectorAll('.hidden'));
      hiddenElements.forEach((el) => {
        if (el.nodeName === 'A') {
          el.classList.add('disabled');
        } else {
          el.setAttribute('disabled', '');
        }
        el.removeAttribute('tabindex');
      });

      this.flyoutToggleButtonElement.addEventListener('click', (e) => {
        e.preventDefault();
        const isExpanded = this.flyoutToggleButtonElement.getAttribute('aria-expanded') === 'true';
        this.flyoutToggleButtonElement.setAttribute('aria-expanded', String(!isExpanded));

        if (isExpanded) {
          this.closeFlyout();
          return;
        }

        this.modalElement.classList.remove('invisible');
        const innerCloseButton = this.modalElement.querySelector('button[data-flyout-close]') as HTMLButtonElement;
        innerCloseButton.focus();

        this.keyDownListener = this.onKeyDown.bind(this);
        document.addEventListener('keydown', this.keyDownListener);

        if (this.modalElement.hasAttribute('data-flyout-inactive-class')) {
          this.modalElement.classList.remove(
            ...this.modalElement.getAttribute('data-flyout-inactive-class').split(' ')
          );
        }
        if (this.modalElement.hasAttribute('data-flyout-active-class')) {
          this.modalElement.classList.add(...this.modalElement.getAttribute('data-flyout-active-class').split(' '));
        }
        if (this.modalElement.hasAttribute('data-flyout-body-active-class')) {
          document.body.classList.add(...this.modalElement.getAttribute('data-flyout-body-active-class').split(' '));
        }

        Array.from(this.flyoutCloseButtons).forEach((button) => {
          button.style.transition = '';
          if (button.hasAttribute('data-flyout-close-inactive-class')) {
            button.classList.remove(...button.getAttribute('data-flyout-close-inactive-class').split(' '));
          }
          if (button.hasAttribute('data-flyout-close-active-class')) {
            button.classList.add(...button.getAttribute('data-flyout-close-active-class').split(' '));
          }
          button.setAttribute('aria-expanded', 'false');
        });
      });

      if (this.modalElement.hasAttribute('data-flyout-inactive-class')) {
        this.modalElement.classList.add(...this.modalElement.getAttribute('data-flyout-inactive-class').split(' '));
      }

      A11yUtils.keepFocus(this.modalElement, true);
    } else {
      console.warn('Flyout modal element not found for trigger:', flyoutTrigger);
    }
  }

  private onKeyDown(e) {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.closeFlyout();
        break;
    }
  }

  private closeFlyout() {
    this.flyoutToggleButtonElement.focus();
    this.flyoutToggleButtonElement.setAttribute('aria-expanded', 'false');
    const onTransitionEnd = () => {
      this.modalElement.classList.add('invisible');
      this.modalElement.removeEventListener('transitionend', onTransitionEnd);
    };
    this.modalElement.addEventListener('transitionend', onTransitionEnd);
    document.removeEventListener('keydown', this.keyDownListener);

    Array.from(this.flyoutCloseButtons).forEach((button) => {
      if (button.hasAttribute('data-flyout-close-inactive-class')) {
        button.classList.add(...button.getAttribute('data-flyout-close-inactive-class').split(' '));
      }
      if (button.hasAttribute('data-flyout-close-active-class')) {
        button.classList.remove(...button.getAttribute('data-flyout-close-active-class').split(' '));
      }
      button.setAttribute('aria-expanded', 'false');
    });

    if (this.modalElement.hasAttribute('data-flyout-active-class')) {
      this.modalElement.classList.remove(...this.modalElement.getAttribute('data-flyout-active-class').split(' '));
    }
    if (this.modalElement.hasAttribute('data-flyout-inactive-class')) {
      this.modalElement.classList.add(...this.modalElement.getAttribute('data-flyout-inactive-class').split(' '));
    }
    if (this.modalElement.hasAttribute('data-flyout-body-active-class')) {
      document.body.classList.remove(...this.modalElement.getAttribute('data-flyout-body-active-class').split(' '));
    }
  }
}
