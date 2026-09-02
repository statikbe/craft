import Swiper from 'swiper';
import { SiteLang } from '../utils/site-lang';
import { Navigation, A11y } from 'swiper/modules';

import 'swiper/css';
// import 'swiper/css/navigation';

export default class SwiperComponent {
  private siteLang = SiteLang.getLang();
  private lang;

  constructor() {
    this.getLang().then(() => {
      const swiper = new Swiper('.swiper', {
        modules: [Navigation, A11y],
        slidesPerView: 'auto',
        //   slideToClickedSlide: true,
        watchSlidesProgress: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
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
