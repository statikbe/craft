'use strict';

// Accept HMR as per: https://vitejs.dev/guide/api-hmr.html
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('HMR');
  });
}

import { ComponentLoader } from './loader/component.loader';
const componentLoader = new ComponentLoader();

const components = [
  {
    name: 'general',
    selector: 'body',
  },
  {
    name: 'ajaxPaging',
    selector: '[data-ajax-paging]',
  },
  {
    name: 'ajaxSearch',
    selector: '[data-ajax-search], [data-ajax-search-callback]',
  },
  {
    name: 'autocomplete',
    selector: '[data-autocomplete]',
  },
  {
    name: 'accordion',
    className: 'AccordionComponent',
    selector: 'details',
  },
  {
    name: 'backgroundImage',
    selector: '[data-bg-image]',
  },
  {
    name: 'chip',
    selector: '[data-chip]',
  },
  {
    name: 'ckeEditor',
    selector: '[data-ck-editor]',
  },
  {
    name: 'datepicker',
    selector: '[data-date-picker]',
  },
  {
    name: 'dropdown',
    selector: '[data-dropdown]',
  },
  {
    name: 'filter',
    selector: '[data-filter]',
  },
  {
    name: 'flyout',
    selector: '[data-flyout]',
  },
  {
    name: 'formie',
    selector: '.fui-form',
  },
  {
    name: 'formOptionalBlocks',
    selector: '[data-optional-block],[data-optional-required]',
  },
  {
    name: 'formOtherRadio',
    selector: '[data-other-option]',
  },
  {
    name: 'googleMaps',
    selector: '[data-google-maps]',
  },
  {
    name: 'indeterminateChecks',
    selector: 'ul[data-indeterminate]',
  },
  {
    name: 'leaflet',
    selector: '[data-leaflet-map]',
  },
  {
    name: 'loadMore',
    selector: '[data-load-more]',
  },
  {
    name: 'masonry',
    selector: '.masonry',
  },
  {
    name: 'matrix',
    selector: '[data-matrix-add]',
  },
  {
    name: 'modal',
    className: 'ModalComponent',
    selector: '.js-modal, .js-modal-image, .js-modal-video, .js-modal-confirmation, .js-modal-ajax',
    plugins: [
      { path: 'modal', file: 'image.plugin', name: 'ImageModalPlugin' },
      { path: 'modal', file: 'video.plugin', name: 'VideoModalPlugin' },
      { path: 'modal', file: 'ajax.plugin', name: 'AjaxModalPlugin' },
      {
        path: 'modal',
        file: 'confirmation.plugin',
        name: 'ConfirmationModalPlugin',
      },
    ],
  },
  {
    name: 'parallax',
    selector: '.parallax',
  },
  {
    name: 'passwordToggle',
    selector: '[data-password-toggle]',
  },
  {
    name: 'rangeSlider',
    selector: 'input[type=range]',
  },
  {
    name: 'search',
    selector: '[data-search-trigger]',
  },
  {
    name: 'site',
    selector: 'body',
  },
  {
    name: 'stickyHeader',
    selector: '[data-sticky-header-reveal]',
  },
  {
    name: 'swiper',
    selector: '.swiper',
  },
  {
    name: 'table',
    selector: '.custom-table table',
  },
  {
    name: 'tabs',
    selector: 'ul[data-tabs]',
  },
  {
    name: 'toggle',
    selector: '[data-toggle]',
  },
  {
    name: 'tooltip',
    selector: '[data-tippy-content], [data-tippy-template]',
  },
  {
    name: 'validation',
    selector: 'form[data-validate]',
    plugins: [
      { path: 'validation', file: 'countdown.plugin', name: 'CountdownPlugin' },
      {
        path: 'validation',
        file: 'passwordConfirm.plugin',
        name: 'PasswordConfirmPlugin',
      },
      {
        path: 'validation',
        file: 'checkboxRange.plugin',
        name: 'CheckboxRangePlugin',
      },
      {
        path: 'validation',
        file: 'passwordStrength.plugin',
        name: 'PasswordStrengthPlugin',
      },
    ],
  },
  {
    name: 'videoBackground',
    selector: '[data-video-bg]',
  },
  {
    name: 'videoToggle',
    selector: 'button[data-video-toggle]',
  },
];

components.forEach((component) => {
  componentLoader.loadComponent(component.name, component.selector, component.plugins ?? []);
});

/**
 * CSS import
 * DO NOT REMOVE !!
 */
import '../css/site/main.css';
// import '../css/site/ckeditor.css';
