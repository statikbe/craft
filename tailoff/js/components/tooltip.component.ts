import tippy from 'tippy.js';

export class TooltipComponent {
  constructor() {
    if (document.querySelectorAll('[data-tippy-content]').length > 0 || document.querySelectorAll('[data-tippy-template]').length > 0) {
      this.initTippy();
    }
  }

  private async initTippy() {
    // @ts-ignore
    const tippy = await import('tippy.js');
    tippy.default('[data-tippy-content]', {
      aria: {
        content: 'describedby',
      },
    });
    tippy.default('[data-tippy-template]', {
      content(reference) {
        const id = reference.getAttribute('data-tippy-template');
        const template = document.getElementById(id);
        return template.innerHTML;
      },
      allowHTML: true,
      aria: {
        content: 'describedby',
      },
    });
  }
}
