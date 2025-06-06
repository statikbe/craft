import { DOMHelper } from '../utils/domHelper';

export default class PasswordToggleComponent {
  constructor() {
    const items = document.querySelectorAll('[data-password-toggle]');
    Array.from(items).forEach((item) => {
      this.initToggleButton(item as HTMLButtonElement);
    });

    DOMHelper.onDynamicContent(
      document.documentElement,
      '[data-password-toggle]',
      (items: NodeListOf<HTMLButtonElement>) => {
        items.forEach((item) => {
          this.initToggleButton(item as HTMLButtonElement);
        });
      }
    );
  }

  private initToggleButton(button: HTMLButtonElement) {
    const input = document.querySelector(
      `input[name=${button.getAttribute('data-password-toggle')}]`
    ) as HTMLInputElement;
    if (!input) {
      console.warn(`No input found for password toggle with name: ${button.getAttribute('data-password-toggle')}`);
      return;
    }
    button.addEventListener('click', () => {
      if (input.getAttribute('type') === 'password') {
        input.setAttribute('type', 'text');
        button.setAttribute('aria-checked', 'true');
      } else {
        input.setAttribute('type', 'password');
        button.setAttribute('aria-checked', 'false');
      }
    });
  }
}
