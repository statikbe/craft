import { DOMHelper } from '../utils/domHelper';
import { Formatter } from '../utils/formater';
import { SiteLang } from '../utils/site-lang';

export default class RangeSliderComponent {
  constructor() {
    const sliders = document.querySelectorAll('.js-range-slider');
    Array.from(sliders).forEach((slider) => {
      new RangeSlider(slider as HTMLElement);
    });
  }
}

class RangeSlider {
  private siteLang = SiteLang.getLang();
  // private lang = require(`../i18n/s-range-slider-${this.siteLang}.json`);
  private lang;

  private minValue: number;
  private maxValue: number;
  private minStartValue: number;
  private maxStartValue: number;
  private step: number;
  private stepRender: number;
  private name: string;
  private nameMin: string;
  private nameMax: string;

  private outputMin: HTMLElement;
  private outputMax: HTMLElement;

  private maxX: number;
  private startX: number;
  private moveBlockWidth = 0;
  private selectedHandle: HTMLElement;

  private slider: HTMLElement;
  private touchRight: HTMLElement;
  private touchLeft: HTMLElement;
  private sliderLine: HTMLElement;
  private sliderLineHighlight: HTMLSpanElement;
  private sliderInputs: HTMLDivElement;
  private inputMax: HTMLInputElement;
  private inputMin: HTMLInputElement;
  private sliderSteps: HTMLDivElement;
  private sliderStepStrings: Array<string> = new Array<string>();

  private mouseDownListener;
  private mouseMoveListener;
  private mouseUpListener;

  private jsChange;

  constructor(el: HTMLElement) {
    this.getLang().then(() => {
      this.initRangeSlider(el);
    });
  }

