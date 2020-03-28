export class A11yUtils {
  private static tabbableElements = `a[href], area[href], input:not([disabled]),
    select:not([disabled]), textarea:not([disabled]),
    button:not([disabled]), iframe, object, embed, *[tabindex],
    *[contenteditable]`;

  constructor() {}

  public static keepFocus(context: HTMLElement) {
    const allTabbableElements = context.querySelectorAll(this.tabbableElements);

    const firstTabbableElement = allTabbableElements[0];
    const lastTabbableElement =
      allTabbableElements[allTabbableElements.length - 1];

    const trapFunction = function(event) {
      const keyCode = event.which || event.keyCode; // Get the current keycode

      // If it is TAB
      if (keyCode === 9) {
        // Move focus to first element that can be tabbed if Shift isn't used
        if (event.target === lastTabbableElement && !event.shiftKey) {
          event.preventDefault();
          (firstTabbableElement as HTMLElement).focus();

          // Move focus to last element that can be tabbed if Shift is used
        } else if (event.target === firstTabbableElement && event.shiftKey) {
          event.preventDefault();
          (lastTabbableElement as HTMLElement).focus();
        }
      }
    };
    context.addEventListener("keydown", trapFunction);
  }
}
