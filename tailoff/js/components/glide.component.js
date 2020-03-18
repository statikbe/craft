'use strict';

import $ from 'jquery';
import Glide from '@glidejs/glide';

$('.js-slider').each(function(){
  
  const $sliderID = $(this).attr('id');
  const glide = new Glide('#' + sliderID, {
    type: 'carousel',
    perView: 1,
  });

  if ($('#' + sliderID).length) {
    glide.mount();
  }

});