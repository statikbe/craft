import { DOMHelper } from '../utils/domHelper';
import { Formatter } from '../utils/formater';

export default class MatrixComponent {
  constructor() {
    const buttons = document.querySelectorAll('[data-matrix-add]');
    Array.from(buttons).forEach((button, i) => {
      new Matrix(button as HTMLButtonElement);
    });

    DOMHelper.onDynamicContent(document.documentElement, '[data-matrix-add]', (buttons: NodeListOf<HTMLElement>) => {
      Array.from(buttons).forEach((button) => {
        new Matrix(button as HTMLButtonElement);
      });
    });
  }
}

class Matrix {
  private triggerButton;
  private template;
  private destinationElement;
  private maxRows = -1;
  private showElements;
  private hideElements;

  constructor(button: HTMLButtonElement) {
    this.triggerButton = button;
    this.template = document.querySelector('#' + button.getAttribute('data-matrix-add'));
    this.destinationElement = document.querySelector('#' + button.getAttribute('data-matrix-destination'));
    if (!this.triggerButton || !this.template || !this.destinationElement) {
      console.log('One or more elements are missing in order for the Matrix component to work');
      return;
    }

    const max = button.getAttribute('data-matrix-max');
    if (max) {
      this.maxRows = parseInt(max);
    }

    if (button.getAttribute('data-matrix-show')) {
      const showIds = button.getAttribute('data-matrix-show').split(',');
      this.showElements = showIds.map((id) => document.getElementById(id)).filter((el) => el);
    }

    if (button.getAttribute('data-matrix-hide')) {
      const hideIds = button.getAttribute('data-matrix-hide').split(',');
      this.hideElements = hideIds.map((id) => document.getElementById(id)).filter((el) => el);
    }

    this.triggerButton.addEventListener('click', this.addRow.bind(this));
  }

  private addRow(e: Event) {
    e.preventDefault();
    if (this.maxRows > 0 && this.destinationElement.children.length >= this.maxRows) {
      console.warn('Maximum number of rows reached');
      return;
    }

    let addIndex = this.triggerButton.hasAttribute('data-matrix-index')
      ? parseInt(this.triggerButton.getAttribute('data-matrix-index'))
      : 0;
    addIndex++;
    this.triggerButton.setAttribute('data-matrix-index', addIndex.toString());

    const templateContent = Formatter.evaluateJSTemplate(this.template.innerHTML, { index: addIndex });
    const row = document.createElement('div');
    row.setAttribute('data-matrix-row', addIndex.toString());
    row.innerHTML = templateContent;

    const removeButton = row.querySelector('[data-remove-row]');
    if (removeButton) {
      removeButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.triggerButton.removeAttribute('disabled');
        row.remove();
        this.optionalElementsAction();
        this.triggerButton.dispatchEvent(
          new CustomEvent('matrix.rowRemoved', {
            bubbles: true,
            detail: {
              index: addIndex,
              rowElement: row,
            },
          })
        );
      });
    } else {
      console.warn('No remove button found for the matrix row');
    }

    this.destinationElement.appendChild(row);
    if (this.destinationElement.children.length >= this.maxRows) {
      this.triggerButton.setAttribute('disabled', 'disabled');
      this.triggerButton.dispatchEvent(
        new CustomEvent('matrix.maxRowsReached', {
          bubbles: true,
          detail: {
            maxRows: this.maxRows,
            currentRows: this.destinationElement.children.length,
          },
        })
      );
    }
    this.optionalElementsAction();
    this.triggerButton.dispatchEvent(
      new CustomEvent('matrix.rowAdded', {
        bubbles: true,
        detail: {
          index: addIndex,
          rowElement: row,
        },
      })
    );
  }

  private optionalElementsAction() {
    if (this.destinationElement.children.length > 0) {
      this.showElements?.forEach((el) => {
        el.setAttribute('open', '');
        this.disableAllFormElements(el);
        this.triggerButton.dispatchEvent(
          new CustomEvent('matrix.showElement', {
            bubbles: true,
            detail: {
              element: el,
            },
          })
        );
      });
      this.hideElements?.forEach((el) => {
        el.removeAttribute('open');
        this.disableAllFormElements(el);
        this.triggerButton.dispatchEvent(
          new CustomEvent('matrix.hideElement', {
            bubbles: true,
            detail: {
              element: el,
            },
          })
        );
      });
    } else {
      this.showElements?.forEach((el) => {
        el.removeAttribute('open');
        this.disableAllFormElements(el);
        this.triggerButton.dispatchEvent(
          new CustomEvent('matrix.hideElement', {
            bubbles: true,
            detail: {
              element: el,
            },
          })
        );
      });
      this.hideElements?.forEach((el) => {
        el.setAttribute('open', '');
        this.disableAllFormElements(el);
        this.triggerButton.dispatchEvent(
          new CustomEvent('matrix.showElement', {
            bubbles: true,
            detail: {
              element: el,
            },
          })
        );
      });
    }
  }

  private disableAllFormElements(element: HTMLElement) {
    const disableElements = element.querySelectorAll('input, textarea, select');
    Array.from(disableElements).forEach((d: HTMLElement) => {
      if (!element.hasAttribute('open')) {
        if (d.hasAttribute('required')) {
          d.removeAttribute('required');
          d.setAttribute('data-has-required', 'true');
        }
        d.setAttribute('disabled', 'disabled');
      } else {
        if (d.hasAttribute('data-has-required')) {
          d.setAttribute('required', 'required');
          d.removeAttribute('data-has-required');
        }
        d.removeAttribute('disabled');
      }
    });
  }
}
