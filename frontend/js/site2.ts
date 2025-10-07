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
    selector: '[data-modal]',
    plugins: [
      { path: 'modal', file: 'image.plugin', name: 'ImageModalPlugin', selector: '[data-modal-image]' },
      { path: 'modal', file: 'video.plugin', name: 'VideoModalPlugin', selector: '[data-modal-video]' },
      { path: 'modal', file: 'ajax.plugin', name: 'AjaxModalPlugin', selector: '[data-modal-ajax]' },
      {
        path: 'modal',
        file: 'confirmation.plugin',
        name: 'ConfirmationModalPlugin',
        selector: '[data-modal-confirmation]',
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
    name: 'stickyHeader',
    selector: '[data-sticky-header-reveal]',
  },
  {
    name: 'swiper',
    selector: '.swiper',
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
      { path: 'validation', file: 'countdown.plugin', name: 'CountdownPlugin', selector: '[data-countdown]' },
      {
        path: 'validation',
        file: 'passwordConfirm.plugin',
        name: 'PasswordConfirmPlugin',
        selector: 'input[data-confirm]',
      },
      {
        path: 'validation',
        file: 'checkboxRange.plugin',
        name: 'CheckboxRangePlugin',
        selector: 'input[type=checkbox][min], input[type=checkbox][max]',
      },
      {
        path: 'validation',
        file: 'passwordStrength.plugin',
        name: 'PasswordStrengthPlugin',
        selector: 'input[type=password][data-strength]',
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

components.forEach((component: { name: string; selector: string; plugins?: any[] }) => {
  componentLoader.loadComponent(component.name, component.selector, component.plugins ?? []);
});

const siteComponents = [
  {
    name: 'site',
    selector: 'body',
  },
];

siteComponents.forEach((component: { name: string; selector: string; plugins?: any[] }) => {
  componentLoader.loadComponent(component.name, component.selector, component.plugins ?? [], 'components-site');
});

/**
 * CSS import
 * DO NOT REMOVE !!
 */
import '../css/site/main.css';
// import '../css/site/ckeditor.css';
