# Leaflet Map

The Leaflet Map component provides an open-source alternative to Google Maps using the Leaflet library with OpenStreetMap tiles. It supports multiple markers, geocoding by address, custom icons, and popup info windows—all without requiring an API key.

## Features

- ✅ **Open Source**: No API keys or usage limits
- ✅ **OpenStreetMap Tiles**: Free, community-maintained map tiles
- ✅ **Dynamic Import**: Leaflet library loaded on demand (code splitting)
- ✅ **Multiple Markers**: Support for multiple location markers
- ✅ **Geocoding**: Convert addresses to coordinates via Nominatim API
- ✅ **Auto-Fit Bounds**: Automatically zoom to show all markers
- ✅ **Custom Icons**: Retina-ready custom marker icons
- ✅ **Info Popups**: Clickable markers with popup content
- ✅ **Touch Optimized**: Disabled tap delay for better mobile experience
- ✅ **Scroll Protection**: Disabled scroll wheel zoom by default

## How It Works

### Initialization Flow

1. **Element Detection**: Finds all `[data-leaflet-map]` elements
2. **Dynamic Import**: Lazy loads Leaflet library (not bundled initially)
3. **Create Map**: Instantiates Leaflet map with default options
4. **Load Markers**: Either geocodes address OR places markers from locations
5. **Add Tiles**: Adds OpenStreetMap tile layer
6. **Auto-Fit**: Calculates bounds to show all markers

### Geocoding Flow (data-address)

When using `data-address`:

1. **API Call**: Makes request to Nominatim API (OpenStreetMap geocoding service)
2. **Parse Response**: Extracts lat/lon from first result
3. **Place Marker**: Creates single marker at coordinates
4. **Set View**: Centers map at location with zoom level 14

### Multi-Marker Flow (data-locations)

When using `data-locations`:

1. **Parse JSON**: Extracts array of location objects
2. **Calculate Bounds**: Determines bounding box for all markers
3. **Fit Map**: Zooms to show all markers
4. **Place Markers**: Creates marker for each location with custom icon
5. **Bind Popups**: Attaches info popup to each marker (if info provided)

### Dynamic Import Benefits

Leaflet library (~140KB) is only loaded when needed:

```typescript
const leaflet = await import('leaflet');
```

This improves initial page load performance for pages without maps.

## Configuration

### Custom Marker Icons

The component uses custom marker icons from `/frontend/img/leaflet/`:

- **marker-icon.png**: Standard resolution (25x41px)
- **marker-icon-2x.png**: Retina resolution (50x82px)
- **marker-shadow.png**: Drop shadow (41x41px)

These files must be present in your project.

## Example

### Basic Map with Markers

<iframe src="../../examples/leaflet.html" height="450"></iframe>

```HTML
<div class="aspect-video"
     data-leaflet-map
     data-locations='[{ "lat": 50.882170, "lng": 4.702510, "info": "Statik" }, { "lat": 50.881401, "lng": 4.715916, "info": "Station" }]'>
</div>
```

This example creates a map with two markers. The map automatically fits bounds to show both markers.

### Single Location by Address

```HTML
<div class="aspect-video"
     data-leaflet-map
     data-address="1600 Amphitheatre Parkway, Mountain View, CA">
</div>
```

Uses Nominatim geocoding to convert the address to coordinates and places a single marker.

## Data Structures

### Location Objects

For `data-locations` attribute:

```json
[
  {
    "lat": 50.88217, // Latitude (required, number or string)
    "lng": 4.70251, // Longitude (required, number or string)
    "info": "Statik" // Popup content (optional, string)
  },
  {
    "lat": 50.881401,
    "lng": 4.715916,
    "info": "Station"
  }
]
```

### Address Format

For `data-address` attribute:

```html
<!-- Full address -->
<div data-leaflet-map data-address="123 Main St, Brussels, Belgium"></div>

<!-- City and country -->
<div data-leaflet-map data-address="Paris, France"></div>

<!-- Postal code -->
<div data-leaflet-map data-address="1000 Brussels"></div>
```

The Nominatim API tries to parse any address format.

## Attributes

| Attribute          | Description                                                           | Required |
| ------------------ | --------------------------------------------------------------------- | -------- |
| `data-leaflet-map` | Triggers the component                                                | Yes      |
| `data-locations`   | JSON array of location objects with `lat`, `lng`, and optional `info` | Either\* |
| `data-address`     | Address string for geocoding to a single marker                       | Either\* |

\*Use either `data-locations` OR `data-address`, not both. If both are present, `data-address` is processed first.

## Best Practices

### Responsive Sizing

Use aspect ratio utilities:

```html
<!-- 16:9 aspect ratio -->
<div class="aspect-video" data-leaflet-map ...></div>

<!-- 4:3 aspect ratio -->
<div class="aspect-4/3" data-leaflet-map ...></div>

<!-- Fixed height -->
<div class="h-96" data-leaflet-map ...></div>
```

Ensure the container has explicit dimensions; Leaflet can't render in 0-height containers.

### Performance

Since Leaflet is dynamically imported, it doesn't affect initial bundle size:

```javascript
// Leaflet (~140KB) only loads when needed
const leaflet = await import('leaflet');
```

### Accessibility

```html
<!-- Add ARIA label -->
<div
  class="aspect-video"
  role="application"
  aria-label="Interactive map showing our office locations"
  data-leaflet-map
  data-locations="..."
></div>

<!-- Provide text alternative -->
<div class="aspect-video" data-leaflet-map data-locations="..."></div>
<div class="sr-only">
  <h3>Locations:</h3>
  <ul>
    <li>Statik: 50.882170, 4.702510</li>
    <li>Station: 50.881401, 4.715916</li>
  </ul>
</div>
```

## Additional Resources

- [Leaflet Documentation](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Leaflet Plugins](https://leafletjs.com/plugins.html)
- [Nominatim API](https://nominatim.org/)
- [Alternative Tile Providers](https://leaflet-extras.github.io/leaflet-providers/preview/)
