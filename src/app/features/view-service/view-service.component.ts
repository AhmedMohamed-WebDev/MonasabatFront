import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EventItemService } from '../../core/services/event-item.service';
import { EventItem } from '../../core/models/event-item.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../core/services/notification.service';
import {
  isContactOnlyService,
  getServiceIconClass,
} from '../../core/models/constants/categories.const';

@Component({
  selector: 'app-view-service',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './view-service.component.html',
  styleUrls: ['./view-service.component.css'],
})
export class ViewServiceComponent implements OnInit {
  service: EventItem | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private eventItemService: EventItemService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadService(id);
    }
  }

  loadService(id: string) {
    this.isLoading = true;
    this.error = null;

    this.eventItemService.getEventItemById(id).subscribe({
      next: (data) => {
        this.service = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = this.translate.instant('viewService.error.loadFailed');
        this.isLoading = false;
        console.error('Service loading error:', error);
        this.notificationService.error(
          this.translate.instant('viewService.error.loadFailed'),
          this.translate.instant('viewService.error.loadFailed')
        );
      },
    });
  }

  deleteService() {
    if (!this.service?._id) return;

    if (confirm(this.translate.instant('viewService.delete.confirmation'))) {
      this.eventItemService.deleteEventItem(this.service._id).subscribe({
        next: () => {
          this.notificationService.success(
            this.translate.instant('viewService.delete.success'),
            this.translate.instant('viewService.delete.success')
          );
          this.router.navigate(['/supplier-dashboard']);
        },
        error: (error) => {
          this.notificationService.error(
            this.translate.instant('viewService.delete.error'),
            this.translate.instant('viewService.delete.error')
          );
          console.error('Delete error:', error);
        },
      });
    }
  }

  formatCurrency(amount: number): string {
    return `${amount} JD`;
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

  isContactOnlyService(): boolean {
    if (!this.service) return false;
    return isContactOnlyService(
      this.service.category,
      this.service.subcategory
    );
  }

  getServiceIconClass(): string {
    if (!this.service) return 'fas fa-tag';
    return getServiceIconClass(this.service.category, this.service.subcategory);
  }

  goBack(): void {
    this.router.navigate(['/supplier-dashboard']);
  }
}
