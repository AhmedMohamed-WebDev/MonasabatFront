import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventItem } from '../../core/models/event-item.model';
import { ServiceDetailService } from '../../core/services/ServiceDetails.service';

import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { ContactService } from '../../core/services/contact.service';
import {
  ContactChatService,
  ContactChatAccess,
} from '../../core/services/contact-chat.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { TranslationService } from '../../core/services/translation.service';
import { isContactOnlyService } from '../../core/models/constants/categories.const';
import { NotificationService } from '../../core/services/notification.service';
import { PhoneUtils } from '../../core/utils/phone.utils';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.css'],
})
export class ServiceDetailComponent implements OnInit, OnDestroy {
  service: any = null;
  relatedServices: EventItem[] = [];
  loading = false;
  error: string | null = null;
  serviceId: string = '';
  serviceRating: string = '';

  // Image gallery
  currentImageIndex = 0;
  showImageModal = false;

  // Video gallery
  currentVideoIndex = 0;
  showVideoModal = false;
  activeMediaType: 'image' | 'video' = 'image';

  // Google Maps URLs
  googleMapUrl = '';
  directionUrl = '';

  // Contact chat access
  chatAccess: ContactChatAccess = { canChat: false };
  checkingChatAccess = false;

  // Contact request state
  contactRequestSent = false;
  contactRequestLoading = false;
  contactRequestStatus: 'pending' | 'accepted' | 'rejected' | null = null;
  checkingContactStatus = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceDetailService: ServiceDetailService,

