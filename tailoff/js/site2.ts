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

import { GeneralComponent } from './components/general.component';
new GeneralComponent();

import { ResponsiveBackgroundComponent } from './components/responsiveBackground.component';
new ResponsiveBackgroundComponent();

/**
 * Extra components
 */
import { AjaxPagingComponent } from './components/ajaxPaging.component';
new AjaxPagingComponent();

import { AjaxSearchComponent } from './components/ajaxSearch.component';
new AjaxSearchComponent();

import { AutocompleteComponent } from './components/autocomplete.component';
new AutocompleteComponent();

import { ChipComponent } from './components/chip.component';
new ChipComponent();

import { DatePickerComponent } from './components/datepicker.component';
new DatePickerComponent();

import { DropdownComponent } from './components/dropdown.component';
new DropdownComponent();

import { FilterComponent } from './components/filter.component';
new FilterComponent();

import { FlyoutComponent } from './components/flyout.component';
new FlyoutComponent();

import { FormieComponent } from './components/formie.component';
new FormieComponent();

import { FormOptionalBlocks } from './components/formOptionalBlocks.component';
new FormOptionalBlocks();

import { formOtherRadioComponent } from './components/formOtherRadio.component';
new formOtherRadioComponent();

import { GlideComponent } from './components/glide.component';
new GlideComponent();

// import { GoogleMapsComponent } from './components/googleMaps.component';
// new GoogleMapsComponent();

import { IndeterminateChecksComponent } from './components/indeterminateChecks.component';
new IndeterminateChecksComponent();

import { LeafletComponent } from './components/leaflet.component';
new LeafletComponent();

import { LoadMoreComponent } from './components/loadmore.component';
new LoadMoreComponent();

import { MasonryComponent } from './components/masonry.component';
new MasonryComponent();

import { MatrixComponent } from './components/matrix.component';
new MatrixComponent();

import { ModalComponent } from './components/modal.component';
// new ModalComponent();
import { ImageModalPlugin } from './plugins/modal/image.plugin';
import { VideoModalPlugin } from './plugins/modal/video.plugin';
import { ConfirmationModalPlugin } from './plugins/modal/confirmation.plugin';
new ModalComponent({
  plugins: [ImageModalPlugin, VideoModalPlugin, ConfirmationModalPlugin],
});

import { PageFindComponent } from './components/pageFind.component';
new PageFindComponent();

import { PasswordToggleComponent } from './components/passwordToggle.component';
new PasswordToggleComponent();

import { PullOutComponent } from './components/pullOut.component';
new PullOutComponent();

import { RangeSliderComponent } from './components/rangeSlider.component';
new RangeSliderComponent();

import { ScrollAnimationComponent } from './components/scrollAnimation.component';
new ScrollAnimationComponent();

import { ScrollParallaxComponent } from './components/scrollParallax.component';
new ScrollParallaxComponent();

import { ScrollToAnchorComponent } from './components/scrollToAnchor.component';
new ScrollToAnchorComponent();

import { SearchComponent } from './components/search.component';
new SearchComponent();

import { SiteComponent } from './components/site.component';
new SiteComponent();

import { StickyHeader } from './components/stickyHeader.component';
new StickyHeader();

import { TableComponent } from './components/table.component';
new TableComponent();

import { TabsComponent } from './components/tabs.component';
new TabsComponent();

import { ToggleComponent } from './components/toggle.component';
new ToggleComponent();

import { TooltipComponent } from './components/tooltip.component';
new TooltipComponent();

import { ValidationComponent } from './components/validation.component';
// new ValidationComponent();
import { CountdownPlugin } from './plugins/validation/countdown.plugin';
import { PasswordConfirmPlugin } from './plugins/validation/passwordConfirm.plugin';
import { CheckboxRangePlugin } from './plugins/validation/checkboxRange.plugin';
import { PasswordStrengthPlugin } from './plugins/validation/passwordStrength.plugin';
new ValidationComponent({
  plugins: [CountdownPlugin, PasswordConfirmPlugin, CheckboxRangePlugin, PasswordStrengthPlugin],
});

import { VideoBackgroundComponent } from './components/videoBackground.component';
new VideoBackgroundComponent();

import { VideoToggleComponent } from './components/videoToggle.component';
new VideoToggleComponent();

/**
 * CSS import
 * DO NOT REMOVE !!
 */
import '../css/site2/main.css';
