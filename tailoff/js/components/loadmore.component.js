'use strict';

import $ from 'jquery';
const $document = $(document);
const $container = $('.js-pagination-container');
const $pagination = $('.js-pagination');
var promise;

$document.on('click', '.js-load-more', function(e) {
    e.preventDefault();
    var $pagerLink = $('.js-load-more');
    $pagerLink.addClass('is-loading');
    getNextPage($pagerLink.attr('href'));
});

function getNextPage(url) {
    if (promise) {
        promise.abort();
    }
    promise = $.get(url);
    promise.then(function(page) {
        $pagination.html($(page).find('.js-pagination').html());
        $container.append($(page).find('.js-pagination-container').html());
        history.pushState('', 'New URL: ' + url, url);
    }, function(error) {
        // console.log(error);
    });
}