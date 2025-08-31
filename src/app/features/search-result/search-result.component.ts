import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SearchService } from '../../core/services/search-result.service';
import { EventItem } from '../../core/models/event-item.model';
import { LanguageService } from '../../core/services/language.service';
import { TranslationService } from '../../core/services/translation.service';
import {
  EVENT_CATEGORIES,
  CategoryConfig,
  isContactOnlyService,
} from '../../core/models/constants/categories.const';
import {
  CATEGORY_TO_SUBCATEGORY_FALLBACK,
  SUBCATEGORY_TO_CATEGORY_ALIAS,
  getServiceIconClass,
} from '../../core/models/constants/categories.const';

interface TranslatedCity {
  original: string;
  translated: string;
}

interface PeopleRange {
  min: number;
  max: number | null;
  label: string;
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css'],
})
export class SearchResultComponent implements OnInit {
  results: EventItem[] = [];
  filteredResults: EventItem[] = [];
  loading = false;
  error: string | null = null;
  currentParams: any = {};
  selectedCategory: CategoryConfig | undefined;
  showFilters = false;
  showSort = false;
  // Mobile sheet mode
  filtersSheetMode: 'all' | 'city' = 'all';

  // Price slider bounds
  priceBounds = { min: 0, max: 10000, step: 10 };

  // Sorting
  sortKey: 'relevance' | 'priceAsc' | 'priceDesc' | 'rating' = 'relevance';

  // Filters state
  filters = {
    minPrice: 0,
    maxPrice: 10000,
    selectedSubcategories: [] as string[],
    priceRange: { min: 0, max: 10000 },
    // Location filters
    showNearby: false,
    selectedCity: '',
    // Availability filters
    availableOnDate: '',
  };

  // Lookup data
  eventCategories: CategoryConfig[] = [];
  peopleRanges: PeopleRange[] = [];
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
  translatedCities: TranslatedCity[] = [];

  // Debounce id for price changes
  private priceDebounceId: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private translate: TranslateService,
    private languageService: LanguageService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    this.loading = true;

    // Initialize lookups
    this.updateLookups();

    this.route.queryParams.subscribe((params) => {
      this.currentParams = { ...params };

      // Sync selected category
      if (this.currentParams['category']) {
        const cat = this.currentParams['category'];
        this.selectedCategory = this.eventCategories.find(
          (c) => c.value === cat
        );
      } else if (this.currentParams['subcategory']) {
        const alias =
          SUBCATEGORY_TO_CATEGORY_ALIAS[this.currentParams['subcategory']];
        if (alias) {
          this.selectedCategory = this.eventCategories.find(
            (c) => c.value === alias
          );
        } else {
          this.selectedCategory = undefined;
        }
      } else {
        this.selectedCategory = undefined;
      }

      // Sync subcategory filter UI (checkboxes) from query param if present
      if (this.currentParams['subcategory']) {
        this.filters.selectedSubcategories = [
          this.currentParams['subcategory'],
        ];
      } else {
        this.filters.selectedSubcategories = [];
      }

      // Sync new filter parameters
      if (this.currentParams['nearby']) {
        this.filters.showNearby = this.currentParams['nearby'] === 'true';
      }

      if (this.currentParams['availableOnDate']) {
        this.filters.availableOnDate = this.currentParams['availableOnDate'];
      }

      this.searchEvents();
    });

