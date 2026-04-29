import { SiteLang } from '../utils/site-lang';
import { ModalPlugin, ModalPluginConstructor } from '../plugins/modal/plugin.interface';
import { DOMHelper } from '../utils/domHelper';
import { Ajax } from '../utils/ajax';

export default class ModalComponent {
  private options = {
    onClose: null,
    plugins: [],
  };

  private plugins: Array<ModalPlugin> = new Array<ModalPlugin>();

  constructor(options: Object = {}) {
    this.options = { ...this.options, ...options };

    const triggers = document.querySelectorAll('button[data-modal]');
    Array.from(triggers).forEach((trigger: HTMLElement) => {
      this.initModal(trigger, options);
    });
    DOMHelper.onDynamicContent(document.documentElement, 'button[data-modal]', (triggers) => {
      Array.from(triggers).forEach((trigger: HTMLElement) => {
        this.initModal(trigger, options);
      });
    });
    this.options.plugins.forEach((p) => {
      const triggers = document.querySelectorAll(p.selector);
      Array.from(triggers).forEach((trigger: HTMLElement) => {
        this.initModal(trigger, options, p);
      });

      DOMHelper.onDynamicContent(document.documentElement, p.selector, (triggers) => {
        Array.from(triggers).forEach((trigger: HTMLElement) => {
          this.initModal(trigger, options, p);
        });
      });
    });
  }

  private initModal(trigger: HTMLElement, options: Object = {}, plugin: any = null) {
    let p = null;
    if (plugin) {
      p =
        typeof plugin.module == 'function'
          ? new plugin.module(plugin.selector)
          : new plugin.module.plugin(plugin.selector);
    }
    if (trigger.hasAttribute('data-modal-initialized')) {
      return;
    }
    trigger.setAttribute('data-modal-initialized', 'true');
    if (trigger.hasAttribute('data-group')) {
      const group = trigger.getAttribute('data-group');
      const groupTriggers = document.querySelectorAll(`button[data-group="${group}"]`);
      if (Array.from(groupTriggers).indexOf(trigger) > 0) {
        return;
      } else {
        return new Modal(trigger, options, p);
      }
    } else {
      return new Modal(trigger, options, p);
    }
  }
}

export class Modal {
  private siteLang = SiteLang.getLang();
  private lang;
  public options: any = {};
  public trigger: HTMLElement;
  public dialog: HTMLDialogElement;
  private plugin: ModalPlugin;
  public modalCloseBtn: HTMLButtonElement;

  public galleryGroup: Array<string>;
  public currentGroupIndex: number = 0;
  private nextButton: HTMLButtonElement;
  private prevButton: HTMLButtonElement;

  private navListener;
  private startTouchX = 0;
  private startTouchY = 0;

  public cssClasses = {
    closePosition: 'absolute -top-4 -right-4',
    closeStyle: 'modal__close bg-white p-2',
    closeAfter:
      'after:block after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/clear.svg")]',
    loaderStyle: 'modal__loader__wrapper p-6 bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    nextButtonStyle:
      'modal__next-button absolute top-1/2 -translate-y-1/2 left-full -mr-4 bg-white p-2 disabled:hidden',
    nextButtonAfter:
      'after:block after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/chevron-right.svg")]',
    prevButtonStyle:
      'modal__prev-button absolute top-1/2 -translate-y-1/2 right-full -ml-4 bg-white p-2 disabled:hidden',
    prevButtonAfter:
      'after:block after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/chevron-left.svg")]',
  };

  constructor(trigger: HTMLElement, options: Object = {}, plugin: ModalPlugin = null) {
    // this.getLang().then(() => {
    this.lang = import(`../i18n/s-modal-${this.siteLang}.json`);
    this.options = { ...this.options, ...options };
    this.plugin = plugin;
    this.initTrigger(trigger);
    // });
  }

  private async getLang() {
    this.lang = import(`../i18n/s-modal-${this.siteLang}.json`);
  }

