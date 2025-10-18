// src/app/features/add-service/add-service.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';
import { merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { EventItemService } from '../../core/services/event-item.service';
import { CreateEventItemRequest } from '../../core/models/event-item.model';
import {
  CategoryConfig,
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
  selector: 'app-add-service',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MapPickerComponent,
  ],
  templateUrl: './add-service.component.html',
  styleUrls: ['./add-service.component.css'],
})
export class AddServiceComponent implements OnInit {
  serviceForm!: FormGroup;
  isLoading = false;
  isUploading = false;
  isSubmitting = false;
  selectedImages: any[] = [];
  selectedVideos: any[] = [];
  availableDatesArray!: FormArray;
  categories: CategoryConfig[] = [];
  selectedCategory?: CategoryConfig;
  subcategories: { value: string; label: string }[] = [];
  initialMapLocation?: MapLocation;

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

  // Translated data
  translatedCategories: CategoryConfig[] = [];
  translatedCities: { value: string; label: string }[] = [];
  today = new Date().toISOString().split('T')[0]; // For min date validation
  excludedDates: string[] = []; // To store excluded dates

  constructor(
    private fb: FormBuilder,
    private eventItemService: EventItemService,
    private router: Router,
    private translate: TranslateService,
    private notificationService: NotificationService,
    private translationService: TranslationService
  ) {}

  // Validator to ensure a FormControl array has at least minLength items
  arrayMinLengthValidator(minLength: number) {
    return (control: any) => {
      if (!control || !control.value) return { minLengthArray: true };
      const val = control.value;
      if (!Array.isArray(val)) return { minLengthArray: true };
      return val.length >= minLength ? null : { minLengthArray: true };
    };
  }

