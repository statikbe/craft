import { DOMHelper } from '../utils/domHelper';

export default class RangeSliderComponent {
  constructor() {
    const sliders = document.querySelectorAll('input[type=range]');
    Array.from(sliders).forEach((slider) => {
      new RangeSlider(slider as HTMLInputElement);
    });

    DOMHelper.onDynamicContent(
      document.documentElement,
      'input[type=range]',
      (sliders: NodeListOf<HTMLInputElement>) => {
        sliders.forEach((slider) => {
          new RangeSlider(slider);
        });
      }
    );
  }
}

class RangeSlider {
  private slider: HTMLInputElement;
  private toSlider: HTMLInputElement | null = null;
  private syncElement: HTMLElement | null = null;

  constructor(sliderEl: HTMLInputElement) {
    this.slider = sliderEl;
    if (this.slider.hasAttribute('data-sync')) {
      this.syncElement = document.getElementById(this.slider.getAttribute('data-sync') || '') as HTMLElement;
    }

    if (this.slider.id.indexOf('to') == 0) {
      this.toSlider = sliderEl;
      this.slider = document.getElementById(this.toSlider.id.replace('to', 'from')) as HTMLInputElement;
      if (this.slider) {
        this.setProgress(true, this.toSlider.value);
        this.toSlider.addEventListener('input', (event) => {
          const step = parseInt(this.toSlider.getAttribute('step') || '1');
          if (parseInt(this.slider.value) >= parseInt(this.toSlider.value) - step) {
            this.toSlider.value = parseInt(this.slider.value) + step + '';
          }
          this.setProgress(true, this.toSlider.value);
        });
      }
      return;
    }
    if (this.slider.id.indexOf('from') == 0) {
      const toSliderId = this.slider.id.replace('from', 'to');
      this.toSlider = document.getElementById(toSliderId) as HTMLInputElement;
      if (this.toSlider) {
        this.toSlider.style.position = 'absolute';
        this.toSlider.style.top = this.slider.offsetTop + 'px';
        this.toSlider.style.left = this.slider.offsetLeft + 'px';
        this.toSlider.style.width = this.slider.offsetWidth + 'px';
        this.toSlider.style.zIndex = '1';
        this.toSlider.style.setProperty('--slider-color', 'transparent');
        this.toSlider.style.setProperty('--slider-progress-color', 'transparent');
      }
    }
    this.initSafariFallBack(sliderEl);
    this.setProgress(this.toSlider !== null, this.slider.value);
    this.slider.addEventListener('input', (event) => {
      if (this.toSlider) {
        const step = parseInt(this.toSlider.getAttribute('step') || '1');
        if (parseInt(this.slider.value) >= parseInt(this.toSlider.value) - step) {
          this.slider.value = parseInt(this.toSlider.value) - step + '';
        }
      }
      this.setProgress(this.toSlider !== null, this.slider.value);
    });
  }

  private setProgress(range = false, value = '') {
    if (this.syncElement) {
      if (this.syncElement.tagName.toLowerCase() === 'input') {
        (this.syncElement as HTMLInputElement).value = value;
      } else {
        this.syncElement.textContent = value;
      }
    }
    if (range) {
      const fromSliderValue = parseInt(this.slider.value);
      const toSliderValue = parseInt(this.toSlider.value);
      const fromProgress = (fromSliderValue / parseInt(this.slider.max)) * 100;
      const toProgress = (toSliderValue / parseInt(this.toSlider.max)) * 100;
      this.slider.style.backgroundImage = `linear-gradient(to right, var(--slider-color) 0%, var(--slider-color) ${fromProgress}%, var(--slider-progress-color) ${fromProgress}%, var(--slider-progress-color) ${toProgress}%, var(--slider-color) ${toProgress}%, var(--slider-color) 100%)`;
    } else {
      const tempSliderValue = parseInt(this.slider.value);
      const progress = (tempSliderValue / parseInt(this.slider.max)) * 100;
      this.slider.style.backgroundImage = `linear-gradient(to right, var(--slider-progress-color) ${progress}%, var(--slider-color) ${progress}%)`;
    }
  }

  private initSafariFallBack(el: HTMLElement) {
    const input = el as HTMLInputElement;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      const listId = input.getAttribute('list');
      const datalist = listId ? (document.getElementById(listId) as HTMLDataListElement) : null;
      if (datalist) {
        const divFallBack = document.createElement('div');
        divFallBack.classList.add(...datalist.classList);
        divFallBack.classList.add('datalist');
        const options = Array.from(datalist.options);
        options.forEach((option) => {
          const span = document.createElement('span');
          span.textContent = option.label || option.value;
          span.classList.add(...option.classList);
          span.classList.add('option');
          divFallBack.appendChild(span);
        });
        datalist.insertAdjacentElement('beforebegin', divFallBack);
      }
    }
  }
}
