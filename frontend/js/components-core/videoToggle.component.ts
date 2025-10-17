import { DOMHelper } from '../utils/domHelper';

export default class VideoToggleComponent {
  constructor() {
    const triggers = document.querySelectorAll('button[data-video-toggle]');
    Array.from(triggers).forEach((trigger, index) => {
      new VideoToggle(trigger as HTMLButtonElement, index);
    });
  }
}

class VideoToggle {
  private options = {
    url: '',
    container: null,
    aspectRatio: 'auto',
    hideTrigger: true,
    showCloseButton: true,
    hideClass: 'hidden',
    toggleContent: 'close',
  };

  private trigger: HTMLButtonElement;
  private videoContent: HTMLDivElement;
  private videoIFrame: HTMLIFrameElement;
  private videoCloseButton: HTMLButtonElement;
  private videoOpen = false;
  private openContent = '';

  private cssClasses = {
    videoToggleContainer: 'video-toggle__container relative',
    videoToggleContent: 'video-toggle__content absolute top-0 right-0 bottom-0 left-0',
    videoToggleIframe: 'video-toggle__iframe',
    videoToggleClose: 'video-toggle__close absolute top-0 right-0 p-2 bg-white',
    videoToggleCloseAfter:
      'after:block after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/clear.svg")]',
  };

  constructor(trigger: HTMLButtonElement, index: number = 0) {
    this.trigger = trigger;
    this.options.url = trigger.getAttribute('data-video-toggle') as string;
    this.options.container = trigger.hasAttribute('data-video-toggle-container')
      ? document.querySelector(trigger.getAttribute('data-video-toggle-container'))
      : trigger.parentElement;

    this.options.aspectRatio = trigger.hasAttribute('data-video-toggle-aspect-ratio')
      ? (trigger.getAttribute('data-video-toggle-aspect-ratio') as string)
      : this.options.aspectRatio;

    this.options.showCloseButton = trigger.hasAttribute('data-video-toggle-show-close-button')
      ? (trigger.getAttribute('data-video-toggle-show-close-button') as string) === 'true'
      : this.options.showCloseButton;

    this.options.hideTrigger = trigger.hasAttribute('data-video-toggle-hide-trigger')
      ? (trigger.getAttribute('data-video-toggle-hide-trigger') as string) === 'true'
      : this.options.hideTrigger;

    this.options.hideClass = trigger.hasAttribute('data-video-toggle-hide-class')
      ? (trigger.getAttribute('data-video-toggle-hide-class') as string)
      : this.options.hideClass;

    this.options.toggleContent = trigger.hasAttribute('data-video-toggle-toggle-content')
      ? (trigger.getAttribute('data-video-toggle-toggle-content') as string)
      : this.options.toggleContent;

    const datasetKeys = Object.keys(this.trigger.dataset);
    datasetKeys.forEach((key) => {
      if (this.cssClasses[key]) {
        this.cssClasses[key] = this.trigger.dataset[key];
      }
    });

    this.videoContent = document.createElement('div');
    this.videoContent.classList.add(...this.cssClasses.videoToggleContent.split(' '));
    this.videoContent.classList.add(this.options.hideClass);
    this.videoContent.id = 'videoToggleContent' + index;

    this.videoIFrame = document.createElement('iframe');
    this.videoIFrame.classList.add(...this.cssClasses.videoToggleIframe.split(' '));
    this.videoIFrame.setAttribute('title', 'Video embed');
    this.videoIFrame.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
    );
    this.videoIFrame.setAttribute('allowfullscreen', '');
    this.videoIFrame.setAttribute('width', '100%');
    this.videoIFrame.setAttribute('height', '100%');

    this.videoContent.appendChild(this.videoIFrame);

    this.options.container.appendChild(this.videoContent);
    this.options.container.classList.add('video-toggle__container');

    if (this.options.showCloseButton) {
      this.videoCloseButton = document.createElement('button');
      this.videoCloseButton.classList.add(...this.cssClasses.videoToggleClose.split(' '));
      this.videoCloseButton.classList.add(...this.cssClasses.videoToggleCloseAfter.split(' '));
      this.videoCloseButton.classList.add(this.options.hideClass);
      this.videoCloseButton.setAttribute('aria-label', 'Close video');
      this.videoCloseButton.setAttribute('title', 'Close video');
      this.videoCloseButton.addEventListener('click', this.closeVideo.bind(this));
      this.options.container.appendChild(this.videoCloseButton);
    }

    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'videoToggleContent' + index);

    trigger.addEventListener('click', this.toggleVideo.bind(this));
  }

  private toggleVideo(e: Event) {
    if (this.videoOpen) {
      this.closeVideo(e);
    } else {
      this.openVideo(e);
    }
  }

  private clearVideoContainer() {
    const videocloseButtons = this.options.container.querySelectorAll('.video-toggle__close');
    const videoContentBlocks = this.options.container.querySelectorAll('.video-toggle__content');
    const videoIframes = this.options.container.querySelectorAll('.video-toggle__iframe');

    Array.from(videocloseButtons).forEach((button: HTMLElement) => {
      button.classList.add(this.options.hideClass);
    });
    Array.from(videoContentBlocks).forEach((block: HTMLElement) => {
      block.classList.add(this.options.hideClass);
    });
    Array.from(videoIframes).forEach((iframe: HTMLIFrameElement) => {
      iframe.setAttribute('src', '');
    });
  }

  private openVideo(e: Event) {
    this.clearVideoContainer();
    this.trigger.setAttribute('aria-expanded', 'true');
    this.videoContent.classList.remove(this.options.hideClass);

    let url = new URL(this.options.url);
    url.searchParams.append('autoplay', '1');

    this.videoIFrame.setAttribute('src', url.toString());

    if (this.options.showCloseButton) {
      this.videoCloseButton.classList.remove(this.options.hideClass);
    }
    if (this.options.hideTrigger) {
      this.trigger.classList.add(this.options.hideClass);
    } else {
      this.openContent = this.trigger.innerHTML;
      this.trigger.innerHTML = this.options.toggleContent;
    }
    if (this.options.aspectRatio !== 'auto') {
      const aspectRatio = this.options.aspectRatio.split(':');
      const width = parseInt(aspectRatio[0]);
      const height = parseInt(aspectRatio[1]);
      const newHeight = (this.options.container.offsetWidth * height) / width;
      this.options.container.style.height = newHeight + 'px';
    }

    this.videoOpen = true;

    document.dispatchEvent(new CustomEvent('videotoggle.open', { detail: this.videoContent }));
  }

  private closeVideo(e: Event) {
    this.trigger.setAttribute('aria-expanded', 'false');
    this.videoContent.classList.add(this.options.hideClass);
    this.videoIFrame.setAttribute('src', '');
    if (this.options.showCloseButton) {
      this.videoCloseButton.classList.add(this.options.hideClass);
    }
    if (this.options.hideTrigger) {
      this.trigger.classList.remove(this.options.hideClass);
    } else {
      this.trigger.innerHTML = this.openContent;
    }
    if (this.options.aspectRatio !== 'auto') {
      this.options.container.style.height = '';
    }

    this.videoOpen = false;

    document.dispatchEvent(new CustomEvent('videotoggle.close', { detail: this.videoContent }));

    const containerToggleButton = this.options.container.querySelector('[data-video-toggle]');

    if (containerToggleButton) {
      containerToggleButton.classList.remove(this.options.hideClass);
    }
  }
}
