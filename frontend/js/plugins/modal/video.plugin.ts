import { Modal } from '../../components-base/modal.component';
import { ArrayPrototypes } from '../../utils/prototypes/array.prototypes';
import { ModalPlugin } from './plugin.interface';

ArrayPrototypes.activateFrom();

export class VideoModalPlugin implements ModalPlugin {
  private triggerSelector = '';
  private modalComponent: Modal;
  private caption: HTMLDivElement;
  private captionGroup: Array<string>;
  private modalLoader: HTMLDivElement;
  private iframe: HTMLIFrameElement;

  private options = {};

  public cssClasses = {
    videoStyle: 'modal__video w-screen max-w-[calc(100vw-6rem)] aspect-video',
    videoCaptionStyle: 'modal__caption p-2 bg-black text-sm text-white',
  };

  constructor(selector: string) {
    this.triggerSelector = selector;
  }

  public getPluginName() {
    return 'video';
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
    const src = (trigger && trigger.getAttribute('data-modal-video')) ?? this.modalComponent.options.src;
    const caption = (trigger && trigger.getAttribute('data-caption')) ?? this.modalComponent.options.caption;
    const group = (trigger && trigger.getAttribute('data-group')) ?? this.modalComponent.options.group;

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
        this.iframe.src = '';
      };
      if (group) {
        this.modalComponent.dialog.setAttribute('id', group);
      }
      document.body.appendChild(this.modalComponent.dialog);
      this.modalComponent.addCloseButton();
      this.modalComponent.modalCloseBtn.classList.add('hidden');

      this.caption = document.createElement('div');
      this.caption.classList.add('hidden');
      this.caption.classList.add(...this.cssClasses.videoCaptionStyle.split(' '));
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
    this.iframe.setAttribute('src', this.modalComponent.galleryGroup[this.modalComponent.currentGroupIndex]);
  }

  public openPluginModal(src: string) {
    this.modalComponent.galleryGroup = [];
    this.captionGroup = [];

    const group = this.modalComponent.trigger && this.modalComponent.trigger.getAttribute('data-group');
    if (group) {
      this.modalComponent.galleryGroup = Array.from(document.querySelectorAll(`[data-group=${group}]`)).map(
        (t) => `https://www.youtube.com/embed/${this.getYoutubeId(t.getAttribute('data-modal-video'))}`
      );
      const captions = document.querySelectorAll(`[data-group=${group}][data-caption]`);
      if (captions.length > 0) {
        this.captionGroup = Array.from(document.querySelectorAll(`[data-group=${group}]`)).map((t) =>
          t.getAttribute('data-caption')
        );
      }
      this.modalComponent.currentGroupIndex = this.modalComponent.galleryGroup.indexOf(
        `https://www.youtube.com/embed/${this.getYoutubeId(src)}`
      );
    }

    if (!this.modalLoader) {
      this.modalLoader = document.createElement('div');
      this.modalLoader.classList.add(...this.modalComponent.cssClasses.loaderStyle.split(' '));
      this.modalLoader.insertAdjacentHTML('afterbegin', `<div class="loader"></div>`);
      this.modalComponent.dialog.insertAdjacentElement('afterbegin', this.modalLoader);
    }

    if (this.iframe) {
      this.iframe.src = `https://www.youtube.com/embed/${this.getYoutubeId(src)}`;
      if (group) {
        this.changeGroupIndex();
        this.modalComponent.showNavigation();
      }
    } else {
      this.modalComponent.modalCloseBtn.classList.remove('hidden');
      if (group) {
        this.modalComponent.addNavigation();
        this.modalComponent.showNavigation();
      }
      this.iframe = document.createElement('iframe');
      this.iframe.classList.add(...this.cssClasses.videoStyle.split(' '));
      this.iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
      this.iframe.setAttribute('allowfullscreen', 'true');
      this.iframe.addEventListener('load', () => {
        this.modalLoader.classList.add('hidden');
        if (this.caption.innerText.length > 0) {
          this.caption.classList.remove('hidden');
        }
      });
      this.iframe.src = `https://www.youtube.com/embed/${this.getYoutubeId(src)}`;
      this.modalLoader.classList.add('hidden');
      this.modalComponent.dialog.insertAdjacentElement('afterbegin', this.iframe);
    }
    this.modalComponent.dialog.showModal();
  }

  private getYoutubeId(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return match && match[7].length == 11 ? match[7] : false;
  }
}
