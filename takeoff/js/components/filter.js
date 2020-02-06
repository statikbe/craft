'use strict';

const $form = $('.js-filter-form');
const $submit = $('.js-filter-submit').hide();
const $loader = $('.js-filter-loading').hide();
const $inputFilter = $('.js-filter-form input, .js-filter-form select');
const $result = $('.js-filter-results');
let promise;

function initialize() {

    $inputFilter.on('change', function(e) {
        $loader.fadeIn();
        $result.hide();
        var url = $form.attr('action') + '?' + $form.serialize();
        getFilter(url);
    });

    $result.on('click', '.js-filter-pagination a', function(e) {
        e.preventDefault();
        $loader.fadeIn();
        $result.hide();
        getFilter($(this).attr('href'));
    });
}

function getFilter(url) {

    if (promise) {
        promise.abort();
    }

    promise = $.get(url);
    promise.then(function(filter) {
        $loader.hide();
        $result.html($(filter).find('.js-filter-results').html());
        $result.fadeIn();
        history.pushState('', 'New URL: ' + url, url);
    }, function(error) {
        // console.log(error);
    });
}

initialize();
