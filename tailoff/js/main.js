"use strict";

// //  Icon font generation - do not remove
import "../icons/iconfont.font";

import "../css/main.css";

// import Vue from "vue";
// import { Toggle } from "./directives/Toggle";
// import { ValidateInput } from "./directives/ValidateInput";
// import { ValidateForm } from "./directives/ValidateForm";

// new Vue({
//     el: "#app",
//     components: {},
//     directives: {
//         Toggle,
//         ValidateInput,
//         ValidateForm
//     }
// });

import Vue from "vue";
import wrap from "@vue/web-component-wrapper";
import TestComponent from "./components/Test";
import ValidationWrapper from "./components/ValidationWrapper";
// import { ValidateInput } from "./directives/ValidateInput";
// import { ValidateForm } from "./directives/ValidateForm";

window.customElements.define("test-component", wrap(Vue, TestComponent));
window.customElements.define(
    "validation-wrapper",
    wrap(Vue, ValidationWrapper)
);
