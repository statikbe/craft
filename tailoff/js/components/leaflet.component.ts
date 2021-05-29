import 'leaflet/dist/leaflet.js';
import { Ajax } from '../utils/ajax';

export class LeafletComponent {
  private L = window['L'];

  constructor() {
    const maps = document.querySelectorAll('.leaflet-map');
    Array.from(maps).forEach((map: HTMLElement) => {
      this.initMap(map);
    });
  }

  private initMap(map: HTMLElement) {
    const lmap = this.L.map(map, {
      // center: [data[0].locations[0].lat, data[0].locations[0].lng],
      zoom: 13,
      tap: false,
      scrollWheelZoom: false,
    });

    if (map.getAttribute('data-address')) {
      Ajax.call({
        url: `https://nominatim.openstreetmap.org/search/${map.getAttribute(
          'data-address'
        )}?format=json&addressdetails=1&limit=1`,
        success: (data) => {
          this.L.marker([data[0].lat, data[0].lon]).addTo(lmap);
          lmap.setView([data[0].lat, data[0].lon], 14);
        },
      });
    }

    if (map.getAttribute('data-points-obj')) {
      const data = JSON.parse(map.getAttribute('data-points-obj'));
      lmap.fitBounds(data.map((p) => [...p.locations.map((m) => [m.lat, m.lng])]));
      data.forEach((marker) => {
        const pin = this.L.marker([marker.lat, marker.lng]).addTo(lmap);
        const address = marker.address != '' ? `<div class="">${marker.address}</div>` : '';
        const popupContent = `${address}`;
        pin.bindPopup(popupContent);
      });
    }
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(lmap);
  }
}
