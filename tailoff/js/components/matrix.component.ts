export class MatrixComponent {
  constructor() {
    const buttons = document.querySelectorAll('.js-matrix-add');
    Array.from(buttons).forEach((button, i) => {
      button.addEventListener('click', this.addRow.bind(this));
    });

    document.addEventListener(
      'click',
      (e) => {
        // loop parent nodes from the target to the delegation node
        for (let target = <Element>e.target; target && !target.isSameNode(document); target = target.parentElement) {
          if (target.matches('.js-remove-row')) {
            e.preventDefault();
            const row = target.closest('.js-row');
            const parent = row.parentElement;
            parent.removeChild(row);
            this.triggerChange(parent.querySelectorAll('.js-row').length, row.getAttribute('data-s-type'));
            const addButton = document.querySelector(
              `.js-matrix-add[data-s-type=${row.getAttribute('data-s-type')}]`
            ) as HTMLButtonElement;
            addButton.disabled = false;
            break;
          }
        }
      },
      false
    );
  }

  private addRow(e: Event) {
    e.preventDefault();
    const el: HTMLButtonElement = e.target as HTMLButtonElement;
    const rows = document.querySelectorAll('.' + el.getAttribute('data-s-type'));
    const nbrOfRows = rows.length;
    let currentCount = 1;
    const addIndex = el.getAttribute('data-add-index');
    if (addIndex) {
      currentCount = parseInt(addIndex);
      currentCount++;
      el.setAttribute('data-add-index', `${currentCount}`);
    }

    const lastRow = Array.from(rows).pop();
    if (lastRow) {
      const templateName = el.getAttribute('data-s-template');
      const template = this.getTemplate(templateName);
      const newTemplate = template.replace(new RegExp('%%block%%', 'g'), 'new_' + currentCount);
      lastRow.parentElement.insertAdjacentHTML('beforeend', newTemplate);
      this.triggerChange(nbrOfRows, el.getAttribute('data-s-type'));
    }

    const max = el.getAttribute('data-s-max');
    if (max) {
      const maxRows = parseInt(max);
      if (nbrOfRows + 1 >= maxRows) {
        el.disabled = true;
      }
    }
  }

  private getTemplate(name) {
    const template = document.querySelector('#' + name);
    if (template) return template.innerHTML;
    else return '';
  }

  private triggerChange(amount, type) {
    console.log(amount);

    let event;
    if (typeof CustomEvent === 'function') {
      event = new CustomEvent('matrix-changed', {
        detail: { amount: amount, type: type },
      });
    } else {
      event = document.createEvent('Event');
      event.initEvent('matrix-changed', false, true, {
        detail: { amount: amount, type: type },
      });
    }
    document.dispatchEvent(event);

    const optionals = document.querySelectorAll(`.js-matrix-optional[data-s-type='${type}']`);
    console.log(type, optionals);

    Array.from(optionals).forEach((optional) => {
      if (amount > 0) {
        optional.classList.remove('hidden');
        this.disableAllFormElements(false, optional);
      } else {
        optional.classList.add('hidden');
        this.disableAllFormElements(true, optional);
      }
    });
  }

  private disableAllFormElements(disable = true, element) {
    const disableElements = element.querySelectorAll('input, textarea, select');
    Array.from(disableElements).forEach((d: HTMLElement) => {
      if (disable) {
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
