import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-picker-container">
      <div class="map-instructions mb-2">
        <small class="text-muted">
          <i class="fas fa-info-circle me-1"></i>
          انقر على الخريطة لتحديد موقع الخدمة
        </small>
      </div>

      <div #mapContainer class="map-container"></div>

      <div class="coordinates-display mt-2" *ngIf="selectedLocation">
        <div class="row g-2">
          <div class="col-md-6">
            <label class="form-label small fw-semibold">خط العرض:</label>
            <input
              type="number"
              class="form-control form-control-sm"
              [value]="selectedLocation.lat"
              (input)="updateLatitude($event)"
              step="any"
              readonly
            />
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-semibold">خط الطول:</label>
            <input
              type="number"
              class="form-control form-control-sm"
              [value]="selectedLocation.lng"
              (input)="updateLongitude($event)"
              step="any"
              readonly
            />
          </div>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary mt-2"
          (click)="clearLocation()"
        >
          <i class="fas fa-times me-1"></i>
          مسح الموقع
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .map-picker-container {
        width: 100%;
      }

      .map-container {
        height: 300px;
        width: 100%;
        border-radius: 8px;
        border: 2px solid #e9ecef;
        overflow: hidden;
      }

      .coordinates-display {
        background-color: #f8f9fa;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #dee2e6;
      }

      .map-instructions {
        text-align: center;
      }
    `,
  ],
})
export class MapPickerComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  @Input() initialLocation?: MapLocation;
  @Input() centerLocation: MapLocation = { lat: 31.9566, lng: 35.9457 }; // Default to Amman
  @Input() zoom: number = 10;

  @Output() locationSelected = new EventEmitter<MapLocation>();
  @Output() locationCleared = new EventEmitter<void>();

  private map!: L.Map;
  private marker?: L.Marker;
  selectedLocation?: MapLocation;

  ngOnInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Create map
    this.map = L.map(this.mapContainer.nativeElement).setView(
      [this.centerLocation.lat, this.centerLocation.lng],
      this.zoom
    );

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Add click event
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.setLocation(e.latlng.lat, e.latlng.lng);
    });

    // Set initial location if provided
    if (this.initialLocation) {
      this.setLocation(this.initialLocation.lat, this.initialLocation.lng);
    }
  }

  private setLocation(lat: number, lng: number): void {
    this.selectedLocation = { lat, lng };

    // Remove existing marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Add new marker
    this.marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #dc3545; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    }).addTo(this.map);

    // Emit the selected location
    this.locationSelected.emit(this.selectedLocation);
  }

  updateLatitude(event: any): void {
    const lat = parseFloat(event.target.value);
    if (!isNaN(lat) && this.selectedLocation) {
      this.selectedLocation.lat = lat;
      this.setLocation(lat, this.selectedLocation.lng);
    }
  }

  updateLongitude(event: any): void {
    const lng = parseFloat(event.target.value);
    if (!isNaN(lng) && this.selectedLocation) {
      this.selectedLocation.lng = lng;
      this.setLocation(this.selectedLocation.lat, lng);
    }
  }

  clearLocation(): void {
    this.selectedLocation = undefined;
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = undefined;
    }
    this.locationCleared.emit();
  }
}
