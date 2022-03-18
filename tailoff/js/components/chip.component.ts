import { A11yUtils } from '../utils/a11y';
import { SiteLang } from '../utils/site-lang';

export class ChipComponent {
    constructor() {
        const chips = Array.from(document.querySelectorAll('[data-s-chip]'));
        chips.forEach((chip, index) => {
            new ChipElement(chip as HTMLElement, index);
        });
    }
}

class ChipElement {
    private lang = require(`../i18n/s-chip-${SiteLang.getLang()}.json`);
    private element: HTMLElement;
    private triggerElement: HTMLButtonElement;
    private triggerTextElement: HTMLElement;
    private triggerClearElement: HTMLButtonElement;
    private modalElement: HTMLElement;
    private modalCloseElement: HTMLButtonElement;
    private modalClearElement: HTMLButtonElement;
    private toggleListener;
    private changeListener;
    private clearListener;
    private escapeListener;
    private clickOutsideListener;
    private name: String;
    private selected: String;
    private index: Number;

    constructor(element: HTMLElement, index) {
        this.element = element;
        this.index = index;
        this.triggerElement = element.querySelector('.js-chip-trigger');
        this.triggerTextElement = element.querySelector('.js-chip-trigger-text');
        this.triggerClearElement = element.querySelector('.js-chip-trigger-clear');
        this.modalElement = element.querySelector('.js-chip-modal');
        this.modalCloseElement = element.querySelector('.js-chip-modal-close');
        this.modalClearElement = element.querySelector('.js-chip-modal-clear');

        this.toggleListener = this.toggleAction.bind(this);
        this.changeListener = this.changeAction.bind(this);
        this.clearListener = this.clearAction.bind(this);
        this.escapeListener = this.escapeAction.bind(this);
        this.clickOutsideListener = this.clickOutsideAction.bind(this);

        this.name = element.getAttribute('data-s-chip');

        this.initInputs();
        this.selected = this.getSelected();
        this.initTrigger();
        this.initModal();
    }

    private initTrigger() {
        this.triggerElement.setAttribute('aria-haspopup', 'true');
        this.setTriggerLabel();
        this.setTriggerText();
        this.setTriggerState();
        this.triggerElement.addEventListener('click', this.toggleListener);
        this.triggerClearElement.addEventListener('click', this.clearListener);
    }

    private initModal() {
        this.modalElement.setAttribute('aria-modal', 'true');
        this.modalElement.setAttribute('role', 'dialog');
        const heading = this.modalElement.querySelector('h1,h2');
        const id = `chip-${this.index}-heading`;
        heading.id = id;
        this.modalElement.setAttribute('aria-labelledby', id);
        this.modalElement.setAttribute('tabindex', '-1');
    }

    private initInputs() {
        const inputs = this.modalElement.querySelectorAll('input');
        Array.from(inputs).forEach(input => {
            const labelElement = this.modalElement.querySelector(`label[for=${input.id}]`);
            input.setAttribute('data-s-chip-input-label', labelElement.textContent.trim());
        })
    }

    private toggleModal() {
        if (this.modalElement.classList.contains('hidden')) {
            this.modalElement.classList.remove('hidden');
            this.trapFocus();
            this.modalCloseElement.addEventListener('click', this.toggleListener);
            this.modalElement.addEventListener('change', this.changeListener);
            this.modalClearElement.addEventListener('click', this.clearListener);

            document.addEventListener('click', this.clickOutsideListener);
            document.addEventListener('keydown', this.escapeListener);
        } else {
            this.modalElement.classList.add('hidden');
            this.modalCloseElement.removeEventListener('click', this.toggleListener);
            this.modalElement.removeEventListener('change', this.changeListener);
            this.modalClearElement.removeEventListener('click', this.clearListener);

            document.removeEventListener('click', this.clickOutsideListener);
            document.removeEventListener('keydown', this.escapeListener);
        }
    }

    private trapFocus() {
        A11yUtils.keepFocus(this.modalElement);
        this.modalElement.focus();
    }

    private getTriggerText() {
        const count = this.getCount();
        switch (count) {
            case 0:
                return this.name;
            case 1:
                return this.selected;
            default:
                return `${this.selected} +${count - 1}`;
        }
    }

    private getTriggerLabel() {
        const count = this.getCount();
        switch (count) {
            case 0:
                return `${this.name}, ${this.lang.triggerNotSelectedLabel}`;
            case 1:
                return `${this.selected}, ${this.name}, ${this.lang.triggerSelectedLabel}`;
            default:
                return `${this.selected} +${count - 1}, ${this.name}, ${this.lang.triggerSelectedLabel}`;
        }
    }

    private setTriggerText() {
        const text = this.getTriggerText();
        this.triggerTextElement.textContent = text;
    }

    private setTriggerLabel() {
        const label = this.getTriggerLabel();
        this.triggerElement.setAttribute('aria-label', label);
    }

    private getSelected() {
        const checked = this.modalElement.querySelector('input:checked');
        return checked ? checked.getAttribute('data-s-chip-input-label') : '';
    }

    private getCount() {
        const checked = this.modalElement.querySelectorAll('input:checked');
        return checked.length;
    }

    private setTriggerState() {
        if (this.selected) {
            this.element.classList.add('active')
        } else {
            this.element.classList.remove('active');
        }
    }

    private toggleAction() {
        this.toggleModal();
    }

    private changeAction(event: Event) {
        const label = event.target.getAttribute('data-s-chip-input-label');

        if (event.target.checked) {
            if(event.target.getAttribute('type') === 'checkbox') {
                if (!this.selected) {
                    this.selected = label;
                }
            } else {
                this.selected = label;
            }
        } else {
            if (this.selected === label) {
                this.selected = this.getSelected();
            }
        }

        const checkedInputs = this.modalElement.querySelectorAll('input:checked');
        const count = checkedInputs.length;

        this.setTriggerText();
        this.setTriggerLabel();
        this.setTriggerState();
    }

    private clearAction(event) {
        const checkedInputs = this.modalElement.querySelectorAll('input:checked');
        Array.from(checkedInputs).forEach(input => {
            input.checked = false;
        })
        this.selected = '';
        const changeEvent = new Event('change', { bubbles: true });
        const input = this.modalElement.querySelector('input');
        input.dispatchEvent(changeEvent);
    }

    private escapeAction(event) {
        if (event.keyCode === 27 || event.key === 'Escape') {
            this.toggleModal();
        }
    }

    private clickOutsideAction(event) {
        if (this.element.contains(event.target)) {
            return;
        }
        this.toggleModal();
    }
}