import { A11yUtils } from "../utils/a11y";
import "wicg-inert";

declare global {
  interface Window {
    dataLayer: any;
  }
}

export class CookieComponent {
  private consentCookie = "__cookie_consent";
  private mainContentBlock: HTMLElement;

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

    this.mainContentBlock = document.getElementById("mainContentBlock");

    const cookieBanner = document.getElementById("cookiebanner");

    if (shouldRun && cookieBanner) {
      cookieBanner.classList.toggle("hidden");
      document
        .getElementById("cookiebanner-overlay")
        .classList.toggle("hidden");
      A11yUtils.keepFocus(cookieBanner);
      cookieBanner.focus();
      const closeBtn = document.querySelector(
        ".js-modal-close-btn"
      ) as HTMLElement;
      if (closeBtn) {
        closeBtn.setAttribute("disabled", "true");
        closeBtn.classList.add("hidden");
      }
      this.setMainContentInert();
    }

    document.body.addEventListener("click", this.clickListener.bind(this));
  }

  private clickListener(event) {
    const element = event.target;
    if (!element) {
      return;
    }

    if (element.classList) {
      if (element.classList.contains("js-cookie-settings")) {
        event.preventDefault();
        const cookieBanner = document.getElementById("cookiebanner");
        if (cookieBanner) {
          cookieBanner.classList.add("hidden");
        }
        this.renderCookieModal();
        this.setMainContentInert();
      } else if (element.classList.contains("js-cookie-accept")) {
        event.preventDefault();
        this.setCookie(this.consentCookie, "365", true);
        document.getElementById("cookiebanner").classList.add("hidden");
        document.getElementById("cookiebanner-overlay").classList.add("hidden");
        document.getElementById("cookieModal").classList.add("hidden");
        this.setMainContentInert(false);
      } else if (element.classList.contains("js-modal-close")) {
        event.preventDefault();
        this.closeCookieModal();
        document.getElementById("cookiebanner-overlay").classList.add("hidden");
      } else if (element.classList.contains("js-modal-close-btn")) {
        event.preventDefault();
        this.closeCookieModalWithoutSave();
        document.getElementById("cookiebanner-overlay").classList.add("hidden");
      } else if (element.classList.contains("js-cookie-performance")) {
        this.updateCheckbox("performance");
      } else if (element.classList.contains("js-cookie-marketing")) {
        this.updateCheckbox("marketing");
      }
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
    this.setMainContentInert(false);
  }

  private closeCookieModalWithoutSave() {
    const cookieModal = document.getElementById("cookieModal");
    cookieModal.classList.toggle("hidden");
    this.setMainContentInert(false);
  }

  private updateCheckbox(label) {
    const checkboxvar = document.getElementById(label) as HTMLInputElement;

    if (
      (checkboxvar.defaultChecked && !checkboxvar.checked) ||
      !checkboxvar.checked
    ) {
      checkboxvar.checked = false;
      checkboxvar.defaultChecked = false;
    } else {
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

    if (window.dataLayer) {
      window.dataLayer.push({ event: "cookie_refresh" });
    }
  }

  private renderCookieModal() {
    //check if the modal was already opened before
    const cookieBanner = document.getElementById("cookiebanner");
    if (cookieBanner) {
      cookieBanner.classList.add("hidden");
    }
    const cookieModal = document.getElementById("cookieModal");
    if (cookieModal) {
      cookieModal.classList.remove("hidden");
    }
    var cookieOverlay = document.getElementById("cookiebanner-overlay");
    cookieOverlay.classList.remove("hidden");

    A11yUtils.keepFocus(cookieModal);
    cookieModal.focus();

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

  private setMainContentInert(set = true) {
    if (this.mainContentBlock && set) {
      this.mainContentBlock.setAttribute("inert", "");
      document.documentElement.classList.add("overflow-hidden");
    }
    if (this.mainContentBlock && !set) {
      this.mainContentBlock.removeAttribute("inert");
      document.documentElement.classList.remove("overflow-hidden");
    }
  }
}
