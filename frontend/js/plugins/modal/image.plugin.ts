import { Modal } from '../../components-core/modal.component';
import { ArrayPrototypes } from '../../utils/prototypes/array.prototypes';
import { DOMHelper } from '../../utils/domHelper';
import { ModalPlugin } from './plugin.interface';

ArrayPrototypes.activateFrom();

interface ImageModalSource {
  type?: string;
  srcset: string;
  media?: string;
  sizes?: string;
}

export class ImageModalPlugin implements ModalPlugin {
  private static galleryOpenerInitialized = false;
  private triggerSelector = '';
  private modalComponent: Modal;
  private picture: HTMLPictureElement;
  private image: HTMLImageElement;
  private caption: HTMLDivElement;
  private captionGroup: Array<string>;
  private sourcesGroup: Array<Array<ImageModalSource>> = [];
  private modalLoader: HTMLDivElement;
  private loaderTimeout: ReturnType<typeof setTimeout>;
  private loaderDelay = 100;

  private options = {};

  private defaultCssClasses = {
    pictureStyle: 'modal__picture',
    imageStyle: 'modal__image',
    imageCaptionStyle: 'modal__caption modal__caption--image',
  };

  public cssClasses = { ...this.defaultCssClasses };

  constructor(selector: string) {
    this.triggerSelector = selector;
    this.initGalleryOpener();
  }

  // Buttons with data-open-gallery="<group>" open the first image of that gallery group
  private initGalleryOpener() {
    if (ImageModalPlugin.galleryOpenerInitialized) {
      return;
    }
    ImageModalPlugin.galleryOpenerInitialized = true;

    const openers = document.querySelectorAll('[data-open-gallery]');
    Array.from(openers).forEach((opener: HTMLElement) => {
      this.initGalleryOpenerButton(opener);
    });

    DOMHelper.onDynamicContent(document.documentElement, '[data-open-gallery]', (openers: NodeListOf<HTMLElement>) => {
      openers.forEach((opener) => {
        this.initGalleryOpenerButton(opener);
      });
    });
  }

  private initGalleryOpenerButton(opener: HTMLElement) {
    if (opener.hasAttribute('data-open-gallery-initialized')) {
      return;
    }
    opener.setAttribute('data-open-gallery-initialized', 'true');
    opener.addEventListener('click', this.openGalleryClick.bind(this));
  }

  private openGalleryClick(e: MouseEvent) {
    const group = (e.currentTarget as HTMLElement).getAttribute('data-open-gallery');
    const firstTrigger = document.querySelector<HTMLElement>(`[data-modal-image][data-group="${CSS.escape(group)}"]`);
    if (!firstTrigger) {
      console.log(`No gallery found with data-group="${group}"`);
      return;
    }
    e.preventDefault();
    firstTrigger.click();
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
          this.cssClasses[key] = `${this.defaultCssClasses[key]} ${this.modalComponent.trigger.dataset[key]}`.trim();
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

      this.modalComponent.dialog.addEventListener('close', () => {
        this.hideLoader();
        this.setSources([]);
        this.image.setAttribute('src', '');
        this.image.classList.add('hidden');
      });
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
    this.showLoader();
    if (this.captionGroup[this.modalComponent.currentGroupIndex]) {
      this.caption.innerText = this.captionGroup[this.modalComponent.currentGroupIndex];
    } else {
      this.caption.innerText = '';
    }
    this.setSources(this.sourcesGroup[this.modalComponent.currentGroupIndex] ?? []);
    this.image.setAttribute('src', this.modalComponent.galleryGroup[this.modalComponent.currentGroupIndex]);
  }

  // Only show the loader when the image takes longer than loaderDelay to load, to avoid a flash on cached images
  private showLoader() {
    clearTimeout(this.loaderTimeout);
    this.loaderTimeout = setTimeout(() => {
      this.modalLoader.classList.remove('hidden');
    }, this.loaderDelay);
  }

