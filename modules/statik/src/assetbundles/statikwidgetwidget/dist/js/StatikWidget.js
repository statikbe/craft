/**
 * Statik module for Craft CMS
 *
 * StatikWidget Widget JS
 *
 * @author    Statik
 * @copyright Copyright (c) 2018 Statik
 * @link      https://www.statik.be
 * @package   Statik
 * @since     1.0.0
 */

// Mark as read + delete messages forms
$('.js-checkbox').on('click', function() {
    $(this).closest('.form').submit();
});

// Collapse edit form
$('.js-collapse-form').hide();
$('.js-expand-form').on('click', function() {
    $('#js-collapse-' + $(this).data('id')).toggle(500);
});

