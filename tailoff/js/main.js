"use strict";

// //  Icon font generation - do not remove
import "../icons/iconfont.font";

import "../css/main.css";

import Vue from "vue";
import vuetify from "./plugins/vuetify";
import Test from "./components/Test";
import { Toggle } from "./directives/Toggle";

new Vue({
    vuetify,
    el: "#app",
    components: {
        "test-component": Test
    },
    directives: {
        Toggle
    }
});
