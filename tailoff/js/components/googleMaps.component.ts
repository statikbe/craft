/// <reference types="@types/googlemaps" />
import { DOMHelper } from "../utils/domHelper";

export class GoogleMapsComponent {
  private googleApiKey = process.env.GOOGLE_API_KEY_MAPS;
  constructor(apiKey = null) {
    if (apiKey) {
      this.googleApiKey = apiKey;
    }

    if (typeof google === "undefined" || !google.hasOwnProperty("maps")) {
      DOMHelper.loadScript(
        "https://maps.googleapis.com/maps/api/js?v=3.exp&key=" +
          this.googleApiKey,
        this.initGoogleMaps
      );
    } else {
      this.initGoogleMaps();
    }
  }

  private initGoogleMaps() {
    //  Options for all map instances
    const defaultOptions = {
      zoom: 9,
      scrollwheel: false
    };

    let mapData = [];

    //  <div class="js-google-map" data-locations='[{ "lat": 50.00, "lng": 4.00 }, { ... }]' data-options="{}"></div>
    Array.from(document.querySelectorAll(".js-google-map")).forEach(element => {
      let locations = [];
      let customOptions = {};

      try {
        locations = JSON.parse(element.getAttribute("data-locations"));
        customOptions = JSON.parse(element.getAttribute("data-options"));
      } catch (e) {}

      const map = new google.maps.Map(element, {
        ...defaultOptions,
        ...customOptions
      });

      const infoWindow = new google.maps.InfoWindow();

      const bounds = new google.maps.LatLngBounds();

      let markers = [];

      locations.forEach(location => {
        const marker = new google.maps.Marker({
          map,
          position: {
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lng)
          }
        });

        if (location.info) {
          google.maps.event.addListener(marker, "click", function() {
            infoWindow.setContent(
              ["<div>", location.info, "</div>"].join("\n")
            );
            infoWindow.open(map, marker);
          });
        }

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
    let timeoutDelay = null;
    window.addEventListener("resize", () => {
      clearTimeout(timeoutDelay);
      timeoutDelay = setTimeout(() => {
        mapData.forEach(data => {
          if (data.markers.length > 1) {
            data.instance.fitBounds(data.bounds);
          }
          data.instance.setCenter(data.bounds.getCenter());
        });
      }, 250);
    });
  }
}
