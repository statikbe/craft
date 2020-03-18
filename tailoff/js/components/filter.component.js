"use strict";

var $window = $(window);
const $form = $(".js-filter-form");
const $submit = $(".js-filter-submit").hide();
const $loader = $(".js-filter-loading").hide();
const $inputFilter = $(".js-filter-form input, .js-filter-form select");
var $submitFilter = $(".js-filter-form .js-submit-filter");
const $result = $(".js-filter-results");
const $toggle = $(".js-toggle-filter");
const $scroll = $(".js-scroll-results");
const $filterBlock = $(".js-filter-block");
const $clear = $(".js-clear-filter");
const $showMore = $(".js-show-more");
const $extraContent = $(".js-extra-content");
// import selectize from "selectize/dist/js/selectize.min";
let promise;

showOrHideFilters();

// setTimeout(() => {
//     $(".js-selectize").selectize({
//         maxItems: null,
//         plugins: ["remove_button"]
//     });
// }, 0);

function initialize() {
    $inputFilter.on("change", function(e) {
        $loader.fadeIn();
        $result.hide();
        var url = $form.attr("action") + "?" + $form.serialize();
        getFilter(url);
        scrollToBody();
    });

    // filter on btn click
    $submitFilter.on("click", function(e) {
        $loader.fadeIn();
        $result.hide();
        var url = $form.attr("action") + "?" + $form.serialize();
        getFilter(url);
        scrollToBody();
    });

    $result.on("click", ".js-filter-pagination a", function(e) {
        e.preventDefault();
        $loader.fadeIn();
        $result.hide();
        getFilter($(this).attr("href"));
        scrollToBody();
    });

    $toggle.on("click", function(e) {
        e.preventDefault();
        $filterBlock.toggleClass("hidden");
        $(".icon", this)
            .toggleClass("icon--arrow-up")
            .toggleClass("icon--arrow-down");
    });

    $clear.on("click", function(e) {
        e.preventDefault();
        $loader.fadeIn();
        $result.hide();
        $form[0].reset();
        // $(".js-selectize", $form).each(function(i, element) {
        //     element.selectize && element.selectize.clear();
        // });
        const url =
            location.protocol + "//" + location.host + location.pathname;
        getFilter(url);
    });

    $showMore.on("click", function(e) {
        e.preventDefault();
        $(this).remove();
        $extraContent.removeClass("hidden");
    });
}

function getFilter(url) {
    if (promise) {
        promise.abort();
    }

    promise = $.get(url);
    promise.then(
        function(filter) {
            $loader.hide();
            $result.html(
                $(filter)
                    .find(".js-filter-results")
                    .html()
            );
            $result.fadeIn();
            history.pushState("", "New URL: " + url, url);
            scrollToBody();
        },
        function(error) {
            // console.log(error);
        }
    );
}

// scroll to results after filtering
function scrollToBody() {
    $("html, body").animate(
        {
            scrollTop: $scroll.offset().top
        },
        200
    );
}

let screenWidth = $window.width();
$window.on("resize", function() {
    if ($(this).width() !== screenWidth) {
        screenWidth = $(this).width();
        showOrHideFilters();
    }
});

function showOrHideFilters() {
    if ($window.width() > 820) {
        $filterBlock.removeClass("hidden");
    } else if ($window.width() < 820) {
        $filterBlock.addClass("hidden");
    }
}

initialize();
