import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
import { SiteLang } from "../utils/site-lang";
import { A11yUtils } from "../utils/a11y";
import "wicg-inert";
import {
  ModalPlugin,
  ModalPluginConstructor,
} from "../plugins/modal/plugin.interface";

ArrayPrototypes.activateFrom();

export class ModalComponent {
  private lang = require(`../i18n/s-modal-${SiteLang.getLang()}.json`);

  private options = {
    closeHTML: `<svg class="icon" aria-hidden="true">
                    <use xlink:href="/icon/sprite.svg#clear"></use>
                </svg>`,
    nextHTML: `<svg class="icon" aria-hidden="true">
                  <use xlink:href="/icon/sprite.svg#chevron-right"></use>
              </svg>`,
    prevHTML: `<svg class="icon" aria-hidden="true">
                  <use xlink:href="/icon/sprite.svg#chevron-left"></use>
              </svg>`,
    initTriggers: true,
    allowClose: true,
    onClose: null,
    plugins: [],
  };

  private bodyElement: HTMLBodyElement;
  private modalOverlay: HTMLDivElement;
  private modal: HTMLDivElement;
  private modalClose: HTMLButtonElement;
  public modalContent: HTMLDivElement;
  private closeListener;
  public trigger: HTMLElement;
  public modalLoader: HTMLDivElement;
  public galleryGroup: Array<string>;
  private nextButton: HTMLButtonElement;
  private prevButton: HTMLButtonElement;
  public currentGroupIndex: number = 0;
  private navListener;
  private inlineContentWrapper: HTMLElement;
  private mainContentBlock: HTMLElement;
  public firstTabbableElement: Element;
  public lastTabbableElement: Element;
  private plugins: Array<ModalPlugin> = new Array<ModalPlugin>();

  constructor(options: Object = {}) {
    this.options = { ...this.options, ...options };

    this.mainContentBlock = document.getElementById("mainContentBlock");
    this.bodyElement = document.getElementsByTagName(
      "BODY"
    )[0] as HTMLBodyElement;

    if (this.options.initTriggers) {
      const triggers = document.querySelectorAll(".js-modal");
      Array.from(triggers).forEach((trigger) => {
        this.initTrigger(trigger);
      });

      this.options.plugins.forEach(
        (
          plugin:
            | ModalPluginConstructor
            | { plugin: ModalPluginConstructor; options: {} }
        ) => {
          const p =
            typeof plugin == "function"
              ? new plugin(this)
              : new plugin.plugin(this);
          p.initElement();
          this.plugins.push(p);
        }
      );

      this.initTriggerClick();
    }
  }

  private initTrigger(trigger: Element) {
    trigger.setAttribute("role", "button");
  }

  private initTriggerClick() {
    document.addEventListener(
      "click",
      (e) => {
        // loop parent nodes from the target to the delegation node
        for (
          let target = <Element>e.target;
          target && !target.isSameNode(document);
          target = target.parentElement
        ) {
          if (target.matches(".js-modal")) {
            e.preventDefault();
            this.openModalClick(target as HTMLElement);
            break;
          }
          this.plugins.forEach((p) => {
            if (target.matches(`.${p.getTriggerClass()}`)) {
              e.preventDefault();
              p.openModalClick(target as HTMLElement);
            }
          });
        }
      },
      false
    );
  }

  private openModalClick(trigger: HTMLElement) {
    this.trigger = trigger;
    if (trigger.classList.contains("js-modal")) {
      if (trigger.tagName === "A") {
        this.openInlineModal(
          (trigger as HTMLAnchorElement).getAttribute("href")
        );
      } else {
        const id = trigger.getAttribute("data-modal-id");
        id
          ? this.openInlineModal(id)
          : console.log("No modal id is provided on the trigger");
      }
    }
    document.body.classList.add("has-open-modal");
  }

  public getTriggerSrc(trigger: Element) {
    if (trigger.tagName === "A") {
      return (trigger as HTMLAnchorElement).getAttribute("href");
    } else {
      const src = trigger.getAttribute("data-modal-src");
      return src ? src : null;
    }
  }

