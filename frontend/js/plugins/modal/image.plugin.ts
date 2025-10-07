import { Modal } from '../../components-base/modal.component';
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

  public cssClasses = {
    imageStyle: 'modal__image w-full max-h-[calc(100vh-6rem)] max-w-[calc(100vw-6rem)]',
    imageCaptionStyle: 'modal__caption p-2 bg-black/50 absolute left-0 right-0 bottom-0 text-sm text-white',
  };

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
    const src = (trigger && trigger.getAttribute('data-modal-image')) ?? this.modalComponent.options.src;
    const caption = (trigger && trigger.getAttribute('data-caption')) ?? this.modalComponent.options.caption ?? '';
    const group = (trigger && trigger.getAttribute('data-group')) ?? this.modalComponent.options.group;

    if (trigger) {
      const datasetKeys = Object.keys(this.modalComponent.trigger.dataset);
      datasetKeys.forEach((key) => {
        if (this.cssClasses[key]) {
          this.cssClasses[key] = this.modalComponent.trigger.dataset[key];
        }
      });
    }

    if (group) {
      const dialog = document.querySelector(`dialog#${group}`);
      if (dialog) {
        this.modalComponent.dialog = dialog as HTMLDialogElement;
        this.changeGroupIndex();
      }
    }

    if (!this.modalComponent.dialog) {
      this.modalComponent.dialog = document.createElement('dialog');
      this.modalComponent.dialog.onclose = () => {
        this.modalComponent.hideNavigation();
      };
      if (group) {
        this.modalComponent.dialog.setAttribute('id', group);
      }
      document.body.appendChild(this.modalComponent.dialog);
      this.modalComponent.addCloseButton();
      this.modalComponent.modalCloseBtn.classList.add('hidden');

      this.caption = document.createElement('div');
      this.caption.classList.add('hidden');
      this.caption.classList.add(...this.cssClasses.imageCaptionStyle.split(' '));
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

    const group = this.modalComponent.trigger && this.modalComponent.trigger.getAttribute('data-group');
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
      this.image.classList.add(...this.cssClasses.imageStyle.split(' '));
      this.modalComponent.dialog.insertAdjacentElement('afterbegin', this.image);
    } else {
      if (group) {
        this.changeGroupIndex();
      }
    }

    this.modalComponent.dialog.showModal();
  }
}
