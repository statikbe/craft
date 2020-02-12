window.app = window.app || {};

app.google = (function googleComponent($, undefined) {

    //  Change this for your current project
    const GOOGLE_API_KEY = '';

    function initialize() {

        if (typeof google === 'undefined' || !google.hasOwnProperty('maps')) {
            return app.helpers.loadScript('https://maps.googleapis.com/maps/api/js?v=3.exp&key=' + GOOGLE_API_KEY, app.google.init);
        }

        initGoogleMaps();
    }

    function initGoogleMaps() {

        //  Options for all map instances
        var defaultOptions = {
            zoom: 9,
            scrollwheel: false
        };

        var mapData = [];

        //  <div class="js-google-map" data-locations='[{ "lat": 50.00, "lng": 4.00 }, { ... }]' data-options="{}"></div>
        $('.js-google-map').each(function () {

            var $mapEl = $(this);
            var locations = [];
            var customOptions = {};

            try {
                locations = JSON.parse($mapEl.attr('data-locations'));
                customOptions = JSON.parse($mapEl.attr('data-options'));
            } catch (e) {}

            var map = new google.maps.Map(this, $.extend({}, defaultOptions, customOptions));

            var infowindow = new google.maps.InfoWindow();

            var bounds = new google.maps.LatLngBounds();

            var markers = [];

            $.each(locations, function () {

                var marker = new google.maps.Marker({
                    map,
                    position: {
                        lat: parseFloat(this.lat),
                        lng: parseFloat(this.lng)
                    }
                });

                google.maps.event.addListener(marker, 'click', function () {

                    infowindow.setContent([
                        '<div>',
                            'Infowindow',
                        '</div>'
                    ].join('\n'));

                    infowindow.open(map, marker);
                });

                bounds.extend(marker.getPosition());

                markers.push(marker);
            });

            mapData.push({
                instance: map,
                bounds,
                markers
            });

            if (markers.length > 1) {
                map.fitBounds(bounds);
            }

            map.setCenter(bounds.getCenter());
        });

        // Refocus map on screen resize
        $(window).on('resize', app.helpers.debounce(function () {
            $.each(mapData, function () {

                if (this.markers.length > 1) {
                    this.instance.fitBounds(this.bounds);
                }

                this.instance.setCenter(this.bounds.getCenter());
            });
        }, 250, false));
    }

    return {
        init: initialize
    };

})(jQuery);
