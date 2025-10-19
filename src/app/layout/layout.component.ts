import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../core/services/language.service';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TranslateModule,
    HeaderComponent,
    FooterComponent,
  ],
  template: `
    <app-header></app-header>
    <div class="app-layout" [class.rtl]="isRTL">
      <router-outlet></router-outlet>
    </div>
    <app-footer></app-footer>
  `,
  styles: [
    `
      .app-layout {
        min-height: 100vh;
        transition: all 0.3s ease;
      }

      .rtl {
        direction: rtl;
      }

      .rtl * {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
    `,
  ],
})
export class LayoutComponent implements OnInit, OnDestroy {
  isRTL = false;

  private routerSub: Subscription | null = null;

  constructor(
    private languageService: LanguageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.languageService.currentLanguage$.subscribe(() => {
      this.isRTL = this.languageService.isRTL();
    });
    // Scroll to top on every successful navigation so pages always start at top
    this.routerSub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        try {
          // Use instant scroll to avoid visual jump in some browsers
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        } catch (e) {
          // fallback
          window.scrollTo(0, 0);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
      this.routerSub = null;
    }
  }
}
