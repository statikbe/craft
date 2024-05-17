export class GeneralComponent {
  constructor() {
    const bodyElement = document.getElementsByTagName(
      "BODY"
    )[0] as HTMLBodyElement;
    bodyElement.classList.add("js-enabled");
    this.addOutlineForTabbers();

    const node = document.querySelector(".preload-transitions");
    document.addEventListener("DOMContentLoaded", function () {
      node.classList.remove("preload-transitions");
    });
    if (
      document.readyState === "interactive" ||
      document.readyState === "complete"
    ) {
      node.classList.remove("preload-transitions");
    }
  }

  // This adds a class if the user is tabbing and thus using the keyboard, so the focus style will be visible. Otherwise if it's a clicker the focus is removed.
  private addOutlineForTabbers() {
    function handleFirstTab(e) {
      if (e.keyCode === 9) {
        // the "I am a keyboard user" key
        document.body.classList.add("user-is-tabbing");
        window.removeEventListener("keydown", handleFirstTab);
      }
    }
    window.addEventListener("keydown", handleFirstTab);
  }
}
