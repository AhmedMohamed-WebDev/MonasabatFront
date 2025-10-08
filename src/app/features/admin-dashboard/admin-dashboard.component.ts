// src/app/features/admin/admin-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AdminStats, JoinRequest } from '../../core/models/admin.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../core/services/translation.service';
import { LanguageService } from '../../core/services/language.service';
import { ContactMessage } from '../../core/models/contact.model';
import { forkJoin } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats | null = null;
  joinRequests: JoinRequest[] = [];
  loading = true;
  error = '';
  selectedTab = 'overview';

  // Contact messages property
  contactMessages: ContactMessage[] = [];

  // Contact info array
  contactInfoArray = [
    {
      icon: 'bi bi-geo-alt',
      type: 'address',
    },
    {
      icon: 'bi bi-telephone',
      type: 'phone',
    },
    {
      icon: 'bi bi-envelope',
      type: 'email',
    },
  ];

  // Property to track unlocking state
  unlockingSupplier: string | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private languageService: LanguageService,
    private notificationService: NotificationService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    // Use forkJoin to handle multiple requests
    forkJoin({
      stats: this.adminService.getAdminStats(),
      requests: this.adminService.getJoinRequests(),
      messages: this.adminService.getContactMessages(),
    }).subscribe({
      next: (data: any) => {
        this.stats = data.stats;
        this.joinRequests = data.requests;
        // Ensure messages is an array
        this.contactMessages = Array.isArray(data.messages.messages)
          ? data.messages.messages
          : [];

        // Update unread count in notification service
        this.updateUnreadContactMessagesCount();

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data';
        this.loading = false;
        console.error('Dashboard error:', err);
      },
    });
  }

  // Get unread contact messages count for badge
  getUnreadContactMessagesCount(): number {
    return this.contactMessages.filter(
      (message) => message.status === 'pending'
    ).length;
  }

  // Update unread count in notification service
  private updateUnreadContactMessagesCount(): void {
    const unreadCount = this.getUnreadContactMessagesCount();
    this.notificationService.setUnreadCount(
      'adminContactMessages',
      unreadCount
    );
  }

  // Mark contact message as read
  markContactMessageAsRead(messageId: string): void {
    // Find the message and mark it as read
    const message = this.contactMessages.find((msg) => msg._id === messageId);
    if (message && message.status === 'pending') {
      message.status = 'read';
      // Update unread count
      this.updateUnreadContactMessagesCount();
    }
  }

  // Mark all contact messages as read
  markAllContactMessagesAsRead(): void {
    this.contactMessages.forEach((message) => {
      if (message.status === 'pending') {
        message.status = 'read';
      }
    });
    // Update unread count
    this.updateUnreadContactMessagesCount();
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  approveRequest(request: JoinRequest): void {
    this.translate
      .get('adminDashboard.requests.confirmation.approve')
      .subscribe((msg: string) => {
        if (confirm(msg)) {
          this.adminService.approveJoinRequest(request._id).subscribe({
            next: (response) => {
              request.status = 'approved';
              this.translate
                .get('adminDashboard.requests.confirmation.success.approved', {
                  name: request.name,
                })
                .subscribe((successMsg: string) => {
                  this.showSuccessMessage(successMsg);
                });
            },
            error: (err) => {
              console.error('Approve error:', err);
              this.translate
                .get('adminDashboard.requests.confirmation.error.approve')
                .subscribe((errorMsg: string) => {
                  this.showErrorMessage(errorMsg);
                });
            },
          });
        }
      });
  }

  rejectRequest(request: JoinRequest): void {
    this.translate
      .get('adminDashboard.requests.confirmation.reject')
      .subscribe((msg: string) => {
        if (confirm(msg)) {
          this.adminService.rejectJoinRequest(request._id).subscribe({
            next: (response) => {
              request.status = 'rejected';
              this.translate
                .get('adminDashboard.requests.confirmation.success.rejected')
                .subscribe((successMsg: string) => {
                  this.showSuccessMessage(successMsg);
                });
            },
            error: (err) => {
              console.error('Reject error:', err);
              this.translate
                .get('adminDashboard.requests.confirmation.error.reject')
                .subscribe((errorMsg: string) => {
                  this.showErrorMessage(errorMsg);
                });
            },
          });
        }
      });
  }

  markAsReviewed(request: JoinRequest): void {
    this.adminService.markAsReviewed(request._id).subscribe({
      next: (response) => {
        request.status = 'reviewed';
        this.translate
          .get('adminDashboard.requests.confirmation.success.reviewed')
          .subscribe((successMsg: string) => {
            this.showSuccessMessage(successMsg);
          });
      },
      error: (err) => {
        console.error('Review error:', err);
        this.translate
          .get('adminDashboard.requests.confirmation.error.review')
          .subscribe((errorMsg: string) => {
            this.showErrorMessage(errorMsg);
          });
      },
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'reviewed':
        return 'badge bg-info';
      case 'approved':
        return 'badge bg-success';
      case 'rejected':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getPendingRequests(): JoinRequest[] {
    return this.joinRequests.filter((req) => req.status === 'pending');
  }

  getReviewedRequests(): JoinRequest[] {
    return this.joinRequests.filter((req) => req.status === 'reviewed');
  }

  logout() {
    this.translate
      .get('adminDashboard.header.logoutConfirm')
      .subscribe((msg: string) => {
        if (confirm(msg)) {
          this.authService.logout();
          this.router.navigate(['/']);
        }
      });
  }

  // Unlock supplier method
  unlockSupplier(supplierId: string): void {
    if (this.unlockingSupplier) return;

    this.unlockingSupplier = supplierId;
    this.adminService.unlockSupplier(supplierId).subscribe({
      next: () => {
        // Remove supplier from locked list
        if (this.stats?.lockedSuppliers) {
          this.stats.lockedSuppliers = this.stats.lockedSuppliers.filter(
            (s) => s._id !== supplierId
          );
        }
        this.translate
          .get('adminDashboard.locked.success')
          .subscribe((msg: string) => {
            this.showSuccessMessage(msg);
          });
        this.unlockingSupplier = null;
      },
      error: (err) => {
        console.error('Unlock error:', err);
        this.translate
          .get('adminDashboard.locked.error')
          .subscribe((msg: string) => {
            this.showErrorMessage(msg);
          });
        this.unlockingSupplier = null;
      },
    });
  }

  // Message management methods
  getMessageStatusBadge(status: string): string {
    return `badge ${
      status === 'pending' ? 'bg-warning text-dark' : 'bg-success'
    }`;
  }

  viewMessageDetails(message: ContactMessage): void {
    const details = `
      ${this.translate.instant('adminDashboard.messages.table.name')}: ${
      message.name
    }
      ${this.translate.instant('adminDashboard.messages.table.email')}: ${
      message.email
    }
      ${this.translate.instant('adminDashboard.messages.table.message')}:
      ${message.message}
    `;
    // Replace with proper modal implementation
    alert(details);
  }

  markMessageAsRead(message: ContactMessage): void {
    this.adminService.markContactMessageAsRead(message._id).subscribe({
      next: () => {
        message.status = 'read';
        this.translate
          .get('adminDashboard.messages.marked.success')
          .subscribe((msg: string) => {
            this.showSuccessMessage(msg);
          });
      },
      error: (err) => {
        console.error('Mark as read error:', err);
        this.translate
          .get('adminDashboard.messages.marked.error')
          .subscribe((msg: string) => {
            this.showErrorMessage(msg);
          });
      },
    });
  }

  // Private helper methods
  private showSuccessMessage(message: string): void {
    // Create a temporary success notification
    const notification = document.createElement('div');
    notification.className =
      'alert alert-success alert-dismissible fade show position-fixed';
    notification.style.cssText =
      'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
      <i class="bi bi-check-circle me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  }

  private showErrorMessage(message: string): void {
    // Create a temporary error notification
    const notification = document.createElement('div');
    notification.className =
      'alert alert-danger alert-dismissible fade show position-fixed';
    notification.style.cssText =
      'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
      <i class="bi bi-exclamation-triangle me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 8000);
  }

  // Translate a serviceType which may contain commas or be a category value
  translateServiceType(serviceType?: string): string {
    if (!serviceType) return '';
    // Some requests may send comma-separated values; handle them
    const parts = serviceType
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    const translated = parts.map((part) => {
      // normalize part to match translation keys: lowercased, spaces/underscores -> hyphen
      const normalized = part.toLowerCase().replace(/[\s_]+/g, '-');

      // Try both categories and subcategories keys (some entries live under subcategories)
      const catKey = `categories.${normalized}`;
      const subKey = `subcategories.${normalized}`;

      const tCat = this.translate.instant(catKey);
      if (tCat && tCat !== catKey) return tCat;

      const tSub = this.translate.instant(subKey);
      if (tSub && tSub !== subKey) return tSub;

      // As a last try, also check underscore variant
      const underscore = normalized.replace(/-/g, '_');
      const tCatUnd = this.translate.instant(`categories.${underscore}`);
      if (tCatUnd && tCatUnd !== `categories.${underscore}`) return tCatUnd;

      const tSubUnd = this.translate.instant(`subcategories.${underscore}`);
      if (tSubUnd && tSubUnd !== `subcategories.${underscore}`) return tSubUnd;

      // Fallback to the original raw part if no translation found
      return part;
    });
    return translated.join(', ');
  }

  // Translate a city value using TranslationService helper
  translateCity(city?: string): string {
    if (!city) return '';
    return this.translationService.getTranslatedCity(city) || city;
  }
}

// Helper methods moved below component for template usage
