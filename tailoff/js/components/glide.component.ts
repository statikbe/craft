import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
// import Glide from "@glidejs/glide";
import Glide, {
  Controls,
  Breakpoints,
} from "@glidejs/glide/dist/glide.modular.esm";
import { DOMHelper } from "../utils/domHelper";

ArrayPrototypes.activateFrom();

export class GlideComponent {
  constructor() {
    const sliders = Array.from(document.querySelectorAll(".js-slider"));
    this.processSliders(sliders);

    DOMHelper.onDynamicContent(
      document.documentElement,
      ".js-slider",
      (sliders) => {
        this.processSliders(Array.from(sliders));
      }
    );
  }

  private processSliders(sliders: Array<Element>) {
    sliders.forEach((slider) => {
      slider.classList.remove("js-slider");
      const sliderID = slider.getAttribute("id");
      const glide = new (Glide as any)("#" + sliderID, {
        type: "carousel",
        perView: 1,
      });
      // glide.mount({});
      glide.mount({ Controls, Breakpoints });
    });
  }
}
