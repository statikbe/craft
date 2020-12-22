export class AnimationHelper {
  constructor() {}

  public static cssPropertyAnimation(
    element: HTMLElement,
    property: string,
    newValue: number,
    unit: string,
    duration: number,
    cb: Function = null
  ) {
    const startingValue = element.style[property]
      ? parseFloat(element.style[property])
      : 0;
    const diff = newValue - startingValue;
    let start;

    window.requestAnimationFrame(function step(timestamp) {
      if (!start) start = timestamp;
      const time = timestamp - start;
      const percent = Math.min(time / duration, 1);
      element.style[property] = `${startingValue + diff * percent}${unit}`;
      if (time < duration) {
        window.requestAnimationFrame(step);
      } else {
        cb && cb();
      }
    });
  }
}