  private initTrigger(trigger: HTMLElement) {
    this.trigger = trigger;
    if (!this.trigger) {
      return;
    }
    const datasetKeys = Object.keys(this.trigger.dataset);
    datasetKeys.forEach((key) => {
      if (this.cssClasses[key]) {
        this.cssClasses[key] = this.trigger.dataset[key];
      }
    });

    if (this.trigger.getAttribute('data-modal')) {
      this.dialog = document.getElementById(this.trigger.getAttribute('data-modal')) as HTMLDialogElement;
      this.onDialogCreation();
      this.addCloseButton();
      this.activateCloseButtons();
    }

    // Listen for element removal (destroy)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((removedNode) => {
          if (removedNode === this.trigger || removedNode.contains(this.trigger)) {
            // Clean up listeners and resources here
            if (this.dialog) {
              this.dialog.remove();
            }
            observer.disconnect();
          }
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    if (this.trigger.hasAttribute('data-group')) {
      const group = this.trigger.getAttribute('data-group');
      const groupTriggers = document.querySelectorAll(`button[data-group="${group}"]`);
      groupTriggers.forEach((btn: HTMLElement, index) => {
        btn.addEventListener('click', this.triggerClicked.bind(this));
      });
    } else {
      this.trigger.addEventListener('click', this.triggerClicked.bind(this));
    }
  }

  private triggerClicked(e) {
    const _self = this;
    e.preventDefault();
    let normalModal = true;
    this.trigger = e.currentTarget;

    if (this.plugin) {
      if (e.currentTarget.matches(`${this.plugin.getTriggerSelector()}`)) {
        normalModal = false;
        this.options = { ...this.options, ...this.plugin.getOptions() };
        this.plugin.openModalClick(_self);
      }
    }
    if (normalModal) {
      if (this.dialog) {
        this.dialog.showModal();
      }
    }
  }

  public addCloseButton() {
    this.modalCloseBtn = document.createElement('button');
    this.modalCloseBtn.classList.add(...this.cssClasses.closePosition.split(' '));
    this.modalCloseBtn.classList.add(...this.cssClasses.closeStyle.split(' '));
    this.modalCloseBtn.classList.add(...this.cssClasses.closeAfter.split(' '));
    this.modalCloseBtn.setAttribute('type', 'button');
    this.modalCloseBtn.insertAdjacentHTML('beforeend', `<span class="sr-only">${this.lang.closeLabel}</span>`);
    this.modalCloseBtn.addEventListener('click', () => {
      this.dialog.close();
    });
    this.dialog.insertAdjacentElement('afterbegin', this.modalCloseBtn);
  }