  private initRangeSlider(el: HTMLElement) {
    el.classList.remove('js-range-slider');
    this.slider = el;
    this.minValue = parseInt(this.slider.getAttribute('data-slider-min'));
    this.maxValue = parseInt(this.slider.getAttribute('data-slider-max'));
    this.name = this.slider.getAttribute('data-slider-name');
    if (!this.name) {
      this.nameMin = this.slider.getAttribute('data-slider-name-min');
      this.nameMax = this.slider.getAttribute('data-slider-name-max');
    }

    this.outputMin = document.getElementById(this.slider.getAttribute('data-slider-min-output'));
    this.outputMax = document.getElementById(this.slider.getAttribute('data-slider-max-output'));

    if (isNaN(this.minValue) || isNaN(this.maxValue) || (!this.name && !this.nameMin && !this.nameMax)) {
      console.error(
        'Make sure your range slider has the following attributes: data-slider-min, data-slider-max, data-slider-name'
      );
      return;
    }

    this.jsChange = document.createEvent('HTMLEvents');
    this.jsChange.initEvent('jschange', false, true);

    this.minStartValue = parseInt(this.slider.getAttribute('data-slider-min-start'));
    this.maxStartValue = parseInt(this.slider.getAttribute('data-slider-max-start'));
    this.step = this.slider.getAttribute('data-slider-step')
      ? parseInt(this.slider.getAttribute('data-slider-step'))
      : 1;
    this.stepRender = this.slider.getAttribute('data-slider-step-render')
      ? parseInt(this.slider.getAttribute('data-slider-step-render'))
      : this.step;
    const sliderStepStringAttr = this.slider.getAttribute('data-slider-steps');
    if (sliderStepStringAttr) {
      this.sliderStepStrings = JSON.parse(sliderStepStringAttr.replace(/'/g, '"'));
    }

    if (this.minStartValue && this.minStartValue < this.minValue) {
      this.minStartValue = this.minValue;
    }

    if (this.maxStartValue > this.maxValue) {
      this.maxStartValue = this.maxValue;
    }

    if (this.minStartValue > this.maxStartValue) {
      this.minStartValue = this.maxStartValue;
    }

    if (!this.step) {
      this.step = 1;
    }

    this.slider.classList.remove('js-range-slider');
    this.slider.classList.add('slider');
    this.slider.insertAdjacentHTML(
      'beforeend',
      `
      <div class="slider-steps">
      </div>
      <div class="slider-inputs">
        <input type="number" class="slider-input-max sr-only" value="" name="${
          this.name ? this.name : this.nameMax
        }" aria-label="${Formatter.sprintf(this.lang.maxLabel, {
        max: this.maxValue,
      })}"/>
      </div>
      <div class="slider-touch-right" aria-hidden="true">
        <span></span>
      </div>
      <div class="slider-line" aria-hidden="true">
        <span></span>
      </div>
      `
    );
    this.touchRight = this.slider.querySelector('.slider-touch-right');
    this.sliderInputs = this.slider.querySelector('.slider-inputs');
    this.sliderSteps = this.slider.querySelector('.slider-steps');
    this.inputMax = this.slider.querySelector('.slider-input-max');
    this.sliderLine = this.slider.querySelector('.slider-line');
    this.sliderLineHighlight = this.sliderLine.querySelector('span');
    this.mouseDownListener = this.onStart.bind(this);
    this.maxX = this.slider.offsetWidth - this.touchRight.offsetWidth;
    this.moveBlockWidth = this.sliderLine.offsetWidth / ((this.maxValue - this.minValue) / this.step);

    if (!isNaN(this.minStartValue)) {
      this.slider.insertAdjacentHTML(
        'afterbegin',
        `<div class="slider-touch-left" aria-hidden="true">
          <span></span>
        </div>
        `
      );
      this.sliderInputs.insertAdjacentHTML(
        'afterbegin',
        `
        <input type="number" class="slider-input-min sr-only" value="" name="${
          this.name ? this.name + '[min]' : this.nameMin
        }" aria-label="${Formatter.sprintf(this.lang.minLabel, {
          max: this.minValue,
        })}"/>
      `
      );
      this.inputMax.name = this.name ? `${this.name}[max]` : this.nameMax;
      this.inputMin = this.slider.querySelector('.slider-input-min');
      this.touchLeft = this.slider.querySelector('.slider-touch-left');
      this.setMinValuePosition();
      this.touchLeft.addEventListener('mousedown', this.mouseDownListener);
      this.touchLeft.addEventListener('touchstart', this.mouseDownListener);
    }

    this.setMaxValuePosition();
    this.touchRight.addEventListener('mousedown', this.mouseDownListener);
    this.touchRight.addEventListener('touchstart', this.mouseDownListener);

    this.renderSteps();

    window.addEventListener('resize', () => {
      this.maxX = this.slider.offsetWidth - this.touchRight.offsetWidth;
      this.moveBlockWidth = this.sliderLine.offsetWidth / ((this.maxValue - this.minValue) / this.step);
      this.renderSteps();
      this.setMaxValuePosition();
      if (!isNaN(this.minStartValue)) {
        this.setMinValuePosition();
      }
    });

    var _self = this;
    if (this.slider.offsetParent == null) {
      const hiddenParent = this.slider.closest('.hidden');
      const observer = new MutationObserver(function () {
        _self.maxX = _self.slider.offsetWidth - _self.touchRight.offsetWidth;
        _self.moveBlockWidth = _self.sliderLine.offsetWidth / ((_self.maxValue - _self.minValue) / _self.step);
        _self.renderSteps();
        _self.setMaxValuePosition();
        if (!isNaN(_self.minStartValue)) {
          _self.setMinValuePosition();
        }
      });
      observer.observe(hiddenParent, { attributes: true, childList: true });
    }
  }

  private async getLang() {
    this.lang = await import(`../i18n/s-range-slider-${this.siteLang}.json`);
  }

  private setMinValuePosition() {
    const ratio = (this.minStartValue - this.minValue) / (this.maxValue - this.minValue);

    const xPos = Math.ceil(ratio * this.slider.offsetWidth);
    if (!this.inputMin.value) {
      this.inputMin.value = this.minStartValue.toString();
    }

    if (this.outputMin) {
      this.outputMin.innerText = this.inputMin.value;
    }

    this.touchLeft.style.left = this.roundXPos(xPos, this.touchLeft, parseInt(this.inputMin.value)) + 'px';
    this.sliderLineHighlight.style.marginLeft = this.touchLeft.offsetLeft + 'px';
    this.sliderLineHighlight.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
  }

  private setMaxValuePosition() {
    let xPos = 0;
    if (!this.inputMax.value) {
      if (this.maxStartValue) {
        const ratio = (this.maxStartValue - this.minValue) / (this.maxValue - this.minValue);
        xPos = Math.ceil(ratio * this.slider.offsetWidth);
        this.inputMax.value = this.maxStartValue.toString();
      } else {
        this.inputMax.value = this.minValue.toString();
      }
    }

    if (this.outputMax) {
      this.outputMax.innerText = this.inputMax.value;
    }

    this.touchRight.style.left = this.roundXPos(xPos, this.touchRight, parseInt(this.inputMax.value)) + 'px';
    this.sliderLineHighlight.style.marginLeft = (this.touchLeft ? this.touchLeft.offsetLeft : 0) + 'px';
    this.sliderLineHighlight.style.width =
      this.touchRight.offsetLeft - (this.touchLeft ? this.touchLeft.offsetLeft : 0) + 'px';
  }

  private onStart(e) {
    e.preventDefault();
    let eventTouch = e;
    let xPos = 0;

    if (e.touches) {
      eventTouch = e.touches[0];
    }

    if (eventTouch.target === this.touchLeft) {
      xPos = this.touchLeft.offsetLeft;
    } else {
      xPos = this.touchRight.offsetLeft;
    }

    this.startX = eventTouch.pageX - xPos;
    this.selectedHandle = eventTouch.target;

    this.mouseMoveListener = this.onMove.bind(this);
    this.mouseUpListener = this.onStop.bind(this);
    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('touchmove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);
    document.addEventListener('touchend', this.mouseUpListener);
  }

  private onMove(e) {
    let eventTouch = e;
    const minOffsetLeft = this.touchLeft ? this.touchLeft.offsetLeft : 0;

    if (e.touches) {
      eventTouch = e.touches[0];
    }

    let xPos = this.roundXPos(eventTouch.pageX - this.startX);

    if (this.selectedHandle === this.touchLeft) {
      // xPos = this.moveBlockWidth
      if (xPos > this.touchRight.offsetLeft) {
        xPos = this.touchRight.offsetLeft;
      } else if (xPos < 0) {
        xPos = 0;
      }

      this.selectedHandle.style.left = xPos + 'px';
      this.inputMin.value = this.calculateValue(xPos).toString();

      if (this.outputMin) {
        this.outputMin.innerText = this.inputMin.value;
      }
    } else if (this.selectedHandle === this.touchRight) {
      if (xPos < minOffsetLeft) {
        xPos = minOffsetLeft;
        if (this.selectedHandle != this.touchLeft) {
          this.selectedHandle = this.touchLeft;
        }
      } else if (xPos > this.maxX) {
        xPos = this.maxX;
      }
      this.selectedHandle.style.left = xPos + 'px';
      this.inputMax.value = this.calculateValue(xPos).toString();

      if (this.outputMax) {
        this.outputMax.innerText = this.inputMax.value;
      }
    }

    // update line span
    this.sliderLineHighlight.style.marginLeft = minOffsetLeft + 'px';
    this.sliderLineHighlight.style.width = this.touchRight.offsetLeft - minOffsetLeft + 'px';
  }

  private onStop(e) {
    document.removeEventListener('mousemove', this.mouseMoveListener);
    document.removeEventListener('touchmove', this.mouseMoveListener);
    document.removeEventListener('mouseup', this.mouseUpListener);
    document.removeEventListener('touchend', this.mouseUpListener);

    this.selectedHandle = null;

    if (this.inputMin) {
      this.inputMin.dispatchEvent(this.jsChange);
    }
    if (this.inputMax) {
      this.inputMax.dispatchEvent(this.jsChange);
    }
  }

  private roundXPos(xPos: number, handle = this.selectedHandle, blockFactor: number = null) {
    const halfHandleWidth = handle.offsetWidth / 2;
    if (!blockFactor) {
      blockFactor = this.calculateValue(xPos, handle);
    }

    blockFactor /= this.step;
    blockFactor -= this.minValue / this.step;

    return this.sliderLine.offsetLeft + blockFactor * this.moveBlockWidth - halfHandleWidth;
  }

  private calculateValue(xPos, handle = this.selectedHandle) {
    const halfHandleWidth = handle.offsetWidth / 2;
    let handleValue = xPos - this.sliderLine.offsetLeft + halfHandleWidth;
    handleValue = handleValue > 0 ? handleValue : 0;
    handleValue =
      handleValue < this.sliderLine.offsetLeft + this.sliderLine.offsetWidth + halfHandleWidth
        ? handleValue
        : this.sliderLine.offsetLeft + this.sliderLine.offsetWidth + halfHandleWidth;
    handleValue = Math.round(handleValue / this.moveBlockWidth) * this.step + this.minValue;
    return handleValue;
  }

  private renderSteps() {
    this.sliderSteps.innerHTML = '';
    const amountOfSteps = (this.maxValue - this.minValue) / this.stepRender;
    for (let i = 0; i <= amountOfSteps; i++) {
      const step = document.createElement('div');
      step.classList.add('slider-step');
      let value = (this.minValue + i * this.stepRender).toString();
      if (this.sliderStepStrings.length > i) {
        value = this.sliderStepStrings[i];
      }
      if (value.length > 0) {
        step.innerHTML = `
          <span>${value}</span>
        `;
      } else {
        step.classList.add('slider-step__no-value');
      }
      step.style.left = `${i * this.moveBlockWidth * (this.stepRender > this.step ? this.stepRender : 1)}px`;
      this.sliderSteps.insertAdjacentElement('beforeend', step);
    }
  }
}
