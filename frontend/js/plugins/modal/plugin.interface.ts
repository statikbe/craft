import { Modal } from '../../components/modal.component';

export interface ModalPluginConstructor {
  new (): ModalPlugin;
}

export interface ModalPlugin {
  getOptions(): {};
  getTriggerSelector(): string;
  openModalClick(modal: Modal): void;
  openPluginModal({}): void;
  gotoNextAction(): void;
  gotoPrevAction(): void;
}
