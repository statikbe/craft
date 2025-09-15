import { Modal } from '../../components/modal.component';
import { AnimationHelper } from '../../utils/animationHelper';
import { ArrayPrototypes } from '../../utils/prototypes/array.prototypes';
import { ModalPlugin } from './plugin.interface';

ArrayPrototypes.activateFrom();

export class ImageModalPlugin implements ModalPlugin {
  private triggerSelector = '';
  private modalComponent: Modal;
  private image: HTMLImageElement;
  private caption: HTMLDivElement;
  private captionGroup: Array<string>;
  private modalLoader: HTMLDivElement;

  private options = {};

  constructor(selector: string) {
    this.triggerSelector = selector;
  }

  public getPluginName() {
    return 'image';
  }

  public getTriggerSelector() {
    return this.triggerSelector;
  }

  public getOptions() {
    return this.options;
  }

  public openModalClick(modal: Modal) {
    this.modalComponent = modal;
    const trigger = this.modalComponent.trigger;
    const src = trigger.getAttribute('data-modal-image');
    const caption = trigger.getAttribute('data-caption');
    const group = trigger.getAttribute('data-group');

    if (group) {
      const dialog = document.querySelector(`dialog#${group}`);
      if (dialog) {
        this.modalComponent.dialog = dialog as HTMLDialogElement;
        this.modalComponent.showNavigation();
        this.changeGroupIndex();
      }
    }

    if (!this.modalComponent.dialog) {
      this.modalComponent.dialog = document.createElement('dialog');
      if (group) {
        this.modalComponent.dialog.setAttribute('id', group);
      }
      document.body.appendChild(this.modalComponent.dialog);
      this.modalComponent.addCloseButton();
      this.modalComponent.modalCloseBtn.classList.add('hidden');

      this.caption = document.createElement('div');
      this.caption.classList.add('hidden');
      this.caption.classList.add(...this.modalComponent.cssClasses.imageCaptionStyle.split(' '));
      this.caption.innerText = caption;
      this.modalComponent.dialog.appendChild(this.caption);
    }
    src ? this.openPluginModal(src) : console.log('No modal src is provided on the trigger');
  }

  public gotoNextAction() {
    this.changeGroupIndex();
  }

  public gotoPrevAction() {
    this.changeGroupIndex();
  }

  public closeModal() {}

  private changeGroupIndex() {
    this.caption.classList.add('hidden');
    this.modalLoader.classList.remove('hidden');
    if (this.captionGroup[this.modalComponent.currentGroupIndex]) {
      this.caption.innerText = this.captionGroup[this.modalComponent.currentGroupIndex];
    } else {
      this.caption.innerText = '';
    }
    this.image.setAttribute('src', this.modalComponent.galleryGroup[this.modalComponent.currentGroupIndex]);
  }

  public openPluginModal(src: string) {
    this.modalComponent.galleryGroup = [];
    this.captionGroup = [];

    const group = this.modalComponent.trigger.getAttribute('data-group');
    if (group) {
      this.modalComponent.galleryGroup = Array.from(document.querySelectorAll(`[data-group=${group}]`)).map((t) =>
        t.getAttribute('data-modal-image')
      );
      const captions = document.querySelectorAll(`[data-group=${group}][data-caption]`);
      if (captions.length > 0) {
        this.captionGroup = Array.from(document.querySelectorAll(`[data-group=${group}]`)).map((t) =>
          t.getAttribute('data-caption')
        );
      }
      this.modalComponent.currentGroupIndex = this.modalComponent.galleryGroup.indexOf(src);
    }

    if (!this.modalLoader) {
      this.modalLoader = document.createElement('div');
      this.modalLoader.classList.add(...this.modalComponent.cssClasses.loaderStyle.split(' '));
      this.modalLoader.insertAdjacentHTML('afterbegin', `<div class="loader"></div>`);
      this.modalComponent.dialog.insertAdjacentElement('afterbegin', this.modalLoader);
    }

    if (!this.image) {
      if (group) {
        this.modalComponent.addNavigation();
      }
      this.image = document.createElement('img');
      this.image.addEventListener('load', (e) => {
        this.modalLoader.classList.add('hidden');
        this.modalComponent.modalCloseBtn.classList.remove('hidden');
        if (group) {
          this.modalComponent.showNavigation();
        }
        if (this.caption.innerText.length > 0) {
          this.caption.classList.remove('hidden');
        }
      });
      this.image.setAttribute('src', src);
      this.image.classList.add(...this.modalComponent.cssClasses.imageStyle.split(' '));
      this.modalComponent.dialog.insertAdjacentElement('afterbegin', this.image);
    } else {
      if (group) {
        this.changeGroupIndex();
      }
    }

    this.modalComponent.dialog.showModal();
  }
}
