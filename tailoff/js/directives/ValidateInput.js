const lang = require(`../i18n/s-validation-${getValidationLang()}`);
Number.prototype.countDecimals = function() {
    if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0;
};

export const ValidateInput = {
    bind(el) {
        el.addEventListener("blur", checkValidation);
        el.addEventListener("check-validation", checkValidation);
        // if (el.tagName === "SELECT") {
        //     console.log("bind", el);

        //     el.addEventListener("change", function() {
        //         console.log("changed");
        //     });
        // }
    }
};

function checkValidation(e) {
    const errorClass = "form__error";
    const el = e.target;
    const validity = e.target.validity;

    // if (el.tagName === "SELECT") {
    //     console.log(el.nearest("label"));
    // }

    if (!validity.valid) {
        if (
            !el.nextElementSibling ||
            (el.nextElementSibling &&
                !el.nextElementSibling.classList.contains(errorClass))
        ) {
            el.insertAdjacentHTML(
                "afterend",
                `<div class="${errorClass}"></div>`
            );
        }
        if (el.classList) {
            el.classList.add(errorClass);
        }
        el.nextElementSibling.innerHTML = getErrorMessage(
            validity,
            el.getAttribute("type"),
            el
        );
    } else {
        if (el.classList) {
            el.classList.remove(errorClass);
        }
        if (
            el.nextElementSibling &&
            el.nextElementSibling.classList.contains(errorClass)
        ) {
            el.parentNode.removeChild(el.nextElementSibling);
        }
    }
}

function getErrorMessage(validity, type, el) {
    // console.log(lang);
    if (validity.badInput && type === "number") return lang.type.number;
    if (validity.valueMissing) return lang.required;
    if (validity.typeMismatch && type === "email") return lang.type.email;
    if (validity.typeMismatch && type === "url") return lang.type.url;
    if (validity.typeMismatch && type === "tel") return lang.type.tel;
    if (validity.typeMismatch) return lang.defaultMessage;
    if (validity.stepMismatch && parseFloat(el.getAttribute("step")) >= 1)
        return lang.stepInt;
    if (validity.stepMismatch && parseFloat(el.getAttribute("step")) < 1)
        return formatMessage(lang.stepFloat, {
            max: parseFloat(el.getAttribute("step")).countDecimals()
        });
    if (
        (validity.rangeUnderflow || validity.rangeOverflow) &&
        (type === "number" || type === "range") &&
        el.getAttribute("min") &&
        el.getAttribute("max")
    )
        return formatMessage(lang.range, {
            min: el.getAttribute("min"),
            max: el.getAttribute("max")
        });
    if (
        validity.rangeUnderflow &&
        (type === "number" || type === "range") &&
        el.getAttribute("min")
    )
        return formatMessage(lang.min, { min: el.getAttribute("min") });
    if (
        validity.rangeOverflow &&
        (type === "number" || type === "range") &&
        el.getAttribute("max")
    )
        return formatMessage(lang.max, { min: el.getAttribute("max") });
    return lang.defaultMessage;
}

function getValidationLang() {
    return document.documentElement.lang ? document.documentElement.lang : "nl";
}

// Kind of light `sprintf()` implementation
function formatMessage(string, parameters) {
    if ("object" === typeof parameters) {
        for (var i in parameters) string = formatMessage(string, parameters[i]);
        return string;
    }
    return "string" === typeof string ? string.replace(/%s/i, parameters) : "";
}

// if (!Element.prototype.matches) {
//     Element.prototype.matches =
//         Element.prototype.msMatchesSelector ||
//         Element.prototype.webkitMatchesSelector;
// }

// Element.prototype.nearest = function(s) {
//     var el = this;

//     do {
//         if (el.matches(s)) return el;
//         el = el.parentElement || el.parentNode;
//         var child = el.querySelectorAll(s);
//         if (child) return child;
//     } while (el !== null && el.nodeType === 1);
//     return null;
// };
