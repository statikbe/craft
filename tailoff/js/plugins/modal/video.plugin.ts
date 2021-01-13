import { ModalComponent } from "../../components/modal.component";
import { AnimationHelper } from "../../utils/animationHelper";
import { ArrayPrototypes } from "../../utils/prototypes/array.prototypes";
import { ModalPlugin } from "./plugin.interface";

ArrayPrototypes.activateFrom();

export class VideoModalPlugin implements ModalPlugin {
  private triggerClass = "js-modal-video";
  private modalComponent: ModalComponent;
  private galleryType: string;
  private image: HTMLImageElement;
  private imageResizeListener;
  private imageTabTrapListener;

  private options = {
    imageMargin: 20,
    imageMarginNav: 80,
    imageMarginNoneBreakPoint: 820,
    resizeDuration: 100,
    fadeDuration: 100,
  };

  constructor(modalComponent: ModalComponent, options: Object = {}) {
    this.options = { ...this.options, ...options };
    this.modalComponent = modalComponent;
  }

  public initElement() {
    const imageTriggers = document.querySelectorAll(`.${this.triggerClass}`);
    Array.from(imageTriggers).forEach((trigger) => {
      this.initVideoTrigger(trigger);
    });
  }

  public getTriggerClass() {
    return this.triggerClass;
  }

  public openModalClick(trigger: HTMLElement) {
    this.modalComponent.trigger = trigger;
    if (trigger.classList.contains("js-modal-video")) {
      const src = this.modalComponent.getTriggerSrc(trigger);
      src
        ? this.openVideoModal(src)
        : console.log("No modal src is provided on the trigger");
    }
  }

  public gotoNextAction() {
    this.changeGroupIndex();
  }

  public gotoPrevAction() {
    this.changeGroupIndex();
  }

  public closeModal() {
    document.removeEventListener("keydown", this.imageTabTrapListener);
    window.removeEventListener("resize", this.imageResizeListener);
  }

  private changeGroupIndex() {
    this.loadVideo(
      this.modalComponent.galleryGroup[this.modalComponent.currentGroupIndex]
    );
  }

  public openVideoModal(src: string) {
    this.galleryType = "video";
    this.modalComponent.createOverlay();
    this.modalComponent.createModal("modal__dialog--video", "modal__video");

    this.modalComponent.galleryGroup = [];
    const group = this.modalComponent.trigger.getAttribute("data-group");

    if (group) {
      this.modalComponent.galleryGroup = Array.from(
        document.querySelectorAll(`[data-group=${group}]`)
      ).map((t) => this.modalComponent.getTriggerSrc(t));
      this.modalComponent.currentGroupIndex = this.modalComponent.galleryGroup.indexOf(
        src
      );
      this.modalComponent.addNavigation();
    }

    this.loadVideo(src);

    this.initGalleryTabTrap();
  }

  private loadVideo(src: string) {
    const iframe = this.modalComponent.modalContent.querySelector("iframe");
    if (iframe) {
      iframe.parentElement.removeChild(iframe);
    }
    const youtubeEmbed = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${this.getYoutubeId(
      src
    )}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    this.modalComponent.modalContent.insertAdjacentHTML(
      "afterbegin",
      youtubeEmbed
    );
  }

  private getYoutubeId(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return match && match[7].length == 11 ? match[7] : false;
  }

  private initGalleryTabTrap() {
    this.modalComponent.updateGalleryTabIndexes();
    this.imageTabTrapListener = this.imagesTrapTab.bind(this);
    document.addEventListener("keydown", this.imageTabTrapListener);
    this.modalComponent.modalContent.focus();
  }

  private imagesTrapTab(event) {
    const keyCode = event.which || event.keyCode; // Get the current keycode

    // If it is TAB
    if (keyCode === 9) {
      // Move focus to first element that can be tabbed if Shift isn't used
      if (
        event.target === this.modalComponent.lastTabbableElement &&
        !event.shiftKey
      ) {
        event.preventDefault();
        (this.modalComponent.firstTabbableElement as HTMLElement).focus();

        // Move focus to last element that can be tabbed if Shift is used
      } else if (
        event.target === this.modalComponent.firstTabbableElement &&
        event.shiftKey
      ) {
        event.preventDefault();
        (this.modalComponent.lastTabbableElement as HTMLElement).focus();
      }
    }
  }

  private setImageSize(_, newImage = false) {
    let imageWidth = this.image.naturalWidth;
    let imageHeight = this.image.naturalHeight;
    let maxWidth = window.innerWidth;
    let maxHeight = window.innerHeight;

    if (window.innerWidth > this.options.imageMarginNoneBreakPoint) {
      maxWidth = this.modalComponent.galleryGroup.length
        ? window.innerWidth - this.options.imageMarginNav * 2
        : window.innerWidth - this.options.imageMargin * 2;
      maxHeight = window.innerHeight - this.options.imageMargin * 2;
    }

    if (imageWidth > maxWidth || imageHeight > maxHeight) {
      if (imageWidth / maxWidth >= imageHeight / maxHeight) {
        imageHeight *= maxWidth / imageWidth;
        imageWidth = maxWidth;
      } else {
        imageWidth *= maxHeight / imageHeight;
        imageHeight = maxHeight;
      }
    }

    if (this.options.resizeDuration === 0 || !newImage) {
      this.modalComponent.modalContent.style.width = `${Math.round(
        imageWidth
      )}px`;
      this.modalComponent.modalContent.style.height = `${Math.round(
        imageHeight
      )}px`;
      this.image.classList.remove("hidden");
    } else {
      AnimationHelper.cssPropertyAnimation(
        this.modalComponent.modalContent,
        "width",
        Math.round(imageWidth),
        "px",
        this.options.resizeDuration
      );
      AnimationHelper.cssPropertyAnimation(
        this.modalComponent.modalContent,
        "height",
        Math.round(imageHeight),
        "px",
        this.options.resizeDuration,
        () => {
          this.image.style.opacity = "0";
          this.image.classList.remove("hidden");
          AnimationHelper.cssPropertyAnimation(
            this.image,
            "opacity",
            1,
            "",
            this.options.fadeDuration
          );
        }
      );
    }
  }

  private initVideoTrigger(trigger: Element) {
    trigger.setAttribute("role", "button");
    trigger.classList.add("modal__video-trigger");
  }
}
