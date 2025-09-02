import { Masonry } from '@prof-dev/masonry';

export default class MasonryComponent {
  constructor() {
    const masonries = document.querySelectorAll('.masonry');
    masonries.forEach((masonry) => {
      new Masonry(masonry as HTMLElement);
    });
  }
}
