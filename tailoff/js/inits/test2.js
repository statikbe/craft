import Vue from "vue";
import Test2Component from "../components/Test2";
import store from "../stores/store";

Vue.prototype.$eventBus = new Vue();

const elements = document.querySelectorAll(".s-test2");
elements.forEach(element => {
    new Vue({
        el: element,
        store,
        components: {
            Test2Component
        }
    });
});
