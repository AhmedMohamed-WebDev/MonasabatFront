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
import { EventItemService } from '../../core/services/event-item.service';
import { CreateEventItemRequest } from '../../core/models/event-item.model';
import {
  EVENT_CATEGORIES,
  CategoryConfig,
  isContactOnlyService,
} from '../../core/models/constants/categories.const';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
  categories = EVENT_CATEGORIES;
  selectedCategory?: CategoryConfig;
  subcategories: { value: string; label: string }[] = [];
  initialMapLocation?: MapLocation;

  cities = [
    // Jordan cities
    'Amman',
    'Irbid',
    'Zarqa',
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

  constructor(
    private fb: FormBuilder,
    private eventItemService: EventItemService,
    private router: Router,
    private translate: TranslateService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupCategoryListener();
    this.updateTranslations();

    // Listen for language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
    });
  }

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

  private initForm(): void {
    this.availableDatesArray = this.fb.array([]);

    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['', Validators.required],
      subcategory: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      city: ['', Validators.required],
      area: [''],
      lat: [''],
      lng: [''],
      minCapacity: [''],
      maxCapacity: [''],
      availableDates: this.availableDatesArray,
    });
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

        // Update subcategory control
        const subcategoryControl = this.serviceForm.get('subcategory');
        if (subcategoryControl) {
          subcategoryControl.patchValue('');
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

    // Update subcategory control
    const subcategoryControl = this.serviceForm.get('subcategory');
    if (subcategoryControl) {
      subcategoryControl.patchValue('');
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
  onVideoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      const maxVideos = 3;
      const maxSize = 50 * 1024 * 1024; // 50MB

      // Limit to max 3 videos
      const validFiles = files.slice(
        0,
        Math.max(0, maxVideos - this.selectedVideos.length)
      );

      for (const file of validFiles) {
        // Check file size
        if (file.size > maxSize) {
          this.notificationService.error(
            this.translate.instant('addService.form.media.videoSizeError', {
              fileName: file.name,
            }),
            this.translate.instant('addService.form.media.videoSizeError', {
              fileName: file.name,
            })
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
    const request: CreateEventItemRequest = {
      name: formValues.name,
      description: formValues.description,
      category: formValues.category,
      subcategory: formValues.subcategory,
      price: formValues.price,
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
      availableDates: this.availableDatesArray.value,
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
    const subcategory = this.serviceForm.get('subcategory')?.value;
    return isContactOnlyService(category, subcategory);
  }
}