    // Update translations/lookups on language change
    this.translate.onLangChange.subscribe(() => {
      this.updateLookups();
    });
  }

  private updateLookups() {
    this.eventCategories = this.translationService.getTranslatedCategories();
    this.peopleRanges = this.translationService.getTranslatedPeopleRanges();
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
        original: city,
        translated: this.translate.instant(translationKey),
      };
    });
  }

  private navigateWith(paramsPatch: any) {
    const newParams: any = { ...this.currentParams, ...paramsPatch };

    // Remove empty values
    Object.keys(newParams).forEach((key) => {
      const v = newParams[key];
      if (v === '' || v === undefined || v === null) delete newParams[key];
    });

    // Skip if nothing changed
    const curr = JSON.stringify(this.currentParams || {});
    const next = JSON.stringify(newParams || {});
    if (curr === next) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: newParams,
      queryParamsHandling: '',
    });
  }

  onCategoryChange(value: string) {
    if (!value) {
      // Clear category and subcategory
      this.selectedCategory = undefined;
      this.navigateWith({ category: '', subcategory: '' });
      return;
    }
    this.selectedCategory = this.eventCategories.find((c) => c.value === value);
    // Use subcategory fallback for new top-level categories backed by legacy subcategories
    const fallbackSub = CATEGORY_TO_SUBCATEGORY_FALLBACK[value];
    if (fallbackSub) {
      this.navigateWith({ category: '', subcategory: fallbackSub });
    } else {
      // Reset subcategory on category change
      this.navigateWith({ category: value, subcategory: '' });
    }
  }

  onSubcategoryChange(value: string) {
    this.navigateWith({ subcategory: value || '' });
  }

  onCityChange(value: string) {
    this.navigateWith({ city: value || '' });
  }

  onDateChange(value: string) {
    this.navigateWith({ date: value || '' });
  }

  // Handle nearby location filter
  onNearbyChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.filters.showNearby = checked;
    this.applyFilters();

    // Update URL with nearby filter
    if (checked) {
      this.navigateWith({ nearby: 'true' });
    } else {
      this.navigateWith({ nearby: '' });
    }
  }

  // Handle availability filter
  onAvailabilityChange(value: string) {
    this.filters.availableOnDate = value;
    this.applyFilters();

    // Update URL with availability filter
    this.navigateWith({ availableOnDate: value || '' });
  }

  // Handle date input change from template
  onAvailabilityDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.onAvailabilityChange(target.value);
    }
  }

  onPeopleChange(label: string) {
    const range = this.peopleRanges.find((r) => r.label === label);
    if (!label || !range) {
      // Clear both if Any
      const patch: any = { minCapacity: '', maxCapacity: '' };
      this.navigateWith(patch);
      return;
    }
    const patch: any = {
      minCapacity: range.min,
      maxCapacity: range.max,
    };
    this.navigateWith(patch);
  }

  searchEvents() {
    this.loading = true;
    this.error = null;

    this.searchService.searchEvents(this.currentParams).subscribe({
      next: (data: EventItem[]) => {
        this.results = data;
        this.filteredResults = [...data];
        this.calculatePriceRange();

        // Generate ratings for all services
        data.forEach((service) => this.generateStarRating(service._id));

        this.sortResults();
        this.loading = false;

        // Log search results for debugging
        console.log(
          `Search returned ${data.length} results for params:`,
          this.currentParams
        );
      },
      error: (error) => {
        console.error('Search failed:', error);

        // Provide more specific error messages
        let errorMessage = 'search.error.retry';
        if (error.status === 0) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.status === 404) {
          errorMessage = 'Search service not available.';
        }

        this.translate.get('search.error.retry').subscribe((msg) => {
          this.error =
            errorMessage === 'search.error.retry' ? msg : errorMessage;
        });

        this.loading = false;
      },
    });
  }

  onSubcategoryFilterChange(subcategoryValue: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.filters.selectedSubcategories.push(subcategoryValue);
      // Drive URL with single subcategory for simplicity
      this.onSubcategoryChange(subcategoryValue);
    } else {
      this.filters.selectedSubcategories =
        this.filters.selectedSubcategories.filter(
          (s) => s !== subcategoryValue
        );
      if (this.filters.selectedSubcategories.length === 0) {
        this.onSubcategoryChange('');
      }
    }
    this.applyFilters();
  }

  onPriceRangeChange() {
    this.applyFilters();
    const { min, max } = this.filters.priceRange;

    // Debounce URL updates to avoid rapid reloads while dragging
    clearTimeout(this.priceDebounceId);
    this.priceDebounceId = setTimeout(() => {
      const patch: any = {
        minPrice: min !== this.filters.minPrice ? min : '',
        maxPrice: max !== this.filters.maxPrice ? max : '',
      };
      this.navigateWith(patch);
    }, 250);
  }

  applyFilters() {
    this.filteredResults = this.results.filter((item) => {
      const subcategoryMatch =
        this.filters.selectedSubcategories.length === 0 ||
        this.filters.selectedSubcategories.includes(item.subcategory || '');

      const priceMatch =
        item.price >= this.filters.priceRange.min &&
        item.price <= this.filters.priceRange.max;

      // Location filter: show nearby only
      const locationMatch =
        !this.filters.showNearby ||
        (item.location.coordinates?.lat && item.location.coordinates?.lng);

      // For now, we'll show services with coordinates when nearby is selected
      // In a real app, you'd get user's location and filter by actual distance
      // const userLat = getUserLocation().lat;
      // const userLon = getUserLocation().lon;
      // const distance = this.calculateDistance(userLat, userLon, item.location.coordinates.lat, item.location.coordinates.lng);
      // const locationMatch = !this.filters.showNearby || distance <= 50; // 50km radius

      // Availability filter: check if service is available on selected date
      const availabilityMatch =
        !this.filters.availableOnDate ||
        (item.availableDates &&
          item.availableDates.some(
            (date) =>
              new Date(date).toDateString() ===
              new Date(this.filters.availableOnDate).toDateString()
          ));

      return (
        subcategoryMatch && priceMatch && locationMatch && availabilityMatch
      );
    });
  }

  calculatePriceRange() {
    if (this.results.length > 0) {
      const prices = this.results.map((item) => item.price ?? 0);
      this.filters.minPrice = Math.min(...prices);
      this.filters.maxPrice = Math.max(...prices);
      // Clamp current range to new bounds
      this.filters.priceRange = {
        min: Math.max(
          this.filters.minPrice,
          this.filters.priceRange.min || this.filters.minPrice
        ),
        max: Math.min(
          this.filters.maxPrice,
          this.filters.priceRange.max || this.filters.maxPrice
        ),
      };
      // Update bounds for slider
      this.priceBounds.min = this.filters.minPrice;
      this.priceBounds.max = this.filters.maxPrice;
    }
  }

  clearFilters() {
    this.filters.selectedSubcategories = [];
    this.filters.priceRange = {
      min: this.filters.minPrice,
      max: this.filters.maxPrice,
    };
    // Reset new filters
    this.filters.showNearby = false;
    this.filters.selectedCity = '';
    this.filters.availableOnDate = '';

    this.filteredResults = this.results;

    // Also clear query params for optional filters (except city if present)
    const patch: any = {
      category: '',
      subcategory: '',
      date: '',
      minCapacity: '',
      maxCapacity: '',
      minPrice: '',
      maxPrice: '',
      nearby: '',
      availableOnDate: '',
    };
    this.navigateWith(patch);
  }

  viewServiceDetails(serviceId: string) {
    this.router.navigate(['/service', serviceId]);
  }

  // Store ratings
  serviceRatings: { [key: string]: string } = {};

  // Improved rating generation with more realistic distribution
  generateStarRating(serviceId: string): string {
    if (!this.serviceRatings[serviceId]) {
      // Generate more realistic ratings: 60% 4-5 stars, 30% 3-4 stars, 10% 2-3 stars
      const rand = Math.random();
      let rating: number;

      if (rand < 0.6) {
        rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
      } else if (rand < 0.9) {
        rating = Math.floor(Math.random() * 2) + 3; // 3-4 stars
      } else {
        rating = Math.floor(Math.random() * 2) + 2; // 2-3 stars
      }

      this.serviceRatings[serviceId] = '⭐'.repeat(rating);
    }
    return this.serviceRatings[serviceId];
  }

  // Get rating value for sorting
  getRatingValue(serviceId: string): number {
    const rating = this.serviceRatings[serviceId];
    return rating ? rating.length : 0;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('placeholder.png')) {
      img.src = 'assets/placeholder.png';
    }
  }

  getCategoryLabel(value: string): string {
    return this.translationService.instant(`categories.${value}`) || value;
  }

  getSubcategoryLabel(value: string): string {
    return this.translationService.instant(`subcategories.${value}`) || value;
  }

  getCityLabel(value: string): string {
    return (
      this.translationService.instant(`cities.${value.toLowerCase()}`) || value
    );
  }

  getSelectedPeopleLabel(): string {
    const min =
      this.currentParams.minCapacity != null
        ? Number(this.currentParams.minCapacity)
        : undefined;
    const max =
      this.currentParams.maxCapacity != null
        ? Number(this.currentParams.maxCapacity)
        : undefined;
    if (min == null && max == null) return '';
    const match = this.peopleRanges.find(
      (r) => r.min === min && r.max === (max ?? null)
    );
    return match?.label || '';
  }

  isRTL(): boolean {
    return this.languageService.isRTL();
  }

  // Check if search results are empty
  hasNoResults(): boolean {
    return !this.loading && !this.error && this.filteredResults.length === 0;
  }

  // Check if there are any results at all
  hasAnyResults(): boolean {
    return this.results.length > 0;
  }

  // Get search summary for display
  getSearchSummary(): string {
    if (this.loading) return '';
    if (this.error) return '';

    if (this.results.length === 0) {
      // Use translated "no results" title to avoid hardcoded English
      return this.translate.instant('search.noResults.title');
    }

    const total = this.results.length;
    const filtered = this.filteredResults.length;

    if (total === filtered) {
      return this.translate.instant('search.foundServices', { count: total });
    } else {
      return this.translate.instant('search.results.showing', {
        filtered,
        total,
      });
    }
  }

  // Mask phone number for security (show only first 3 and last 2 digits)
  maskPhoneNumber(phone: string): string {
    if (!phone || phone.length < 5) return phone;
    const firstThree = phone.substring(0, 3);
    const lastTwo = phone.substring(phone.length - 2);
    const maskedLength = phone.length - 5;
    const maskedPart = '*'.repeat(maskedLength);
    return `${firstThree}${maskedPart}${lastTwo}`;
  }

  // Check if location filter is active
  isLocationFilterActive(): boolean {
    return this.filters.showNearby || this.filters.selectedCity !== '';
  }

  // Check if availability filter is active
  isAvailabilityFilterActive(): boolean {
    return this.filters.availableOnDate !== '';
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  // Convert degrees to radians
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  isContactOnly(service: EventItem): boolean {
    return isContactOnlyService(service.category, service.subcategory);
  }

  openFilters(section: 'all' | 'city' | 'category' | 'date') {
    this.filtersSheetMode = section === 'city' ? 'city' : 'all';
    this.showFilters = true;
    document.body.classList.add('filters-open');
    setTimeout(() => {
      let targetId = '';
      if (section === 'city') targetId = 'fs-city';
      if (section === 'category')
        targetId = this.selectedCategory ? 'fs-subcategory' : 'fs-category';
      if (section === 'date') targetId = 'fs-date';
      if (!targetId) return;
      const el = document.getElementById(targetId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  closeFilters() {
    this.showFilters = false;
    document.body.classList.remove('filters-open');
    this.filtersSheetMode = 'all';
  }

  // Dual slider handlers
  onPriceMinChange(v: string | number) {
    const val = Number(v);
    this.filters.priceRange.min = Math.max(
      this.priceBounds.min,
      Math.min(val, this.filters.priceRange.max)
    );
    this.onPriceRangeChange();
  }
  onPriceMaxChange(v: string | number) {
    const val = Number(v);
    this.filters.priceRange.max = Math.min(
      this.priceBounds.max,
      Math.max(val, this.filters.priceRange.min)
    );
    this.onPriceRangeChange();
  }

  onSortChange(key: 'relevance' | 'priceAsc' | 'priceDesc' | 'rating') {
    this.sortKey = key;
    this.sortResults();
  }

  private sortResults() {
    if (!this.filteredResults) return;

    const byPriceAsc = (a: EventItem, b: EventItem) =>
      (a.price ?? Number.POSITIVE_INFINITY) -
      (b.price ?? Number.POSITIVE_INFINITY);

    const byPriceDesc = (a: EventItem, b: EventItem) =>
      (b.price ?? Number.NEGATIVE_INFINITY) -
      (a.price ?? Number.NEGATIVE_INFINITY);

    const byRating = (a: EventItem, b: EventItem) =>
      this.getRatingValue(b._id) - this.getRatingValue(a._id);

    if (this.sortKey === 'priceAsc')
      this.filteredResults = [...this.filteredResults].sort(byPriceAsc);
    else if (this.sortKey === 'priceDesc')
      this.filteredResults = [...this.filteredResults].sort(byPriceDesc);
    else if (this.sortKey === 'rating')
      this.filteredResults = [...this.filteredResults].sort(byRating);
    else this.filteredResults = [...this.filteredResults]; // relevance - keep original order
  }

  // Icon helper for template
  getServiceIconClass(category?: string, subcategory?: string): string {
    return getServiceIconClass(category, subcategory);
  }

  // Chips helpers
  hasAnyFilters(): boolean {
    return !!(
      this.currentParams.category ||
      this.currentParams.subcategory ||
      this.currentParams.city ||
      this.currentParams.date ||
      this.currentParams.minCapacity ||
      this.currentParams.maxCapacity ||
      this.currentParams.nearby === 'true' ||
      this.currentParams.availableOnDate ||
      this.isPriceRangeChanged()
    );
  }

  isPriceRangeChanged(): boolean {
    return (
      this.filters.priceRange.min !== this.filters.minPrice ||
      this.filters.priceRange.max !== this.filters.maxPrice
    );
  }

  clearCategory() {
    this.onCategoryChange('');
  }
  clearSubcategory() {
    this.onSubcategoryChange('');
  }
  clearCity() {
    this.onCityChange('');
  }
  clearDate() {
    this.onDateChange('');
  }
  clearPeople() {
    this.navigateWith({ minCapacity: '', maxCapacity: '' });
  }
  clearNearby() {
    this.filters.showNearby = false;
    this.navigateWith({ nearby: '' });
  }
  clearAvailableOnDate() {
    this.filters.availableOnDate = '';
    this.navigateWith({ availableOnDate: '' });
  }
  clearPriceRange() {
    this.filters.priceRange = {
      min: this.filters.minPrice,
      max: this.filters.maxPrice,
    };
    this.onPriceRangeChange();
  }
}
