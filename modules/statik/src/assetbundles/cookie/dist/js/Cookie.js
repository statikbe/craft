/* Author: Statik */
(function (window) {
    'use strict';

    var CookieMonster = function () {

        var cookieWrapper;
        var __cookieCheckerCookieName = '__cookieGdpr';
        var locale = document.documentElement.lang;
        var translations = {
            nl: { active: "actief", nonactive: "niet actief"},
            fr: { active: "actif", nonactive: "non actif"},
            en: { active: "active", nonactive: "non-active"}
        };


        var _init = function () {
            var shouldRun = _getCookie(__cookieCheckerCookieName) ? false : true;
            //console.log(shouldRun);
            if (shouldRun) {
                document.getElementById("cookiebanner").style.display = 'block';
            } else {
                document.body.addEventListener('click', _listener);
                return;
            }
            document.body.addEventListener('click', _listener);
        };




        // check when links get clicked
        var _listener = function (event) {
            var element = event.target;
            if (!element) {
                return;
            }

            if (_hasClass(element, 'js-cookie-settings')) {
                event.preventDefault();
                _renderCookieModal();

            } else if (_hasClass(element, 'js-cookie-accept')) {
                event.preventDefault();
                _setCookie(__cookieCheckerCookieName, '365', true);
                document.getElementById("cookiebanner").classList.toggle("superhidden");

            } else if (_hasClass(element, 'js-modal-close')) {
                event.preventDefault();
                _setCookie(__cookieCheckerCookieName, '365', true);
                _closeCookieModal();
                document.getElementById("cookiebanner").classList.toggle("superhidden");
                location.reload();

            } else if (_hasClass(element, 'js-cookie-performance')) {
                _updateCheckbox('performance');

            } else if (_hasClass(element, 'js-cookie-marketing')) {
                _updateCheckbox('marketing');
            }
        };


        var _closeCookieModal = function() {
            //console.log(_isCookieChecked('performance'), _isCookieChecked('marketing'));
            if (_isCookieChecked('performance')==true && _isCookieChecked('marketing')==false) {
                _setCookie('__gdpr', '365', 2);
            }

            if (_isCookieChecked('marketing')==true && _isCookieChecked('performance')==false) {
                _setCookie('__gdpr', '365', 3);
            }

            if (_isCookieChecked('marketing')==false && _isCookieChecked('performance')==false) {
                _setCookie('__gdpr', '365', false);
            }

            var cookieModal = document.getElementById('cookieModal');
            cookieModal.classList.toggle("superhidden");
        };


        var _updateCheckbox = function(label) {
            var checkboxvar = document.getElementById(label);
            var labelvar = document.getElementById(label+'Label');

            if ((checkboxvar.defaultChecked && ! checkboxvar.checked) || !(checkboxvar.checked))  {
                if (typeof translations[locale] !== 'undefined') {
                    labelvar.innerHTML = ' '+ translations[locale].nonactive;
                } else {
                    labelvar.innerHTML = ' niet actief';
                }
                checkboxvar.checked=false;
                checkboxvar.defaultChecked=false;
            }
            else {
                if (typeof translations[locale] !== 'undefined') {
                    labelvar.innerHTML = ' '+ translations[locale].active;
                } else {
                    labelvar.innerHTML = ' actief';
                }
                checkboxvar.checked=true;
            }
        };


        var _isCookieChecked = function(cookie) {
            var cookieId = document.getElementById(cookie);
            if ((cookieId.checked)==true || (cookieId.defaultChecked)) {
                return true;
            }
            else {
                return false;
            }
        };


        var _removeCookieWrapper = function () {
            var elements = document.getElementsByClassName('gdpr');
            var count = elements.length;
            for (var i = 0; i < count; i++) {
                document.body.removeChild(elements[i]);
            }
        };

        var _hasClass = function (element, selector) {
            return element.className && new RegExp("(\\s|^)" + selector + "(\\s|$)").test(element.className);
        };


        var _getCookie = function (key) {
            if (!key) {
                return null;
            }
            return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        };


        var _setCookie = function (key, expireDays, value) {
            if (expireDays) {
                var date = new Date();
                date.setTime(date.getTime() + (expireDays * 24 * 60 * 60 * 1000));
                var expires = date.toUTCString();
            }
            document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + (expires ? '; expires=' + expires : "") + "; path=/";
        };


        var _renderCookieModal = function () {

            //check if the modal was already opened before
            var cookieModal = document.getElementById('cookieModal');
            cookieModal.style.display = 'block';

            var cookieGdpr = _getCookie('__gdpr');

            if(cookieGdpr == '2' || cookieGdpr == undefined) {
                document.getElementById('performance').checked = true;
            }
            if(cookieGdpr == '3' || cookieGdpr == undefined) {
                document.getElementById('marketing').checked = true;
            }
        };

        return {
            init: _init
        };
    };

    var cookie = new CookieMonster();
    // init and check is already being done in original cookiemonster??
    // window.onload = cookie.init();

    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", cookie.init, false);
    }
})(window, undefined);

if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || null;
}


