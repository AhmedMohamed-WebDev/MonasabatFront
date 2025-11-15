import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nav-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar navbar-expand-lg bg-white shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-bold text-dark" routerLink="/">
          <span class="text-warning">✨</span>
          {{ currentLang === 'ar' ? 'لمتنا' : 'Lamitna' }}
        </a>

        <div class="navbar-nav ms-auto d-flex align-items-center gap-3">
          <!-- Language Switcher -->
          <div class="nav-item dropdown">
            <button
              class="btn btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              🌐 {{ currentLang === 'ar' ? 'العربية' : 'English' }}
            </button>
            <ul class="dropdown-menu">
              <li>
                <button class="dropdown-item" (click)="switchLanguage('ar')">
                  العربية
                </button>
              </li>
              <li>
                <button class="dropdown-item" (click)="switchLanguage('en')">
                  English
                </button>
              </li>
            </ul>
          </div>

          <!-- Auth Buttons -->
          <ng-container *ngIf="!isAuthenticated">
            <button class="btn btn-warning" routerLink="/auth">Sign In</button>
          </ng-container>

          <!-- User Menu -->
          <div class="nav-item dropdown" *ngIf="isAuthenticated">
            <button
              class="btn btn-outline-primary dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              <i class="fas fa-user me-1"></i>
              {{ currentUser?.name }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" [routerLink]="getDashboardLink()">
                  <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                </a>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <button class="dropdown-item text-danger" (click)="logout()">
                  <i class="fas fa-sign-out-alt me-2"></i>Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .navbar {
        padding: 1rem 0;
      }
      .dropdown-item {
        cursor: pointer;
      }
      .dropdown-item i {
        width: 20px;
      }
    `,
  ],
})
export class NavHeaderComponent implements OnInit {
  isAuthenticated = false;
  currentUser: any = null;
  currentLang = 'en';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
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
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }

  switchLanguage(lang: string) {
    // Implement language switching logic
  }
}
