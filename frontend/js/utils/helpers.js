import $ from "jquery";

export function debounce(func, wait, immediate) {
    var timeout;

    return function () {
        var context = this;
        var args = arguments;
        var callNow = immediate && !timeout;
        function later() {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}

//  Loosely based on https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
export function extend(target) {
    target = Object(target);

    var argLen = arguments.length;
    var source, key;

    for (var i = 1; i < argLen; i++) {
        source = arguments[i];
        if (source !== null) {
            for (key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
    }

    return target;
}

export function getContentProperty(element, pseudoElement) {
    if (!window.hasOwnProperty("getComputedStyle")) {
        //  getComputedStyle is not supported
        return "";
    }

    return getComputedStyle(element, pseudoElement).getPropertyValue("content");
}

export function isBreakpointActive(breakpointKey) {
    return (
        getContentProperty(document.body, ":after").indexOf(breakpointKey) < 0
    );
}

export function loadScript(url, cb) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;

    if (typeof cb !== "undefined") {
        $(script).on("load", function () {
            cb();
        });
    }

    document.body.appendChild(script);
}
