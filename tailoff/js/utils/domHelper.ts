export class DOMHelper {
  constructor() {}

  public static loadScript(url, cb) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;

    if (typeof cb !== "undefined") {
      script.addEventListener("load", function() {
        cb();
      });
    }

    document.body.appendChild(script);
  }
}
