"use strict";

/**
 * Essential components
 */
import { CookieComponent } from "./components/cookie.component";
new CookieComponent();

import { GeneralComponent } from "./components/general.component";
new GeneralComponent();

import { ResponsiveBackgroundComponent } from "./components/responsiveBackground.component";
new ResponsiveBackgroundComponent();

import { WebfontComponent } from "./components/webfont.component";
new WebfontComponent([
  "https://fonts.googleapis.com/css2?family=Roboto&display=swap",
]);

/**
 * Extra components
 */
import { AutocompleteComponent } from "./components/autocomplete.component";
new AutocompleteComponent();

// import { DatePickerComponent } from "./components/datepicker.component";
// new DatePickerComponent();

import { DropdownComponent } from "./components/dropdown.component";
new DropdownComponent();

import { FilterComponent } from "./components/filter.component";
new FilterComponent();

import { FlyoutComponent } from "./components/flyout.component";
new FlyoutComponent();

import { FormOptionalBlocks } from "./components/formOptionalBlocks.component";
new FormOptionalBlocks();

import { formOtherRadioComponent } from "./components/formOtherRadio.component";
new formOtherRadioComponent();

import { GlideComponent } from "./components/glide.component";
new GlideComponent();

import { GoogleMapsComponent } from "./components/googleMaps.component";
new GoogleMapsComponent();

import { IndeterminateChecksComponent } from "./components/indeterminateChecks.component";
new IndeterminateChecksComponent();

import { LoadMoreComponent } from "./components/loadmore.component";
new LoadMoreComponent();

import { MasonryComponent } from "./components/masonry.component";
new MasonryComponent();

import { MatrixComponent } from "./components/matrix.component";
new MatrixComponent();

import { ModalComponent } from "./components/modal.component";
// new ModalComponent();
import { ImageModalPlugin } from "./plugins/modal/image.plugin";
import { VideoModalPlugin } from "./plugins/modal/video.plugin";
new ModalComponent({
  plugins: [ImageModalPlugin, VideoModalPlugin],
});

import { PullOutComponent } from "./components/pullOut.component";
new PullOutComponent();

import { RangeSliderComponent } from "./components/rangeSlider.component";
new RangeSliderComponent();

import { ScrollToAnchorComponent } from "./components/scrollToAnchor.component";
new ScrollToAnchorComponent();

import { SearchComponent } from "./components/search.component";
new SearchComponent();

import { SiteComponent } from "./components/site.component";
new SiteComponent();

import { StickyHeader } from "./components/stickyHeader.component";
new StickyHeader();

import { TabsComponent } from "./components/tabs.component";
new TabsComponent();

import { ToggleComponent } from "./components/toggle.component";
new ToggleComponent();

import { ValidationComponent } from "./components/validation.component";
// new ValidationComponent();
import { CountdownPlugin } from "./plugins/validation/countdown.plugin";
import { PasswordConfirmPlugin } from "./plugins/validation/passwordConfirm.plugin";
import { CheckboxRangePlugin } from "./plugins/validation/checkboxRange.plugin";
new ValidationComponent({
  plugins: [CountdownPlugin, PasswordConfirmPlugin, CheckboxRangePlugin],
});

import "./components/lazySizes.component";

/**
 * Icon font generation
 * DO NOT REMOVE !!
 */
// import "../icons/iconfont.font";
/**
 * CSS import
 * DO NOT REMOVE !!
 */
import "../css/main.css";
