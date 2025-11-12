import { DOMHelper } from '../utils/domHelper';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default class DatalayerComponent {
  constructor() {
    window.dataLayer = window.dataLayer || [];
    const datalayerElements = document.querySelectorAll('form[data-datalayer-event]');
    if (datalayerElements.length) {
      datalayerElements.forEach((datalayerElement) => {
        new Datalayer(datalayerElement as HTMLFormElement);
      });
    }

    DOMHelper.onDynamicContent(document.documentElement, 'form[data-datalayer-event]', (datalayerElements) => {
      datalayerElements.forEach((datalayerElement) => {
        new Datalayer(datalayerElement as HTMLFormElement);
      });
    });
  }
}

class Datalayer {
  private form: HTMLFormElement;

  constructor(datalayerElement) {
    this.form = datalayerElement;
    this.initDatalayerEvent();
  }

  private initDatalayerEvent() {}

  private pushToDatalayer() {
    const extraFormElement = document.querySelector('.js-filter-extra-form') as HTMLFormElement;
    const formData = new FormData(this.form);
    if (extraFormElement) {
      const extraFormData = new FormData(extraFormElement);
      for (var pair of extraFormData.entries()) {
        if (
          !formData.has(pair[0]) ||
          (formData.has(pair[0]) && pair[0].indexOf('[]') >= 0 && formData.getAll(pair[0]).indexOf(pair[1]) < 0)
        ) {
          formData.append(pair[0], pair[1]);
        }
      }
    }
    const formDataArray = Array.from(formData) as Array<[string, string]>;
    const pushData = {
      event: 'filter',
    };
    formDataArray.forEach((data) => {
      if (data[1] !== '') {
        if (data[0].indexOf('[]') >= 0) {
          const variable = data[0].replace('[]', '');
          if (!pushData[variable]) {
            pushData[variable] = [];
          }
          pushData[variable].push(this.getLabelForInput(data));
        } else {
          pushData[data[0]] = data[1];
        }
      }
    });

    // Remove object items when they have an empty array
    Object.keys(pushData).forEach((key) => {
      if (Array.isArray(pushData[key]) && pushData[key].length === 0) {
        delete pushData[key];
      }
    });

    if (Object.keys(pushData).length > 1) {
      // console.log(pushData);
      window.dataLayer.push(pushData);
    }
  }

  private getLabelForInput(data: [string, string]) {
    const inputElement = document.querySelector(`[name="${data[0]}"]`);
    if (inputElement) {
      if (inputElement instanceof HTMLSelectElement) {
        return inputElement.options[inputElement.selectedIndex].text;
      } else {
        const input = document.querySelector(`[name="${data[0]}"][value="${data[1]}"]`);
        if (input) {
          if (input.hasAttribute('id')) {
            const label = document.querySelector(`label[for="${input.getAttribute('id')}"]`) as HTMLLabelElement;
            if (label) {
              return label.innerText;
            }
          } else {
            const label = input.closest('label');
            if (label) {
              return label.innerText;
            }
          }
        }
      }
    }
    return data[0];
  }
}
