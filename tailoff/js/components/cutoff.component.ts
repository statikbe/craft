import { DOMHelper } from '../utils/domHelper';

export class CutoffComponent {
  private animationSpeed = 400;

  constructor() {
    const triggers = document.querySelectorAll('[data-s-cutoff-trigger]');
    Array.from(triggers).forEach((t: HTMLElement) => {
      this.initCutoffTrigger(t);
    });

    DOMHelper.onDynamicContent(document.documentElement, '[data-s-cutoff-trigger]', (triggers) => {
      Array.from(triggers).forEach((t: HTMLElement) => {
        if (!t.classList.contains('cutoff-initialized')) {
          this.initCutoffTrigger(t);
        }
      });
    });
  }

  private initCutoffTrigger(trigger: HTMLElement) {
    const elementId = trigger.getAttribute('data-s-cutoff-trigger');
    const target = document.querySelector(elementId) as HTMLElement;
    const height = parseInt(target.getAttribute('data-s-cutoff-height'));
    const margin = parseInt(target.getAttribute('data-s-cutoff-margin')) ?? 0;
    const animation = target.getAttribute('data-s-cutoff-animation') ?? false;
    const changeClass = target.getAttribute('data-s-cutoff-class') ?? 'cutoff';

    if (height) {
      if (target.scrollHeight > height + (height * margin) / 100) {
        trigger.classList.add('cutoff-initialized');
        trigger.setAttribute('aria-controls', elementId);
        trigger.setAttribute('tabindex', '0');
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          this.expand(trigger, target, changeClass, animation);
        });
        target.style.maxHeight = `${height}px`;
        target.classList.add('overflow-hidden');

        target.addEventListener('open', () => {
          this.expand(trigger, target, changeClass, false);
        });
      } else {
        trigger.parentElement.removeChild(trigger);
        target.classList.remove(changeClass);
      }
    } else {
      console.error(
        `You need to define an attribute "data-s-cutoff-height" on the target element, in order for the cutoff plugin to work.`
      );
    }
  }

  private expand(trigger: HTMLElement, target: HTMLElement, changeClass, animation) {
    if (target.classList.contains(changeClass)) {
      trigger.parentElement.removeChild(trigger);
      if (animation) {
        this.showAnimated(target, changeClass, animation);
      } else {
        target.classList.remove(changeClass);
        target.style.maxHeight = '';
      }
    }
  }

  private showAnimated(el, changeClass, animation) {
    let speed = this.animationSpeed;

    if (parseInt(animation)) {
      speed = parseInt(animation);
    }
    el.style.transition = `max-height`;
    el.style.transitionDuration = `${speed}ms`;
    const height = this.getHeight(el);
    el.style.maxHeight = height;

    window.setTimeout(function () {
      el.style.maxHeight = '';
      el.classList.remove(changeClass);
    }, speed);
  }

  private getHeight(el) {
    const max = el.style.height;
    el.style.height = '';
    var height = el.scrollHeight + 'px';
    el.style.height = max;
    return height;
  }
}
