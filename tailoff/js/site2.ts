'use strict';

// Accept HMR as per: https://vitejs.dev/guide/api-hmr.html
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('HMR');
  });
}

/**
 * Essential components
 */
import { ComponentLoader } from './loader/component.loader';
const componentLoader = new ComponentLoader();

componentLoader.loadComponent('general', 'GeneralComponent', 'body');

componentLoader.loadComponent('responsiveBackground', 'ResponsiveBackgroundComponent', '.js-bg-src');

/**
 * Extra components
 */
componentLoader.loadComponent('ajaxPaging', 'AjaxPagingComponent', '.js-ajax-paging');

componentLoader.loadComponent(
  'ajaxSearch',
  'AjaxSearchComponent',
  '[data-s-ajax-search], [data-s-ajax-search-callback]'
);

componentLoader.loadComponent('autocomplete', 'AutocompleteComponent', '[data-s-autocomplete]');

componentLoader.loadComponent('chip', 'ChipComponent', '[data-s-chip]');

componentLoader.loadComponent('datepicker', 'DatePickerComponent', '.js-date-picker');

componentLoader.loadComponent('dropdown', 'DropdownComponent', '.js-dropdown');

componentLoader.loadComponent('filter', 'FilterComponent', '.js-filter-form');

componentLoader.loadComponent('flyout', 'FlyoutComponent', '#flyout');

componentLoader.loadComponent('formie', 'FormieComponent', '.fui-form');

componentLoader.loadComponent(
  'formOptionalBlocks',
  'FormOptionalBlocks',
  '.js-form-optional-block, js-form-optional-required'
);

componentLoader.loadComponent('formOtherRadio', 'formOtherRadioComponent', '.js-other-radio');

componentLoader.loadComponent('glide', 'GlideComponent', '.js-slider');

componentLoader.loadComponent('googleMaps', 'GoogleMapsComponent', '.js-google-map');

componentLoader.loadComponent('indeterminateChecks', 'IndeterminateChecksComponent', 'ul.js-indeterminate-checks');

componentLoader.loadComponent('leaflet', 'LeafletComponent', '.leaflet-map');

componentLoader.loadComponent('loadMore', 'LoadMoreComponent', '.js-load-more');

componentLoader.loadComponent('masonry', 'MasonryComponent', '.js-masonry-item');

componentLoader.loadComponent('matrix', 'MatrixComponent', '.js-matrix-add');

componentLoader.loadComponent('modal', 'ModalComponent', '.js-modal', [
  { path: 'modal/image.plugin', name: 'ImageModalPlugin' },
  { path: 'modal/video.plugin', name: 'VideoModalPlugin' },
  {
    path: 'modal/confirmation.plugin',
    name: 'ConfirmationModalPlugin',
  },
]);

componentLoader.loadComponent('pageFind', 'PageFindComponent', 'form.js-find-form');

componentLoader.loadComponent('passwordToggle', 'PasswordToggleComponent', '.js-password-toggle');

componentLoader.loadComponent('pullOut', 'PullOutComponent', '.js-pull-out');

componentLoader.loadComponent('rangeSlider', 'RangeSliderComponent', '.js-range-slider');

componentLoader.loadComponent('scrollAnimation', 'ScrollAnimationComponent', '.scroll-ani');

componentLoader.loadComponent('scrollParallax', 'ScrollParallaxComponent', '[data-s-parallax]');

componentLoader.loadComponent(
  'scrollToAnchor',
  'ScrollToAnchorComponent',
  'a.js-smooth-scroll, .js-smooth-scroll-attr'
);

componentLoader.loadComponent('search', 'SearchComponent', '.js-search-form');

componentLoader.loadComponent('site', 'SiteComponent', 'body');

componentLoader.loadComponent('stickyHeader', 'StickyHeader', '[data-s-sticky-header]');

componentLoader.loadComponent('table', 'TableComponent', '.custom-table table');

componentLoader.loadComponent('tabs', 'TabsComponent', 'ul.js-tabs');

componentLoader.loadComponent('toggle', 'ToggleComponent', '[data-s-toggle]');

componentLoader.loadComponent('tooltip', 'TooltipComponent', '[data-tippy-content], [data-tippy-template]');

componentLoader.loadComponent('validation', 'ValidationComponent', '[data-s-validate]', [
  { path: 'validation/countdown.plugin', name: 'CountdownPlugin' },
  {
    path: 'validation/passwordConfirm.plugin',
    name: 'PasswordConfirmPlugin',
  },
  { path: 'validation/checkboxRange.plugin', name: 'CheckboxRangePlugin' },
  {
    path: 'validation/passwordStrength.plugin',
    name: 'PasswordStrengthPlugin',
  },
]);

componentLoader.loadComponent('videoBackground', 'VideoBackgroundComponent', '.js-video-bg, .js-video-container');

componentLoader.loadComponent('videoToggle', 'VideoToggleComponent', 'button[data-s-video-toggle]');

/**
 * CSS import
 * DO NOT REMOVE !!
 */
import '../css/site/main.css';
import '../css/site/ckeditor.css';
