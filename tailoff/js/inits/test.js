import Vue from "vue";
import TestComponent from "../components/Test";
import store from "../stores/store";

const elements = document.querySelectorAll(".s-test");
elements.forEach(element => {
    new Vue({
        el: element,
        store,
        components: {
            TestComponent
        }
    });
});
