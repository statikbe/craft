export default class TooltipComponent {
  constructor() {
    if (
      document.querySelectorAll('[data-tippy-content]').length > 0 ||
      document.querySelectorAll('[data-tippy-template]').length > 0
    ) {
      this.initTippy();
    }
  }

  // Tippy appends to document.body by default, which puts the tooltip *below* a modal
  // <dialog> (the dialog sits in the browser's top layer) — so it never shows. Keep the
  // tooltip inside the dialog when the reference lives in one.
  private appendTo(reference: Element): Element {
    const elementSelector = reference.getAttribute('data-tippy-append-to');
    if (elementSelector) {
      const element = document.querySelector(elementSelector);
      if (element) {
        return element;
      }
    }
    return reference.closest('dialog') ?? document.body;
  }

  private async initTippy() {
    // @ts-ignore
    const tippy = await import('tippy.js');
    tippy.default('[data-tippy-content]', {
      appendTo: this.appendTo,
      aria: {
        content: 'describedby',
      },
    });
    tippy.default('[data-tippy-template]', {
      appendTo: this.appendTo,
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
