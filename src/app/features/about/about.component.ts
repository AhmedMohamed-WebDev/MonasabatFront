import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <section class="about-section py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <h1 class="text-center mb-4">{{ 'about.title' | translate }}</h1>
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="mb-4">{{ 'about.mission.title' | translate }}</h5>
                <p>{{ 'about.mission.description' | translate }}</p>

                <h5 class="mb-4 mt-5">
                  {{ 'about.whatWeDo.title' | translate }}
                </h5>
                <div class="row g-4">
                  <div
                    class="col-md-6"
                    *ngFor="
                      let feature of 'about.whatWeDo.features' | translate
                    "
                  >
                    <div class="feature-card p-4 bg-light rounded">
                      <i [class]="feature.icon"></i>
                      <h6 class="mt-3">{{ feature.title }}</h6>
                      <p class="text-muted small">{{ feature.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .feature-card {
        transition: transform 0.3s ease;
      }
      .feature-card:hover {
        transform: translateY(-5px);
      }
    `,
  ],
})
export class AboutComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    // Set SEO metadata for About page
    this.seoService.setPageSEO({
      title: 'About Lamitna - Event Booking Platform',
      titleAr: 'عن لمتنا - منصة حجز الفعاليات',
      description:
        'Learn about Lamitna, the leading event booking platform in Kuwait. Discover our mission, values, and how we connect customers with professional service providers.',
      descriptionAr:
        'تعرف على لمتنا، منصة حجز الفعاليات الرائدة في الكويت. اكتشف رسالتنا وقيمنا وكيف نربط العملاء مع مقدمي الخدمات المحترفين.',
      keywords: [
        'about lamitna',
        'event booking platform',
        'Kuwait services',
        'our mission',
      ],
      keywordsAr: ['عن لمتنا', 'منصة حجز الفعاليات', 'خدمات الكويت', 'رسالتنا'],
      image: 'https://lamitna.com/assets/EnOr-image.png',
      url: 'https://lamitna.com/about',
      type: 'website',
    });

    // Add breadcrumb schema
    this.seoService.addStructuredData(
      this.seoService.getBreadcrumbSchema([
        { name: 'Home', url: 'https://lamitna.com/home' },
        { name: 'About', url: 'https://lamitna.com/about' },
      ]),
    );
  }
}