    private chatService: ChatService,
    private authService: AuthService,
    private contactService: ContactService,
    private contactChatService: ContactChatService,
    private translate: TranslateService,
    private languageService: LanguageService,
    private translationService: TranslationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.serviceId = params['id'];
      this.loadServiceDetails();
    });

    // Subscribe to language changes
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateTranslations();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateTranslations() {
    if (this.service) {
      this.service.translatedCategory =
        this.translationService.getTranslatedCategory(this.service.category);
      this.service.translatedLocation =
        this.translationService.getTranslatedCity(this.service.location?.city);
    }
  }

  loadServiceDetails() {
    this.loading = true;
    this.error = null;

    this.serviceDetailService.getServiceById(this.serviceId).subscribe({
      next: (data: any) => {
        console.log('Service detail fetched:', data);
        this.service = data;
        this.serviceRating = this.generateStarRating();
        this.googleMapUrl = data.googleMapUrl || '';
        this.directionUrl = data.directionUrl || '';

        this.updateTranslations();

        // Check chat access if user is authenticated
        if (this.authService.isAuthenticated() && this.service?.supplier?._id) {
          this.checkChatAccess();
          this.checkContactRequestStatus();
        }

        this.loadRelatedServices();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching service details:', error);
        this.error = 'Failed to load service details. Please try again.';
        this.loading = false;
      },
    });
  }

  loadRelatedServices() {
    if (this.service) {
      const searchParams = {
        category: this.service.category,
        minPrice: Math.max(0, this.service.price - 200),
        maxPrice: this.service.price + 200,
      };

      this.serviceDetailService.getRelatedServices(searchParams).subscribe({
        next: (data: EventItem[]) => {
          this.relatedServices = data
            .filter((item) => item._id !== this.service?._id)
            .slice(0, 6);
        },
        error: (error) => {
          console.error('Related services fetch failed:', error);
        },
      });
    }
  }

  // Image gallery methods
  nextImage() {
    if (this.service?.images) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.service.images.length;
    }
  }

  prevImage() {
    if (this.service?.images) {
      this.currentImageIndex =
        this.currentImageIndex === 0
          ? this.service.images.length - 1
          : this.currentImageIndex - 1;
    }
  }

  selectImage(index: number) {
    this.currentImageIndex = index;
  }

  openImageModal() {
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
  }

  // Video gallery methods
  nextVideo() {
    if (this.service?.videos) {
      this.currentVideoIndex =
        (this.currentVideoIndex + 1) % this.service.videos.length;
    }
  }

  prevVideo() {
    if (this.service?.videos) {
      this.currentVideoIndex =
        this.currentVideoIndex === 0
          ? this.service.videos.length - 1
          : this.currentVideoIndex - 1;
    }
  }

  selectVideo(index: number) {
    this.currentVideoIndex = index;
    this.activeMediaType = 'video';
  }

  openVideoModal() {
    this.showVideoModal = true;
    this.activeMediaType = 'video';
  }

  closeVideoModal() {
    this.showVideoModal = false;
    this.activeMediaType = 'image';
  }

  // Navigation methods
  bookNow() {
    this.router.navigate(['/booking', this.serviceId]);
  }

  contactSupplier() {
    if (this.service?.supplier.phone) {
      window.open(`tel:${this.service.supplier.phone}`, '_self');
    }
  }

  viewRelatedService(serviceId: string) {
    this.router.navigate(['/service', serviceId]);
  }

  goBack() {
    window.history.back();
  }

  openGoogleMaps() {
    if (this.googleMapUrl) {
      window.open(this.googleMapUrl, '_blank');
    }
  }

  openDirections() {
    if (this.directionUrl) {
      window.open(this.directionUrl, '_blank');
    }
  }

  // Chat method - simplified
  openChat() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: `/service/${this.serviceId}`,
          action: 'chat',
        },
      });
      return;
    }

    if (!this.service?.supplier) {
      this.notificationService.show(
        'error',
        'Error',
        'No supplier information found'
      );
      return;
    }

    // For bookable services, allow direct chat
    if (this.shouldShowBookingButton()) {
      try {
        this.chatService.connectSocket();
        // Navigate to the dedicated chat page
        this.router.navigate(['/chat', this.service.supplier._id], {
          queryParams: { userName: this.service.supplier.name || 'Supplier' },
        });
        return;
      } catch (error) {
        console.error('Error opening chat:', error);
        this.notificationService.show(
          'error',
          'Error',
          'Failed to open chat. Please try again.'
        );
        return;
      }
    }

    // For contact-only services, check contact request approval
    if (!this.chatAccess.canChat) {
      this.notificationService.show(
        'warning',
        'Chat Not Available',
        this.chatAccess.reason ||
          'You need an approved contact request to chat with this supplier.'
      );
      return;
    }

    try {
      this.chatService.connectSocket();
      // Navigate to the dedicated chat page
      this.router.navigate(['/chat', this.service.supplier._id], {
        queryParams: { userName: this.service.supplier.name || 'Supplier' },
      });
    } catch (error) {
      console.error('Error opening chat:', error);
      this.notificationService.show(
        'error',
        'Error',
        'Failed to open chat. Please try again.'
      );
    }
  }

  // Simplified chat access check
  canChat(): boolean {
    // For bookable services, allow chat if user is authenticated and is a client
    if (this.shouldShowBookingButton()) {
      return (
        this.authService.isAuthenticated() &&
        this.authService.getCurrentUser()?.role === 'client'
      );
    }

    // For contact-only services, require contact request approval
    return (
      this.authService.isAuthenticated() &&
      this.authService.getCurrentUser()?.role === 'client' &&
      this.chatAccess.canChat
    );
  }

  // Check if user can chat with this supplier
  checkChatAccess() {
    if (!this.service?.supplier?._id) return;

    this.checkingChatAccess = true;

    // For bookable services, allow direct chat access
    if (this.shouldShowBookingButton()) {
      this.chatAccess = { canChat: true };
      this.checkingChatAccess = false;
      return;
    }

    // For contact-only services, check contact request approval
    this.contactChatService
      .checkChatAccess(this.service.supplier._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (access) => {
          this.chatAccess = access;
          this.checkingChatAccess = false;
        },
        error: (error) => {
          console.error('Error checking chat access:', error);
          this.checkingChatAccess = false;
          this.chatAccess = { canChat: false, reason: 'Error checking access' };
        },
      });
  }

  // Check contact request status for current user and service
  checkContactRequestStatus() {
    // Skip contact request checking for bookable services
    if (this.shouldShowBookingButton()) {
      return;
    }

    if (
      !this.authService.isAuthenticated() ||
      !this.service?.supplier?._id ||
      !this.service?._id
    ) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.checkingContactStatus = true;

    this.contactService
      .checkContactRequestStatus(
        currentUser.id,
        this.service.supplier._id,
        this.service._id
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.checkingContactStatus = false;
          if (response.status !== 'none') {
            this.contactRequestStatus = response.status;
            this.contactRequestSent = true;

            // If accepted, update chat access
            if (response.status === 'accepted') {
              this.chatAccess = { canChat: true };
            }
          }
        },
        error: (error: any) => {
          console.error('Error checking contact request status:', error);
          this.checkingContactStatus = false;
        },
      });
  }

  // Utility methods
  shouldShowBookingButton(): boolean {
    if (!this.service) return false;
    return !isContactOnlyService(
      this.service.category,
      this.service.subcategory
    );
  }

  formatDate(date: Date | string): string {
    const dateObj = new Date(date);
    const currentLang = this.languageService.getCurrentLanguage();

    if (currentLang === 'ar') {
      return dateObj.toLocaleDateString('ar', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else {
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  private generateStarRating(): string {
    const rating = Math.floor(Math.random() * 2) + 4;
    return '⭐'.repeat(rating);
  }

  // Helper method to get translated category
  getTranslatedCategory(): string {
    return this.service?.category
      ? this.translationService.getTranslatedCategory(this.service.category)
      : '';
  }

  // Helper method to get translated subcategory
  getTranslatedSubcategory(): string {
    return this.service?.subcategory
      ? this.translationService.getTranslatedSubcategory(
          this.service.subcategory
        )
      : '';
  }

  // Helper method to get translated city
  // Update the getTranslatedCity method
  getTranslatedCity(): string {
    if (!this.service?.location?.city) return '';

    const city = this.service.location.city.toLowerCase();

    // Check if it's a Jordanian city
    if (
      [
        'amman',
        'irbid',
        'zarqa',
        'aqaba',
        'salt',
        'madaba',
        'karak',
        'tafilah',
      ].includes(city)
    ) {
      return this.translate.instant(`cities.jordan.${city}`);
    }

    // Check if it's a Kuwaiti city
    if (
      [
        'kuwait_city',
        'ahmadi',
        'hawalli',
        'jahra',
        'farwaniya',
        'mubarak_al_kabeer',
        'salmiya',
        'fahaheel',
      ].includes(city)
    ) {
      return this.translate.instant(`cities.kuwait.${city}`);
    }

    // Fallback to original city name if no translation found
    return this.service.location.city;
  }

  // Phone masking utility
  maskPhoneNumber(phone: string): string {
    return PhoneUtils.maskPhoneNumber(phone);
  }

  // Contact request methods - simplified
  sendContactRequest() {
    // Prevent contact requests for bookable services
    if (this.shouldShowBookingButton()) {
      this.notificationService.show(
        'warning',
        'Not Available',
        'Contact requests are not available for bookable services. Please use the booking form instead.'
      );
      return;
    }

    if (!this.service || !this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: `/service/${this.serviceId}`,
          action: 'contact',
        },
      });
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.error('Error', 'No current user found');
      return;
    }

    this.contactRequestLoading = true;

    const contactRequest = {
      client: currentUser.id,
      supplier: this.service.supplier._id,
      service: this.service._id,
      message: `I'm interested in your ${this.service.name} service. Please contact me for more details.`,
    };

    this.contactService
      .sendContactRequest(contactRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.contactRequestLoading = false;
          if (response.success) {
            this.contactRequestSent = true;
            this.contactRequestStatus = 'pending';

            // Show success notification
            this.notificationService.show(
              'success',
              'Contact Request Sent!',
              'The supplier will contact you soon.'
            );

            // Update chat access to show pending state
            this.chatAccess = {
              canChat: false,
              reason: 'Contact request pending approval',
            };
          } else {
            this.notificationService.show(
              'error',
              'Failed',
              response.message || 'Failed to send contact request'
            );
          }
        },
        error: (error) => {
          this.contactRequestLoading = false;
          console.error('Error sending contact request:', error);

          let errorMessage =
            'Failed to send contact request. Please try again.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.notificationService.show('error', 'Error', errorMessage);
        },
      });
  }

  // Check if user can send contact request
  canSendContactRequest(): boolean {
    // Only allow contact requests for contact-only services
    if (this.shouldShowBookingButton()) {
      return false;
    }

    return (
      this.authService.isAuthenticated() &&
      this.authService.getCurrentUser()?.role === 'client' &&
      !this.contactRequestSent
    );
  }

  // Get tooltip for chat button
  getChatButtonTooltip(): string {
    if (this.checkingChatAccess) {
      return 'Checking chat access...';
    }

    if (!this.authService.isAuthenticated()) {
      return 'Please login to chat with supplier';
    }

    if (this.authService.getCurrentUser()?.role !== 'client') {
      return 'Only clients can chat with suppliers';
    }

    // For bookable services, provide direct chat tooltip
    if (this.shouldShowBookingButton()) {
      return 'Chat with supplier (direct access available)';
    }

    // For contact-only services, check contact request status
    if (this.chatAccess.canChat) {
      return 'Chat with supplier (contact request approved)';
    }

    return this.chatAccess.reason || 'Contact request required to chat';
  }
}
