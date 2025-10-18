import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <footer class="footer mt-auto pt-5 pb-3">
      <div class="container">
        <div class="row gy-4 align-items-start">
          <!-- Brand & Description -->
          <div class="col-md-4 text-center mb-4 mb-md-0">
            <a
              class="navbar-brand fw-bold text-warning mb-2 d-inline-block"
              routerLink="/"
            >
              <span class="text-warning">✨</span>
              {{ 'footer.brandName' | translate }}
            </a>
            <p class="mb-3">{{ 'footer.description' | translate }}</p>
            <div class="d-flex gap-3 justify-content-center">
              <a href="#" class="social-link" aria-label="Facebook"
                ><i class="fab fa-facebook-f"></i
              ></a>
              <a href="#" class="social-link" aria-label="Twitter"
                ><i class="fab fa-twitter"></i
              ></a>
              <a href="#" class="social-link" aria-label="Instagram"
                ><i class="fab fa-instagram"></i
              ></a>
              <a href="#" class="social-link" aria-label="LinkedIn"
                ><i class="fab fa-linkedin-in"></i
              ></a>
            </div>
          </div>
          <!-- Quick Links -->
          <div class="col-md-4 text-center mb-4 mb-md-0">
            <h5 class="mb-3">{{ 'footer.quickLinksTitle' | translate }}</h5>
            <ul class="list-unstyled quick-links">
              <li>
                <a routerLink="/about">{{ 'footer.aboutLink' | translate }}</a>
              </li>
              <li>
                <a routerLink="/contact">{{
                  'footer.contactLink' | translate
                }}</a>
              </li>
              <li>
                <a routerLink="/terms">{{ 'footer.termsLink' | translate }}</a>
              </li>
            </ul>
          </div>
          <!-- Contact Info -->
          <div class="col-md-4 text-center ">
            <h5 class="mb-3">{{ 'footer.contactInfoTitle' | translate }}</h5>
            <ul class="list-unstyled contact-info">
              <li>
                <i class="fas fa-envelope me-2"></i>
                <a [href]="'mailto:' + email" class="text-warning">
                  {{ 'footer.emailInfo' | translate }}
                </a>
              </li>
              <li>
                <i class="fas fa-phone me-2"></i>
                <a [href]="'tel:' + phone" class=" text-warning">
                  <!-- force left-to-right rendering so RTL locales keep phone order -->
                  <span class="ltr-number" dir="ltr">{{
                    'footer.phoneInfo' | translate
                  }}</span>
                </a>
              </li>
              <li>
                <i class="fas fa-map-marker-alt me-2"></i>
                {{ 'footer.addressInfo' | translate }}
              </li>
            </ul>
          </div>
        </div>
        <hr class="my-4" />
        <div class="text-center small text-muted">
          {{ 'footer.copyright' | translate }}
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        background: linear-gradient(
          135deg,
          var(--primary-dark, #2c2c2c) 0%,
          #1a1a1a 100%
        ) !important;
        color: var(--text-light, #f8f9fa) !important;
        border-top: 1px solid var(--accent-gold, #cba135);
      }
      .footer .navbar-brand {
        color: var(--accent-gold, #cba135) !important;
        font-size: 1.5rem;
        font-weight: 700;
      }
      .footer .navbar-brand span {
        color: var(--accent-gold, #cba135) !important;
      }
      .footer h5 {
        color: var(--accent-gold, #cba135) !important;
        font-weight: 700;
      }
      .footer p,
      .footer ul,
      .footer li,
      .footer a,
      .footer .text-muted {
        color: var(--text-light, #f8f9fa) !important;
        font-size: 1rem;
      }
      .footer .quick-links li a {
        text-decoration: none;
        color: var(--text-light, #f8f9fa) !important;
        transition: color 0.2s;
      }
      .footer .quick-links li a:hover {
        color: var(--accent-gold, #cba135) !important;
      }
      .footer .social-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        max-width: 44px;
        max-height: 44px;
        border-radius: 50%;
        background: rgba(203, 161, 53, 0.2); /* #cba13533 */
        border: 2px solid var(--accent-gold, #cba135);
        color: var(--accent-gold, #cba135);
        text-decoration: none;
        margin-right: 0.5rem;
        transition: var(--transition, all 0.3s cubic-bezier(0.4, 0, 0.2, 1));
        vertical-align: middle;
        padding: 0;
        box-sizing: border-box;
      }
      .footer .social-link:last-child {
        margin-right: 0;
      }
      .footer .social-link:hover {
        background: var(--accent-gold, #cba135);
        color: var(--primary-white, #fff);
        transform: translateY(-3px);
      }
      .footer .list-unstyled li {
        margin-bottom: 0.5rem;
      }
      .footer .list-unstyled li:last-child {
        margin-bottom: 0;
      }
      .footer hr {
        border-color: var(--accent-gold, #cba135) !important;
        opacity: 0.2;
      }
      .footer .text-muted {
        color: #bdbdbd !important;
      }
      .footer .contact-info a {
        text-decoration: none;
      }
      .footer .contact-info a:hover {
        color: var(--accent-gold, #cba135) !important;
      }
      @media (max-width: 768px) {
        .footer .row {
          flex-direction: column;
          text-align: center;
        }
        .footer .col-md-4 {
          margin-bottom: 2rem;
        }
      }
      [dir='rtl'] .footer .navbar-brand {
        margin-right: 0;
        margin-left: auto;
      }
      [dir='rtl'] .footer .social-link {
        margin-left: 0.5rem;
        margin-right: 0;
      }
      [dir='rtl'] .footer .social-link:last-child {
        margin-left: 0;
      }
      .ltr-number {
        direction: ltr;
        unicode-bidi: isolate; /* keep numbers in their original LTR order inside RTL text */
      }
    `,
  ],
})
export class FooterComponent {
  public readonly email = 'info@eventbook.com';
  public readonly phone = '+96261234567';
}