  public openInlineModal(id: string) {
    this.createOverlay();
    this.createModal();

    this.inlineContentWrapper = document.querySelector(id);
    if (this.inlineContentWrapper) {
      // this.modalContent.insertAdjacentHTML("afterbegin", content.innerHTML);
      Array.from(this.inlineContentWrapper.children).forEach((element) => {
        this.modalContent.insertAdjacentElement("beforeend", element);
      });
      this.linkAccesebilityToDialog();
    } else {
      this.modalContent.insertAdjacentHTML(
        "afterbegin",
        `<h1>Error</h1><p>${this.lang.contentError}</p>`
      );
    }

    this.trapTab();
  }

  public createOverlay() {
    this.modalOverlay = document.createElement("div");
    this.modalOverlay.classList.add("modal__overlay");
    if (this.options.allowClose) {
      this.modalOverlay.addEventListener("click", () => {
        this.closeModal();
      });
    }
    this.bodyElement.insertAdjacentElement("beforeend", this.modalOverlay);
  }

  public createModal(dialogClass = "", modalContentClass = "modal__content") {
    this.modal = document.createElement("div");
    this.modal.classList.add("modal__dialog");
    dialogClass != "" && this.modal.classList.add(dialogClass);
    this.modal.setAttribute("role", "dialog");
    // this.modal.setAttribute("aria-selected", "true");
    this.modal.setAttribute("aria-label", this.lang.dialogLabel);

    if (this.options.allowClose) {
      this.modalClose = document.createElement("button");
      this.modalClose.classList.add("modal__close");
      this.modalClose.setAttribute("type", "button");
      // this.modalClose.setAttribute("aria-label", this.lang.closeLabel);
      this.modalClose.insertAdjacentHTML(
        "beforeend",
        `<span class="sr-only">${this.lang.closeLabel}</span>`
      );
      this.modalClose.insertAdjacentHTML("beforeend", this.options.closeHTML);
      this.modalClose.addEventListener("click", () => {
        this.closeModal();
      });
      this.modal.insertAdjacentElement("afterbegin", this.modalClose);
    }

    this.modalContent = document.createElement("div");
    this.modalContent.classList.add(modalContentClass);
    this.modalContent.setAttribute("tabindex", "-1");
    this.modal.insertAdjacentElement("beforeend", this.modalContent);

    if (this.options.allowClose) {
      this.closeListener = this.escKeyAction.bind(this);
      document.addEventListener("keydown", this.closeListener);
    }

    this.bodyElement.insertAdjacentElement("beforeend", this.modal);
    this.setMainContentInert();
  }

  private linkAccesebilityToDialog() {
    let label = this.modalContent.querySelector(".js-modal-label");
    label = label
      ? label
      : this.modalContent.querySelector("h1,h2,h3,h4,h5,h6");
    if (label) {
      label.setAttribute("id", "js-modal-label");
      this.modal.setAttribute("aria-labelledby", "js-modal-label");
    }
  }

  public addNavigation() {
    this.nextButton = document.createElement("button");
    this.nextButton.classList.add("modal__navigation");
    this.nextButton.classList.add("modal__next-button");
    this.nextButton.setAttribute("type", "button");
    this.nextButton.setAttribute("aria-label", this.lang.nextLabel);
    this.nextButton.insertAdjacentHTML(
      "beforeend",
      `<span class="sr-only">${this.lang.nextText}</span>`
    );
    this.nextButton.insertAdjacentHTML("beforeend", this.options.nextHTML);
    this.nextButton.addEventListener("click", this.gotoNextItem.bind(this));
    if (this.currentGroupIndex === this.galleryGroup.length - 1) {
      this.nextButton.classList.add("hidden");
      this.nextButton.setAttribute("disabled", "");
    }
    this.modalContent.insertAdjacentElement("beforeend", this.nextButton);

    this.prevButton = document.createElement("button");
    this.prevButton.classList.add("modal__navigation");
    this.prevButton.classList.add("modal__prev-button");
    this.prevButton.setAttribute("type", "button");
    this.prevButton.setAttribute("aria-label", this.lang.prevLabel);
    this.prevButton.insertAdjacentHTML(
      "beforeend",
      `<span class="sr-only">${this.lang.prevText}</span>`
    );
    this.prevButton.insertAdjacentHTML("beforeend", this.options.prevHTML);
    this.prevButton.addEventListener("click", this.gotoPrevItem.bind(this));
    if (this.currentGroupIndex === 0) {
      this.prevButton.classList.add("hidden");
      this.prevButton.setAttribute("disabled", "");
    }
    this.modalContent.insertAdjacentElement("beforeend", this.prevButton);

    this.navListener = this.keyBoardNavigation.bind(this);
    document.addEventListener("keydown", this.navListener);
  }

