import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';
import { LanguageToggleComponent } from '../../shared/components/language-toggle/language-toggle.component';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SideDrawerComponent,
    LanguageToggleComponent,
  ],
  template: `
    <header
      class="navbar navbar-expand-lg bg-white shadow-sm sticky-top"
      [class.side-drawer-open]="drawerOpen"
    >
      <div class="container">
        <!-- Brand -->
        <a class="navbar-brand fw-bold text-dark" routerLink="/">
          <span class="text-warning">✨</span>
          {{ getCurrentLanguage() === 'ar' ? 'لمتنا' : 'Lamitna' }}
        </a>

        <!-- Hamburger for mobile -->
        <button
          *ngIf="!drawerOpen"
          class="navbar-toggler d-lg-none"
          type="button"
          (click)="drawerOpen = true"
          aria-label="Open menu"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Desktop Nav -->
        <nav
          class="navbar-nav ms-auto d-none d-lg-flex align-items-center gap-3"
        >
          <ng-container *ngTemplateOutlet="navLinks"></ng-container>
          <app-language-toggle></app-language-toggle>
        </nav>
      </div>

      <!-- Side Drawer for mobile -->
      <app-side-drawer [open]="drawerOpen" (close)="drawerOpen = false">
        <div class="drawer-menu">
          <a
            class="navbar-brand fw-bold text-dark mb-4"
            routerLink="/"
            (click)="closeDrawer()"
          >
            <span class="text-warning">✨</span>
            {{ getCurrentLanguage() === 'ar' ? 'لمتنا' : 'Lamitna' }}
          </a>
          <ng-container
            *ngTemplateOutlet="navLinks; context: { closeDrawer: closeDrawer }"
          ></ng-container>
          <app-language-toggle
            (languageChange)="closeDrawer()"
          ></app-language-toggle>
          <a
            class="btn btn-outline-warning rounded-pill px-4 mb-3 join-supplier-btn"
            routerLink="/join"
            (click)="closeDrawer()"
          >
            <i class="fas fa-user-plus me-2"></i>
            {{
              getCurrentLanguage() === 'ar'
                ? 'انضم كمزود خدمة'
                : 'Join as Supplier'
            }}
          </a>
          <div class="drawer-contact-info mt-2 mb-2">
            <div class="d-flex align-items-center mb-2">
              <i class="fas fa-envelope me-2 text-warning"></i>
              <a href="mailto:info@eventbook.com" class="text-warning small"
                >info&#64;eventbook.com</a
              >
            </div>
            <div class="d-flex align-items-center mb-2">
              <i class="fas fa-phone me-2 text-warning"></i>
              <a href="tel:+96261234567" class="text-warning small" dir="ltr"
                >+965 9914 1518
              </a>
            </div>
            <div class="d-flex align-items-center mb-2">
              <i class="fas fa-map-marker-alt me-2 text-warning"></i>
              <span class="small">{{
                getCurrentLanguage() === 'ar' ? 'عمان، الأردن' : 'Amman, Jordan'
              }}</span>
            </div>
          </div>
          <div class="drawer-copyright text-center small text-muted mt-3">
            {{
              getCurrentLanguage() === 'ar'
                ? '© 2024 لمتنا. جميع الحقوق محفوظة.'
                : '© 2024 Lamitna. All rights reserved.'
            }}
          </div>
        </div>
      </app-side-drawer>

      <!-- Shared nav links/user menu template -->
      <ng-template #navLinks let-closeDrawer="closeDrawer">
        <div class="d-flex align-items-center gap-2 me-2">
          <button
            class="btn btn-outline-secondary btn-sm wishlist-btn"
            (click)="navigateToWishlist(closeDrawer)"
            aria-label="Wishlist"
          >
            <i class="fas fa-heart"></i>
            <span
              *ngIf="wishlistCount > 0"
              class="wishlist-badge"
              aria-hidden="false"
              >{{ wishlistCount }}</span
            >
          </button>
        </div>

        <ng-container *ngIf="!isAuthenticated">
          <button
            class="btn btn-warning rounded-pill px-4"
            routerLink="/login"
            (click)="closeDrawer()"
          >
            <i class="fas fa-sign-in-alt me-2"></i
            >{{ getCurrentLanguage() === 'ar' ? 'تسجيل الدخول' : 'Sign In' }}
          </button>
        </ng-container>
        <div class="nav-item dropdown" *ngIf="isAuthenticated">
          <button
            class="btn btn-outline-primary rounded-pill px-4"
            data-bs-toggle="dropdown"
          >
            <i class="fas fa-user me-2"></i>{{ currentUser?.name }}
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow">
            <li>
              <a
                class="dropdown-item"
                [routerLink]="getDashboardLink()"
                (click)="closeDrawer()"
              >
                <i class="fas fa-tachometer-alt me-2"></i
                >{{
                  getCurrentLanguage() === 'ar' ? 'لوحة التحكم' : 'Dashboard'
                }}
              </a>
            </li>
            <li>
              <hr class="dropdown-divider" />
            </li>
            <li>
              <button
                class="dropdown-item text-danger"
                (click)="logout(); closeDrawer()"
              >
                <i class="fas fa-sign-out-alt me-2"></i
                >{{ getCurrentLanguage() === 'ar' ? 'تسجيل الخروج' : 'Logout' }}
              </button>
            </li>
          </ul>
        </div>
      </ng-template>
    </header>
  `,
  styles: [
    `
      .navbar {
        padding: 0.75rem 0;
        min-height: 70px;
        background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
        border-bottom: 1px solid rgba(203, 161, 53, 0.15);
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      }

      .navbar-brand {
        font-size: 1.6rem;
        letter-spacing: -0.5px;
        font-weight: 700;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .navbar-brand:hover {
        transform: translateY(-2px);
        color: #ffc107 !important;
      }

      .navbar-brand span {
        font-size: 1.8rem;
        animation: float 3s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-4px); }
      }

      .navbar-toggler {
        border: none;
        background: transparent;
        font-size: 1.5rem;
        color: var(--accent-gold);
        outline: none;
        padding: 0.5rem;
        transition: transform 0.3s ease;
      }

      .navbar-toggler:hover {
        transform: scale(1.1);
      }

      .navbar-toggler:focus {
        box-shadow: 0 0 0 0.3rem rgba(203, 161, 53, 0.25);
      }

      .navbar-toggler-icon {
        display: inline-block;
        width: 1.8rem;
        height: 1.8rem;
        background: url("data:image/svg+xml;utf8,<svg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'><path stroke='%23cba135' stroke-width='2.5' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/></svg>")
          center/contain no-repeat;
      }

      .navbar-nav {
        display: flex;
        align-items: center;
        gap: 1.2rem;
      }

      .drawer-menu {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        margin-top: 2rem;
        align-items: stretch;
      }

      .btn {
        font-weight: 600;
        letter-spacing: 0.3px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 8px;
      }

      .btn-warning {
        background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
        border: none;
        color: #1a1a1a;
        box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
      }

      .btn-warning:hover {
        background: linear-gradient(135deg, #ffb300 0%, #ffa500 100%);
        box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
        transform: translateY(-2px);
      }

      .btn-warning:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(255, 193, 7, 0.25);
      }

      .btn-outline-secondary {
        color: #6c757d;
        border: 1.5px solid #dee2e6;
        transition: all 0.3s ease;
      }

      .btn-outline-secondary:hover {
        background: #f8f9fa;
        border-color: #adb5bd;
        color: #495057;
      }

      .btn-outline-primary {
        color: #0d6efd;
        border: 1.5px solid #0d6efd;
        font-weight: 600;
      }

      .btn-outline-primary:hover {
        background: #0d6efd;
        color: white;
        box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
      }

      .join-supplier-btn {
        font-weight: 700;
        letter-spacing: 0.5px;
        background: linear-gradient(135deg, #cba135 0%, #b8931c 100%);
        border: none;
        color: white;
        box-shadow: 0 4px 16px rgba(203, 161, 53, 0.25);
      }

      .join-supplier-btn:hover {
        background: linear-gradient(135deg, #b8931c 0%, #a67f0f 100%);
        box-shadow: 0 6px 24px rgba(203, 161, 53, 0.35);
        transform: translateY(-2px);
      }

      .dropdown-menu {
        border: none;
        border-radius: 12px;
        padding: 0.75rem 0;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        animation: slideDown 0.2s ease;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .dropdown-item {
        padding: 0.75rem 1.5rem;
        transition: all 0.2s ease;
        color: #495057;
      }

      .dropdown-item:hover {
        background: rgba(203, 161, 53, 0.08);
        color: #cba135;
        padding-left: 1.75rem;
      }

      .dropdown-item.text-danger:hover {
        background: rgba(220, 53, 69, 0.08);
        color: #dc3545 !important;
      }

      .drawer-contact-info {
        background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
        border-radius: 12px;
        padding: 1.25rem 1rem;
        margin-bottom: 0.5rem;
        box-shadow: 0 2px 8px rgba(44, 44, 44, 0.06);
        border: 1px solid rgba(203, 161, 53, 0.1);
      }

      .drawer-contact-info i {
        min-width: 24px;
        text-align: center;
        color: #cba135;
      }

      .drawer-contact-info a {
        text-decoration: none;
        transition: all 0.2s ease;
        font-weight: 500;
      }

      .drawer-contact-info a:hover {
        color: var(--accent-gold, #cba135) !important;
        text-decoration: underline;
      }

      .drawer-copyright {
        margin-top: 1rem;
        color: #adb5bd !important;
        font-size: 0.85rem;
      }

      .wishlist-btn {
        position: relative;
        padding: 0.6rem 0.9rem;
        min-width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.3s ease;
        background: #f8f9fa;
      }

      .wishlist-btn:hover {
        background: rgba(203, 161, 53, 0.1);
        color: #cba135;
      }

      .wishlist-btn i {
        font-size: 1.2rem;
      }

      .wishlist-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        min-width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        color: white;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        line-height: 1;
        padding: 0 6px;
        box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
        border: 2px solid white;
        animation: bounce 0.5s ease;
      }

      @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
      }

      @media (max-width: 991.98px) {
        .navbar {
          min-height: 64px;
        }

        .navbar-brand {
          font-size: 1.4rem;
        }

        .navbar-nav {
          display: none !important;
        }

        .side-drawer-open .container > :not(.navbar-brand):not(.navbar-toggler) {
          display: none !important;
        }

        .side-drawer-open .navbar-toggler {
          z-index: 1051;
        }
      }

      @media (max-width: 576px) {
        .navbar {
          padding: 0.5rem 0;
          min-height: 60px;
        }

        .navbar-brand {
          font-size: 1.3rem;
          gap: 0.3rem;
        }

        .navbar-brand span {
          font-size: 1.4rem;
        }

        .drawer-menu {
          gap: 1rem;
          margin-top: 1.5rem;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  drawerOpen = false;
  isAuthenticated = false;
  currentUser: any = null;
  // wishlist count
  wishlistCount = 0;

  // Function to close the drawer, used in template context
  closeDrawer = () => {
    this.drawerOpen = false;
  };

  constructor(
    public languageService: LanguageService,
    private authService: AuthService,
    private router: Router,
    private wishlistService: WishlistService
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      if (this.isAuthenticated) {
        // Refresh wishlist from server when user becomes authenticated
        this.wishlistService.refreshWishlist();
      } else {
        this.wishlistCount = 0;
      }
    });
    // Subscribe to reactive wishlist count updates
    this.wishlistService.wishlistCount$.subscribe(
      (c) => (this.wishlistCount = c)
    );
  }

  navigateToWishlist = (closeDrawer?: any) => {
    // Close drawer if provided (mobile)
    try {
      if (closeDrawer) closeDrawer();
    } catch (e) {
      // ignore
    }

    if (!this.isAuthenticated) {
      // Redirect to login with return url
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/wishlist' },
      });
      return;
    }

    this.router.navigate(['/wishlist']);
  };

  getCurrentLanguage(): string {
    return this.languageService.getCurrentLanguage();
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
    this.authService.logout();
  }
}
