import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { TranslationService } from '../../core/services/translation.service';
import {
  EVENT_CATEGORIES,
  CategoryConfig,
} from '../../core/models/constants/categories.const';
import { CATEGORY_TO_SUBCATEGORY_FALLBACK } from '../../core/models/constants/categories.const';
import { CLIENT_MAIN_CATEGORIES } from '../../core/models/constants/categories.const';
import { getServiceIconClass } from '../../core/models/constants/categories.const';
import { SearchService } from '../../core/services/search-result.service';
import { forkJoin } from 'rxjs';

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
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('searchModal') searchModal!: ElementRef;

  private destroy$ = new Subject<void>();

  // Search form data
  searchForm = {
    city: 'ALL',
    eventType: '',
    people: '',
    date: '',
  };

  // Modal state
  isSearchModalOpen = false;

  // Data for dropdowns
  cities = [
    'Amman',
    'Irbid',
    'Zarqa',
    'Aqaba',
    'Salt',
    'Madaba',
    'Karak',
    'Tafilah',
  ];

  // Translated cities for display
  translatedCities: TranslatedCity[] = [];

  // Event categories with translations
  eventCategories: CategoryConfig[] = [];

  peopleRanges: PeopleRange[] = [];

  // Popular categories for quick access
  popularCategories = ['wedding', 'farm'];

  isAuthenticated = false;
  currentUser: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private translationService: TranslationService,
    public languageService: LanguageService,
    private translate: TranslateService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        this.isAuthenticated = !!user;
      });

    // Wait for translations to be loaded before initial update
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateTranslations();
    });

    // Initial load
    this.translate.get('header.brandName').subscribe(() => {
      this.updateTranslations();
    });

    // Add escape key listener for modal
    document.addEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  private handleEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isSearchModalOpen) {
      this.closeSearchModal();
    }
  }

  private updateTranslations() {
    // Get translated categories
    this.eventCategories = this.translationService.getTranslatedCategories();

    // Update translated cities
    this.translatedCities = this.cities.map((city) => ({
      original: city,
      translated: this.translate.instant(`cities.${city.toLowerCase()}`),
    }));

    // Update people ranges with translations
    this.peopleRanges = this.translationService.getTranslatedPeopleRanges();

    // Refresh top categories dynamically
    this.refreshTopCategories();
  }

  // Modal methods
  openSearchModal() {
    this.isSearchModalOpen = true;
    document.body.classList.add('modal-open');
    // Focus on first input after modal opens
    setTimeout(() => {
      const firstInput = document.querySelector(
        '.search-modal input, .search-modal select'
      ) as HTMLElement;
      firstInput?.focus();
    }, 100);
  }

  closeSearchModal() {
    this.isSearchModalOpen = false;
    document.body.classList.remove('modal-open');
  }

  onModalBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeSearchModal();
    }
  }

  // Category selection handling
  onCategoryChange() {
    // Remove subcategory logic, just keep category selection logic if needed
  }

  // Quick category selection
  selectCategory(categoryValue: string) {
    const fallbackSub = CATEGORY_TO_SUBCATEGORY_FALLBACK[categoryValue];
    const queryParams = fallbackSub
      ? { subcategory: fallbackSub }
      : { category: categoryValue };
    this.router.navigate(['/search-results'], { queryParams });
  }

  onSearchSubmit() {
    const selectedRange = this.peopleRanges.find(
      (range) => range.label === this.searchForm.people
    );

    const queryParams: any = {};

    if (this.searchForm.city && this.searchForm.city !== 'ALL') {
      queryParams.city = this.searchForm.city;
    }

    if (this.searchForm.eventType) {
      queryParams.category = this.searchForm.eventType;
    }

    if (this.searchForm.date) {
      queryParams.date = this.searchForm.date;
    }

    if (selectedRange) {
      queryParams.minCapacity = selectedRange.min;
      queryParams.maxCapacity = selectedRange.max;
    }

    this.closeSearchModal();
    this.router.navigate(['/search-results'], { queryParams });
  }

  navigateToVendorJoin() {
    this.router.navigate(['/join']);
  }

  getDashboardLink(): string {
    if (!this.currentUser) return '/';

    switch (this.currentUser.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'supplier':
        return '/supplier-dashboard';
      default:
        return '/client-dashboard';
    }
  }

  logout() {
    const confirmMessage =
      this.languageService.getCurrentLanguage() === 'ar'
        ? 'هل أنت متأكد من أنك تريد تسجيل الخروج؟'
        : 'Are you sure you want to logout?';

    if (confirm(confirmMessage)) {
      this.authService.logout();
    }
  }

  getCategoryIcon(categoryValue: string): string {
    return getServiceIconClass(categoryValue);
  }

  // Compute dynamic top categories based on available services
  private refreshTopCategories() {
    const candidates = CLIENT_MAIN_CATEGORIES;
    const counts: { [key: string]: number } = {};

    // Query count by trying category first; if none, try mapped subcategory
    candidates.forEach((cat) => (counts[cat] = 0));

    const requests = candidates.map((cat) => {
      const fallbackSub = CATEGORY_TO_SUBCATEGORY_FALLBACK[cat];
      const params: any = fallbackSub
        ? { subcategory: fallbackSub }
        : { category: cat };
      return this.searchService.searchEvents(params);
    });

    // Fire all requests and update once they return
    forkJoin(requests).subscribe({
      next: (results) => {
        results.forEach((arr: any[], idx) => {
          const cat = candidates[idx];
          counts[cat] = Array.isArray(arr) ? arr.length : 0;
        });
        // Threshold logic: include categories with any results; fallback to first few if none
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([k]) => k);
        const nonZero = sorted.filter((k) => counts[k] > 0);
        this.popularCategories = (nonZero.length > 0 ? nonZero : sorted).slice(
          0,
          6
        );
      },
      error: () => {
        // On failure, fall back to default shortlist
        this.popularCategories = [
          'halls',
          'photographers',
          'hospitality',
          'chairs',
          'tables',
          'flowers',
        ];
      },
    });
  }

  // Scroll to section
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
