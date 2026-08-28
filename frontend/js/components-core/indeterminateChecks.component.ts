import { DOMHelper } from '../utils/domHelper';

export default class IndeterminateChecksComponent {
  constructor() {
    Array.from(document.querySelectorAll('ul[data-indeterminate]')).forEach((list: HTMLUListElement, index) => {
      new IndeterminateChecks(list, index);
    });

    DOMHelper.onDynamicContent(
      document.documentElement,
      'ul[data-indeterminate]',
      (lists: NodeListOf<HTMLUListElement>) => {
        lists.forEach((list: HTMLUListElement, index) => {
          new IndeterminateChecks(list, index + Date.now());
        });
      }
    );
  }
}

class IndeterminateChecks {
  private mainList: HTMLUListElement;
  private mainListIndex = 0;

  constructor(element: HTMLUListElement, index) {
    this.mainList = element;
    this.mainListIndex = index;
    this.init();
  }

  private init() {
    if (!this.mainList.hasAttribute('id')) {
      this.mainList.setAttribute('id', `jsIndeterminateList${this.mainListIndex}`);
    }
    this.initSubLists();
    this.initCheckboxes();
  }

  private initCheckboxes() {
    Array.from(this.mainList.querySelectorAll('input[type=checkbox]')).forEach((checkbox: HTMLInputElement) => {
      checkbox.addEventListener('change', this.onCheckboxChange.bind(this));
      checkbox.addEventListener('jschange', this.onCheckboxChange.bind(this));
      if (checkbox.checked) {
        this.checkUp(checkbox);
      }
    });
  }

  private initSubLists() {
    Array.from(this.mainList.querySelectorAll('ul')).forEach((list: HTMLUListElement, index) => {
      if (!list.hasAttribute('id')) {
        const subLevelID = `jsIndeterminateSubList${this.mainListIndex}-${index}`;
        list.setAttribute('id', subLevelID);
      }
    });
  }

  private onCheckboxChange(e) {
    this.checkUp(e.target);
    this.checkDown(e.target);

    if (e.target.checked) {
      const listItem = e.target.closest('li') as HTMLLIElement;
      const subLists = listItem.querySelectorAll('ul');
      subLists.forEach((subList: HTMLUListElement) => {
        subList.dispatchEvent(new CustomEvent('open'));
      });
    }
  }

  private checkUp(check: HTMLInputElement) {
    const list = check.closest('ul');

    if (list && !list.hasAttribute('data-indeterminate')) {
      let nbrOfUnchecked = 0;
      let nbrOfChecked = 0;
      let nbrOfIndeterminate = 0;
      Array.from(
        this.mainList.querySelectorAll(
          `#${list.getAttribute('id')} > li > *:not(ul) input, #${list.getAttribute('id')} > li > input`
        )
      ).forEach((input: HTMLInputElement) => {
        if (input.checked || input.indeterminate) {
          if (input.indeterminate) {
            nbrOfIndeterminate++;
          } else {
            nbrOfChecked++;
          }
        } else {
          nbrOfUnchecked++;
        }
      });

      const parent = list.closest('li');
      const parentInput = parent.querySelector('input[type=checkbox]') as HTMLInputElement;

      if (nbrOfUnchecked === 0 && nbrOfIndeterminate === 0 && nbrOfChecked > 0) {
        parentInput.indeterminate = false;
        parentInput.checked = true;
      } else {
        if (nbrOfChecked > 0 || nbrOfIndeterminate > 0) {
          parentInput.indeterminate = true;
          parentInput.checked = false;
        } else {
          parentInput.indeterminate = false;
          parentInput.checked = false;
        }
      }

      this.checkUp(parentInput);
    }
  }

  private checkDown(check: HTMLInputElement) {
    const subList = check.closest('li').querySelector('ul');
    if (subList) {
      Array.from(subList.querySelectorAll('input[type=checkbox]')).forEach((input: HTMLInputElement) => {
        input.indeterminate = false;
        input.checked = check.checked;
      });
    }
  }
}
