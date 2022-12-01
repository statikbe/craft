import { DOMHelper } from '../utils/domHelper';
import { Info } from '../utils/info';

export class GlideComponent {
  constructor() {
    const sliders = Array.from(document.querySelectorAll('.js-slider'));
    if (sliders.length > 0) {
      this.processSliders(sliders);
    }

    DOMHelper.onDynamicContent(document.documentElement, '.js-slider', (sliders) => {
      this.processSliders(Array.from(sliders), true);
    });
  }

  private async processSliders(sliders: Array<Element>, ajaxLoaded?: boolean) {
    // @ts-ignore
    const Glide = await import('@glidejs/glide');
    sliders.forEach((slider) => {
      slider.classList.remove('js-slider');
      const sliderID = slider.getAttribute('id');

      if (sliderID.indexOf('carousel') >= 0) {
        const glide = new Glide.default('#' + sliderID, {
          type: 'carousel',
          perView: 1,
        });
        glide.mount();
      }

      if (sliderID.indexOf('slider') >= 0) {
        const idealWidth = parseInt(slider.getAttribute('data-ideal-width')) || 200;
        const glide = new Glide.default('#' + sliderID, {
          type: 'slider',
          perView: 1,
          animationDuration: 800,
          gap: 20,
          peek: 100,
        });

        glide.on(['mount.after', 'resize'], function (e) {
          const slider = document.getElementById(sliderID);
          const slides = slider.querySelectorAll('.glide__slide');
          if (window.innerWidth < 480) {
            glide.update({ peek: 40 });
          } else {
            glide.update({ peek: 100 });
          }
          const availableWidth = slider.offsetWidth - 2 * glide.settings.peek;
          let possiblePerView = Math.floor(availableWidth / idealWidth);

          if (possiblePerView <= 0) {
            possiblePerView = 1;
          }
          glide.update({ perView: possiblePerView });

          const controles = slider.querySelector("div[data-glide-el='controls']");

          if ((controles && Info.isTouchDevice() && Info.isMobile()) || possiblePerView >= slides.length) {
            controles.classList.add('hidden');
          } else {
            controles.classList.remove('hidden');
          }
          if (possiblePerView >= slides.length) {
            if (glide.index > 0) {
              glide.go('<<');
            }
            glide.disable();
          } else {
            glide.enable();
          }
        });

        glide.on(['run.before', 'resize'], (event) => {
          const slider = document.getElementById(sliderID);
          const slides = slider.querySelectorAll('.glide__slide');

          let amount = glide.settings.perView;

          if (slides.length - (glide.index + glide.settings.perView) < amount) {
            amount = slides.length - glide.settings.perView;
          }
          event.steps = event.direction === '>' ? -amount : amount;

          Array.from(slides).forEach((slide) => {
            slide.classList.remove('opacity-50');
            slide.classList.remove('opacity-25');
            slide.classList.remove('opacity-0');
            slide.classList.remove('pointer-events-none');
          });
        });

        glide.on(['mount.after', 'run.after', 'resize'], (event) => {
          const slider = document.getElementById(sliderID);
          const slides = slider.querySelectorAll('.glide__slide');
          let start = glide.index;
          let end = start + glide.settings.perView;
          Array.from(slides).forEach((slide, i) => {
            if (i < start || i >= end) {
              if (i + 1 == start || i == end) {
                slide.classList.add('opacity-50');
              } else if (i + 2 == start || i - 1 == end) {
                slide.classList.add('opacity-25');
              } else {
                slide.classList.add('opacity-0');
              }
              slide.classList.add('pointer-events-none');
            }
          });

          const prevController = slider.querySelector("div[data-glide-el='controls'] .glide__arrow--left");
          const nextController = slider.querySelector("div[data-glide-el='controls'] .glide__arrow--right");
          if (glide.index == 0) {
            prevController.classList.add('opacity-25');
            prevController.classList.add('pointer-events-none');
            prevController.classList.remove('pointer-events-auto');
          } else {
            prevController.classList.remove('opacity-25');
            prevController.classList.remove('pointer-events-none');
            prevController.classList.add('pointer-events-auto');
          }

          if (glide.index + glide.settings.perView >= slides.length) {
            nextController.classList.add('opacity-25');
            nextController.classList.add('pointer-events-none');
            nextController.classList.remove('pointer-events-auto');
          } else {
            nextController.classList.remove('opacity-25');
            nextController.classList.remove('pointer-events-none');
            nextController.classList.add('pointer-events-auto');
          }
        });

        if (ajaxLoaded) {
          glide.mount();
        } else {
          setTimeout(() => {
            glide.mount();
          }, 0);
        }
      }
    });
  }
}
