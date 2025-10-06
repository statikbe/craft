import { Modal } from '../../components/modal.component';

export interface ModalPluginConstructor {
  new (selector: string): ModalPlugin;
}

export interface ModalPlugin {
  getOptions(): {};
  getTriggerSelector(): string;
  openModalClick(modal: Modal): void;
  openPluginModal({}): void;
  gotoNextAction(): void;
  gotoPrevAction(): void;
}
