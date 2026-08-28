interface MutationCallback {
  handler: (mutations: MutationRecord[]) => void;
  options: MutationObserverInit;
}

interface ManagedObserver {
  observer: MutationObserver;
  callbacks: Set<MutationCallback>;
}

export class DOMHelper {
  private static observerRegistry = new WeakMap<Element, ManagedObserver>();

  constructor() {}

  public static loadScript(url, cb) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    if (typeof cb !== 'undefined') {
      script.addEventListener('load', function () {
        cb();
      });
    }

    document.body.appendChild(script);
  }

  private static mergeOptions(
    options1: MutationObserverInit,
    options2: MutationObserverInit
  ): MutationObserverInit {
    const merged: MutationObserverInit = {};
    merged.childList = (options1.childList || false) || (options2.childList || false);
    merged.attributes = (options1.attributes || false) || (options2.attributes || false);
    merged.subtree = (options1.subtree || false) || (options2.subtree || false);
    merged.attributeOldValue = (options1.attributeOldValue || false) || (options2.attributeOldValue || false);
    merged.characterData = (options1.characterData || false) || (options2.characterData || false);
    merged.characterDataOldValue = (options1.characterDataOldValue || false) || (options2.characterDataOldValue || false);

    const filters1 = options1.attributeFilter || [];
    const filters2 = options2.attributeFilter || [];
    if (filters1.length > 0 || filters2.length > 0) {
      merged.attributeFilter = Array.from(new Set([...filters1, ...filters2]));
    }

    return merged;
  }

  private static getOrCreateObserver(parent: Element): ManagedObserver {
    let managed = this.observerRegistry.get(parent);

    if (!managed) {
      const callbacks = new Set<MutationCallback>();
      const observer = new MutationObserver((mutationsList) => {
        callbacks.forEach(({ handler }) => handler(mutationsList));
      });

      managed = { observer, callbacks };
      this.observerRegistry.set(parent, managed);
    }

    return managed;
  }

  private static updateObserverOptions(parent: Element): void {
    const managed = this.observerRegistry.get(parent);
    if (!managed || managed.callbacks.size === 0) return;

    let mergedOptions: MutationObserverInit = {
      childList: false,
      attributes: false,
      subtree: false,
    };

    managed.callbacks.forEach(({ options }) => {
      mergedOptions = this.mergeOptions(mergedOptions, options);
    });

    managed.observer.observe(parent, mergedOptions);
  }

  public static onDynamicContent(
    parent: Element,
    selector: string,
    callback: Function,
    includeAttributes: boolean | string = false
  ): () => void {
    const managed = this.getOrCreateObserver(parent);

    const handler = (mutationsList: MutationRecord[]) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          Array.from(mutation.addedNodes).forEach((node: HTMLElement) => {
            if (node.nodeType == 1) {
              const results = node.querySelectorAll(selector);
              if (results.length > 0) {
                callback(results);
              } else {
                if (node.matches(selector)) {
                  callback([node]);
                }
              }
            }
          });
        }
        if (mutation.type === 'attributes' && includeAttributes) {
          if (typeof includeAttributes == 'string') {
            if (mutation.attributeName == includeAttributes) {
              const results = (mutation.target as HTMLElement).matches(selector);
              if (results) {
                callback([mutation.target]);
              }
            }
          } else {
            const results = (mutation.target as HTMLElement).matches(selector);
            if (results) {
              callback([mutation.target]);
            }
          }
        }
      }
    };

    const options: MutationObserverInit = {
      attributes: typeof includeAttributes == 'boolean' ? includeAttributes : includeAttributes.length > 0,
      childList: true,
      subtree: true,
    };

    if (typeof includeAttributes === 'string') {
      options.attributeFilter = [includeAttributes];
    }

    const callbackWrapper: MutationCallback = { handler, options };
    managed.callbacks.add(callbackWrapper);
    this.updateObserverOptions(parent);

    return () => this.removeCallback(parent, callbackWrapper);
  }

  private static removeCallback(parent: Element, callbackWrapper: MutationCallback): void {
    const managed = this.observerRegistry.get(parent);
    if (!managed) return;

    managed.callbacks.delete(callbackWrapper);

    if (managed.callbacks.size === 0) {
      managed.observer.disconnect();
      this.observerRegistry.delete(parent);
    } else {
      this.updateObserverOptions(parent);
    }
  }
}

