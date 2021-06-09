import { A11yUtils } from './a11y';

export class IEBannerComponent {
  private mainContentBlock: HTMLElement;

  constructor() {
    this.mainContentBlock = document.getElementById('mainContentBlock');

    window.addEventListener('cookie-closed', () => {
      const banner = document.querySelector('.ie-banner') as HTMLElement;
      const overlay = document.querySelector('.ie-banner-overlay') as HTMLElement;
      banner.classList.remove('hidden');
      overlay.classList.remove('hidden');
      A11yUtils.keepFocus(banner);
      banner.focus();
      const closeBtn = document.querySelector('.js-ie-banner-close') as HTMLElement;
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        banner.classList.add('hidden');
        overlay.classList.add('hidden');
        this.setMainContentInert(false);
      });
      this.setMainContentInert();
    });
  }

  private setMainContentInert(set = true) {
    if (this.mainContentBlock && set) {
      this.mainContentBlock.setAttribute('inert', '');
      document.documentElement.classList.add('overflow-hidden');
    }
    if (this.mainContentBlock && !set) {
      this.mainContentBlock.removeAttribute('inert');
      document.documentElement.classList.remove('overflow-hidden');
    }
  }
}
