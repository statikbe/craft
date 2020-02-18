/*********
 * Example use:
 * <div v-toggle:flyout-open="'body'"></div>
 */

const toggleAction = (target, changeClass) => {
    const targetElement = document.querySelectorAll(target);
    targetElement.forEach(t => {
        if (t.classList) {
            if (t.classList.contains(changeClass)) {
                t.classList.remove(changeClass);
            } else {
                t.classList.add(changeClass);
            }
        }
    });
};

export const Toggle = {
    inserted(el, binding, vnode) {
        const changeClass = binding.arg ? binding.arg : "toggle-open";
        el.addEventListener("click", function() {
            toggleAction(binding.value, changeClass);
        });
    }
};
