(function (window) {
    "use strict";

    var CookieMonster = function () {
        var consentCookie = "__cookie_consent";
        var locale = document.documentElement.lang;
        var translations = {
            nl: {active: "actief", nonactive: "niet actief"},
            fr: {active: "actif", nonactive: "non actif"},
            en: {active: "active", nonactive: "non-active"}
        };


        var _init = function () {
            var shouldRun = !_getCookie(consentCookie);
            if (shouldRun) {
                document.getElementById("cookiebanner").style.display = "block";
                document.getElementById("cookiebanner-overlay").style.display = "block";
                trapFocus(document.getElementById("cookiebanner"));
            }

            document.body.addEventListener("click", _listener);
        };

        // check when links get clicked
        var _listener = function (event) {
            var element = event.target;
            if (!element) {
                return;
            }

            if (_hasClass(element, "js-cookie-settings")) {
                event.preventDefault();
                document.getElementById("cookiebanner").classList.toggle("superhidden");
                _renderCookieModal();
            } else if (_hasClass(element, "js-cookie-accept")) {
                event.preventDefault();
                _setCookie(consentCookie, true);
                document.getElementById("cookiebanner").classList.toggle("superhidden");
                document.getElementById("cookiebanner-overlay").classList.toggle("superhidden");
                location.reload();
            } else if (_hasClass(element, "js-modal-close")) {
                event.preventDefault();
                _closeCookieModal();
                document
                    .getElementById("cookiebanner-overlay")
                    .classList.toggle("superhidden");
                location.reload();
            } else if (_hasClass(element, "js-cookie-performance")) {
                _updateCheckbox("performance");
            } else if (_hasClass(element, "js-cookie-marketing")) {
                _updateCheckbox("marketing");
            }
        };

        var _closeCookieModal = function () {
            if (
                _isCookieChecked("performance") === true &&
                _isCookieChecked("marketing") === true
            ) {
                _setCookie(consentCookie, true);
            }
            if (
                _isCookieChecked("performance") === true &&
                _isCookieChecked("marketing") === false
            ) {
                _setCookie(consentCookie, 2);
            }

            if (
                _isCookieChecked("marketing") === true &&
                _isCookieChecked("performance") === false
            ) {
                _setCookie(consentCookie, 3);
            }

            if (
                _isCookieChecked("marketing") === false &&
                _isCookieChecked("performance") === false
            ) {
                _setCookie(consentCookie, false);
            }

            var cookieModal = document.getElementById("cookieModal");
            cookieModal.classList.toggle("superhidden");
        };

        var _updateCheckbox = function (label) {
            var checkboxvar = document.getElementById(label);
            var labelvar = document.getElementById(label + "Label");

            if (
                (checkboxvar.defaultChecked && !checkboxvar.checked) ||
                !checkboxvar.checked
            ) {
                if (typeof translations[locale] !== 'undefined') {
                    labelvar.innerHTML = ' ' + translations[locale].nonactive;
                } else {
                    labelvar.innerHTML = ' niet actief';
                }
                checkboxvar.checked = false;
                checkboxvar.defaultChecked = false;
            } else {
                if (typeof translations[locale] !== 'undefined') {
                    labelvar.innerHTML = ' ' + translations[locale].active;
                } else {
                    labelvar.innerHTML = ' actief';
                }
                checkboxvar.checked = true;
            }
        };

        var _isCookieChecked = function (cookie) {
            var cookieId = document.getElementById(cookie);
            if (cookieId.checked === true || cookieId.defaultChecked) {
                return true;
            } else {
                return false;
            }
        };

        var _hasClass = function (element, selector) {
            return (
                element.className &&
                new RegExp("(\\s|^)" + selector + "(\\s|$)").test(element.className)
            );
        };

        var _getCookie = function (key) {
            if (!key) {
                return null;
            }
            return (
                decodeURIComponent(
                    document.cookie.replace(
                        new RegExp(
                            "(?:(?:^|.*;)\\s*" +
                            encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") +
                            "\\s*\\=\\s*([^;]*).*$)|^.*$"
                        ),
                        "$1"
                    )
                ) || null
            );
        };


        var _setCookie = function (key, value) {
            var date = new Date();
            date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
            var expires = date.toUTCString();

            document.cookie =
                encodeURIComponent(key) +
                "=" +
                encodeURIComponent(value) +
                (expires ? "; expires=" + expires : "") +
                "; path=/";
        };

        var _renderCookieModal = function () {
            //check if the modal was already opened before
            document.getElementById("cookieModal").style.display = "block";
            document.getElementById("cookiebanner-overlay").style.display = 'block';

            var cookieGdpr = _getCookie(consentCookie);

            if (cookieGdpr === "true") {
                document.getElementById("performance").checked = true;
                _updateCheckbox("performance");
                document.getElementById("marketing").checked = true;
                _updateCheckbox("marketing");
            }
            if (cookieGdpr === "2") {
                document.getElementById("performance").checked = true;
                _updateCheckbox("performance");
            }
            if (cookieGdpr === "3") {
                document.getElementById("marketing").checked = true;
                _updateCheckbox("marketing");
            }
            trapFocus(document.getElementById("cookieModal"));

        };

        return {
            init: _init
        };

        function trapFocus(element) {
            var focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
            var firstFocusableEl = focusableEls[0];
            var lastFocusableEl = focusableEls[focusableEls.length - 1];
            var KEYCODE_TAB = 9;

            element.addEventListener('keydown', function (e) {
                var isTabPressed = (e.key === 'Tab' || e.keyCode === KEYCODE_TAB);

                if (!isTabPressed) {
                    return;
                }

                if (e.shiftKey) /* shift + tab */ {
                    if (document.activeElement === firstFocusableEl) {
                        lastFocusableEl.focus();
                        e.preventDefault();
                    }
                } else /* tab */ {
                    if (document.activeElement === lastFocusableEl) {
                        firstFocusableEl.focus();
                        e.preventDefault();
                    }
                }

            });
        }
    };

    var cookie = new CookieMonster();

    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", cookie.init, false);
    }
})(window, undefined);

if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.webkitMatchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        null;
}