  ngOnInit(): void {
    this.initForm();
    this.setupCategoryListener();
    this.updateTranslations();
    // Add this new section for coordinate change monitoring
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

    // Listen for language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
    });
  }

  private updateTranslations(): void {
    // Update categories with translations (service categories only)
    this.translatedCategories =
      this.translationService.getTranslatedServiceCategories();

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

    // Update subcategories if a category is selected
    if (this.selectedCategory) {
      this.updateSubcategories();
    }
  }

  private updateSubcategories(): void {
    if (this.selectedCategory) {
      this.subcategories = this.selectedCategory.subcategories.map((sub) => ({
        ...sub,
        label: this.translate.instant(`subcategories.${sub.value}`),
      }));
    }
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
    (event.target as HTMLInputElement).value = '';
  }

  // Method to remove excluded date
  removeExcludedDate(index: number): void {
    this.excludedDates.splice(index, 1);
    const excludedDatesArray = this.serviceForm.get(
      'availability.excludedDates'
    ) as FormArray;
    excludedDatesArray.removeAt(index);
  }

  private initForm(): void {
    this.availableDatesArray = this.fb.array([]);

    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['', Validators.required],
      // support multiple subcategories (array of strings)
      subcategories: [[], [this.arrayMinLengthValidator(1)]],
      // price optional if supplier chooses 'Ask for price'
      askForPrice: [false],
      price: ['', [Validators.min(0)]],
      city: ['', Validators.required],
      area: [''],
      lat: [''],
      lng: [''],
      minCapacity: [''],
      maxCapacity: [''],
      social: this.fb.group({
        instagram: [''],
        facebook: [''],
      }),
      availableDates: this.availableDatesArray,
      availability: this.fb.group({
        dateRange: this.fb.group({
          from: ['', Validators.required],
          to: ['', Validators.required],
        }),
        excludedDates: this.fb.array([]),
      }),
    });
  }
  validateDateRange(): boolean {
    const dateRange = this.serviceForm.get('availability.dateRange')?.value;
    if (!dateRange?.from || !dateRange?.to) return false;

    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);

    return fromDate <= toDate;
  }
  private setupCategoryListener(): void {
    const categoryControl = this.serviceForm.get('category');
    if (categoryControl) {
      categoryControl.valueChanges.subscribe((categoryValue: string) => {
        if (categoryValue) {
          this.selectedCategory = this.translatedCategories.find(
            (c) => c.value === categoryValue
          );
          this.updateSubcategories();
        } else {
          this.subcategories = [];
          this.selectedCategory = undefined;
        }

        // Update subcategories control (clear selection when category changes)
        const subcategoriesControl = this.serviceForm.get('subcategories');
        if (subcategoriesControl) {
          subcategoriesControl.patchValue([]);
        }
      });
    }
  }

  // Add method to handle category change from template
  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    if (!selectElement) return;

    const categoryValue = selectElement.value;

    if (categoryValue) {
      this.selectedCategory = this.translatedCategories.find(
        (c) => c.value === categoryValue
      );
      this.updateSubcategories();
    } else {
      this.subcategories = [];
      this.selectedCategory = undefined;
    }

    // Update subcategories control
    const subcategoriesControl = this.serviceForm.get('subcategories');
    if (subcategoriesControl) {
      subcategoriesControl.patchValue([]);
    }
  }

  // Method to add a new available date
  addAvailableDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedDate = input.value;

    if (!selectedDate) return;

    // Check if date already exists
    const exists = this.availableDatesArray.controls.some(
      (control) => control.value === selectedDate
    );

    if (exists) {
      this.notificationService.warning(
        this.translate.instant('addService.form.availability.dateExists'),
        this.translate.instant('addService.form.availability.dateExists')
      );
      return;
    }

    this.availableDatesArray.push(this.fb.control(selectedDate));
  }

  // Method to remove an available date
  removeAvailableDate(index: number): void {
    this.availableDatesArray.removeAt(index);
  }

  // Getter for availableDates to use in template
  get availableDates(): string[] {
    return this.availableDatesArray
      ? this.availableDatesArray.controls.map((control) => control.value)
      : [];
  }

  // Method to handle image selection
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      const maxImages = 5;
      const maxSize = 5 * 1024 * 1024; // 5MB

      // Limit to max 5 images
      const validFiles = files.slice(
        0,
        Math.max(0, maxImages - this.selectedImages.length)
      );

      for (const file of validFiles) {
        // Check file size
        if (file.size > maxSize) {
          this.notificationService.error(
            this.translate.instant('addService.form.media.imageSizeError', {
              fileName: file.name,
            }),
            this.translate.instant('addService.form.media.imageSizeError', {
              fileName: file.name,
            })
          );
          continue;
        }

        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedImages.push({
            file: file,
            preview: e.target.result,
            name: file.name,
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Method to handle video selection
  // onVideoSelect(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files) {
  //     const files = Array.from(input.files);
  //     const maxVideos = 3;
  //     const maxSize = 50 * 1024 * 1024; // 50MB

  //     // Limit to max 3 videos
  //     const validFiles = files.slice(
  //       0,
  //       Math.max(0, maxVideos - this.selectedVideos.length)
  //     );

  //     for (const file of validFiles) {
  //       // Check file size
  //       if (file.size > maxSize) {
  //         this.notificationService.error(
  //           this.translate.instant('addService.form.media.videoSizeError', {
  //             fileName: file.name,
  //           }),
  //           this.translate.instant('addService.form.media.videoSizeError', {
  //             fileName: file.name,
  //           })
  //         );
  //         continue;
  //       }

  //       this.selectedVideos.push({
  //         file: file,
  //         name: file.name,
  //       });
  //     }
  //   }
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
  // Method to remove a video
  removeVideo(index: number): void {
    this.selectedVideos.splice(index, 1);
  }

  // Method to remove an image
  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  // Method to navigate back
  goBack(): void {
    this.router.navigate(['/supplier-dashboard']);
  }

  // Method to check if a field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.serviceForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  // Method to get field error message
  getFieldError(fieldName: string): string {
    const field = this.serviceForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return this.translate.instant('addService.form.validation.required');
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return this.translate.instant('addService.form.validation.minLength', {
        length: minLength,
      });
    }
    if (field.hasError('min')) {
      const min = field.getError('min').min;
      return this.translate.instant('addService.form.validation.minValue', {
        value: min,
      });
    }
    return this.translate.instant('addService.form.validation.invalidValue');
  }

  // Map location handlers
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
  // Add this method to the class
  // updateMapFromCoordinates(): void {
  //   const lat = this.serviceForm.get('lat')?.value;
  //   const lng = this.serviceForm.get('lng')?.value;

  //   if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
  //     this.initialMapLocation = { lat, lng };
  //   }
  // }
  // updateMapFromCoordinates(): void {
  //   const lat = parseFloat(this.serviceForm.get('lat')?.value);
  //   const lng = parseFloat(this.serviceForm.get('lng')?.value);

  //   if (
  //     !isNaN(lat) &&
  //     !isNaN(lng) &&
  //     lat >= -90 &&
  //     lat <= 90 &&
  //     lng >= -180 &&
  //     lng <= 180
  //   ) {
  //     console.log('Updating map location to:', { lat, lng }); // Debug log

  //     // Create a new object to force change detection
  //     this.initialMapLocation = {
  //       lat: Number(lat.toFixed(6)),
  //       lng: Number(lng.toFixed(6)),
  //     };
  //   }
  // }
  updateMapFromCoordinates(): void {
    const latValue = this.serviceForm.get('lat')?.value;
    const lngValue = this.serviceForm.get('lng')?.value;

    // Check if values exist and are not empty strings
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

      // Force change detection by creating a completely new object
      this.initialMapLocation = {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      };

      // Trigger change detection manually if needed
      // this.cdr.detectChanges(); // Uncomment if you inject ChangeDetectorRef
    }
  }
  // Method to submit the form
  onSubmit(): void {
    if (this.serviceForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.serviceForm.controls).forEach((key) => {
        const control = this.serviceForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Create the request object from form values
    const formValues = this.serviceForm.value;
    const selectedSubcategories: string[] = Array.isArray(
      formValues.subcategories
    )
      ? formValues.subcategories
      : formValues.subcategories
      ? [formValues.subcategories]
      : [];

    const request: CreateEventItemRequest = {
      name: formValues.name,
      description: formValues.description,
      category: formValues.category,
      // legacy single subcategory field kept for backward compatibility
      subcategory:
        selectedSubcategories.length > 0 ? selectedSubcategories[0] : '',
      // new array field sent in parallel (backend should accept or ignore)
      // @ts-ignore - CreateEventItemRequest may not include subcategories yet
      subcategories: selectedSubcategories,
      price: formValues.askForPrice ? undefined : formValues.price,
      priceType: formValues.askForPrice ? 'not_provided' : 'fixed',
      priceAvailable: !formValues.askForPrice,
      minCapacity: formValues.minCapacity,
      maxCapacity: formValues.maxCapacity,
      location: {
        city: formValues.city,
        area: formValues.area,
        coordinates: {
          lat: formValues.lat ? Number(formValues.lat) : undefined,
          lng: formValues.lng ? Number(formValues.lng) : undefined,
        },
      },
      // availableDates deprecated - backend now uses availability (dateRange + excludedDates)
      availability: {
        dateRange: {
          from: formValues.availability.dateRange.from,
          to: formValues.availability.dateRange.to,
        },
        excludedDates: formValues.availability.excludedDates,
      },
      social: {
        instagram: this.normalizeUrl(formValues.social?.instagram),
        facebook: this.normalizeUrl(formValues.social?.facebook),
      },
    };

    // Call the service to create the event item
    this.eventItemService.createEventItem(request).subscribe({
      next: (response) => {
        // If there are images or videos to upload
        if (this.selectedImages.length > 0 || this.selectedVideos.length > 0) {
          this.isSubmitting = false;
          this.isUploading = true;
          this.uploadMedia(response._id);
        } else {
          this.isSubmitting = false;
          this.notificationService.success(
            this.translate.instant('addService.form.success.serviceCreated'),
            this.translate.instant('addService.form.success.serviceCreated')
          );
          this.router.navigate(['/supplier-dashboard']);
        }
      },
      error: (error) => {
        console.error('Error creating event item:', error);
        this.isSubmitting = false;
        this.notificationService.error(
          this.translate.instant('addService.form.error.createFailed'),
          this.translate.instant('addService.form.error.createFailed')
        );
      },
    });
  }

  // Normalize social URL: trim and ensure protocol (https) if looks like a domain
  private normalizeUrl(url?: string): string | undefined {
    if (!url) return undefined;
    let v = String(url).trim();
    if (!v) return undefined;
    // If user provided username-like input (starts with '@') -> convert to instagram URL
    if (v.startsWith('@')) {
      v = v.substring(1);
      return `https://instagram.com/${v}`;
    }
    // If missing protocol, prepend https://
    if (!/^https?:\/\//i.test(v)) {
      v = 'https://' + v;
    }
    return v;
  }

  // Helper method to upload media files
  private uploadMedia(eventId: string): void {
    const formData = new FormData();

    // Add images to form data
    this.selectedImages.forEach((image, index) => {
      formData.append(`images`, image.file);
    });

    // Add videos to form data
    this.selectedVideos.forEach((video, index) => {
      formData.append(`videos`, video.file);
    });

    // Upload the media files
    this.eventItemService.uploadEventMedia(eventId, formData).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.notificationService.success(
          this.translate.instant('addService.form.success.serviceCreated'),
          this.translate.instant('addService.form.success.serviceCreated')
        );
        this.router.navigate(['/supplier-dashboard']);
      },
      error: (error) => {
        console.error('Error uploading media:', error);
        this.isUploading = false;
        this.notificationService.error(
          this.translate.instant('addService.form.error.uploadFailed'),
          this.translate.instant('addService.form.error.uploadFailed')
        );
      },
    });
  }

  // Check if the selected service is contact-only
  isContactOnlyService(): boolean {
    const category = this.serviceForm.get('category')?.value;
    const subs = this.serviceForm.get('subcategories')?.value;
    const primary = Array.isArray(subs) ? subs[0] : subs;
    return isContactOnlyService(category, primary);
  }

  // Toggle selection of a subcategory by value
  toggleSubcategory(value: string): void {
    const control = this.serviceForm.get('subcategories');
    if (!control) return;
    const current: string[] = Array.isArray(control.value) ? control.value : [];
    const idx = current.indexOf(value);
    if (idx === -1) {
      control.patchValue([...current, value]);
    } else {
      const next = current.slice(0, idx).concat(current.slice(idx + 1));
      control.patchValue(next);
    }
  }

  // Convenience for toggling by label (used on chip close button)
  toggleSubcategoryByValue(labelOrValue: string, isLabel = false): void {
    // If a label was passed, map it back to the subcategory value
    let value = labelOrValue;
    if (isLabel) {
      const found = this.subcategories.find(
        (s) => s.label === labelOrValue || s.value === labelOrValue
      );
      if (found) value = found.value;
    }
    this.toggleSubcategory(value);
  }

  isSubcategorySelected(value: string): boolean {
    const control = this.serviceForm.get('subcategories');
    if (!control) return false;
    const current: string[] = Array.isArray(control.value) ? control.value : [];
    return current.includes(value);
  }

  // Return selected subcategory labels (translated)
  getSelectedSubcategoryLabels(): string[] {
    const control = this.serviceForm.get('subcategories');
    if (!control) return [];
    const current: string[] = Array.isArray(control.value) ? control.value : [];
    return current
      .map((v) => this.subcategories.find((s) => s.value === v))
      .filter(Boolean)
      .map((s: any) => s.label);
  }
}
