export class DOMHelper {
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

  public static onDynamicContent(
    parent: Element,
    selector: string,
    callback: Function,
    includeAttributes: boolean | string = false
  ) {
    const mutationObserver: MutationObserver = new MutationObserver((mutationsList) => {
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
    });
    mutationObserver.observe(parent, {
      attributes: typeof includeAttributes == 'boolean' ? includeAttributes : includeAttributes.length > 0,
      childList: true,
      subtree: true,
    });
  }
}
