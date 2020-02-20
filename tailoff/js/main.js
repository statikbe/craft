"use strict";

// //  Icon font generation - do not remove
import "../icons/iconfont.font";

import "../css/main.css";

import Vue from "vue";
import { Toggle } from "./directives/Toggle";
import { ValidateInput } from "./directives/ValidateInput";
import { ValidateForm } from "./directives/ValidateForm";

new Vue({
    el: "#app",
    components: {},
    directives: {
        Toggle,
        ValidateInput,
        ValidateForm
    }
});
