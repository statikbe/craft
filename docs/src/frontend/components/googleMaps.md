# Google maps

This is a very basic component to show a Google Map with some locations.
Many projects that use Google Maps require more complex interactions. This can then be used as a starting point.

## Example

<iframe src="../../examples/googleMaps1.html" height="450"></iframe>

```HTML
<div class="aspect-video" data-google-maps data-locations='[{ "lat": 50.882170, "lng": 4.702510, "info": "Statik" }, { "lat": 50.881401, "lng": 4.715916, "info": "Station" }]'></div>
```

<iframe src="../../examples/googleMaps2.html" height="450"></iframe>

```HTML
<div class="aspect-video" data-google-maps data-locations='[{ "lat": 50.882170, "lng": 4.702510, "info": "Statik" }, { "lat": 50.881401, "lng": 4.715916, "info": "Station" }]' data-options='{"disableDefaultUI": "true"}'></div>
```

<iframe src="../../examples/googleMaps3.html" height="450"></iframe>

```HTML
<div class="aspect-video" data-google-maps data-locations='[{ "lat": 50.882170, "lng": 4.702510, "info": "Statik" }, { "lat": 50.881401, "lng": 4.715916, "info": "Station" }]' data-options='{"mapTypeControl": false, "scaleControl": false, "zoomControl": false, "streetViewControl": false, "fullscreenControl": true}'></div>
```

## Attributes

| Attribute          | Description                                                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data-google-maps` | This attribute triggers the component                                                                                                                                                                        |
| `data-options`     | This attribute can contain [google map options](https://developers.google.com/maps/documentation/javascript/controls) in a JSON object; use boolean values (not strings) for options like `true` or `false`. |
