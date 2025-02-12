import { ModalComponent } from '../../components/modal.component';
import { A11yUtils } from '../../utils/a11y';
import { Ajax } from '../../utils/ajax';
import { ArrayPrototypes } from '../../utils/prototypes/array.prototypes';
import { ModalPlugin } from './plugin.interface';

ArrayPrototypes.activateFrom();

export class AjaxModalPlugin implements ModalPlugin {
  private triggerClass = 'js-modal-ajax';
  private modalComponent: ModalComponent;

  private options = {};

  constructor(modalComponent: ModalComponent, options: Object = {}) {
    this.options = { ...this.options, ...options };
    this.modalComponent = modalComponent;
  }

  public initElement() {}

  public getPluginName() {
    return 'ajax';
  }

  public afterCreateModal() {
    const closeModalButton = this.modalComponent.modalContent.querySelector('.js-close-modal');
    if (closeModalButton) {
      closeModalButton.addEventListener('click', () => {
        this.modalComponent.closeModal();
      });
    }
  }

  public getTriggerClass() {
    return this.triggerClass;
  }

  public getOptions() {
    return this.options;
  }

  public openModalClick(trigger: HTMLElement) {
    this.openPluginModal({ url: trigger.getAttribute('href'), callback: () => {} });
  }

  public gotoNextAction() {}

  public gotoPrevAction() {}

  public closeModal() {}

  public openPluginModal({ url, callback }) {
    this.modalComponent.createOverlay();
    this.modalComponent.createModal('modal__dialog--ajax', 'modal__ajax');

    this.modalComponent.modalLoader = document.createElement('div');
    this.modalComponent.modalLoader.classList.add('modal__loader-wrapper');
    this.modalComponent.modalLoader.insertAdjacentHTML('afterbegin', `<div class="modal__loader"></div>`);
    this.modalComponent.modalContent.insertAdjacentElement('afterbegin', this.modalComponent.modalLoader);

    const ajaxModelContent = document.createElement('div');
    ajaxModelContent.classList.add('modal__ajax__content');

    Ajax.call({
      url: url,
      method: 'GET',
      success: (response) => {
        ajaxModelContent.innerHTML = response;
        this.modalComponent.modalLoader.classList.add('hidden');
        this.modalComponent.modalContent.insertAdjacentElement('beforeend', ajaxModelContent);
        this.afterCreateModal();
        callback();
      },
    });

    A11yUtils.keepFocus(this.modalComponent.modalContent);
  }
}
