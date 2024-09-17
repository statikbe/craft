import { DOMHelper } from '../utils/domHelper';

export class TabsComponent {
  constructor() {
    const tabs = document.querySelectorAll('ul.js-tabs');
    Array.from(tabs).forEach((t: HTMLUListElement, index) => {
      if (!t.classList.contains('js-tabs-initialized')) {
        new Tabs(t, index);
      }
    });
  }
}

class Tabs {
  private tabsEl: HTMLUListElement;
  private buttons: Array<HTMLButtonElement> = new Array<HTMLButtonElement>();
  private panels: Array<HTMLElement> = new Array<HTMLElement>();
  private activeButton: HTMLButtonElement;
  private updateHash: boolean = false;

  private keys = {
    up: 38,
    left: 37,
    right: 39,
    down: 40,
  };

  constructor(tabsEl: HTMLUListElement, tabIndex) {
    this.tabsEl = tabsEl;
    this.tabsEl.classList.add('js-tabs-initialized');
    this.updateHash = this.tabsEl.hasAttribute('data-update-hash');

    const buttons = this.tabsEl.querySelectorAll('button');
    Array.from(buttons).forEach((button, index) => {
      const panelId = button.getAttribute('data-panel');
      button.setAttribute('id', `tabs${tabIndex}-label-${index}`);
      button.setAttribute('role', `tab`);
      button.setAttribute('aria-setsize', `${buttons.length}`);
      button.setAttribute('aria-posinset', `${index + 1}`);
      button.setAttribute('tabindex', `-1`);
      button.setAttribute('aria-controls', panelId);
      button.setAttribute('aria-selected', 'false');

      button.addEventListener('click', this.onClick.bind(this));
      button.addEventListener('keydown', this.onKeyDown.bind(this));

      this.buttons.push(button);

      const panel = document.querySelector(`#${panelId}`);
      panel.classList.add('hidden');
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `tabs${tabIndex}-label-${index}`);
      panel.setAttribute('tabindex', '-1');

      this.panels.push(panel as HTMLElement);

      const firstTab = this.tabsEl.getAttribute('data-first-tab');
      if ((firstTab && parseInt(firstTab) === index) || (!firstTab && index === 0)) {
        panel.classList.remove('hidden');
        button.setAttribute('aria-selected', 'true');
        button.setAttribute('tabindex', `0`);
        this.activeButton = button;
      }
    });

    let urlTab = window.location.hash;
    if (urlTab) {
      urlTab = urlTab.substr(1, urlTab.length - 1);
      const activeButton = document.querySelector(`button[role=tab][data-panel=${urlTab}]`) as HTMLButtonElement;
      if (activeButton) {
        this.activateTab(activeButton);
      }
    }
  }

  private onClick(e) {
    e.preventDefault();
    const button = e.target as HTMLButtonElement;
    this.activateTab(button);
  }

  private activateTab(button: HTMLButtonElement) {
    this.buttons.forEach((b) => {
      b.setAttribute('aria-selected', 'false');
      b.setAttribute('tabindex', '-1');
    });

    button.setAttribute('aria-selected', 'true');
    button.setAttribute('tabindex', '0');
    button.focus();
    this.activeButton = button;

    this.panels.forEach((p) => {
      p.classList.add('hidden');
    });

    const panelId = button.getAttribute('data-panel');
    const panel = document.querySelector(`#${panelId}`);
    panel.classList.remove('hidden');
    if (this.updateHash) {
      window.location.hash = panelId;
    }
  }

  private goToPrevTab() {
    let index = this.buttons.indexOf(this.activeButton);
    index--;
    if (index < 0) {
      index = this.buttons.length - 1;
    }
    this.activateTab(this.buttons[index]);
  }

  private goToNextTab() {
    let index = this.buttons.indexOf(this.activeButton);
    index++;
    if (index >= this.buttons.length) {
      index = 0;
    }
    this.activateTab(this.buttons[index]);
  }

  private onKeyDown(e) {
    switch (e.keyCode) {
      case this.keys.left:
      case this.keys.up:
        e.preventDefault();
        this.goToPrevTab();
        break;
      case this.keys.right:
      case this.keys.down:
        e.preventDefault();
        this.goToNextTab();
        break;
    }
  }
}
