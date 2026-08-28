export default class CopyComponent {
  private toasterContainer: HTMLElement;
  private toasterDuration = 3000;

  constructor() {
    const triggers = document.querySelectorAll('[data-copy]');
    Array.from(triggers).forEach((trigger: HTMLElement) => {
      if (!trigger.classList.contains('copy-initialized')) {
        this.initTrigger(trigger);
      }
    });
  }

  private initTrigger(trigger: HTMLElement) {
    trigger.classList.add('copy-initialized');
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      this.copy(trigger);
    });
  }

  private async copy(trigger: HTMLElement) {
    const value = trigger.getAttribute('data-copy');
    if (!value) return;

    let text = value;
    if (value.startsWith('#')) {
      const target = document.querySelector(value) as HTMLElement;
      if (!target) {
        console.warn(`CopyComponent: no element found for selector "${value}"`);
        return;
      }
      text = (target as HTMLInputElement).value ?? target.textContent ?? '';
      text = text.trim();
    }

    try {
      await this.writeToClipboard(text);
      const feedback = trigger.getAttribute('data-copy-feedback');
      if (feedback) {
        this.showToaster(feedback);
      }
    } catch (err) {
      console.warn('CopyComponent: failed to copy to clipboard', err);
    }
  }

  private async writeToClipboard(text: string) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    // Fallback for non-secure contexts / older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (!successful) {
      throw new Error('execCommand copy failed');
    }
  }

  private getToasterContainer(): HTMLElement {
    let container = document.querySelector('.js-copy-toaster') as HTMLElement;
    if (!container) {
      container = document.createElement('div');
      container.classList.add('js-copy-toaster', 'c-toaster');
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }
    return container;
  }

  private showToaster(message: string) {
    const container = this.getToasterContainer();

    const toast = document.createElement('div');
    toast.classList.add('c-toaster__item');
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    container.appendChild(toast);

    // Trigger the enter transition on the next frame
    window.requestAnimationFrame(() => {
      toast.classList.add('c-toaster__item--visible');
    });

    window.setTimeout(() => {
      toast.classList.remove('c-toaster__item--visible');
      toast.addEventListener(
        'transitionend',
        () => {
          if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
          }
        },
        { once: true },
      );
    }, this.toasterDuration);
  }
}
