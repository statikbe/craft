# Google Maps

The Google Maps component provides a simple way to embed Google Maps with custom markers and locations. This component handles API loading, marker placement, info windows, and responsive map adjustments. It serves as a foundation that can be extended for more complex mapping requirements.

## Features

- ✅ **Automatic API Loading**: Loads Google Maps JavaScript API on demand
- ✅ **Multiple Markers**: Support for multiple location markers per map
- ✅ **Info Windows**: Clickable markers with custom popup content
- ✅ **Auto-Centering**: Automatically centers and zooms to fit all markers
- ✅ **Responsive**: Recalculates bounds and center on window resize
- ✅ **Dynamic Updates**: MutationObserver watches for location changes
- ✅ **Customizable Options**: Pass any Google Maps API options
- ✅ **Environment Variables**: API key managed through Vite config
- ✅ **Progressive Enhancement**: Only loads API when needed

## How It Works

### Initialization Flow

1. **API Check**: Checks if Google Maps API is already loaded
2. **Script Loading**: If not loaded, uses `DOMHelper.loadScript()` to load API with key
3. **Element Detection**: Finds all `[data-google-maps]` elements
4. **Instance Creation**: Creates a GoogleMapComponent for each element
5. **Marker Placement**: Parses locations and creates markers
6. **Auto-Fit**: Calculates bounds and centers map to show all markers

### Marker Management

Each location creates a marker:

1. **Parse Location Data**: Extracts lat, lng, and optional info from JSON
2. **Create Marker**: Instantiates `google.maps.Marker` at coordinates
3. **Add Info Window**: If `info` provided, adds click listener for popup
4. **Extend Bounds**: Adds marker position to bounds calculation
5. **Store Reference**: Keeps marker reference for cleanup

### Dynamic Location Updates

A MutationObserver watches the `data-locations` attribute:

```javascript
// When data-locations changes, markers are cleared and re-added
observer.observe(mapContainer, { attributes: true });
```

This allows updating map markers dynamically without recreating the entire map.

## Configuration

### API Key Setup

The Google Maps API key is configured via environment variables:

```env
# .env.local or similar
VITE_GOOGLE_API_KEY_MAPS=your_api_key_here
```

The component reads this via `import.meta.env.VITE_GOOGLE_API_KEY_MAPS`.

## Example

### Basic Map with Two Markers

<iframe src="../../examples/googleMaps1.html" height="450"></iframe>

```HTML
<div class="aspect-video" data-google-maps data-locations='[{ "lat": 50.882170, "lng": 4.702510, "info": "Statik" }, { "lat": 50.881401, "lng": 4.715916, "info": "Station" }]'></div>
```

This example shows two markers with info windows. Clicking a marker displays its info content.

### Map with Disabled Default UI

<iframe src="../../examples/googleMaps2.html" height="450"></iframe>

```HTML
<div class="aspect-video" data-google-maps data-locations='[{ "lat": 50.882170, "lng": 4.702510, "info": "Statik" }, { "lat": 50.881401, "lng": 4.715916, "info": "Station" }]' data-options='{"disableDefaultUI": true}'></div>
```

Uses `disableDefaultUI` to hide all default controls. Note: Use boolean `true`, not string `"true"`.

### Custom Control Configuration

<iframe src="../../examples/googleMaps3.html" height="450"></iframe>

```HTML
<div class="aspect-video" data-google-maps data-locations='[{ "lat": 50.882170, "lng": 4.702510, "info": "Statik" }, { "lat": 50.881401, "lng": 4.715916, "info": "Station" }]' data-options='{"mapTypeControl": false, "scaleControl": false, "zoomControl": false, "streetViewControl": false, "fullscreenControl": true}'></div>
```

Fine-grained control visibility: Disables most controls but keeps fullscreen enabled.

## Data Structure

### Location Objects

Each location in the `data-locations` array requires:

```json
{
  "lat": 50.88217, // Latitude (required, number or string)
  "lng": 4.70251, // Longitude (required, number or string)
  "info": "Statik" // Info window content (optional, string)
}
```

Example with multiple locations:

```json
[
  { "lat": 50.88217, "lng": 4.70251, "info": "Main Office" },
  { "lat": 50.881401, "lng": 4.715916, "info": "Station" },
  { "lat": 50.88, "lng": 4.72, "info": "Warehouse" }
]
```

### Map Options

The `data-options` attribute accepts any [Google Maps MapOptions](https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions):

```json
{
  "zoom": 12, // Initial zoom level (if not auto-fit)
  "scrollwheel": false, // Disable scroll zoom
  "disableDefaultUI": true, // Hide all default controls
  "mapTypeControl": false, // Hide map type selector
  "zoomControl": true, // Show zoom +/- buttons
  "streetViewControl": false, // Hide street view pegman
  "fullscreenControl": true // Show fullscreen button
}
```

**Important**: Use actual boolean values (`true`/`false`), not strings (`"true"`/`"false"`).

## Attributes

| Attribute          | Description                                                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-google-maps` | Required attribute that triggers the component                                                                                                                                                |
| `data-locations`   | Required JSON array of location objects with `lat`, `lng`, and optional `info` properties                                                                                                     |
| `data-options`     | Optional JSON object with [Google Maps MapOptions](https://developers.google.com/maps/documentation/javascript/controls); use boolean values (not strings) for options like `true` or `false` |

## Dynamic Updates

### Updating Markers via JavaScript

The component watches for changes to `data-locations`.

This triggers marker cleanup and recreation with new locations.

### Loading Locations via AJAX

```javascript
fetch('/api/locations')
  .then((response) => response.json())
  .then((locations) => {
    const mapElement = document.querySelector('[data-google-maps]');
    mapElement.setAttribute('data-locations', JSON.stringify(locations));
  });
```

## Best Practices

### API Key Security

- **Use Restrictions**: Restrict API key by HTTP referrer in Google Cloud Console
- **Environment Variables**: Never commit API keys to version control

### Responsive Design

Use aspect ratio utilities for consistent sizing:

```html
<!-- 16:9 aspect ratio -->
<div class="aspect-video" data-google-maps ...></div>

<!-- 4:3 aspect ratio -->
<div class="aspect-4/3" data-google-maps ...></div>

<!-- Custom height -->
<div class="h-96" data-google-maps ...></div>
```

## Related Components

- **Leaflet Component**: Open-source alternative to Google Maps

## API References

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [MapOptions Reference](https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions)
- [Marker Reference](https://developers.google.com/maps/documentation/javascript/reference/marker)
- [InfoWindow Reference](https://developers.google.com/maps/documentation/javascript/reference/info-window)
- [Google Cloud Console](https://console.cloud.google.com/) (for API key management)
