export class DOMHelper {
  constructor() {}

  public static loadScript(url, cb) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;

    if (typeof cb !== "undefined") {
      script.addEventListener("load", function () {
        cb();
      });
    }

    document.body.appendChild(script);
  }

  public static onDynamicContent(
    parent: Element,
    selector: string,
    callback: Function
  ) {
    const mutationObserver: MutationObserver = new MutationObserver(
      (mutationsList) => {
        for (let mutation of mutationsList) {
          if (mutation.type === "childList") {
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
        }
      }
    );
    mutationObserver.observe(parent, {
      attributes: false,
      childList: true,
      subtree: true,
    });
  }
}
