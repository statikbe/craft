export const ValidateForm = {
    bind(el, _, vnode) {
        const vm = vnode.context; // this is the Vue instance.

        el.addEventListener("submit", function(e) {
            let valid = true;
            const inputs = el.getElementsByTagName("input");
            for (const element of inputs) {
                valid = !element.validity.valid ? false : valid;
                element.dispatchEvent(new Event("check-validation"));
            }
            const textareas = el.getElementsByTagName("textarea");
            for (const element of textareas) {
                valid = !element.validity.valid ? false : valid;
                element.dispatchEvent(new Event("check-validation"));
            }
            const selects = el.getElementsByTagName("select");
            for (const element of selects) {
                valid = !element.validity.valid ? false : valid;
                element.dispatchEvent(new Event("check-validation"));
            }
            if (!valid) {
                e.preventDefault();
            }
        });
    }
};
