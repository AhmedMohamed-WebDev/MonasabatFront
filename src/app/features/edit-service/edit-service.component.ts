// src/app/features/edit-service/edit-service.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EventItemService } from '../../core/services/event-item.service';
import {
  EventItem,
  UpdateEventItemRequest,
} from '../../core/models/event-item.model';
import {
  EVENT_CATEGORIES,
  isContactOnlyService,
} from '../../core/models/constants/categories.const';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../core/services/translation.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  MapPickerComponent,
  MapLocation,
} from '../../shared/components/map-picker/map-picker.component';

@Component({
  selector: 'app-edit-service',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MapPickerComponent,
  ],
  templateUrl: './edit-service.component.html',
  styleUrls: ['./edit-service.component.css'],
})
export class EditServiceComponent implements OnInit {
  serviceForm: FormGroup;
  isLoading = false;
  isUploading = false;
  isLoadingData = true;
  selectedImages: File[] = [];
  selectedVideos: File[] = [];
  existingImages: string[] = [];
  existingVideos: string[] = [];
  availableDates: string[] = [];
  serviceId!: string;
  initialMapLocation?: MapLocation;

  categories = EVENT_CATEGORIES;
  subcategories: { value: string; label: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private eventItemService: EventItemService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private translationService: TranslationService,
    private notificationService: NotificationService
  ) {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['', Validators.required],
      subcategory: [''],
      price: ['', [Validators.required, Validators.min(1)]],
      city: [''],
      area: [''],
      lat: [''],
      lng: [''],
      minCapacity: [''],
      maxCapacity: [''],
    });
  }

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id')!;
    this.loadServiceData();
  }

  async loadServiceData(): Promise<void> {
    try {
      this.isLoadingData = true;
      const service = await this.eventItemService
        .getEventItemById(this.serviceId)
        .toPromise();

      if (service) {
        this.populateForm(service);
      }
    } catch (error) {
      console.error('Error loading service data:', error);
      this.notificationService.error(
        this.translate.instant('editService.form.error.loadFailed'),
        this.translate.instant('editService.form.error.loadFailed')
      );
      this.goBack();
    } finally {
      this.isLoadingData = false;
    }
  }

  private populateForm(service: EventItem): void {
    this.serviceForm.patchValue({
      name: service.name,
      description: service.description || '',
      category: service.category,
      subcategory: service.subcategory || '',
      price: service.price,
      city: service.location?.city || '',
      area: service.location?.area || '',
      lat: service.location?.coordinates?.lat || '',
      lng: service.location?.coordinates?.lng || '',
      minCapacity: service.minCapacity || '',
      maxCapacity: service.maxCapacity || '',
    });

    // Set initial map location if coordinates exist
    if (
      service.location?.coordinates?.lat &&
      service.location?.coordinates?.lng
    ) {
      this.initialMapLocation = {
        lat: service.location.coordinates.lat,
        lng: service.location.coordinates.lng,
      };
    }

    // Set existing media
    this.existingImages = service.images || [];
    this.existingVideos = service.videos || [];

    // Set available dates
    this.availableDates = service.availableDates
      ? service.availableDates.map(
          (date) => new Date(date).toISOString().split('T')[0]
        )
      : [];

    // Add this to populate subcategories
    const category = this.categories.find((c) => c.value === service.category);
    if (category) {
      this.subcategories = category.subcategories.map((sub) => ({
        ...sub,
        label: this.translate.instant(`subcategories.${sub.value}`),
      }));
    }
  }

  onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    const category = this.categories.find((c) => c.value === value);

    if (category) {
      // Translate subcategories when category changes
      this.subcategories = category.subcategories.map((sub) => ({
        ...sub,
        label: this.translate.instant(`subcategories.${sub.value}`),
      }));
    } else {
      this.subcategories = [];
    }

    this.serviceForm.patchValue({ subcategory: '' });
  }

  onImageSelect(event: any): void {
    const files = Array.from(event.target.files) as File[];
    const totalImages =
      this.existingImages.length + this.selectedImages.length + files.length;

    if (totalImages > 5) {
      this.notificationService.warning(
        this.translate.instant('editService.form.media.maxImagesError'),
        this.translate.instant('editService.form.media.maxImagesError')
      );
      return;
    }
    this.selectedImages = [...this.selectedImages, ...files];
  }

  onVideoSelect(event: any): void {
    const files = Array.from(event.target.files) as File[];
    const totalVideos =
      this.existingVideos.length + this.selectedVideos.length + files.length;

    if (totalVideos > 3) {
      this.notificationService.warning(
        this.translate.instant('editService.form.media.maxVideosError'),
        this.translate.instant('editService.form.media.maxVideosError')
      );
      return;
    }
    this.selectedVideos = [...this.selectedVideos, ...files];
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  removeVideo(index: number): void {
    this.selectedVideos.splice(index, 1);
  }

  removeExistingImage(index: number): void {
    this.existingImages.splice(index, 1);
  }

  removeExistingVideo(index: number): void {
    this.existingVideos.splice(index, 1);
  }

  addAvailableDate(event: any): void {
    const date = event.target.value;
    if (date && !this.availableDates.includes(date)) {
      this.availableDates.push(date);
    }
    event.target.value = '';
  }

  removeAvailableDate(index: number): void {
    this.availableDates.splice(index, 1);
  }

  async onSubmit(): Promise<void> {
    if (this.serviceForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;

    try {
      const formValue = this.serviceForm.value;

      const eventItemData: UpdateEventItemRequest = {
        name: formValue.name,
        description: formValue.description,
        category: formValue.category,
        subcategory: formValue.subcategory,
        price: Number(formValue.price),
        location: {
          city: formValue.city,
          area: formValue.area,
          coordinates: {
            lat: formValue.lat ? Number(formValue.lat) : undefined,
            lng: formValue.lng ? Number(formValue.lng) : undefined,
          },
        },
        availableDates: this.availableDates,
        minCapacity: formValue.minCapacity
          ? Number(formValue.minCapacity)
          : undefined,
        maxCapacity: formValue.maxCapacity
          ? Number(formValue.maxCapacity)
          : undefined,
        images: this.existingImages,
        videos: this.existingVideos,
      };

      // Update the event item
      await this.eventItemService
        .updateEventItem(this.serviceId, eventItemData)
        .toPromise();

      // Upload new media if any files are selected
      if (this.selectedImages.length > 0 || this.selectedVideos.length > 0) {
        await this.uploadNewMedia();
      }

      this.notificationService.success(
        this.translate.instant('editService.form.success.serviceUpdated'),
        this.translate.instant('editService.form.success.serviceUpdated')
      );
      this.router.navigate(['/supplier-dashboard']);
    } catch (error: any) {
      console.error('Error updating service:', error);
      this.notificationService.error(
        this.translate.instant('editService.form.error.updateFailed'),
        this.translate.instant('editService.form.error.updateFailed')
      );
    } finally {
      this.isLoading = false;
    }
  }

  private async uploadNewMedia(): Promise<void> {
    if (this.selectedImages.length === 0 && this.selectedVideos.length === 0) {
      return;
    }

    this.isUploading = true;

    try {
      const formData = new FormData();

      this.selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      this.selectedVideos.forEach((video) => {
        formData.append('videos', video);
      });

      await this.eventItemService
        .uploadEventMedia(this.serviceId, formData)
        .toPromise();
    } catch (error) {
      console.error('Error uploading media:', error);
      this.notificationService.warning(
        this.translate.instant('editService.form.warning.uploadFailed'),
        this.translate.instant('editService.form.warning.uploadFailed')
      );
    } finally {
      this.isUploading = false;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.serviceForm.controls).forEach((key) => {
      const control = this.serviceForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.serviceForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Add method to get translated categories
  getTranslatedCategories() {
    return this.categories.map((category) => ({
      ...category,
      label: this.translate.instant(`categories.${category.value}`),
      subcategories: category.subcategories.map((sub) => ({
        ...sub,
        label: this.translate.instant(`subcategories.${sub.value}`),
      })),
    }));
  }

  // Update error messages to use translations
  getFieldError(fieldName: string): string {
    const field = this.serviceForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required'])
        return this.translate.instant('addService.form.validation.required');
      if (field.errors['minlength'])
        return this.translate.instant('addService.form.validation.minLength', {
          length: field.errors['minlength'].requiredLength,
        });
      if (field.errors['min'])
        return this.translate.instant('addService.form.validation.minValue', {
          value: field.errors['min'].min,
        });
    }
    return '';
  }

  onLocationSelected(location: MapLocation): void {
    this.serviceForm.patchValue({
      lat: location.lat,
      lng: location.lng,
    });
  }

  onLocationCleared(): void {
    this.serviceForm.patchValue({
      lat: '',
      lng: '',
    });
  }

  goBack(): void {
    this.router.navigate(['/supplier-dashboard']);
  }

  getImageName(url: string): string {
    return url.split('/').pop()?.split('?')[0] || 'صورة';
  }

  getVideoName(url: string): string {
    return url.split('/').pop()?.split('?')[0] || 'فيديو';
  }

  // Check if the selected service is contact-only
  isContactOnlyService(): boolean {
    const category = this.serviceForm.get('category')?.value;
    const subcategory = this.serviceForm.get('subcategory')?.value;
    return isContactOnlyService(category, subcategory);
  }
}
