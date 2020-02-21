import Vue from "vue";
import { ValidateInput } from "../directives/ValidateInput";
import { ValidateForm } from "../directives/ValidateForm";

const elements = document.querySelectorAll(".s-validation");
elements.forEach(element => {
    new Vue({
        el: element,
        directives: {
            ValidateInput,
            ValidateForm
        }
    });
});
