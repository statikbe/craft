import { A11yUtils } from "../utils/a11y";

export class CookieComponent {
  private consentCookie = "__cookie_consent";
  private locale = document.documentElement.lang;
  private translations = {
    nl: { active: "actief", nonactive: "niet actief" },
    fr: { active: "actif", nonactive: "non actif" },
    en: { active: "active", nonactive: "non-active" }
  };

  constructor() {
    let shouldRun = false;

    if (
      /bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex/i.test(
        navigator.userAgent
      )
    ) {
      shouldRun = false;
    } else {
      shouldRun = this.getCookie(this.consentCookie) ? false : true;
    }

    if (shouldRun) {
      const cookieBanner = document.getElementById("cookiebanner");
      cookieBanner.classList.toggle("hidden");
      document
        .getElementById("cookiebanner-overlay")
        .classList.toggle("hidden");
      A11yUtils.keepFocus(cookieBanner);
      (cookieBanner.querySelector(".js-cookie-accept") as HTMLElement).focus();
      document.body.addEventListener("click", this.clickListener.bind(this));
    }
  }

  private clickListener(event) {
    const element = event.target;
    if (!element) {
      return;
    }

    if (element.classList.contains("js-cookie-settings")) {
      event.preventDefault();
      this.renderCookieModal();
    } else if (element.classList.contains("js-cookie-accept")) {
      event.preventDefault();
      this.setCookie(this.consentCookie, "365", true);
      document.getElementById("cookiebanner").classList.toggle("hidden");
      document
        .getElementById("cookiebanner-overlay")
        .classList.toggle("hidden");
      location.reload();
    } else if (element.classList.contains("js-modal-close")) {
      event.preventDefault();
      this.closeCookieModal();
      document.getElementById("cookiebanner").classList.toggle("hidden");
      document
        .getElementById("cookiebanner-overlay")
        .classList.toggle("hidden");
      location.reload();
    } else if (element.classList.contains("js-cookie-performance")) {
      this.updateCheckbox("performance");
    } else if (element.classList.contains("js-cookie-marketing")) {
      this.updateCheckbox("marketing");
    }
  }

  private closeCookieModal() {
    if (
      this.isCookieChecked("performance") == true &&
      this.isCookieChecked("marketing") == true
    ) {
      this.setCookie(this.consentCookie, "365", true);
    }
    if (
      this.isCookieChecked("performance") == true &&
      this.isCookieChecked("marketing") == false
    ) {
      this.setCookie(this.consentCookie, "365", 2);
    }

    if (
      this.isCookieChecked("marketing") == true &&
      this.isCookieChecked("performance") == false
    ) {
      this.setCookie(this.consentCookie, "365", 3);
    }

    if (
      this.isCookieChecked("marketing") == false &&
      this.isCookieChecked("performance") == false
    ) {
      this.setCookie(this.consentCookie, "365", false);
    }

    const cookieModal = document.getElementById("cookieModal");
    cookieModal.classList.toggle("hidden");
  }

  private updateCheckbox(label) {
    const checkboxvar = document.getElementById(label) as HTMLInputElement;
    const labelvar = document.getElementById(label + "Label");

    if (
      (checkboxvar.defaultChecked && !checkboxvar.checked) ||
      !checkboxvar.checked
    ) {
      if (typeof this.translations[this.locale] !== "undefined") {
        labelvar.innerHTML = " " + this.translations[this.locale].nonactive;
      } else {
        labelvar.innerHTML = " niet actief";
      }
      checkboxvar.checked = false;
      checkboxvar.defaultChecked = false;
    } else {
      if (typeof this.translations[this.locale] !== "undefined") {
        labelvar.innerHTML = " " + this.translations[this.locale].active;
      } else {
        labelvar.innerHTML = " actief";
      }
      checkboxvar.checked = true;
    }
  }

  private isCookieChecked(cookie) {
    const cookieId = document.getElementById(cookie) as HTMLInputElement;
    if (cookieId.checked == true || cookieId.defaultChecked) {
      return true;
    } else {
      return false;
    }
  }

  private getCookie(key) {
    if (!key) {
      return null;
    }
    return (
      decodeURIComponent(
        document.cookie.replace(
          new RegExp(
            "(?:(?:^|.*;)\\s*" +
              encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") +
              "\\s*\\=\\s*([^;]*).*$)|^.*$"
          ),
          "$1"
        )
      ) || null
    );
  }

  private setCookie(key, expireDays, value) {
    const date = new Date();
    if (expireDays) {
      date.setTime(date.getTime() + expireDays * 24 * 60 * 60 * 1000);
    }
    let expires = date.toUTCString();
    document.cookie =
      encodeURIComponent(key) +
      "=" +
      encodeURIComponent(value) +
      (expires ? "; expires=" + expires : "") +
      "; path=/";
  }

  private renderCookieModal() {
    //check if the modal was already opened before
    const cookieModal = document.getElementById("cookieModal");
    cookieModal.classList.toggle("hidden");
    // document.getElementById("cookiebanner-overlay").classList.toggle("hidden");

    A11yUtils.keepFocus(cookieModal);
    (cookieModal.querySelector(".js-modal-close") as HTMLElement).focus();

    const cookieGdpr = this.getCookie(this.consentCookie);

    if (cookieGdpr == "true") {
      (document.getElementById(
        "performance"
      ) as HTMLInputElement).checked = true;
      this.updateCheckbox("performance");
      (document.getElementById("marketing") as HTMLInputElement).checked = true;
      this.updateCheckbox("marketing");
    }
    if (cookieGdpr == "2") {
      (document.getElementById(
        "performance"
      ) as HTMLInputElement).checked = true;
      this.updateCheckbox("performance");
    }
    if (cookieGdpr == "3") {
      (document.getElementById("marketing") as HTMLInputElement).checked = true;
      this.updateCheckbox("marketing");
    }
  }
}
