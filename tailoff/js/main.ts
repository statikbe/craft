"use strict";

/**
 * Essential components
 */
import "./components/cookie.component";

import { ResponsiveBackgroundComponent } from "./components/responsiveBackground.component";
new ResponsiveBackgroundComponent();

import { WebfontComponent } from "./components/webfont.component";
new WebfontComponent([
  "https://fonts.googleapis.com/css2?family=Roboto&display=swap"
]);

/**
 * Extra components
 */
import { FlyoutComponent } from "./components/flyout.component";
new FlyoutComponent();

import { ValidationComponent } from "./components/validation.component";
new ValidationComponent();

import { ToggleComponent } from "./components/toggle.component";
new ToggleComponent();

import { FilterComponent } from "./components/filter.component";
new FilterComponent();

import { LoadMoreComponent } from "./components/loadmore.component";
new LoadMoreComponent();

import { GlideComponent } from "./components/gilde.component";
new GlideComponent();

import { ModalComponent } from "./components/modal.component";
new ModalComponent();

/**
 * Icon font generation
 * DO NOT REMOVE !!
 */
import "../icons/iconfont.font";
/**
 * CSS import
 * DO NOT REMOVE !!
 */
import "../css/main.css";
