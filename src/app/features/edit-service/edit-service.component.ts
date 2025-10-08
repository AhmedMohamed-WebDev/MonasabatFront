// src/app/features/edit-service/edit-service.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { EventItemService } from '../../core/services/event-item.service';
import {
  EventItem,
  UpdateEventItemRequest,
} from '../../core/models/event-item.model';
import {
  CategoryConfig,
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
  selectedVideos: any[] = [];
  existingImages: string[] = [];
  existingVideos: string[] = [];
  availableDates: string[] = [];
  serviceId!: string;
  initialMapLocation?: MapLocation;

  categories = EVENT_CATEGORIES;
  subcategories: { value: string; label: string }[] = [];
  today = new Date().toISOString().split('T')[0];
  excludedDates: string[] = [];
  translatedCities: { value: string; label: string }[] = [];
  // Add this property at the top of the class with other properties
  cities = [
    // Jordan cities
    'Amman',
    'Irbid',
    'Zarqa',
    'Jerash',
    'Balqa',
    'Aqaba',
    'Salt',
    'Madaba',
    'Karak',
    'Tafilah',
    // Kuwait cities
    'Kuwait City',
    'Ahmadi',
    'Hawalli',
    'Jahra',
    'Farwaniya',
    'Mubarak Al-Kabeer',
    'Salmiya',
    'Fahaheel',
  ];
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
      city: ['', Validators.required], // Add required validator for city
      area: [''],
      lat: [''],
      lng: [''],
      minCapacity: [''],
      maxCapacity: [''],
      availability: this.fb.group({
        dateRange: this.fb.group({
          from: ['', Validators.required],
          to: ['', Validators.required],
        }),
        excludedDates: this.fb.array([]),
      }),
    });
  }
  translatedCategories: CategoryConfig[] = [];
  validateDateRange(): boolean {
    const dateRange = this.serviceForm.get('availability.dateRange')?.value;
    if (!dateRange?.from || !dateRange?.to) return false;

    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);

    return fromDate <= toDate;
  }

  addExcludedDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedDate = input.value;

    if (!selectedDate) return;

    const fromDate = this.serviceForm.get('availability.dateRange.from')?.value;
    const toDate = this.serviceForm.get('availability.dateRange.to')?.value;

    if (!fromDate || !toDate) {
      this.notificationService.warning(
        this.translate.instant('addService.form.availability.selectDateRange'),
        'Warning'
      );
      return;
    }

    // Check if date is within range
    if (selectedDate < fromDate || selectedDate > toDate) {
      this.notificationService.warning(
        this.translate.instant('addService.form.availability.dateOutOfRange'),
        'Warning'
      );
      return;
    }

    // Check if date already exists
    if (this.excludedDates.includes(selectedDate)) {
      this.notificationService.warning(
        this.translate.instant(
          'addService.form.availability.dateAlreadyExcluded'
        ),
        'Warning'
      );
      return;
    }

    this.excludedDates.push(selectedDate);
    const excludedDatesArray = this.serviceForm.get(
      'availability.excludedDates'
    ) as FormArray;
    excludedDatesArray.push(this.fb.control(selectedDate));

    // Clear the input
    input.value = '';
  }

  removeExcludedDate(index: number): void {
    this.excludedDates.splice(index, 1);
    const excludedDatesArray = this.serviceForm.get(
      'availability.excludedDates'
    ) as FormArray;
    excludedDatesArray.removeAt(index);
  }

  // Add/update these methods
  private updateTranslations(): void {
    // Update categories with translations
    this.translatedCategories = this.categories.map((category) => ({
      ...category,
      label: this.translate.instant(`categories.${category.value}`),
      subcategories: category.subcategories.map((sub) => ({
        ...sub,
        label: this.translate.instant(`subcategories.${sub.value}`),
      })),
    }));
    // Update cities with translations
    this.translatedCities = this.cities.map((city) => {
      let translationKey = '';

      // Map city names to translation keys
      switch (city) {
        case 'Amman':
        case 'Irbid':
        case 'Zarqa':
        case 'Aqaba':
        case 'Salt':
        case 'Madaba':
        case 'Karak':
        case 'Tafilah':
          translationKey = `cities.jordan.${city.toLowerCase()}`;
          break;
        case 'Kuwait City':
          translationKey = 'cities.kuwait.kuwait_city';
          break;
        case 'Ahmadi':
        case 'Hawalli':
        case 'Jahra':
        case 'Farwaniya':
        case 'Mubarak Al-Kabeer':
        case 'Salmiya':
        case 'Fahaheel':
          translationKey = `cities.kuwait.${city
            .toLowerCase()
            .replace(/[\s\-]/g, '_')}`;
          break;
        default:
          translationKey = `cities.jordan.${city.toLowerCase()}`;
      }

      return {
        value: city,
        label: this.translate.instant(translationKey),
      };
    });

    // Update subcategories if category is selected
    const currentCategory = this.serviceForm.get('category')?.value;
    if (currentCategory) {
      const category = this.translatedCategories.find(
        (c) => c.value === currentCategory
      );
      if (category) {
        this.subcategories = category.subcategories;
      }
    }
  }

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id')!;
    this.updateTranslations();

    // Listen for language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
    });

    this.loadServiceData();

    // Add coordinate change monitoring (same as add-service)
    merge(
      this.serviceForm.get('lat')!.valueChanges,
      this.serviceForm.get('lng')!.valueChanges
    )
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter(() => {
          const lat = parseFloat(this.serviceForm.get('lat')?.value);
          const lng = parseFloat(this.serviceForm.get('lng')?.value);
          return !isNaN(lat) && !isNaN(lng);
        })
      )
      .subscribe(() => {
        this.updateMapFromCoordinates();
      });
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
    const cityValue = service.location?.city || '';
    this.serviceForm.patchValue({
      name: service.name,
      description: service.description || '',
      category: service.category,
      subcategory: service.subcategory || '',
      price: service.price,
      city: cityValue,
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
    // Populate availability data
    if (service.availability?.dateRange) {
      this.serviceForm.patchValue({
        availability: {
          dateRange: {
            from: new Date(service.availability.dateRange.from)
              .toISOString()
              .split('T')[0],
            to: new Date(service.availability.dateRange.to)
              .toISOString()
              .split('T')[0],
          },
        },
      });

      // Populate excluded dates
      if (service.availability.excludedDates) {
        this.excludedDates = service.availability.excludedDates.map(
          (date) => new Date(date).toISOString().split('T')[0]
        );

        const excludedDatesArray = this.serviceForm.get(
          'availability.excludedDates'
        ) as FormArray;
        this.excludedDates.forEach((date) => {
          excludedDatesArray.push(this.fb.control(date));
        });
      }
    }
  }

  // Update the onCategoryChange method
  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    if (!selectElement) return;

    const categoryValue = selectElement.value;
    const category = this.translatedCategories.find(
      (c) => c.value === categoryValue
    );

    if (category) {
      this.subcategories = category.subcategories;
    } else {
      this.subcategories = [];
    }

    // Reset subcategory when category changes
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

  // onVideoSelect(event: any): void {
  //   const files = Array.from(event.target.files) as File[];
  //   const totalVideos =
  //     this.existingVideos.length + this.selectedVideos.length + files.length;

  //   if (totalVideos > 3) {
  //     this.notificationService.warning(
  //       this.translate.instant('editService.form.media.maxVideosError'),
  //       this.translate.instant('editService.form.media.maxVideosError')
  //     );
  //     return;
  //   }
  //   this.selectedVideos = [...this.selectedVideos, ...files];
  // }
  onVideoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);

      // Check total count
      if (this.selectedVideos.length + files.length > 2) {
        this.notificationService.warning(
          this.translate.instant('addService.form.media.errors.videoCount'),
          'Warning'
        );
        return;
      }

      for (const file of files) {
        // Check file size
        if (file.size > 50 * 1024 * 1024) {
          this.notificationService.error(
            this.translate.instant('addService.form.media.errors.videoSize', {
              fileName: file.name,
            }),
            'Error'
          );
          continue;
        }

        // Check file type
        if (!['video/mp4', 'video/webm'].includes(file.type)) {
          this.notificationService.error(
            this.translate.instant('addService.form.media.errors.videoType', {
              fileName: file.name,
            }),
            'Error'
          );
          continue;
        }

        this.selectedVideos.push({
          file: file,
          name: file.name,
        });
      }
    }
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
        availability: {
          dateRange: {
            from: formValue.availability.dateRange.from,
            to: formValue.availability.dateRange.to,
          },
          excludedDates: formValue.availability.excludedDates,
        },
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
        formData.append('videos', video.file);
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
  updateMapFromCoordinates(): void {
    const latValue = this.serviceForm.get('lat')?.value;
    const lngValue = this.serviceForm.get('lng')?.value;

    if (!latValue || !lngValue) {
      return;
    }

    const lat = parseFloat(latValue);
    const lng = parseFloat(lngValue);

    if (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      console.log('Updating map location to:', { lat, lng });

      this.initialMapLocation = {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      };
    }
  }
}
