export class SiteLang {
  constructor() {}

  public static getLang() {
    return document.documentElement.lang ? document.documentElement.lang : "nl";
  }
}