  private hideLoader() {
    clearTimeout(this.loaderTimeout);
    this.modalLoader.classList.add('hidden');
  }

  private getSources(element: Element | null): Array<ImageModalSource> {
    const value = (element && element.getAttribute('data-modal-srcset')) ?? this.modalComponent.options.srcset;
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    }
    try {
      const sources = JSON.parse(value);
      return Array.isArray(sources) ? sources.filter((source) => source && source.srcset) : [];
    } catch (e) {
      console.log('Invalid JSON in data-modal-srcset', value);
      return [];
    }
  }

  private setSources(sources: Array<ImageModalSource>) {
    if (!this.picture) {
      return;
    }
    this.picture.querySelectorAll('source').forEach((source) => source.remove());
    sources.forEach((source) => {
      const sourceElement = document.createElement('source');
      sourceElement.setAttribute('srcset', source.srcset);
      if (source.type) {
        sourceElement.setAttribute('type', source.type);
      }
      if (source.media) {
        sourceElement.setAttribute('media', source.media);
      }
      if (source.sizes) {
        sourceElement.setAttribute('sizes', source.sizes);
      }
      this.picture.insertBefore(sourceElement, this.image);
    });
  }

  public openPluginModal(src: string) {
    this.modalComponent.galleryGroup = [];
    this.captionGroup = [];
    this.sourcesGroup = [];

    const group = this.modalComponent.trigger && this.modalComponent.trigger.getAttribute('data-group');
    if (group) {
      this.modalComponent.galleryGroup = Array.from(document.querySelectorAll(`[data-group=${group}]`)).map((t) =>
        t.getAttribute('data-modal-image'),
      );
      this.sourcesGroup = Array.from(document.querySelectorAll(`[data-group=${group}]`)).map((t) => this.getSources(t));
      const captions = document.querySelectorAll(`[data-group=${group}][data-caption]`);
      if (captions.length > 0) {
        this.captionGroup = Array.from(document.querySelectorAll(`[data-group=${group}]`)).map((t) =>
          t.getAttribute('data-caption'),
        );
      }
      this.modalComponent.currentGroupIndex = this.modalComponent.galleryGroup.indexOf(src);
    }

    if (!this.modalLoader) {
      this.modalLoader = document.createElement('div');
      this.modalLoader.classList.add(...this.modalComponent.cssClasses.loaderStyle.split(' '), 'hidden');
      this.modalLoader.insertAdjacentHTML('afterbegin', `<div class="loader"></div>`);
      this.modalComponent.dialog.insertAdjacentElement('afterbegin', this.modalLoader);
    }

    if (!this.image) {
      if (group) {
        this.modalComponent.addNavigation();
      }
      this.picture = document.createElement('picture');
      this.picture.classList.add(...this.cssClasses.pictureStyle.split(' '));
      this.image = document.createElement('img');
      this.picture.appendChild(this.image);
      this.image.addEventListener('load', (e) => {
        this.hideLoader();
        this.image.classList.remove('hidden');
        this.modalComponent.modalCloseBtn.classList.remove('hidden');
        if (group) {
          this.modalComponent.showNavigation();
        }
        if (this.caption.innerText.length > 0) {
          this.caption.classList.remove('hidden');
        }
      });
      this.setSources(
        group
          ? (this.sourcesGroup[this.modalComponent.currentGroupIndex] ?? [])
          : this.getSources(this.modalComponent.trigger),
      );
      this.showLoader();
      this.image.setAttribute('src', src);
      this.image.classList.add(...this.cssClasses.imageStyle.split(' '));
      this.modalComponent.dialog.insertAdjacentElement('afterbegin', this.picture);
    } else {
      if (group) {
        this.changeGroupIndex();
      } else {
        // The src is cleared on close, so set it again when reopening a single image
        this.showLoader();
        this.setSources(this.getSources(this.modalComponent.trigger));
        this.image.setAttribute('src', src);
      }
    }

    this.modalComponent.dialog.showModal();
  }
}
