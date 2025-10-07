import { Ajax } from '../../utils/ajax';
import { Modal } from '../../components-base/modal.component';
import { ArrayPrototypes } from '../../utils/prototypes/array.prototypes';
import { ModalPlugin } from './plugin.interface';

ArrayPrototypes.activateFrom();

export class AjaxModalPlugin implements ModalPlugin {
  private triggerSelector = '';
  private modalComponent: Modal;
  private modalLoader: HTMLDivElement;
  private formSteps = false;
  private showCloseBtn = false;
  private ajaxContainer: HTMLElement;

  private options = {};

  constructor(selector: string) {
    this.triggerSelector = selector;
  }

  public getPluginName() {
    return 'ajax';
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
    const src = (trigger && trigger.getAttribute('data-modal-ajax')) ?? this.modalComponent.options.src;
    this.formSteps = this.modalComponent.options.formSteps ?? (trigger && trigger.hasAttribute('data-form-steps'));
    this.showCloseBtn =
      this.modalComponent.options.showCloseBtn ?? (trigger && trigger.hasAttribute('data-show-close-btn'));

    if (src) {
      if (!this.modalComponent.dialog) {
        this.modalComponent.dialog = document.createElement('dialog');
        document.body.appendChild(this.modalComponent.dialog);
        this.modalComponent.onDialogCreation();

        if (this.showCloseBtn) {
          this.modalComponent.addCloseButton();
          this.modalComponent.modalCloseBtn.classList.add('hidden');
        }

        if (!this.modalLoader) {
          this.modalLoader = document.createElement('div');
          this.modalLoader.classList.add(...this.modalComponent.cssClasses.loaderStyle.split(' '));
          this.modalLoader.insertAdjacentHTML('afterbegin', `<div class="loader"></div>`);
          this.modalComponent.dialog.insertAdjacentElement('afterbegin', this.modalLoader);
        }

        this.ajaxContainer = document.createElement('div');
        this.ajaxContainer.classList.add('ajax-container');
        this.modalComponent.dialog.appendChild(this.ajaxContainer);
      }
      this.openPluginModal(src);
    }
  }

  public gotoNextAction() {}

  public gotoPrevAction() {}

  public closeModal() {}

  public openPluginModal(src: string) {
    this.modalComponent.dialog.showModal();
    Ajax.call({
      url: src,
      method: 'GET',
      success: (response) => {
        this.ajaxContainer.innerHTML = response;
        this.modalLoader.classList.add('hidden');
        if (this.showCloseBtn) {
          this.modalComponent.modalCloseBtn.classList.remove('hidden');
        }
        this.modalComponent.activateCloseButtons();
        if (this.formSteps) {
          this.initFormStep(src);
          this.activateInternalLinks();
        }
      },
    });
  }

  private initFormStep(src?: string) {
    const form = this.ajaxContainer.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
          return;
        }
        const action = form.getAttribute('action') || src || window.location.href;
        const method = (form.getAttribute('method') || 'POST').toUpperCase();
        this.modalLoader.classList.remove('hidden');
        if (this.showCloseBtn) {
          this.modalComponent.modalCloseBtn.classList.add('hidden');
        }
        this.ajaxContainer.innerHTML = '';
        Ajax.call({
          url: action,
          method: method,
          form: form,
          success: (res) => {
            if (form.hasAttribute('data-close-modal-on-submit')) {
              this.modalComponent.dialog.close();
              return;
            }
            this.ajaxContainer.innerHTML = res;
            this.modalLoader.classList.add('hidden');
            if (this.showCloseBtn) {
              this.modalComponent.modalCloseBtn.classList.remove('hidden');
            }
            this.modalComponent.activateCloseButtons();
            this.initFormStep(src);
            this.activateInternalLinks();
          },
          error: (err) => {
            console.error(err);
            this.modalLoader.classList.add('hidden');
          },
        });
      });
    }
  }

  private activateInternalLinks() {
    const links = this.ajaxContainer.querySelectorAll('[data-modal-ajax-internal]');
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const url = link.getAttribute('data-modal-ajax-internal');
        this.modalLoader.classList.remove('hidden');
        if (url) {
          Ajax.call({
            url: url,
            method: 'GET',
            success: (response) => {
              this.ajaxContainer.innerHTML = response;
              this.modalLoader.classList.add('hidden');
              this.modalComponent.activateCloseButtons();
              if (this.showCloseBtn) {
                this.modalComponent.modalCloseBtn.classList.remove('hidden');
              }
              if (this.formSteps) {
                this.initFormStep(url);
              }
            },
          });
        }
      });
    });
  }
}
