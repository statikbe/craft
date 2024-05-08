import { DOMHelper } from '../utils/domHelper';

export class PullOutComponent {
  constructor() {
    if (document.querySelectorAll('.js-pull-out').length > 0) {
      this.pullOutBlocks();
      window.addEventListener('resize', this.pullOutBlocks.bind(this));
    }
  }

  private pullOutBlocks() {
    Array.from(document.querySelectorAll('.js-pull-out')).forEach((block: HTMLElement) => {
      const noContent = block.getAttribute('data-no-content') ? block.getAttribute('data-no-content') == 'true' : false;

      const direction = block.getAttribute('data-direction');

      const queryObject = block.getAttribute('data-query');

      if (direction) {
        const max = block.getAttribute('data-max')
          ? parseInt(block.getAttribute('data-max'))
          : document.body.clientWidth;
        const breakpoint = block.getAttribute('data-breakpoint') ? parseInt(block.getAttribute('data-breakpoint')) : 0;
        this.pullOutBlock(block, direction, breakpoint, max, noContent);
      } else if (queryObject) {
        const query = JSON.parse(queryObject);
        let queryHit = null;
        query.forEach((q) => {
          if (q.breakpoint <= document.body.clientWidth) {
            queryHit = q;
          }
        });
        if (queryHit) {
          queryHit['direction'] = queryHit.direction ?? 'both';
          queryHit['breakpoint'] = queryHit.breakpoint ?? 0;
          queryHit['max'] = queryHit.max ?? document.body.clientWidth;
          this.pullOutBlock(block, queryHit.direction, queryHit.breakpoint, queryHit.max, noContent);
        }
      } else {
        console.error(
          "You must have a data element with name 'data-direction' or 'data-query' defined in order for the pull out plugin to work."
        );
      }
    });
  }

  private pullOutBlock(block: HTMLElement, direction: string, breakpoint: number, max: number, noContent = false) {
    const rect = block.parentElement.getBoundingClientRect();
    const offset = {
      top: rect.top + document.body.scrollTop,
      left: rect.left + document.body.scrollLeft,
    };

    const paddingLeft = parseInt(window.getComputedStyle(block.parentElement, null).getPropertyValue('padding-left'));
    const paddingRight = parseInt(window.getComputedStyle(block.parentElement, null).getPropertyValue('padding-right'));

    if (document.body.clientWidth >= breakpoint) {
      block.style.marginLeft = '';
      block.style.marginRight = '';
      block.style.width = '';
      switch (direction) {
        case 'both':
        case 'left':
          block.style.marginLeft = `-${Math.min(offset.left, max) + paddingLeft}px`;
          if (noContent) {
            block.style.width = `${Math.min(offset.left, max) + rect.width}px`;
          }
          if (direction != 'both') break;
        case 'right':
          const rightOffset = document.body.clientWidth - (offset.left + block.parentElement.clientWidth);
          block.style.marginRight = `-${Math.min(rightOffset, max) + paddingRight}px`;
          if (noContent) {
            block.style.width = `${Math.min(rightOffset, max) + rect.width}px`;
          }
          if (direction != 'both') break;
          if (noContent) {
            block.style.width = `${Math.min(rightOffset, max) * 2 + rect.width}px`;
          }
        default:
          break;
      }
    } else {
      if (block.style.marginLeft) {
        block.style.marginLeft = '';
      }
      if (block.style.marginRight) {
        block.style.marginRight = '';
      }
      if (noContent) {
        block.style.width = `${rect.width}px`;
      }
    }
  }
}