  public gotoNextItem() {
    this.prevButton.classList.remove("hidden");
    this.prevButton.removeAttribute("disabled");
    if (this.currentGroupIndex < this.galleryGroup.length - 1) {
      this.currentGroupIndex++;
      this.plugins.forEach((p) => {
        if (this.trigger.matches(`.${p.getTriggerClass()}`)) {
          p.gotoNextAction();
        }
      });
    }
    if (this.currentGroupIndex === this.galleryGroup.length - 1) {
      this.nextButton.classList.add("hidden");
      this.nextButton.setAttribute("disabled", "");
      this.prevButton.focus();
    }
    this.updateGalleryTabIndexes();
  }

  public gotoPrevItem() {
    this.nextButton.classList.remove("hidden");
    this.nextButton.removeAttribute("disabled");
    if (this.currentGroupIndex > 0) {
      this.currentGroupIndex--;
      this.plugins.forEach((p) => {
        if (this.trigger.matches(`.${p.getTriggerClass()}`)) {
          p.gotoPrevAction();
        }
      });
    }
    if (this.currentGroupIndex === 0) {
      this.prevButton.classList.add("hidden");
      this.prevButton.setAttribute("disabled", "");
      this.nextButton.focus();
    }
    this.updateGalleryTabIndexes();
  }

  private keyBoardNavigation(event) {
    if (
      event.keyCode === 39 ||
      event.key === "ArrowRight" ||
      (event.code === "ArrowRight" &&
        this.currentGroupIndex < this.galleryGroup.length - 1)
    ) {
      this.gotoNextItem();
    }
    if (
      event.keyCode === 37 ||
      event.key === "ArrowLeft" ||
      (event.code === "ArrowLeft" && this.currentGroupIndex > 0)
    ) {
      this.gotoPrevItem();
    }
  }

  private trapTab() {
    A11yUtils.keepFocus(this.modal);
    this.modalContent.focus();
  }

  private escKeyAction(event) {
    if (
      event.keyCode === 27 ||
      event.key === "Escape" ||
      event.code === "Escape"
    ) {
      this.closeModal();
    }
  }

  public updateGalleryTabIndexes() {
    const tabbableElements = `a[href], area[href], input:not([disabled]),
        select:not([disabled]), textarea:not([disabled]),
        button:not([disabled]), iframe, object, embed, *[tabindex],
        *[contenteditable]`;

    const allTabbableElements = this.modal.querySelectorAll(tabbableElements);

    this.firstTabbableElement = allTabbableElements[0];
    this.lastTabbableElement =
      allTabbableElements[allTabbableElements.length - 1];
  }

  public closeModal() {
    document.body.classList.remove("has-open-modal");
    if (this.inlineContentWrapper) {
      Array.from(this.modalContent.children).forEach((element) => {
        this.inlineContentWrapper.insertAdjacentElement("beforeend", element);
      });
    }
    this.bodyElement.removeChild(this.modalOverlay);
    this.bodyElement.removeChild(this.modal);
    document.removeEventListener("keydown", this.closeListener);
    document.removeEventListener("keydown", this.navListener);
    this.plugins.forEach((p) => {
      if (this.trigger.matches(`.${p.getTriggerClass()}`)) {
        p.closeModal();
      }
    });
    this.setMainContentInert(false);
    if (this.trigger) {
      setTimeout(() => {
        //To make sure this is the last focus. Otherwise the inert plugin fucks it up.
        this.trigger.focus();
      }, 0);
    }

    if (this.options.onClose && typeof this.options.onClose == "function") {
      this.options.onClose();
    }
  }

  private setMainContentInert(set = true) {
    if (this.mainContentBlock && set) {
      this.mainContentBlock.setAttribute("inert", "");
      document.documentElement.classList.add("overflow-hidden");
    }
    if (this.mainContentBlock && !set) {
      this.mainContentBlock.removeAttribute("inert");
      document.documentElement.classList.remove("overflow-hidden");
    }
  }
}
