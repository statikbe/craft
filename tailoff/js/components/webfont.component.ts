import Promise from "promise-polyfill";
// import Promise from "es6-promise";

export class WebfontComponent {
  private urls: Array<string>;
  private key = "fonts";
  private cache;

  constructor(urls: Array<string> = []) {
    this.urls = urls;
    this.cache = window.localStorage.getItem(this.key);
    if (this.cache) {
      this.insertFonts(this.cache);
      this.cacheFonts();
    } else {
      this.cacheFonts(true);
    }
  }

  private cacheFonts(isInsertFonts: boolean = false) {
    const _self = this;
    window.addEventListener("load", function () {
      const promises = [];

      for (let i = 0; i < _self.urls.length; i++) {
        const request = _self.get(_self.urls[i]).then(
          function (response) {
            return response;
          },
          function (error) {
            console.error("Failed!", error);
            return false;
          }
        );

        promises.push(request);
      }

      Promise.all(promises).then((arrayOfResults) => {
        let fonts = "";

        for (let i = 0; i < arrayOfResults.length; i++) {
          if (arrayOfResults[i]) {
            fonts = fonts + " " + arrayOfResults[i];
          }
        }

        if (isInsertFonts) {
          _self.insertFonts(fonts);
        }
        window.localStorage.setItem(_self.key, fonts);
      });
    });
  }

  private insertFonts(value) {
    const style = document.createElement("style");
    style.innerHTML = value;
    document.head.appendChild(style);
  }

  private get(url) {
    return new Promise(function (resolve, reject) {
      const req = new XMLHttpRequest();
      req.open("GET", url);

      req.onload = function () {
        if (req.status == 200) {
          resolve(req.response);
        } else {
          reject(Error(req.statusText));
        }
      };

      req.onerror = function () {
        reject(Error("Network Error"));
      };

      req.send();
    });
  }
}
