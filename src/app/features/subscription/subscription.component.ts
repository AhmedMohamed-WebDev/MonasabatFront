import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SubscriptionService } from '../../core/services/subscription.service';
import { NotificationService } from '../../core/services/notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  SupplierSubscription,
  SubscriptionStats,
  SubscriptionPlan,
  RenewSubscriptionRequest,
} from '../../core/models/subscription.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css'],
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  subscription: SupplierSubscription | null = null;
  stats: SubscriptionStats | null = null;
  availablePlans: SubscriptionPlan[] = [];
  isLoading = true;
  isRenewing = false;
  selectedPlan: string | null = null;
  showPlanSelection = false;

  private destroy$ = new Subject<void>();

  constructor(
    private subscriptionService: SubscriptionService,
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadSubscriptionData();
    this.loadAvailablePlans();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSubscriptionData(): void {
    this.isLoading = true;

    // Load current subscription
    this.subscriptionService
      .getCurrentSubscription()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.subscription = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading subscription:', error);
          this.notificationService.error(
            this.translate.instant('supplier.subscription.error.loadFailed'),
            this.translate.instant('supplier.subscription.error.loadFailed')
          );
          this.isLoading = false;
        },
      });

    // Load subscription stats
    this.subscriptionService
      .getSubscriptionStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading subscription stats:', error);
        },
      });
  }

  loadAvailablePlans(): void {
    this.subscriptionService
      .getAvailablePlans()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (plans) => {
          this.availablePlans = plans;
        },
        error: (error) => {
          console.error('Error loading available plans:', error);
        },
      });
  }

  renewSubscription(): void {
    if (!this.selectedPlan) {
      this.notificationService.warning(
        this.translate.instant('supplier.subscription.warning.selectPlan'),
        this.translate.instant('supplier.subscription.warning.selectPlan')
      );
      return;
    }

    this.isRenewing = true;
    const request: RenewSubscriptionRequest = {
      planType: this.selectedPlan as any,
    };

    this.subscriptionService
      .renewSubscription(request.planType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success(
              this.translate.instant('supplier.subscription.success.renewed'),
              this.translate.instant('supplier.subscription.success.renewed')
            );
            this.subscription = response.subscription || null;
            this.showPlanSelection = false;
            this.selectedPlan = null;
            this.loadSubscriptionData(); // Reload data
          } else {
            this.notificationService.error(
              response.message ||
                this.translate.instant(
                  'supplier.subscription.error.renewFailed'
                ),
              response.message ||
                this.translate.instant(
                  'supplier.subscription.error.renewFailed'
                )
            );
          }
          this.isRenewing = false;
        },
        error: (error) => {
          console.error('Error renewing subscription:', error);
          this.notificationService.error(
            this.translate.instant('supplier.subscription.error.renewFailed'),
            this.translate.instant('supplier.subscription.error.renewFailed')
          );
          this.isRenewing = false;
        },
      });
  }

  toggleAutoRenew(): void {
    this.subscriptionService
      .toggleAutoRenew()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.subscription) {
            this.subscription.autoRenew = response.autoRenew;
          }
          this.notificationService.success(
            this.translate.instant(
              'supplier.subscription.success.autoRenewUpdated'
            ),
            this.translate.instant(
              'supplier.subscription.success.autoRenewUpdated'
            )
          );
        },
        error: (error) => {
          console.error('Error toggling auto-renew:', error);
          this.notificationService.error(
            this.translate.instant(
              'supplier.subscription.error.autoRenewFailed'
            ),
            this.translate.instant(
              'supplier.subscription.error.autoRenewFailed'
            )
          );
        },
      });
  }

  selectPlan(planType: string): void {
    this.selectedPlan = planType;
  }

  showPlanSelectionModal(): void {
    this.showPlanSelection = true;
  }

  hidePlanSelectionModal(): void {
    this.showPlanSelection = false;
    this.selectedPlan = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'expired':
        return 'status-expired';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-inactive';
    }
  }

  getWarningClass(warningType?: string): string {
    switch (warningType) {
      case 'near-limit':
        return 'warning-near-limit';
      case 'expiring':
        return 'warning-expiring';
      case 'locked':
        return 'warning-locked';
      default:
        return '';
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(this.translate.currentLang, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat(this.translate.currentLang, {
      style: 'currency',
      currency: 'JOD',
    }).format(amount);
  }

  getUsagePercentage(): number {
    if (!this.stats) return 0;
    return Math.min(this.stats.usagePercentage, 100);
  }

  isNearLimit(): boolean {
    return this.stats?.warningType === 'near-limit';
  }

  isExpiring(): boolean {
    return this.stats?.warningType === 'expiring';
  }

  isLocked(): boolean {
    return this.stats?.warningType === 'locked';
  }

  getSelectedPlan(): SubscriptionPlan | null {
    if (!this.selectedPlan) return null;
    return (
      this.availablePlans.find((plan) => plan.type === this.selectedPlan) ||
      null
    );
  }

  getProgressBarClass(): string {
    if (!this.stats) return 'bg-secondary';
    const percentage = this.stats.usagePercentage;
    if (percentage > 90) return 'bg-danger';
    if (percentage > 75) return 'bg-warning';
    return 'bg-success';
  }

  getWarningIcon(warningType?: string): string {
    switch (warningType) {
      case 'near-limit':
        return 'bi-exclamation-triangle';
      case 'expiring':
        return 'bi-clock';
      case 'locked':
        return 'bi-lock-fill';
      default:
        return 'bi-exclamation-triangle';
    }
  }
  // Add this method to the SubscriptionOverviewComponent class
  getWarningMessage(stats: SubscriptionStats): string {
    if (!stats.hasWarning) return '';

    if (stats.warningType === 'locked') {
      return this.translate.instant('supplier.subscription.warnings.locked');
    }

    if (stats.warningType === 'near-limit') {
      return this.translate.instant(
        'supplier.subscription.warnings.nearLimit',
        {
          current: stats.currentContacts,
          max: stats.maxContacts,
        }
      );
    }

    if (stats.warningType === 'expiring' && stats.currentContacts > 0) {
      return this.translate.instant('supplier.subscription.warnings.expiring', {
        days: stats.daysUntilExpiry,
      });
    }

    return '';
  }
}
