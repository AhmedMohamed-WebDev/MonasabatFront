import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EventItem } from '../../core/models/event-item.model';
import { AuthService } from '../../core/services/auth.service';
import { BookingFormService } from '../../core/services/booking-form.service';
import { LanguageService } from '../../core/services/language.service';
import { isContactOnlyService } from '../../core/models/constants/categories.const';
import { TranslationService } from '../../core/services/translation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface BookingRequest {
  eventItemId: string;
  eventDate: string;
  numberOfPeople: number;
  phone?: string;
  name?: string;
}

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.css',
})
export class BookingFormComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingFormService);
  private authService = inject(AuthService);
  private languageService = inject(LanguageService);
  private translationService = inject(TranslationService);
  private translate = inject(TranslateService);

  eventItem: EventItem | null = null;
  loading = false;
  submitting = false;
  error = '';
  success = false;

  bookingForm: BookingRequest = {
    eventItemId: '',
    eventDate: '',
    numberOfPeople: 1,
    phone: '',
    name: '',
  };

  isLoggedIn = false;
  currentUser: any = null;

  ngOnInit() {
    this.checkAuthStatus();
    this.loadEventItem();

    // Subscribe to language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
    });
  }

  private updateTranslations() {
    // Any dynamic translations that need to be updated when language changes
    // This can be expanded if needed
  }

  private checkAuthStatus() {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      this.currentUser = this.authService.getCurrentUser();
      if (this.currentUser) {
        this.bookingForm.phone = this.currentUser.phone || '';
        this.bookingForm.name = this.currentUser.name || '';
      }
    }
  }

  private loadEventItem() {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (!eventId) {
      this.router.navigate(['/']);
      return;
    }

    this.loading = true;
    this.bookingForm.eventItemId = eventId;

    this.bookingService.getEventItem(eventId).subscribe({
      next: (item) => {
        this.eventItem = item;
        this.loading = false;

        // Set default number of people to minimum capacity if available, otherwise 1
        const minCap = this.eventItem.minCapacity ?? 1;
        this.bookingForm.numberOfPeople = minCap;
      },
      error: (err) => {
        console.error('Error loading event item:', err);
        // Use translated error message
        this.error = this.translationService.instant(
          'serviceDetails.error.title'
        );
        this.loading = false;
        setTimeout(() => this.router.navigate(['/']), 3000);
      },
    });
  }

  onSubmit() {
    if (!this.isLoggedIn) {
      // Redirect to login with return URL
      const returnUrl = `/booking/${this.bookingForm.eventItemId}`;
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    // Prevent booking for contact-only items (no price provided)
    // If item is contact-only by category, block booking
    const primarySub = this.eventItem
      ? (this.eventItem as any).subcategory
        ? Array.isArray((this.eventItem as any).subcategory)
          ? (this.eventItem as any).subcategory[0]
          : (this.eventItem as any).subcategory
        : undefined
      : undefined;
    const contactOnlyByCategory = this.eventItem
      ? isContactOnlyService(this.eventItem.category, primarySub)
      : false;
    const priceMissing =
      this.eventItem &&
      (this.eventItem.priceAvailable === false ||
        this.eventItem.price === undefined ||
        this.eventItem.price === null ||
        this.eventItem.priceType === 'not_provided');

    if (contactOnlyByCategory || priceMissing) {
      this.error =
        this.translationService.instant('booking.error.priceNotAvailable') ||
        'Price not available for this service. Please contact the supplier.';
      setTimeout(
        () => this.router.navigate(['/service', this.bookingForm.eventItemId]),
        1500
      );
      return;
    }

    this.submitting = true;
    this.error = '';

    const bookingData = {
      eventItemId: this.bookingForm.eventItemId,
      eventDate: this.bookingForm.eventDate,
      numberOfPeople: this.bookingForm.numberOfPeople,
    };

    this.bookingService.createBooking(bookingData).subscribe({
      next: (response) => {
        this.success = true;
        this.submitting = false;

        // Show success message and redirect after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/client-dashboard']);
          // Use translated success message
          const successMessage = this.translationService.instant(
            'booking.success.message'
          );
          alert(successMessage);
        }, 2000);
      },
      error: (err) => {
        console.error('Booking error:', err);
        this.submitting = false;

        if (err.status === 403) {
          this.error = this.translationService.instant(
            'booking.error.limitReached'
          );
        } else if (err.status === 401) {
          this.error = this.translationService.instant(
            'booking.error.loginRequired'
          );
          setTimeout(() => {
            const returnUrl = `/booking/${this.bookingForm.eventItemId}`;
            this.router.navigate(['/login'], { queryParams: { returnUrl } });
          }, 2000);
        } else {
          this.error =
            err.error?.message ||
            this.translationService.instant('booking.error.general');
        }
      },
    });
  }

  private validateForm(): boolean {
    // Check required fields
    if (!this.bookingForm.eventDate) {
      this.error = this.translationService.instant(
        'booking.validation.dateRequired'
      );
      return false;
    }

    if (
      !this.bookingForm.numberOfPeople ||
      this.bookingForm.numberOfPeople < 1
    ) {
      this.error = this.translationService.instant(
        'booking.validation.peopleRequired'
      );
      return false;
    }

    // Check capacity limits only when capacity values are defined on the service
    if (this.eventItem) {
      if (
        this.eventItem.minCapacity != null &&
        this.bookingForm.numberOfPeople < this.eventItem.minCapacity
      ) {
        this.error = this.translationService.instant(
          'booking.validation.minCapacity',
          {
            count: this.eventItem.minCapacity,
          }
        );
        return false;
      }

      if (
        this.eventItem.maxCapacity != null &&
        this.bookingForm.numberOfPeople > this.eventItem.maxCapacity
      ) {
        this.error = this.translationService.instant(
          'booking.validation.maxCapacity',
          {
            count: this.eventItem.maxCapacity,
          }
        );
        return false;
      }
    }

    // Check if selected date is available
    if (this.eventItem && !this.isDateAvailable(this.bookingForm.eventDate)) {
      this.error = this.translationService.instant(
        'booking.validation.dateNotAvailable'
      );
      return false;
    }

    if (!this.bookingForm.phone || this.bookingForm.phone.trim().length < 10) {
      this.error = this.translationService.instant(
        'booking.validation.phoneRequired'
      );
      return false;
    }

    if (!this.bookingForm.name || this.bookingForm.name.trim().length < 2) {
      this.error = this.translationService.instant(
        'booking.validation.nameRequired'
      );
      return false;
    }

    return true;
  }

  isDateAvailable(dateString: string): boolean {
    if (!this.eventItem || !dateString) return false;

    const selectedDate = new Date(dateString);

    // If availableDates exists, check it first
    if (
      this.eventItem.availableDates &&
      this.eventItem.availableDates.length > 0
    ) {
      return this.eventItem.availableDates.some((availableDate) => {
        const available = new Date(availableDate);
        return available.toDateString() === selectedDate.toDateString();
      });
    }

    // Otherwise, check availability.dateRange + excludedDates
    const avail = this.eventItem.availability;
    if (
      avail &&
      avail.dateRange &&
      avail.dateRange.from &&
      avail.dateRange.to
    ) {
      const from = new Date(avail.dateRange.from);
      const to = new Date(avail.dateRange.to);
      const excluded = (avail.excludedDates || []).map((d) =>
        new Date(d).toDateString()
      );

      if (selectedDate >= from && selectedDate <= to) {
        return !excluded.includes(selectedDate.toDateString());
      }
    }

    return false;
  }

  getFormattedDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  calculateDepositAmount(): number {
    const price =
      this.eventItem && this.eventItem.price != null ? this.eventItem.price : 0;
    return price * 0.1;
  }

  goBack() {
    if (this.eventItem) {
      this.router.navigate(['/service', this.eventItem._id]);
    } else {
      this.router.navigate(['/']);
    }
  }

  // Helper method to get translated category
  getTranslatedCategory(category: string): string {
    return this.translationService.getTranslatedCategory(category);
  }

  // Helper method to get translated city
  getTranslatedCity(city: string): string {
    return this.translationService.getTranslatedCity(city);
  }

  // Helper method to check if current language is RTL
  isRTL(): boolean {
    return this.languageService.isRTL();
  }

  // Capacity helpers to simplify template bindings and avoid template type errors
  get minCapacity(): number {
    return this.eventItem && this.eventItem.minCapacity != null
      ? this.eventItem.minCapacity
      : 1;
  }

  get maxCapacityNumeric(): number {
    // Used for numeric [max] binding; provide a reasonable upper bound if not specified
    return this.eventItem && this.eventItem.maxCapacity != null
      ? this.eventItem.maxCapacity
      : 1000;
  }

  get maxCapacityDisplay(): string {
    return this.eventItem && this.eventItem.maxCapacity != null
      ? String(this.eventItem.maxCapacity)
      : '∞';
  }

  hasCapacityInfo(): boolean {
    return !!(
      this.eventItem &&
      (this.eventItem.minCapacity != null || this.eventItem.maxCapacity != null)
    );
  }
}
