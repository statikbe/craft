import { Modal } from '../../components-base/modal.component';
import { ArrayPrototypes } from '../../utils/prototypes/array.prototypes';
import { ModalPlugin } from './plugin.interface';

ArrayPrototypes.activateFrom();

export class ConfirmationModalPlugin implements ModalPlugin {
  private triggerSelector = '';
  private modalComponent: Modal;
  private options = {};

  public cssClasses = {
    confirmationContent: 'modal__confirmation-content p-6 [&_h1]:text-xl',
    confirmationActions: 'modal__confirmation-actions mt-4 flex justify-between gap-10 pb-6 px-6',
    confirmationCancel: 'modal__confirmation__cancel-btn btn btn--ghost',
    confirmationOk: 'modal__confirmation__ok-btn btn btn--primary',
  };

  constructor(selector: string) {
    this.triggerSelector = selector;
  }

  public getPluginName() {
    return 'confirmation';
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

    if (trigger) {
      const datasetKeys = Object.keys(this.modalComponent.trigger.dataset);
      datasetKeys.forEach((key) => {
        if (this.cssClasses[key]) {
          this.cssClasses[key] = this.modalComponent.trigger.dataset[key];
        }
      });

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
          },
        });
      }
    }

    if (this.modalComponent.options.question) {
      this.openPluginModal({
        question: this.modalComponent.options.question,
        cancel: this.modalComponent.options.cancel,
        ok: this.modalComponent.options.ok,
        callback: this.modalComponent.options.callback,
      });
    }
  }

  public gotoNextAction() {}

  public gotoPrevAction() {}

  public closeModal() {}

  public openPluginModal({ question, cancel, ok, callback }) {
    if (!this.modalComponent.dialog) {
      this.modalComponent.dialog = document.createElement('dialog');
      document.body.appendChild(this.modalComponent.dialog);
      this.modalComponent.onDialogCreation();

      const confirmationModelContent = document.createElement('div');
      confirmationModelContent.classList.add(...this.cssClasses.confirmationContent.split(' '));
      const confirmationModelQuestion = document.createElement('h1');
      confirmationModelQuestion.innerText = question;
      confirmationModelContent.insertAdjacentElement('beforeend', confirmationModelQuestion);
      const confirmationModelActions = document.createElement('div');
      confirmationModelActions.classList.add(...this.cssClasses.confirmationActions.split(' '));
      if (cancel) {
        const confirmationModelCancelBtn = document.createElement('button');
        confirmationModelCancelBtn.classList.add(...this.cssClasses.confirmationCancel.split(' '));
        confirmationModelCancelBtn.innerText = cancel;
        confirmationModelCancelBtn.addEventListener('click', () => {
          this.modalComponent.dialog.close();
        });
        confirmationModelActions.insertAdjacentElement('beforeend', confirmationModelCancelBtn);
      }
      if (ok) {
        const confirmationModelOkBtn = document.createElement('button');
        confirmationModelOkBtn.classList.add(...this.cssClasses.confirmationOk.split(' '));
        confirmationModelOkBtn.innerText = ok;
        confirmationModelOkBtn.addEventListener('click', () => {
          this.modalComponent.dialog.close();
          callback();
        });
        confirmationModelActions.insertAdjacentElement('beforeend', confirmationModelOkBtn);
      }

      this.modalComponent.dialog.insertAdjacentElement('beforeend', confirmationModelContent);
      this.modalComponent.dialog.insertAdjacentElement('beforeend', confirmationModelActions);
    }

    this.modalComponent.dialog.showModal();
  }
}
