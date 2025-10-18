import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  getServiceIconClass,
  CATEGORY_TO_SUBCATEGORY_FALLBACK,
  CategoryConfig,
  getServiceCategoriesForEventType,
} from '../../core/models/constants/categories.const';
import { TranslationService } from '../../core/services/translation.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-all-services',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <section class="services-section py-5">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="section-title">
            {{
              selectedEventTypeLabel
                ? selectedEventTypeLabel + ' ' + ('home.services' | translate)
                : ('home.allServices' | translate)
            }}
          </h2>
          <p class="section-subtitle text-muted">
            {{
              selectedEventTypeLabel
                ? ('home.servicesSubtitle' | translate)
                : ('home.allServicesSubtitle' | translate)
            }}
          </p>
        </div>
        <div class="row g-4">
          <div
            class="col-6 col-md-4 col-lg-3"
            *ngFor="let category of eventCategories"
          >
            <div
              class="service-card text-center"
              (click)="selectCategory(category.value)"
            >
              <div class="service-icon">
                <i [class]="getCategoryIcon(category.value)"></i>
              </div>
              <h6 class="service-title">{{ category.label }}</h6>
              <div class="service-count">
                {{ category.subcategories.length }}
                {{ 'home.services' | translate }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['../home/home.component.css'],
})
export class AllServicesComponent implements OnInit, OnDestroy {
  eventCategories: CategoryConfig[] = [];
  allCategories: CategoryConfig[] = [];
  selectedEventTypeLabel: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private translationService: TranslationService,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.updateTranslations();
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateTranslations();
    });

    // React to query param changes (eventType) to filter shown categories
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((qp) => {
      const eventType = qp['eventType'];
      this.applyEventTypeFilter(eventType);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateTranslations() {
    // Keep a copy of all translated service categories then apply any active filter
    // Use service categories as the page should list service groups
    this.allCategories =
      this.translationService.getTranslatedServiceCategories();
    this.eventCategories = [...this.allCategories];

    // If there's an eventType in the current route, set selectedEventTypeLabel accordingly
    const currentEventType = this.route.snapshot.queryParams['eventType'];
    if (currentEventType) {
      const found = this.allCategories.find(
        (c) => c.value === currentEventType
      );
      this.selectedEventTypeLabel = found ? found.label : null;
    } else {
      this.selectedEventTypeLabel = null;
    }
  }

  getCategoryIcon(categoryValue: string): string {
    return getServiceIconClass(categoryValue);
  }

  selectCategory(categoryValue: string) {
    // If this page was opened from an eventType (e.g. user clicked "Wedding" -> All Services),
    // treat clicked card as a top-level service category and query by `category=` so the
    // backend receives `category=<value>` and returns matching items.
    const openedWithEventType = !!this.route.snapshot.queryParams['eventType'];
    if (openedWithEventType) {
      this.router.navigate(['/search-results'], {
        queryParams: { category: categoryValue },
      });
      return;
    }

    // Otherwise preserve legacy behavior for direct navigation: prefer subcategory fallback
    // for top-level categories that correspond to legacy subcategory names.
    const fallbackSub = CATEGORY_TO_SUBCATEGORY_FALLBACK[categoryValue];
    const queryParams = fallbackSub
      ? { subcategory: fallbackSub }
      : { category: categoryValue };
    this.router.navigate(['/search-results'], { queryParams });
  }

  private applyEventTypeFilter(eventType?: string) {
    if (!eventType) {
      this.eventCategories = [...this.allCategories];
      this.selectedEventTypeLabel = null;
      return;
    }

    // Prefer explicit mapping defined in categories.const.ts
    const mapped = getServiceCategoriesForEventType(eventType);
    if (!mapped || mapped.length === 0) {
      // nothing mapped => show all
      this.eventCategories = [...this.allCategories];
      return;
    }

    const filtered = this.allCategories.filter((cat) => {
      if (mapped.includes(cat.value)) return true;
      const fallback = CATEGORY_TO_SUBCATEGORY_FALLBACK[cat.value];
      if (fallback && mapped.includes(fallback)) return true;
      // also if any of the cat.subcategories intersects with mapped values
      if (
        cat.subcategories &&
        cat.subcategories.some((s) => mapped.includes(s.value))
      )
        return true;
      return false;
    });

    this.eventCategories =
      filtered.length > 0 ? filtered : [...this.allCategories];

    // Set translated label for header
    const found = this.allCategories.find((c) => c.value === eventType);
    this.selectedEventTypeLabel = found ? found.label : null;
  }
}
