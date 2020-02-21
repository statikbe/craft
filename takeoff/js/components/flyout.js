'use strict';

const $document = $(document);
const $body = $('body');

$('.js-flyout-toggle').each(function () {

    const $this = $(this);
    const $flyoutRegion = $($this.attr('href'));

    $body.addClass('flyout-enabled');

    $this.on('click', function (e) {
        e.preventDefault();
        $body.addClass('flyout-active');
    });

    $document.on('click', '.flyout__close, .flyout__overlay', function (e) {
        e.preventDefault();
        $body.removeClass('flyout-active');
    });

    //  Multi-level flyout menu
    $flyoutRegion.find('a + ul').each(function () {

        const $submenu = $(this);
        const $anchor = $submenu.prev();
        const $backItem = $('<li><a href="#" class="flyout__back">Back</a></li>');

        $(this).prepend($backItem);

        $anchor.on('click', function (e) {
            e.preventDefault();
            $(this).parent().addClass('is-active');
        });

        $backItem.find('.flyout__back').on('click', function (e) {
            e.preventDefault();
            $(this).closest('li.is-active').removeClass('is-active');
        });
    });
});
