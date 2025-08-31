# Map Picker Feature

## Overview

The Map Picker feature allows suppliers to easily specify the exact location of their services using an interactive map instead of manually entering coordinates.

## Features

- **Interactive Map**: Uses Leaflet with OpenStreetMap tiles
- **Click to Select**: Users can click anywhere on the map to set a location
- **Visual Marker**: Red marker shows the selected location
- **Coordinate Display**: Shows latitude and longitude in readonly input fields
- **Clear Functionality**: Users can clear the selected location
- **Responsive Design**: Works on both desktop and mobile devices

## Implementation Details

### Components

- `MapPickerComponent`: Reusable map picker component
- Location: `src/app/shared/components/map-picker/`

### Dependencies

- `leaflet`: Interactive maps library
- `@types/leaflet`: TypeScript definitions for Leaflet

### Usage

#### In Add Service Form

```html
<app-map-picker [initialLocation]="initialMapLocation" (locationSelected)="onLocationSelected($event)" (locationCleared)="onLocationCleared()"> </app-map-picker>
```

#### In Edit Service Form

```html
<app-map-picker [initialLocation]="initialMapLocation" (locationSelected)="onLocationSelected($event)" (locationCleared)="onLocationCleared()"> </app-map-picker>
```

### Input Properties

- `initialLocation`: Optional initial location to display on the map
- `centerLocation`: Default center location (defaults to Amman, Jordan)
- `zoom`: Map zoom level (default: 10)

### Output Events

- `locationSelected`: Emitted when user selects a location on the map
- `locationCleared`: Emitted when user clears the selected location

### Data Structure

```typescript
interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}
```

## User Experience

### For Suppliers

1. **Easy Location Selection**: Simply click on the map to set the service location
2. **Visual Feedback**: Red marker shows exactly where the service is located
3. **Automatic Coordinates**: Latitude and longitude are automatically filled
4. **Flexible**: Can still manually enter city and area names
5. **Clear Option**: Can easily clear and reselect location if needed

### Benefits

- **Accuracy**: More precise location data compared to manual coordinate entry
- **User-Friendly**: Intuitive map interface
- **Time-Saving**: No need to look up coordinates manually
- **Error Reduction**: Eliminates coordinate entry errors

## Technical Implementation

### Map Configuration

- **Tiles**: OpenStreetMap (free, no API key required)
- **Default Center**: Amman, Jordan (31.9566, 35.9457)
- **Default Zoom**: 10 (city level)
- **Marker Style**: Custom red circular marker with white border

### Integration

- **Non-Breaking**: Existing manual coordinate entry still works
- **Backward Compatible**: Existing services without coordinates continue to work
- **Form Integration**: Seamlessly integrates with existing form validation

### Styling

- **Responsive**: Adapts to different screen sizes
- **Consistent**: Matches existing application design
- **Accessible**: Clear instructions and visual feedback

## Future Enhancements

- **Geocoding**: Reverse geocoding to get address from coordinates
- **Search**: Address search functionality
- **Multiple Locations**: Support for services with multiple locations
- **Custom Markers**: Different marker styles for different service types
- **Map Layers**: Additional map layers (satellite, terrain)

## Browser Compatibility

- Modern browsers with ES6+ support
- Mobile browsers with touch support
- Requires internet connection for map tiles
