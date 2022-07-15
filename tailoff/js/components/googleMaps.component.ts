/// <reference types="@types/googlemaps" />
import { DOMHelper } from '../utils/domHelper';

export class GoogleMapsComponent {
  private googleApiKey = process.env.GOOGLE_API_KEY_MAPS;
  constructor(apiKey = null) {
    if (apiKey) {
      this.googleApiKey = apiKey;
    }

    if (typeof google === 'undefined' || !google.hasOwnProperty('maps')) {
      DOMHelper.loadScript(
        'https://maps.googleapis.com/maps/api/js?v=3.exp&key=' + this.googleApiKey,
        this.initGoogleMaps
      );
    } else {
      this.initGoogleMaps();
    }
  }

  private initGoogleMaps() {
    //  <div class="js-google-map" data-locations='[{ "lat": 50.00, "lng": 4.00 }, { ... }]' data-options="{}"></div>
    Array.from(document.querySelectorAll('.js-google-map')).forEach((element) => {
      new GoogleMapComponent(element);
    });
  }
}

class GoogleMapComponent {
  private mapData = [];
  private markers = [];
  private locations = [];
  private customOptions = {};
  private map;

  constructor(mapContainer) {
    const _self = this;
    const defaultOptions = {
      zoom: 9,
      scrollwheel: false,
    };

    this.mapData = [];

    try {
      this.locations = JSON.parse(mapContainer.getAttribute('data-locations'));
      this.customOptions = JSON.parse(mapContainer.getAttribute('data-options'));
    } catch (e) {}

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-locations') {
          _self.locations = JSON.parse(mutation.target.getAttribute('data-locations'));
          _self.addMarkers();
        }
      });
    });

    observer.observe(mapContainer, {
      attributes: true,
    });

    this.map = new google.maps.Map(mapContainer, {
      ...defaultOptions,
      ...this.customOptions,
      styles: [],
    });

    this.addMarkers();

    // Refocus map on screen resize
    let timeoutDelay = null;
    window.addEventListener('resize', () => {
      clearTimeout(timeoutDelay);
      timeoutDelay = setTimeout(() => {
        this.mapData.forEach((data) => {
          if (data.markers.length > 1) {
            data.instance.fitBounds(data.bounds);
          }
          data.instance.setCenter(data.bounds.getCenter());
        });
      }, 250);
    });
  }
  private addMarkers() {
    const infoWindow = new google.maps.InfoWindow();
    const bounds = new google.maps.LatLngBounds();

    this.markers.forEach((marker) => {
      marker.setMap(null);
    });

    this.markers = [];
    this.mapData = [];

    this.locations.forEach((location) => {
      const marker = new google.maps.Marker({
        map: this.map,
        position: {
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng),
        },
        // icon: '/img/site/marker.png',
      });

      if (location.info) {
        google.maps.event.addListener(marker, 'click', function () {
          infoWindow.setContent(`
            <h2 class="text-lg text-primary">${location.info}</h2>
          `);
          infoWindow.open(this.map, marker);
        });
      }

      bounds.extend(marker.getPosition());
      this.markers.push(marker);
    });

    this.mapData.push({
      instance: this.map,
      bounds,
      markers: this.markers,
    });

    if (this.markers.length > 1) {
      this.map.fitBounds(bounds);
    }

    this.map.setCenter(bounds.getCenter());
  }
}
