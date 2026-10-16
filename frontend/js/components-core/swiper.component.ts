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

  private async getLang() {
    this.lang = await import(`../i18n/s-swiper-${this.siteLang}.json`);
  }
}
