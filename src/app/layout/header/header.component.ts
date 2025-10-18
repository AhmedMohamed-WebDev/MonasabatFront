import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';
import { LanguageToggleComponent } from '../../shared/components/language-toggle/language-toggle.component';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth.service';

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
          {{ getCurrentLanguage() === 'ar' ? 'حجز المناسبات' : 'EventBook' }}
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
            {{ getCurrentLanguage() === 'ar' ? 'حجز المناسبات' : 'EventBook' }}
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
                >+962 6 123 4567
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
                ? '© 2024 إيفنت بوك. جميع الحقوق محفوظة.'
                : '© 2024 EventBook. All rights reserved.'
            }}
          </div>
        </div>
      </app-side-drawer>

      <!-- Shared nav links/user menu template -->
      <ng-template #navLinks let-closeDrawer="closeDrawer">
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
            class="btn btn-outline-primary dropdown-toggle rounded-pill px-4"
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
        padding: 1rem 0;
        min-height: 64px;
      }
      .navbar-toggler {
        border: none;
        background: transparent;
        font-size: 2rem;
        color: var(--accent-gold);
        outline: none;
      }
      .navbar-toggler:focus {
        box-shadow: 0 0 0 0.2rem rgba(203, 161, 53, 0.25);
      }
      .navbar-toggler-icon {
        display: inline-block;
        width: 2rem;
        height: 2rem;
        background: url("data:image/svg+xml;utf8,<svg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'><path stroke='%23cba135' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/></svg>")
          center/contain no-repeat;
      }
      .drawer-menu {
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
        margin-top: 2rem;
        align-items: stretch;
      }
      .join-supplier-btn {
        font-weight: 600;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 8px rgba(203, 161, 53, 0.08);
        transition: background 0.2s, color 0.2s;
      }
      .join-supplier-btn:hover {
        background: var(--accent-gold, #cba135);
        color: #fff;
        border-color: var(--accent-gold, #cba135);
      }
      .drawer-contact-info {
        background: #f8f9fa;
        border-radius: 10px;
        padding: 1rem 0.75rem;
        margin-bottom: 0.5rem;
        box-shadow: 0 1px 4px rgba(44, 44, 44, 0.04);
      }
      .drawer-contact-info i {
        min-width: 20px;
        text-align: center;
      }
      .drawer-contact-info a {
        text-decoration: none;
      }
      .drawer-contact-info a:hover {
        color: var(--accent-gold, #cba135) !important;
      }
      .drawer-copyright {
        margin-top: 0.5rem;
        color: #bdbdbd !important;
      }
      @media (max-width: 991.98px) {
        .navbar-nav {
          display: none !important;
        }
        .side-drawer-open
          .container
          > :not(.navbar-brand):not(.navbar-toggler) {
          display: none !important;
        }
        .side-drawer-open .navbar-toggler {
          z-index: 1051;
        }
        .side-drawer-open {
          /* Optionally add a subtle blur or dim effect to header when drawer is open */
          /* filter: blur(2px); */
        }
      }
    `,
  ],
})
export class HeaderComponent {
  drawerOpen = false;
  isAuthenticated = false;
  currentUser: any = null;

  // Function to close the drawer, used in template context
  closeDrawer = () => {
    this.drawerOpen = false;
  };

  constructor(
    public languageService: LanguageService,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
  }

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
