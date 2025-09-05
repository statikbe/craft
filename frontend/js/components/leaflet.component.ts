import { Ajax } from '../utils/ajax';

export default class LeafletComponent {
  // private L = window['L'];

  constructor() {
    const maps = document.querySelectorAll('[data-leaflet-map]');
    if (maps.length > 0) {
      Array.from(maps).forEach((map: HTMLElement) => {
        this.initMap(map);
      });
    }
  }

  private async initMap(map: HTMLElement) {
    // @ts-ignore
    const leaflet = await import('leaflet');
    const myIcon = new leaflet.Icon({
      iconUrl: '/frontend/img/leaflet/marker-icon.png',
      iconRetinaUrl: '/frontend/img/leaflet/marker-icon-2x.png',
      shadowUrl: '/frontend/img/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
    const lmap = new leaflet.Map(map, {
      // center: [data[0].locations[0].lat, data[0].locations[0].lng],
      zoom: 13,
      tap: false,
      scrollWheelZoom: false,
    });

    if (map.getAttribute('data-address')) {
      Ajax.call({
        url: `https://nominatim.openstreetmap.org/search?q=${map.getAttribute(
          'data-address'
        )}&format=json&addressdetails=1&limit=1`,
        success: (data) => {
          leaflet.marker([data[0].lat, data[0].lon], { icon: myIcon }).addTo(lmap);
          lmap.setView([data[0].lat, data[0].lon], 14);
        },
      });
    }

    if (map.getAttribute('data-locations')) {
      const data = JSON.parse(map.getAttribute('data-locations'));
      lmap.fitBounds(data.map((p) => [p.lat, p.lng]));
      data.forEach((marker) => {
        const pin = new leaflet.Marker([marker.lat, marker.lng], { icon: myIcon }).addTo(lmap);
        if (marker.info) {
          const address = marker.info ? `<div class="">${marker.info}</div>` : '';
          const popupContent = `${address}`;
          pin.bindPopup(popupContent);
        }
      });
    }
    new leaflet.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(lmap);
  }
}
