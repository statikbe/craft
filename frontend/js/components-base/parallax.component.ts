export default class ParallaxComponent {
  constructor() {
    if (!CSS.supports('animation-timeline: --works')) {
      import('../libs/scroll-timeline.js');
    }
  }
}
