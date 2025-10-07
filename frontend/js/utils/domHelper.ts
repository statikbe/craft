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

  public static loadScriptContent(content) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = content;
    document.body.appendChild(script);
  }

  public static onDynamicContent(
    parent: Element,
    selector: string,
    callback: Function,
    includeAttributes: boolean | string = false,
    checkRemoved: boolean = false
  ) {
    const mutationObserver: MutationObserver = new MutationObserver(
      (mutationsList) => {
        for (let mutation of mutationsList) {
          if (mutation.type === "childList") {
            if (checkRemoved) {
              Array.from(mutation.removedNodes).forEach((node: HTMLElement) => {
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
            } else {
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
          if (mutation.type === "attributes" && includeAttributes) {
            if (typeof includeAttributes == "string") {
              if (mutation.attributeName == includeAttributes) {
                const results = (mutation.target as HTMLElement).matches(
                  selector
                );
                if (results) {
                  callback([mutation.target]);
                }
              }
            } else {
              const results = (mutation.target as HTMLElement).matches(
                selector
              );
              if (results) {
                callback([mutation.target]);
              }
            }
          }
        }
      }
    );
    mutationObserver.observe(parent, {
      attributes:
        typeof includeAttributes == "boolean"
          ? includeAttributes
          : includeAttributes.length > 0,
      childList: true,
      subtree: true,
    });
  }

  public static getPathTo(element) {
    if (element.id !== "") return "#" + element.id;

    if (element === document.body) return element.tagName.toLowerCase();

    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
      var sibling = siblings[i];

      if (sibling === element)
        return (
          this.getPathTo(element.parentNode) +
          "-" +
          element.tagName.toLowerCase() +
          (ix + 1)
        );

      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++;
      }
    }
  }
}
