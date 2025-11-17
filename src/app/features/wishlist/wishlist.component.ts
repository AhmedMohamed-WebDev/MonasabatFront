import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WishlistService } from '../../core/services/wishlist.service';
import { EventItemService } from '../../core/services/event-item.service';

@Component({
  standalone: true,
  selector: 'app-wishlist',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit {
  loading = true;
  error: string | null = null;
  services: any[] = [];

  constructor(
    private wishlistService: WishlistService,
    private eventItemService: EventItemService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist() {
    this.loading = true;
    this.error = null;
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        this.services = res.services || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load wishlist', err);
        this.error =
          this.translate.instant('common.error') || 'Failed to load wishlist';
        this.loading = false;
      },
    });
  }

  viewService(id: string) {
    this.router.navigate(['/service', id]);
  }

  remove(serviceId: string) {
    this.wishlistService.removeFromWishlist(serviceId).subscribe({
      next: () => {
        this.services = this.services.filter((s) => s._id !== serviceId);
      },
      error: (err) => {
        console.error('Failed to remove from wishlist', err);
        alert(this.translate.instant('common.error') || 'Failed to remove');
      },
    });
  }
}
