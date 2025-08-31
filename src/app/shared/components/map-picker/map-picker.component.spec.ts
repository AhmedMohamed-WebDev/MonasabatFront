import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapPickerComponent } from './map-picker.component';

describe('MapPickerComponent', () => {
  let component: MapPickerComponent;
  let fixture: ComponentFixture<MapPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapPickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default center location', () => {
    expect(component.centerLocation.lat).toBe(31.9566);
    expect(component.centerLocation.lng).toBe(35.9457);
  });

  it('should have default zoom level', () => {
    expect(component.zoom).toBe(10);
  });
});
