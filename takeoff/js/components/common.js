'use strict';

import { debounce, isBreakpointActive } from './helpers';

window.app = window.app || {};
window.app.variables = window.app.variables || {};

const $document = $(document);
const $window = $(window);
const $html = $('html');
const $body = $('body');

windowResize();

$window.on('resize', debounce(windowResize, 250, false));

$window.on('load', jsDone);

setTimeout(jsDone, 4000);

$('.js-notice-close').on('click', function (e) {

    e.preventDefault();

    const $notice = $(this).closest('.notice');

    $notice.slideToggle(250, () => {
        $notice.remove();
    });
});

function windowResize() {

    const isFlyoutActive = isBreakpointActive('flyout');
    const windowWidth = $window.width();
    const windowHeight = $window.height();

    if (!isFlyoutActive) {
        $body.removeClass('flyout-active');
    }

    $.extend(window.app.variables, {
        isFlyoutActive,
        windowWidth,
        windowHeight
    });
}

function jsDone() {
    $html.addClass('js-done');
}
