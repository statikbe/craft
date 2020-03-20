import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
// import Glide from "@glidejs/glide";
import Glide, {
  Controls,
  Breakpoints
} from "@glidejs/glide/dist/glide.modular.esm";

ArrayPrototypes.activateFrom();

export class GlideComponent {
  constructor() {
    const sliders = Array.from(document.querySelectorAll(".js-slider"));
    sliders.forEach(slider => {
      const sliderID = slider.getAttribute("id");
      const glide = new Glide("#" + sliderID, {
        type: "carousel",
        perView: 1
      });
      // glide.mount({});
      glide.mount({ Controls, Breakpoints });
    });
  }
}
