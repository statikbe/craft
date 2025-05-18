import Swiper from 'swiper';
import { Navigation, A11y } from 'swiper/modules';

import 'swiper/css';
// import 'swiper/css/navigation';

export default class SwiperComponent {
  constructor() {
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
    });
  }
}
