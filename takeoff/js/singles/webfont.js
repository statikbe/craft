(function (window, document) {
    'use strict';

    var isModernBrowser = (
            'localStorage' in window &&
            'addEventListener' in window &&
            typeof window.Promise !== 'undefined'
        ),
        urls = [
            'https://fonts.googleapis.com/css?family=Roboto:400,700'
        ],
        key = 'fonts',
        cache;

    if (!isModernBrowser || !urls.length) {
        return fallback();
    }

    try {
        cache = window.localStorage.getItem(key);
        if (cache) {
            insertFonts(cache);
            cacheFonts();
        } else {
            cacheFonts(true);
        }
    } catch (e) {
        return fallback();
    }

    function cacheFonts(isInsertFonts) {
        window.addEventListener('load', function () {
            var promises = [];

            for (var i = 0; i < urls.length; i++) {
                var request = get(urls[i]).then(function (response) {
                    return response;
                }, function (error) {
                    console.error("Failed!", error);
                    return false;
                });

                promises.push(request);
            }

            Promise.all(promises).then(function (arrayOfResults) {
                var fonts = '';

                for (var i = 0; i < arrayOfResults.length; i++) {
                    if (arrayOfResults[i]) {
                        fonts = fonts + ' ' + arrayOfResults[i];
                    }
                }

                if (isInsertFonts) {
                    insertFonts(fonts);
                }
                window.localStorage.setItem(key, fonts);
            });
        });
    }

    function insertFonts(value) {
        var style = document.createElement('style');
        style.innerHTML = value;
        document.head.appendChild(style);
    }

    function get(url) {
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            req.open('GET', url);

            req.onload = function () {
                if (req.status == 200) {
                    resolve(req.response);
                }
                else {
                    reject(Error(req.statusText));
                }
            };

            req.onerror = function () {
                reject(Error("Network Error"));
            };

            req.send();
        });
    }

    function fallback() {

        var link;

        for (var i = 0; i < urls.length; i++) {
            link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = urls[i];
            document.head.insertBefore(link, document.head.childNodes[document.head.childNodes.length - 1].nextSibling);
        }
    }
})(window, document);
