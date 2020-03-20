'use strict';

import $ from 'jquery';
import Parsley from 'parsleyjs';
import { extend } from './helpers';

require('../parsley/es');
require('../parsley/fr');
require('../parsley/it');
require('../parsley/nl');

const $document = $(document);
const $window = $(window);
const $html = $('html');
const $body = $('body');
const $forms = $('form');

window.Parsley = Parsley;

function errorsContainer(ParsleyField) {

    const $formItem = ParsleyField.$element.closest('.form__item');
    var $formGroup = $formItem.closest('.form__group');

    if ($formGroup.length) {
        return $formGroup;
    } else {
        return $formItem;
    }
}

extend(window.Parsley.options, {

    classHandler: errorsContainer,

    errorClass: 'has-error',

    errorsContainer: errorsContainer,

    errorsWrapper: '<ul class="form__errors"></ul>',

    excluded: 'input:not(:visible), input.novalidate'
});

window.Parsley.setLocale(document.documentElement.lang);

window.Parsley.on('field:error', function () {
    const $errorElement = window.Parsley.options.classHandler(this);
    $errorElement.closest('.form').addClass('has-errors');
    $errorElement.find('.form__errors-server').remove();
});

$forms.on('click', 'button[type=submit]', submit);

function submit() {

    const $form = $(this.form);

    if ($form.data('is-submitted')) {
        return false;
    }

    if ($form.parsley().isValid()) {
        $form.data('is-submitted', true).addClass('is-submitted');
    }
}
