import tippy from 'tippy.js';

export class TooltipComponent {
  constructor() {
    tippy('[data-tippy-content]');
    tippy('[data-tippy-template]', {
      content(reference) {
        const id = reference.getAttribute('data-tippy-template');
        const template = document.getElementById(id);
        return template.innerHTML;
      },
      allowHTML: true,
    });
  }
}
