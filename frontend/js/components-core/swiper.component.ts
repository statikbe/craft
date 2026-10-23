import Swiper from 'swiper';
import { SiteLang } from '../utils/site-lang';
import { Navigation, Pagination, A11y } from 'swiper/modules';

// import 'swiper/css/navigation';

export default class SwiperComponent {
  private siteLang = SiteLang.getLang();
  private lang;

  constructor() {
    this.getLang().then(() => {
      const swiper = new Swiper('.swiper', {
        modules: [Navigation, Pagination, A11y],
        slidesPerView: 'auto',
        //   slideToClickedSlide: true,
        watchSlidesProgress: true,
        // .is-in-view on the slides that are fully in view (the templates fade the others): Swiper's own
        // swiper-slide-fully-visible compares half pixels exactly, so with e.g. 2 × 181.5px slides in 363px the second one
        // was dimmed although it ends at the edge
        on: {
          afterInit: (s: Swiper) => this.markInView(s),
          setTranslate: (s: Swiper) => this.markInView(s),
          resize: (s: Swiper) => this.markInView(s),
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
          lockClass: 'hidden',
        },
        // Only for sliders with a .swiper-pagination element; the bullets are styled in the template
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          bulletElement: 'button',
          lockClass: 'hidden',
        },
        a11y: {
          prevSlideMessage: this.lang.prevSlideMessage,
          nextSlideMessage: this.lang.nextSlideMessage,
          firstSlideMessage: this.lang.firstSlideMessage,
          lastSlideMessage: this.lang.lastSlideMessage,
          paginationBulletMessage: this.lang.paginationBulletMessage,
        },
      });
    });
  }

  /** Marks the slides that are in view with 1px tolerance, from the target translate (also at the start of a transition) */
  private markInView(swiper: Swiper) {
    swiper.slides.forEach((slide, i) => {
      const before = (slide as HTMLElement & { swiperSlideOffset: number }).swiperSlideOffset + swiper.translate;
      const after = before + swiper.slidesSizesGrid[i];
      slide.classList.toggle('is-in-view', before >= -1 && after <= swiper.size + 1);
    });
  }

  private async getLang() {
    this.lang = await import(`../i18n/s-swiper-${this.siteLang}.json`);
  }
}
