import { DOMHelper } from '../utils/domHelper';
import { Info } from '../utils/info';

export class GlideComponent {
  constructor() {
    const sliders = Array.from(document.querySelectorAll('.js-slider'));
    if (sliders.length > 0) {
      this.processSliders(sliders);
    }
  }

  private async processSliders(sliders: Array<Element>) {
    // @ts-ignore
    const Glide = await import('@glidejs/glide');
    sliders.forEach((slider) => {
      slider.classList.remove('js-slider');
      const sliderID = slider.getAttribute('id');

      if (sliderID.indexOf('carousel') >= 0) {
        const glide = new Glide.default('#' + sliderID, {
          type: 'carousel',
          gap: 0,
          perView: 1,
        });

        glide.on(['mount.after', 'resize'], function (e) {
          if (window.innerWidth < 480) {
            glide.update({ peek: 40 });
          } else {
            glide.update({ peek: 0 });
          }
        });

        glide.mount();
      }

      if (sliderID.indexOf('slider') >= 0) {
        const idealWidth = parseInt(slider.getAttribute('data-ideal-width')) || 200;
        const peek = slider.hasAttribute('data-peek') ? parseInt(slider.getAttribute('data-peek')) : 100;
        const gap = slider.hasAttribute('data-gap') ? parseInt(slider.getAttribute('data-gap')) : 20;
        const animationDuration = slider.hasAttribute('data-animation-duration')
          ? parseInt(slider.getAttribute('data-animation-duration'))
          : 800;

        const glide = new Glide.default('#' + sliderID, {
          type: 'slider',
          perView: 1,
          animationDuration: animationDuration,
          gap: gap,
          peek: peek,
          perTouch: 1,
        });

        glide.on(['mount.after', 'resize'], function (e) {
          const slider = document.getElementById(sliderID);
          const slides = slider.querySelectorAll('.glide__slide');
          if (window.innerWidth < 480) {
            glide.update({ peek: 40 });
          } else {
            glide.update({ peek: peek });
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
          slides.forEach((slide: HTMLElement) => {
            slide.style.transitionProperty = 'opacity';
            slide.style.transitionDuration = glide.settings.animationDuration + 'ms';
            slide.style.transitionTimingFunction = 'ease';
          });

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
        });

        glide.on(['run.before', 'resize'], (event) => {
          const slider = document.getElementById(sliderID);
          const slides = slider.querySelectorAll('.glide__slide');

          let amount = glide.settings.perView;

          if (slides.length - (glide.index + glide.settings.perView) < amount) {
            amount = slides.length - glide.settings.perView;
          }

          event.steps = event.direction === '>' ? -amount : amount;
          let start = glide.index;
          let end = start + glide.settings.perView;
          Array.from(slides).forEach((slide, i) => {
            if ((event.direction === '>' && i == start) || (event.direction === '<' && i + 1 == end)) {
              slide.classList.add('opacity-50');
              slide.classList.add('pointer-events-none');
            } else if ((event.direction === '>' && i + 1 == start) || (event.direction === '<' && i == end)) {
              slide.classList.remove('opacity-50');
              slide.classList.add('opacity-25');
            } else if ((event.direction === '>' && i + 2 == start) || (event.direction === '<' && i - 1 == end)) {
              slide.classList.remove('opacity-25');
              slide.classList.add('opacity-0');
            }
            if ((event.direction === '>' && i == end) || (event.direction === '<' && i + 1 == start)) {
              slide.classList.remove('opacity-50');
              slide.classList.remove('pointer-events-none');
            } else if ((event.direction === '>' && i - 1 == end) || (event.direction === '<' && i + 2 == start)) {
              slide.classList.add('opacity-50');
              slide.classList.remove('opacity-25');
            } else if ((event.direction === '>' && i - 2 == end) || (event.direction === '<' && i + 3 == start)) {
              slide.classList.add('opacity-25');
              slide.classList.remove('opacity-0');
            }
          });
        });

        glide.on(['mount.after', 'run.after', 'resize'], (event) => {
          const slider = document.getElementById(sliderID);
          const slides = slider.querySelectorAll('.glide__slide');

          const prevController = slider.querySelector(
            "div[data-glide-el='controls'] .glide__arrow--left"
          ) as HTMLButtonElement;
          const nextController = slider.querySelector(
            "div[data-glide-el='controls'] .glide__arrow--right"
          ) as HTMLButtonElement;
          if (glide.index == 0) {
            prevController.classList.add('opacity-25');
            prevController.classList.add('pointer-events-none');
            prevController.classList.remove('pointer-events-auto');
            prevController.disabled = true;
          } else {
            prevController.classList.remove('opacity-25');
            prevController.classList.remove('pointer-events-none');
            prevController.classList.add('pointer-events-auto');
            prevController.disabled = false;
          }

          if (glide.index + glide.settings.perView >= slides.length) {
            nextController.classList.add('opacity-25');
            nextController.classList.add('pointer-events-none');
            nextController.classList.remove('pointer-events-auto');
            nextController.disabled = true;
          } else {
            nextController.classList.remove('opacity-25');
            nextController.classList.remove('pointer-events-none');
            nextController.classList.add('pointer-events-auto');
            nextController.disabled = false;
          }
        });

        window.addEventListener('load', function () {
          glide.mount();
        });

        glide.mount();
      }
    });
  }
}
