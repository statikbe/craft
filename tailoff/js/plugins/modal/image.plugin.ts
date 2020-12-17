import { ModalComponent } from "../../components/modal.component";
import { AnimationHelper } from "../../utils/animationHelper";
import { ArrayPrototypes } from "../../utils/prototypes/array.prototypes";
import { ModalPlugin } from "./plugin.interface";

ArrayPrototypes.activateFrom();

export class ImageModalPlugin implements ModalPlugin {
  private triggerClass = "js-modal-image";
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
      this.initImageTrigger(trigger);
    });
  }

  public getTriggerClass() {
    return this.triggerClass;
  }

  public openModalClick(trigger: HTMLElement) {
    this.modalComponent.trigger = trigger;
    if (trigger.classList.contains(this.triggerClass)) {
      const src = this.modalComponent.getTriggerSrc(trigger);
      src
        ? this.openImageModal(src)
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
    this.image.classList.add("hidden");
    this.modalComponent.modalLoader.classList.remove("hidden");
    this.image.setAttribute(
      "src",
      this.modalComponent.galleryGroup[this.modalComponent.currentGroupIndex]
    );
  }

  public openImageModal(src: string) {
    this.galleryType = "image";
    this.modalComponent.createOverlay();
    this.modalComponent.createModal("modal__dialog--image", "modal__image");

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

    this.modalComponent.modalLoader = document.createElement("div");
    this.modalComponent.modalLoader.classList.add("modal__loader-wrapper");
    this.modalComponent.modalLoader.insertAdjacentHTML(
      "afterbegin",
      `<div class="modal__loader"></div>`
    );
    this.modalComponent.modalContent.insertAdjacentElement(
      "afterbegin",
      this.modalComponent.modalLoader
    );

    this.image = document.createElement("img");
    this.image.addEventListener("load", (e) => {
      this.modalComponent.modalLoader.classList.add("hidden");
      this.setImageSize(null, true);
    });
    this.image.setAttribute("src", src);
    this.image.classList.add("hidden");
    this.modalComponent.modalContent.insertAdjacentElement(
      "afterbegin",
      this.image
    );

    this.imageResizeListener = this.setImageSize.bind(this);
    window.addEventListener("resize", this.imageResizeListener);

    this.initGalleryTabTrap();
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

  private initImageTrigger(trigger: Element) {
    trigger.setAttribute("role", "button");
    trigger.classList.add("modal__image-trigger");
  }
}
