export class ScrollHelper {
  constructor() {}

  public static scrollToY(elementY: HTMLElement, duration: number) {
    const startingY = window.pageYOffset;
    const diff = elementY.offsetTop - startingY;
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
