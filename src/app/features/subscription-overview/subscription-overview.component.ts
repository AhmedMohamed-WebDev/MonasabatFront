import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../../core/services/subscription.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  SupplierSubscription,
  SubscriptionStats,
} from '../../core/models/subscription.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface SubscriptionOverviewViewModel {
  contactsUsed: number;
  contactLimit: number;
  type: string;
  expiryDate: string;
  status: string;
}

@Component({
  selector: 'app-subscription-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './subscription-overview.component.html',
  styleUrls: ['./subscription-overview.component.css'],
})
export class SubscriptionOverviewComponent implements OnInit {
  subscription?: SupplierSubscription;
  stats?: SubscriptionStats;
  loading = true;
  error = '';

  overviewModel?: SubscriptionOverviewViewModel;

  constructor(
    private subscriptionService: SubscriptionService,
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadSubscriptionData();
  }

  private loadSubscriptionData(): void {
    this.loading = true;
    this.error = '';

    this.subscriptionService.getCurrentSubscription().subscribe({
      next: (subscription) => {
        this.subscription = subscription;
        this.tryBuildOverviewModel();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load subscription data';
        this.loading = false;
        console.error('Subscription error:', err);
      },
    });

    this.subscriptionService.getSubscriptionStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.tryBuildOverviewModel();
      },
      error: (err) => {
        console.error('Stats error:', err);
      },
    });
  }

  private tryBuildOverviewModel(): void {
    if (!this.subscription || !this.stats) return;

    const contactLimit = this.stats.maxContacts || 50;
    const contactsUsed = this.stats.currentContacts || 0;

    this.overviewModel = {
      contactsUsed,
      contactLimit,
      type: this.subscription.type,
      expiryDate: this.subscription.expiryDate,
      status: this.subscription.status,
    };
  }

  getProgressBarClass(): string {
    if (!this.stats) return 'bg-secondary';

    const percentage = this.stats.usagePercentage;
    if (percentage > 90) return 'bg-danger';
    if (percentage > 75) return 'bg-warning';
    return 'bg-success';
  }

  handleRenewClick(): void {
    if (
      confirm(this.translate.instant('supplier.subscription.confirm.renew'))
    ) {
      const planType = this.subscription?.type || 'basic';
      this.subscriptionService.renewSubscription(planType).subscribe({
        next: (response) => {
          if (response.success && response.subscription) {
            this.subscription = response.subscription;
            this.tryBuildOverviewModel();
            this.notificationService.success(
              this.translate.instant('supplier.subscription.success.renewed'),
              this.translate.instant('supplier.subscription.success.renewed')
            );
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
        },
        error: (err) => {
          console.error('Renewal error:', err);
          this.notificationService.error(
            this.translate.instant('supplier.subscription.error.renewFailed'),
            this.translate.instant('supplier.subscription.error.renewFailed')
          );
        },
      });
    }
  }

  handlePlanChange(newPlanType: 'basic' | 'premium' | 'enterprise'): void {
    if (
      confirm(
        this.translate.instant('supplier.subscription.confirm.changePlan', {
          plan: newPlanType,
        })
      )
    ) {
      this.subscriptionService.renewSubscription(newPlanType).subscribe({
        next: (response) => {
          if (response.success && response.subscription) {
            this.subscription = response.subscription;
            this.tryBuildOverviewModel();
            this.notificationService.success(
              this.translate.instant(
                'supplier.subscription.success.planChanged',
                { plan: newPlanType }
              ),
              this.translate.instant(
                'supplier.subscription.success.planChanged',
                { plan: newPlanType }
              )
            );
          } else {
            this.notificationService.error(
              response.message ||
                this.translate.instant(
                  'supplier.subscription.error.changePlanFailed'
                ),
              response.message ||
                this.translate.instant(
                  'supplier.subscription.error.changePlanFailed'
                )
            );
          }
        },
        error: (err) => {
          console.error('Plan change error:', err);
          this.notificationService.error(
            this.translate.instant(
              'supplier.subscription.error.changePlanFailed'
            ),
            this.translate.instant(
              'supplier.subscription.error.changePlanFailed'
            )
          );
        },
      });
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
