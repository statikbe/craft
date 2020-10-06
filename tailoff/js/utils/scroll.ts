export class ScrollHelper {
  constructor() {}

  public static scrollToY(elementY: HTMLElement, duration: number) {
    const rect = elementY.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const startingY = window.pageYOffset;
    const diff = rect.top + scrollTop - startingY;

    let start;

    window.requestAnimationFrame(function step(timestamp) {
      if (!start) start = timestamp;
      var time = timestamp - start;
      var percent = Math.min(time / duration, 1);
      window.scrollTo(0, startingY + diff * percent);
      if (time < duration) {
        window.requestAnimationFrame(step);
      }
    });
  }
}
