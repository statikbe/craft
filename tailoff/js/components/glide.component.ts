// import Glide from "@glidejs/glide";
// import Glide, { Controls, Breakpoints, Keyboard, Swipe } from '@glidejs/glide/dist/glide.modular.esm';
import { DOMHelper } from '../utils/domHelper';

export class GlideComponent {
  constructor() {
    const sliders = Array.from(document.querySelectorAll('.js-slider'));
    if (sliders.length > 0) {
      this.processSliders(sliders);
    }

    DOMHelper.onDynamicContent(document.documentElement, '.js-slider', (sliders) => {
      this.processSliders(Array.from(sliders));
    });
  }

  private async processSliders(sliders: Array<Element>) {
    const Glide = await import('@glidejs/glide');
    console.log(Glide);

    sliders.forEach((slider) => {
      slider.classList.remove('js-slider');
      const sliderID = slider.getAttribute('id');
      const glide = new (Glide.default as any)('#' + sliderID, {
        type: 'carousel',
        perView: 1,
      });
      glide.mount({});
      // glide.mount({ Glide.Controls, Glide.Breakpoints, Glide.Keyboard, Glide.Swipe });
    });
  }
}
