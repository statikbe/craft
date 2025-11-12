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
  private eventName: string = 'filter';
  private ignoreFields: string[] = [];
  private lastPushedData: any = null;

  constructor(datalayerElement: HTMLFormElement) {
    this.form = datalayerElement;
    this.initDatalayerEvent();
  }

  private initDatalayerEvent() {
    const eventAttr = this.form.getAttribute('data-datalayer-event');
    if (eventAttr && eventAttr.length > 0) {
      this.eventName = eventAttr;
      const ignoreAttr = this.form.getAttribute('data-datalayer-ignore');
      if (ignoreAttr && ignoreAttr.length > 0) {
        this.ignoreFields = ignoreAttr.split(',');
      }
      this.ignoreFields = ignoreAttr.split(',');
    }
    this.form.addEventListener('filterFetchData', (event) => {
      this.pushToDatalayer();
    });
  }

  private pushToDatalayer() {
    const formData = new FormData(this.form);
    const formDataArray = Array.from(formData) as Array<[string, string]>;
    const pushData = {
      event: this.eventName,
    };
    formDataArray.forEach((data) => {
      if (data[1] !== '') {
        if (data[0].indexOf('[]') >= 0) {
          const variable = this.getKeyForInput(data);
          if (this.ignoreFields.includes(variable)) {
            return;
          }
          if (!pushData[variable]) {
            pushData[variable] = [];
          }
          pushData[variable].push(this.getLabelForInput(data));
        } else {
          if (this.ignoreFields.includes(data[0])) {
            return;
          }
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

    if (Object.keys(pushData).length > 1 && JSON.stringify(this.lastPushedData) !== JSON.stringify(pushData)) {
      //   console.log(pushData);
      window.dataLayer.push(pushData);
      this.lastPushedData = pushData;
    }
  }

  private getLabelForInput(data: [string, string]) {
    let inputElement = document.querySelector(`[name="${data[0]}"]`);
    if (inputElement) {
      if (inputElement instanceof HTMLSelectElement) {
        if (inputElement.hasAttribute('data-datalayer-value')) {
          return inputElement.getAttribute('data-datalayer-value') as string;
        }
        return inputElement.options[inputElement.selectedIndex].text;
      } else {
        if (
          (inputElement instanceof HTMLInputElement || inputElement instanceof HTMLTextAreaElement) &&
          data[1] !== ''
        ) {
          const specificInput = document.querySelector(`[name="${data[0]}"][value="${data[1]}"]`) || inputElement;
          inputElement = specificInput as HTMLElement;
        }
        if (inputElement.hasAttribute('data-datalayer-value')) {
          return inputElement.getAttribute('data-datalayer-value') as string;
        }
        if (inputElement.hasAttribute('id')) {
          const label = document.querySelector(`label[for="${inputElement.getAttribute('id')}"]`) as HTMLLabelElement;
          if (label) {
            return label.innerText;
          }
        } else {
          const label = inputElement.closest('label');
          if (label) {
            return label.innerText;
          }
        }
      }
    }
    return data[0];
  }

  private getKeyForInput(data: [string, string]) {
    let inputElement = document.querySelector(`[name="${data[0]}"]`);
    if (inputElement) {
      if (!(inputElement instanceof HTMLSelectElement)) {
        inputElement = document.querySelector(`[name="${data[0]}"][value="${data[1]}"]`);
      }
    }
    if (inputElement && inputElement.hasAttribute('data-datalayer-name')) {
      return inputElement.getAttribute('data-datalayer-name');
    }
    return data[0].replace('[]', '');
  }
}
