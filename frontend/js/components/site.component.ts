import { AjaxModalPlugin } from '../plugins/modal/ajax.plugin';
import { ConfirmationModalPlugin } from '../plugins/modal/confirmation.plugin';
import { ImageModalPlugin } from '../plugins/modal/image.plugin';
import { VideoModalPlugin } from '../plugins/modal/video.plugin';
import { Modal } from './modal.component';

export default class SiteComponent {
  constructor() {
    const modalConfirmationButton = document.getElementById('modalConfirmationButton');
    if (modalConfirmationButton) {
      // const modal = new Modal(
      //   modalConfirmationButton,
      //   {
      //     question: 'This is my question',
      //     cancel: 'My cancel text',
      //     ok: 'My OK text',
      //     callback: () => {
      //       console.log('This is my JS callback');
      //     },
      //   },
      //   new ConfirmationModalPlugin('#modalConfirmationButton')
      // );
      // const modal = new Modal(
      //   modalConfirmationButton,
      //   {
      //     src: 'https://www.youtube.com/watch?v=mN0zPOpADL4',
      //   },
      //   new VideoModalPlugin('#modalConfirmationButton')
      // // );
    }
  }
}
