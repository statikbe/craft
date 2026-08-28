import { ValidationPlugin } from './plugin.interface';
import { DOMHelper } from '../../utils/domHelper';

export class CountdownPlugin implements ValidationPlugin {
  constructor() {}

  public initElement() {
    const countdowns = document.querySelectorAll('[data-countdown]');
    Array.from(countdowns).forEach((countdown) => {
      this.initCountdown(countdown);
    });

    DOMHelper.onDynamicContent(document.documentElement, '[data-countdown]', (countdowns: NodeListOf<Element>) => {
      countdowns.forEach((countdown) => {
        this.initCountdown(countdown);
      });
    });
  }

  private initCountdown(countdown: Element) {
    const countdownNotifier = document.getElementById(countdown.getAttribute('data-countdown'));
    const countdownNotifierChange = countdownNotifier
      ? countdownNotifier.querySelector('[data-countdown-count]')
      : null;
    const maxLength = parseInt(countdown.getAttribute('maxlength'));
    if (!countdownNotifier || !countdownNotifierChange || !maxLength) {
      console.warn('Make sure your data-countdown element exists and it has a child span.');
    } else {
      countdown.addEventListener('keyup', (e) => {
        const valLength = (e.target as HTMLTextAreaElement).value.length;
        if (valLength > 0) {
          countdownNotifier.classList.remove('hidden');
          countdownNotifierChange.innerHTML = `${maxLength - valLength}/${maxLength}`;
        } else {
          countdownNotifier.classList.add('hidden');
        }
      });
    }
  }
}
