export default class ToggleComponent {
  constructor() {
    const triggers = document.querySelectorAll('[data-toggle]');
    Array.from(triggers).forEach((t: HTMLElement) => {
      this.initToggleTrigger(t);
    });
  }

  private initToggleTrigger(trigger: HTMLElement) {
    const targetId = trigger.getAttribute('data-toggle');
    if (!targetId) {
      console.warn('Toggle trigger is missing data-toggle attribute');
      return;
    }
    const target = document.getElementById(targetId) as HTMLElement;
    if (!target) {
      console.warn(`Toggle target with id "${targetId}" not found`);
      return;
    }

    if (target.classList.contains('[interpolate-size:allow-keywords]')) {
      this.initAnimation(target as HTMLElement);
    }

    if (target.hasAttribute('open')) {
      trigger.setAttribute('aria-expanded', 'true');
    } else {
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.setAttribute('aria-controls', target.id);
    trigger.setAttribute('tabindex', '0');
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      this.checkGroupState(target);
      this.toggleAction(trigger, target);
    });
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.checkGroupState(target);
        this.toggleAction(trigger, target);
      }
    });

    target.addEventListener('open', () => {
      this.toggleAction(trigger, target, 'open');
    });

    target.addEventListener('close', () => {
      this.toggleAction(trigger, target, 'close');
    });
  }

  private checkGroupState(target: HTMLElement) {
    const group = target.getAttribute('data-toggle-group');
    if (group) {
      const groupElement = document.querySelector(`[data-toggle-group=${group}][open]`) as HTMLElement;
      if (groupElement && groupElement !== target) {
        const triggerElement = document.querySelector(`[data-toggle="${groupElement.id}"]`) as HTMLElement;
        if (triggerElement) {
          this.toggleAction(triggerElement, groupElement, 'close');
        }
      }
    }
  }

  private toggleAction(trigger, target, setState = '') {
    let expanded = trigger.getAttribute('aria-expanded') === 'true';
    if (setState === 'open') {
      expanded = false;
    } else if (setState === 'close') {
      expanded = true;
    }
    const linkedButtons = document.querySelectorAll(`[data-toggle='${target.id}']`);
    Array.from(linkedButtons).forEach((button) => {
      button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });

    if (trigger.getAttribute('data-toggle-scroll')) {
      const scrollToElement = document.querySelector(`${trigger.getAttribute('data-toggle-scroll')}`) as HTMLElement;
      if (scrollToElement) {
        window.scrollTo({
          top: scrollToElement.offsetTop,
          behavior: 'smooth',
        });
      }
    }

    if (expanded) {
      target.removeAttribute('open');
    } else {
      target.setAttribute('open', '');
    }
  }

  private initAnimation(target: HTMLElement) {
    if ('CSS' in window && !CSS.supports('interpolate-size:allow-keywords')) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'open') {
            if (target.hasAttribute('open')) {
              const div = document.createElement('div');
              div.style.width = target.scrollWidth + 'px';
              div.style.visibility = 'hidden';
              div.style.pointerEvents = 'none';
              div.style.position = 'absolute';
              div.style.overflow = 'hidden';
              div.insertAdjacentHTML('afterbegin', target.innerHTML);
              document.body.appendChild(div);
              target.style.height = div.getBoundingClientRect().height + 'px';
              div.remove();
            } else {
              target.style.height = '0px';
            }
          }
        });
      });
      observer.observe(target, { attributes: true, attributeFilter: ['open'] });
    }
  }
}
