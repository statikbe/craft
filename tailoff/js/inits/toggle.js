import Vue from "vue";
import { Toggle } from "../directives/Toggle";

const elements = document.querySelectorAll(".s-toggle");
elements.forEach(element => {
    new Vue({
        el: element,
        directives: {
            Toggle
        }
    });
});
