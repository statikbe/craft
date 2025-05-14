import { ModalComponent } from '../../components/modal.component';
import { A11yUtils } from '../../utils/a11y';
import { AnimationHelper } from '../../utils/animationHelper';
import { ArrayPrototypes } from '../../utils/prototypes/array.prototypes';
import { ModalPlugin } from './plugin.interface';

ArrayPrototypes.activateFrom();

export class ConfirmationModalPlugin implements ModalPlugin {
  private triggerClass = 'js-modal-confirmation';
  private modalComponent: ModalComponent;

  private options = {
    allowClose: false,
  };

  constructor(modalComponent: ModalComponent, options: Object = {}) {
    this.options = { ...this.options, ...options };
    this.modalComponent = modalComponent;
  }

  public initElement() {
    const confirmationTriggers = document.querySelectorAll(`.${this.triggerClass}`);
    Array.from(confirmationTriggers).forEach((trigger) => {
      this.initConfirmationTrigger(trigger);
    });
  }

  public getPluginName() {
    return 'confirmation';
  }

  public afterCreateModal() {}

  public getTriggerClass() {
    return this.triggerClass;
  }

  public getOptions() {
    return this.options;
  }

  public openModalClick(trigger: HTMLElement) {
    this.modalComponent.trigger = trigger;
    if (trigger.classList.contains(this.triggerClass)) {
      const question = trigger.getAttribute('data-question');
      if (question) {
        const cancel = trigger.getAttribute('data-cancel') ?? 'Cancel';
        const ok = trigger.getAttribute('data-ok') ?? 'Ok';
        this.openPluginModal({
          question: question,
          cancel: cancel,
          ok: ok,
          callback: () => {
            if (trigger.tagName === 'A') {
              window.location.href = (trigger as HTMLAnchorElement).href;
            }
            console.log('Okido');
          },
        });
      }
    }
  }

  public gotoNextAction() {}

  public gotoPrevAction() {}

  public closeModal() {}

  public openPluginModal({ question, cancel, ok, callback }) {
    this.modalComponent.createOverlay();
    this.modalComponent.createModal('modal__dialog--confirmation', 'modal__confirmation');

    const confirmationModelContent = document.createElement('div');
    confirmationModelContent.classList.add('modal__confirmation__content');
    const confirmationModelQuestion = document.createElement('h1');
    confirmationModelQuestion.classList.add('modal__confirmation__question');
    confirmationModelQuestion.innerText = question;
    confirmationModelContent.insertAdjacentElement('beforeend', confirmationModelQuestion);
    const confirmationModelActions = document.createElement('div');
    confirmationModelActions.classList.add('modal__confirmation__actions');
    if (cancel) {
      const confirmationModelCancelBtn = document.createElement('button');
      confirmationModelCancelBtn.classList.add('modal__confirmation__cancel-btn');
      confirmationModelCancelBtn.innerText = cancel;
      confirmationModelCancelBtn.addEventListener('click', () => {
        this.modalComponent.closeModal();
      });
      confirmationModelActions.insertAdjacentElement('beforeend', confirmationModelCancelBtn);
    }
    if (ok) {
      const confirmationModelOkBtn = document.createElement('button');
      confirmationModelOkBtn.classList.add('modal__confirmation__ok-btn');
      confirmationModelOkBtn.innerText = ok;
      confirmationModelOkBtn.addEventListener('click', () => {
        this.modalComponent.closeModal();
        callback();
      });
      confirmationModelActions.insertAdjacentElement('beforeend', confirmationModelOkBtn);
    }

    this.modalComponent.modalContent.insertAdjacentElement('beforeend', confirmationModelContent);
    this.modalComponent.modalContent.insertAdjacentElement('beforeend', confirmationModelActions);

    A11yUtils.keepFocus(this.modalComponent.modalContent);
  }

  private initConfirmationTrigger(trigger: Element) {
    trigger.setAttribute('role', 'button');
    trigger.classList.add('modal__confirmation-trigger');
  }
}
