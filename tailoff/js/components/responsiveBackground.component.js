'use strict';

// import $ from 'jquery';

// $('.js-hero-image').on('load', function (e) {

//     const $hero = $(this).closest('.js-hero');
//     const imgSrc = this.currentSrc || this.src;

//     $hero.css('background-image', 'url(' + imgSrc + ')');

//     setTimeout(function () {
//         $hero.addClass('is-loaded');
//     }, 250);

// }).trigger('load');

import 'element-closest-polyfill';

const image = document.querySelectorAll('.js-hero-image');

toArray(image).forEach(image => {

    image.addEventListener('load', e => {

        const hero = e.target.closest('.js-hero');
        const imgSrc = e.target.currentSrc || e.target.src;

        hero.style.backgroundImage = 'url(' + imgSrc + ')';

        setTimeout(function () {
            hero.classList.add("is-loaded");
        }, 250);
    });
});

function toArray(obj) {
    return [ ...obj ];
}