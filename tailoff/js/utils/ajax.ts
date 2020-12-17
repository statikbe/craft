export class Ajax {
  constructor() {}

  public static call(options: Object = {}): XMLHttpRequest {
    const defaultOptions = {
      url: "",
      data: null,
      form: null,
      method: "GET",
      xhr: null,
      success: null,
      error: null,
    };
    const option = { ...defaultOptions, ...options };
    const _self = this;
    if (option.xhr) {
      option.xhr.abort();
    }

    option.xhr = new XMLHttpRequest();
    option.xhr.open(option.method, option.url, true);

    option.xhr.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        if (option.success && typeof option.success == "function") {
          let data = this.response;
          try {
            data = JSON.parse(data);
          } catch (e) {}
          option.success(data);
        }
      } else {
        console.error("Something went wrong when fetching data");
        if (option.error && typeof option.error == "function") {
          option.error(this.status);
        }
      }
    };

    option.xhr.onerror = function () {
      console.error("There was a connection error");
      if (option.error && typeof option.error == "function") {
        option.error();
      }
    };

    if (option.data || option.form) {
      let FD = new FormData();
      if (option.form) {
        FD = new FormData(option.form);
      }
      if (option.data) {
        for (const key in option.data) {
          FD.append(key, option.data[key]);
        }
      }

      option.xhr.send(FD);
    } else {
      option.xhr.send();
    }
    return option.xhr;
  }
}
