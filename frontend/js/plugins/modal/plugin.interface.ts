import { ModalComponent } from '../../components/modal.component';

export interface ModalPluginConstructor {
  new (modalComponent?: ModalComponent, options?: {}): ModalPlugin;
}

export interface ModalPlugin {
  initElement(): void;
  getPluginName(): string;
  getOptions(): {};
  afterCreateModal(): void;
  getTriggerClass(): string;
  openModalClick(trigger: HTMLElement): void;
  openPluginModal({}): void;
  closeModal(): void;
  gotoNextAction(): void;
  gotoPrevAction(): void;
}
