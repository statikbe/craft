type SortState = 'none' | 'asc' | 'desc';

export default class SortTableComponent {
  constructor() {
    const buttons = document.querySelectorAll<HTMLButtonElement>('[data-sorttable]');
    if (buttons.length === 0) return;

    const instances: SortTableButton[] = [];
    buttons.forEach((button) => {
      instances.push(new SortTableButton(button, instances));
    });

    window.addEventListener('popstate', () => {
      const fetched = new Set<string>();
      instances.forEach((instance) => {
        instance.syncFromUrl();
        const id = instance.refreshElementId;
        if (id && !fetched.has(id)) {
          fetched.add(id);
          instance.fetchContent(window.location.href);
        }
      });
    });
  }
}

class SortTableButton {
  private button: HTMLButtonElement;
  private sortKey: string;
  public refreshElementId: string;
  private refreshElement: HTMLElement | null;
  private state: SortState = 'none';
  private defaultState: SortState = 'none';
  private clearOnOtherSort: boolean = true;
  private allInstances: SortTableButton[];
  private fetchAbortController: AbortController | null = null;
  private textNosort: string;
  private textAscsort: string;
  private textDescsort: string;

  constructor(button: HTMLButtonElement, allInstances: SortTableButton[]) {
    this.button = button;
    this.allInstances = allInstances;
    this.sortKey = button.getAttribute('data-sorttable') ?? '';
    this.refreshElementId = button.getAttribute('data-sorttable-refreshelement') ?? '';
    this.refreshElement = this.refreshElementId ? document.getElementById(this.refreshElementId) : null;
    this.defaultState = (button.getAttribute('data-sorttable-defaultstate') as SortState) ?? 'none';
    this.clearOnOtherSort = button.getAttribute('data-sorttable-clear-on-other-sort') !== 'false';

    this.textNosort = this.button.getAttribute('data-sorttable-text-nosort') ?? '';
    this.textAscsort = this.button.getAttribute('data-sorttable-text-ascsort') ?? '';
    this.textDescsort = this.button.getAttribute('data-sorttable-text-descsort') ?? '';

    if (!this.refreshElement) {
      console.warn(`SortTable: No element found with id "${this.refreshElementId}"`);
    }

    this.syncFromUrl();
    this.updateUI();

    this.button.addEventListener('click', () => this.handleClick());
  }

  syncFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(this.sortKey);
    if (value === 'asc' || value === 'desc') {
      this.state = value;
    } else {
      this.state = this.defaultState;
    }
    this.updateUI();
  }

  private nextState(): SortState {
    if (this.state === 'none') return 'asc';
    if (this.state === 'asc') return 'desc';
    return 'none';
  }

  private handleClick() {
    this.state = this.nextState();

    const url = this.buildUrl();

    this.allInstances.forEach((instance) => {
      if (instance !== this && instance.clearOnOtherSort) {
        instance.state = 'none';
        instance.updateUI();
      }
    });

    this.updateUI();
    history.pushState('', '', url);
    this.fetchContent(url);
  }

  private buildUrl(): string {
    const params = new URLSearchParams(window.location.search);

    if (this.state === 'none') {
      params.delete(this.sortKey);
    } else {
      params.set(this.sortKey, this.state);
    }

    this.allInstances.forEach((instance) => {
      if (instance !== this && instance.clearOnOtherSort) {
        params.delete(instance.sortKey);
      }
    });

    const queryString = params.toString();
    return window.location.origin + window.location.pathname + (queryString ? '?' + queryString : '');
  }

  public updateUI() {
    if (this.state === 'asc') {
      this.button.setAttribute('aria-label', this.textDescsort);
    } else if (this.state === 'desc') {
      this.button.setAttribute('aria-label', this.textNosort);
    } else {
      this.button.setAttribute('aria-label', this.textAscsort);
    }

    const ascIndicator = this.button.querySelector('[data-sorttable-state-asc]');
    const descIndicator = this.button.querySelector('[data-sorttable-state-desc]');

    if (ascIndicator) {
      if (this.state === 'asc') {
        ascIndicator.setAttribute('data-active', '');
      } else {
        ascIndicator.removeAttribute('data-active');
      }
    }

    if (descIndicator) {
      if (this.state === 'desc') {
        descIndicator.setAttribute('data-active', '');
      } else {
        descIndicator.removeAttribute('data-active');
      }
    }
  }

  async fetchContent(url: string) {
    if (!this.refreshElement) return;

    if (this.fetchAbortController) {
      this.fetchAbortController.abort();
    }
    this.fetchAbortController = new AbortController();

    try {
      const response = await fetch(url, { signal: this.fetchAbortController.signal });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const newContent = doc.getElementById(this.refreshElementId);
      if (newContent) {
        this.refreshElement.innerHTML = newContent.innerHTML;
      } else {
        console.error(`SortTable: Element with id "${this.refreshElementId}" not found in response.`);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('SortTable fetch error:', error.message);
      }
    }
  }
}