  public activateCloseButtons() {
    this.dialog.querySelectorAll('button[data-modal-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.dialog.close();
      });
    });
  }

  public openPluginModal() {
    if (this.plugin) {
      this.plugin.openModalClick(this);
      this.dialog.showModal();
    }
  }

  public addNavigation() {
    this.nextButton = document.createElement('button');
    this.nextButton.setAttribute('type', 'button');
    this.nextButton.setAttribute('aria-label', this.lang.nextLabel);
    this.nextButton.classList.add(...this.cssClasses.nextButtonStyle.split(' '));
    this.nextButton.classList.add(...this.cssClasses.nextButtonAfter.split(' '));
    this.nextButton.insertAdjacentHTML('beforeend', `<span class="sr-only">${this.lang.nextText}</span>`);
    this.nextButton.addEventListener('click', this.gotoNextItem.bind(this));
    if (this.currentGroupIndex === this.galleryGroup.length - 1) {
      this.nextButton.setAttribute('disabled', '');
    }
    this.dialog.insertAdjacentElement('beforeend', this.nextButton);

    this.prevButton = document.createElement('button');
    this.prevButton.setAttribute('type', 'button');
    this.prevButton.classList.add(...this.cssClasses.prevButtonStyle.split(' '));
    this.prevButton.classList.add(...this.cssClasses.prevButtonAfter.split(' '));
    this.prevButton.setAttribute('aria-label', this.lang.prevLabel);
    this.prevButton.insertAdjacentHTML('beforeend', `<span class="sr-only">${this.lang.prevText}</span>`);
    this.prevButton.addEventListener('click', this.gotoPrevItem.bind(this));
    if (this.currentGroupIndex === 0) {
      this.prevButton.setAttribute('disabled', '');
    }
    this.dialog.insertAdjacentElement('beforeend', this.prevButton);

    this.navListener = this.keyBoardNavigation.bind(this);
    document.addEventListener('keydown', this.navListener);

    this.dialog.addEventListener('touchstart', (e) => {
      this.startTouchX = e.changedTouches[0].pageX;
      this.startTouchY = e.changedTouches[0].pageY;
    });

    this.dialog.addEventListener('touchend', (e) => {
      const swipeThreshold = 10;
      let moved;
      if (this.startTouchX - e.changedTouches[0].pageX > swipeThreshold) {
        this.gotoNextItem();
        moved = true;
      }
      if (this.startTouchX - e.changedTouches[0].pageX < swipeThreshold) {
        this.gotoPrevItem();
        moved = true;
      }
      if (this.startTouchY - e.changedTouches[0].pageY > swipeThreshold && !moved) {
        this.gotoNextItem();
      }
      if (this.startTouchY - e.changedTouches[0].pageY < swipeThreshold && !moved) {
        this.gotoPrevItem();
      }
    });
  }

  public showNavigation() {
    this.nextButton.removeAttribute('disabled');
    if (this.currentGroupIndex === this.galleryGroup.length - 1) {
      this.nextButton.setAttribute('disabled', '');
      this.prevButton.focus();
    }
    this.prevButton.removeAttribute('disabled');
    if (this.currentGroupIndex === 0) {
      this.prevButton.setAttribute('disabled', '');
      this.nextButton.focus();
    }
  }

  public hideNavigation() {
    if (this.nextButton) {
      this.nextButton.setAttribute('disabled', '');
    }
    if (this.prevButton) {
      this.prevButton.setAttribute('disabled', '');
    }
  }

  public gotoNextItem() {
    this.prevButton.removeAttribute('disabled');
    if (this.currentGroupIndex < this.galleryGroup.length - 1) {
      this.currentGroupIndex++;
      this.plugin.gotoNextAction();
    }
    if (this.currentGroupIndex === this.galleryGroup.length - 1) {
      this.nextButton.setAttribute('disabled', '');
      this.prevButton.focus();
    }
  }

  public gotoPrevItem() {
    this.nextButton.removeAttribute('disabled');
    if (this.currentGroupIndex > 0) {
      this.currentGroupIndex--;
      this.plugin.gotoPrevAction();
    }
    if (this.currentGroupIndex === 0) {
      this.prevButton.setAttribute('disabled', '');
      this.nextButton.focus();
    }
  }

  private keyBoardNavigation(event) {
    if (
      event.keyCode === 39 ||
      event.key === 'ArrowRight' ||
      (event.code === 'ArrowRight' && this.currentGroupIndex < this.galleryGroup.length - 1)
    ) {
      this.gotoNextItem();
    }
    if (
      event.keyCode === 37 ||
      event.key === 'ArrowLeft' ||
      (event.code === 'ArrowLeft' && this.currentGroupIndex > 0)
    ) {
      this.gotoPrevItem();
    }
  }

  public onDialogCreation() {
    const refreshOnClose = document.querySelectorAll('[data-refresh-on-dialog-close]');
    if (refreshOnClose.length > 0) {
      this.dialog.addEventListener('close', () => {
        Ajax.call({
          url: window.location.href,
          method: 'GET',
          success: (response) => {
            refreshOnClose.forEach((el: HTMLElement) => {
              const value = el.getAttribute('data-refresh-on-dialog-close');
              const responseElement = document.implementation.createHTMLDocument('');
              responseElement.body.innerHTML = response;
              const newContent = responseElement.body.querySelector(`[data-refresh-on-dialog-close="${value}"]`);
              if (newContent && el.innerHTML !== newContent.innerHTML) {
                el.innerHTML = newContent.innerHTML;
              }
            });
          },
        });
      });
    }
  }
}
