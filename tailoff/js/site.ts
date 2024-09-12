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
    className: 'GeneralComponent',
    selector: 'body',
  },
  {
    name: 'responsiveBackground',
    className: 'ResponsiveBackgroundComponent',
    selector: '.js-bg-src, [data-bg-target]',
  },
  {
    name: 'ajaxPaging',
    className: 'AjaxPagingComponent',
    selector: '.js-ajax-paging',
  },
  {
    name: 'ajaxSearch',
    className: 'AjaxSearchComponent',
    selector: '[data-s-ajax-search], [data-s-ajax-search-callback]',
  },
  {
    name: 'autocomplete',
    className: 'AutocompleteComponent',
    selector: '[data-s-autocomplete]',
  },
  {
    name: 'chip',
    className: 'ChipComponent',
    selector: '[data-s-chip]',
  },
  {
    name: 'ckeEditor',
    className: 'ckeEditorComponent',
    selector: '.js-cke-editor',
  },
  {
    name: 'datepicker',
    className: 'DatePickerComponent',
    selector: '.js-date-picker',
  },
  {
    name: 'dropdown',
    className: 'DropdownComponent',
    selector: '.js-dropdown',
  },
  {
    name: 'filter',
    className: 'FilterComponent',
    selector: '.js-filter-form',
  },
  {
    name: 'flyout',
    className: 'FlyoutComponent',
    selector: '#flyout',
  },
  {
    name: 'formie',
    className: 'FormieComponent',
    selector: '.fui-form',
  },
  {
    name: 'formOptionalBlocks',
    className: 'FormOptionalBlocks',
    selector: '.js-form-optional-block, js-form-optional-required',
  },
  {
    name: 'formOtherRadio',
    className: 'formOtherRadioComponent',
    selector: '.js-other-radio',
  },
  {
    name: 'glide',
    className: 'GlideComponent',
    selector: '.js-slider',
  },
  {
    name: 'googleMaps',
    className: 'GoogleMapsComponent',
    selector: '.js-google-map',
  },
  {
    name: 'indeterminateChecks',
    className: 'IndeterminateChecksComponent',
    selector: 'ul.js-indeterminate-checks',
  },
  {
    name: 'leaflet',
    className: 'LeafletComponent',
    selector: '.leaflet-map',
  },
  {
    name: 'loadMore',
    className: 'LoadMoreComponent',
    selector: '.js-load-more',
  },
  {
    name: 'masonry',
    className: 'MasonryComponent',
    selector: '.js-masonry-item',
  },
  {
    name: 'matrix',
    className: 'MatrixComponent',
    selector: '.js-matrix-add',
  },
  {
    name: 'modal',
    className: 'ModalComponent',
    selector: '.js-modal, .js-modal-image, .js-modal-video, .js-modal-confirmation',
    plugins: [
      { path: 'modal', file: 'image.plugin', name: 'ImageModalPlugin' },
      { path: 'modal', file: 'video.plugin', name: 'VideoModalPlugin' },
      {
        path: 'modal',
        file: 'confirmation.plugin',
        name: 'ConfirmationModalPlugin',
      },
    ],
  },
  {
    name: 'pageFind',
    className: 'PageFindComponent',
    selector: 'form.js-find-form',
  },
  {
    name: 'passwordToggle',
    className: 'PasswordToggleComponent',
    selector: '.js-password-toggle',
  },
  {
    name: 'pullOut',
    className: 'PullOutComponent',
    selector: '.js-pull-out',
  },
  {
    name: 'rangeSlider',
    className: 'RangeSliderComponent',
    selector: '.js-range-slider',
  },
  {
    name: 'scrollAnimation',
    className: 'ScrollAnimationComponent',
    selector: '.scroll-ani',
  },
  {
    name: 'scrollParallax',
    className: 'ScrollParallaxComponent',
    selector: '[data-s-parallax]',
  },
  {
    name: 'scrollToAnchor',
    className: 'ScrollToAnchorComponent',
    selector: 'a.js-smooth-scroll, .js-smooth-scroll-attr',
  },
  {
    name: 'search',
    className: 'SearchComponent',
    selector: '.js-search-form',
  },
  {
    name: 'site',
    className: 'SiteComponent',
    selector: 'body',
  },
  {
    name: 'stickyHeader',
    className: 'StickyHeader',
    selector: '[data-s-sticky-header]',
  },
  {
    name: 'table',
    className: 'TableComponent',
    selector: '.custom-table table',
  },
  {
    name: 'tabs',
    className: 'TabsComponent',
    selector: 'ul.js-tabs',
  },
  {
    name: 'toggle',
    className: 'ToggleComponent',
    selector: '[data-s-toggle]',
  },
  {
    name: 'tooltip',
    className: 'TooltipComponent',
    selector: '[data-tippy-content], [data-tippy-template]',
  },
  {
    name: 'validation',
    className: 'ValidationComponent',
    selector: '[data-s-validate]',
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
    className: 'VideoBackgroundComponent',
    selector: '.js-video-bg, .js-video-container',
  },
  {
    name: 'videoToggle',
    className: 'VideoToggleComponent',
    selector: 'button[data-s-video-toggle]',
  },
];

components.forEach((component) => {
  componentLoader.loadComponent(component.name, component.className, component.selector, component.plugins ?? []);
});

/**
 * CSS import
 * DO NOT REMOVE !!
 */
import '../css/site/main.css';
import '../css/site/ckeditor.css';
