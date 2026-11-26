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
    // Leaflet's styles only load on pages with a map (main.css doesn't import them). Without them the map container doesn't
    // clip its tiles, keeps requesting more and the tile server answers 429.
    // @ts-ignore
    const [leaflet] = await Promise.all([import('leaflet'), import('../../css/site/components/leaflet.css')]);
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
      scrollWheelZoom: false,
    });

    if (map.getAttribute('data-address')) {
      Ajax.call({
        url: `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(map.getAttribute('data-address'))}&format=json&addressdetails=1&limit=1`,
        success: (data) => {
          new leaflet.Marker([data[0].lat, data[0].lon], { icon: myIcon }).addTo(lmap);
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
    new leaflet.TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(lmap);
  }
}
