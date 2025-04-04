import { DOMHelper } from '../utils/domHelper';

export default class AccordionComponent {
  private resizeObserver: ResizeObserver;
  constructor() {
    const accordions = Array.from(document.querySelectorAll('details'));

    accordions.forEach((accordion, index) => {
      if (accordion.classList.contains('[interpolate-size:allow-keywords]')) {
        this.initAccordionAnimation(accordion as HTMLDetailsElement);
      }
    });

    DOMHelper.onDynamicContent(document.documentElement, 'details', (accordions) => {
      accordions.forEach((accordion) => {
        if (accordion.classList.contains('[interpolate-size:allow-keywords]')) {
          this.initAccordionAnimation(accordion as HTMLDetailsElement);
        }
      });
    });

    const accordionsGroup = Array.from(document.querySelectorAll('[data-accordion-group]'));
    accordionsGroup.forEach((accordionGroup) => {
      this.initAccordionGroup(accordionGroup as HTMLDetailsElement);
    });

    DOMHelper.onDynamicContent(document.documentElement, '[data-accordion-group]', (accordionsGroup) => {
      accordionsGroup.forEach((accordionGroup) => {
        this.initAccordionGroup(accordionGroup as HTMLDetailsElement);
      });
    });
  }

  private initAccordionAnimation(accordion: HTMLDetailsElement) {
    if ('CSS' in window && !CSS.supports('interpolate-size:allow-keywords')) {
      accordion.style.height = accordion.scrollHeight + 'px';
      accordion.style.transition = 'height 300ms ease-in-out';
      accordion.dataset.height = accordion.scrollHeight + 'px';
      accordion.addEventListener('toggle', (e) => {
        if (accordion.open) {
          accordion.style.height = accordion.scrollHeight + 'px';
          const div = document.createElement('div');
          div.style.width = accordion.scrollWidth + 'px';
          div.style.visibility = 'hidden';
          div.style.position = 'absolute';
          div.style.overflow = 'hidden';
          div.insertAdjacentHTML('afterbegin', accordion.innerHTML);
          document.body.appendChild(div);
          accordion.style.height = div.getBoundingClientRect().height + 'px';
          div.remove();
        } else {
          accordion.style.height = accordion.dataset.height;
        }
      });
    }
  }

  private initAccordionGroup(accordionGroup: HTMLDetailsElement) {
    const accordions = accordionGroup.querySelectorAll('details');
    accordions.forEach((accordion: HTMLDetailsElement) => {
      accordion.addEventListener('toggle', (e) => {
        if ((e.target as any).open) {
          accordions.forEach((accordion: HTMLDetailsElement) => {
            if (accordion !== e.target) {
              (accordion as any).open = false;
            }
          });
        }
      });
    });
  }
}
