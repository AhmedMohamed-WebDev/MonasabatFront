import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LanguageService } from './language.service';

interface SEOConfig {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  keywords?: string[];
  keywordsAr?: string[];
  image?: string;
  url?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private baseUrl = 'https://lamitna.com'; // Update with your domain
  private readonly defaultConfig: SEOConfig = {
    title: 'Lamitna - Event Booking Platform',
    titleAr: 'لمتنا - منصة حجز الفعاليات',
    description:
      'Book professional event services instantly. Find vendors, suppliers, and service providers for your celebrations.',
    descriptionAr:
      'احجز خدمات الفعاليات الاحترافية على الفور. ابحث عن الموردين والمزودين ومقدمي الخدمات الاحترافيين للاحتفالات والفعاليات.',
    keywords: ['event booking', 'services', 'suppliers', 'vendors'],
    keywordsAr: ['حجز الفعاليات', 'خدمات الفعاليات', 'موردين', 'مزودي خدمات'],
    type: 'website',
  };

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private languageService: LanguageService,
  ) {
    this.initializeRouterListeners();
  }

  /**
   * Set page SEO metadata (supports both English and Arabic)
   */
  setPageSEO(config: Partial<SEOConfig>) {
    const fullConfig = { ...this.defaultConfig, ...config };

    // Set page title
    this.titleService.setTitle(fullConfig.title);

    // Set meta description (English)
    this.updateMetaTag(
      'name',
      'description',
      fullConfig.description,
      `<meta name="description" content="${fullConfig.description}" />`,
    );

    // Set meta description (Arabic) - create with lang attribute
    if (fullConfig.descriptionAr) {
      const arTag = this.metaService.getTag('name="description_ar"');
      if (arTag) {
        arTag.setAttribute('content', fullConfig.descriptionAr);
      } else {
        this.metaService.addTag({
          name: 'description_ar',
          content: fullConfig.descriptionAr,
          lang: 'ar',
        });
      }
    }

    // Set keywords if provided (English)
    if (fullConfig.keywords && fullConfig.keywords.length) {
      this.updateMetaTag(
        'name',
        'keywords',
        fullConfig.keywords.join(', '),
        `<meta name="keywords" content="${fullConfig.keywords.join(', ')}" />`,
      );
    }

    // Set keywords if provided (Arabic) - create with lang attribute
    if (fullConfig.keywordsAr && fullConfig.keywordsAr.length) {
      const arTag = this.metaService.getTag('name="keywords_ar"');
      if (arTag) {
        arTag.setAttribute('content', fullConfig.keywordsAr.join(', '));
      } else {
        this.metaService.addTag({
          name: 'keywords_ar',
          content: fullConfig.keywordsAr.join(', '),
          lang: 'ar',
        });
      }
    }

    // Open Graph tags (English)
    this.updateMetaTag(
      'property',
      'og:title',
      fullConfig.title,
      `<meta property="og:title" content="${fullConfig.title}" />`,
    );

    this.updateMetaTag(
      'property',
      'og:description',
      fullConfig.description,
      `<meta property="og:description" content="${fullConfig.description}" />`,
    );

    // Open Graph tags (Arabic)
    if (fullConfig.titleAr) {
      const arTag = this.metaService.getTag('property="og:title_ar"');
      if (arTag) {
        arTag.setAttribute('content', fullConfig.titleAr);
      } else {
        this.metaService.addTag({
          property: 'og:title_ar',
          content: fullConfig.titleAr,
          lang: 'ar',
        });
      }
    }

    if (fullConfig.descriptionAr) {
      const arTag = this.metaService.getTag('property="og:description_ar"');
      if (arTag) {
        arTag.setAttribute('content', fullConfig.descriptionAr);
      } else {
        this.metaService.addTag({
          property: 'og:description_ar',
          content: fullConfig.descriptionAr,
          lang: 'ar',
        });
      }
    }

    this.updateMetaTag(
      'property',
      'og:type',
      fullConfig.type || 'website',
      `<meta property="og:type" content="${fullConfig.type || 'website'}" />`,
    );

    // Select OG image based on current language
    const isArabic = this.languageService.getCurrentLanguage() === 'ar';
    let ogImage = fullConfig.image;

    // If default English OG image and Arabic is active, use Arabic OG image
    if (isArabic && ogImage?.includes('EnOr-image.png')) {
      ogImage = 'https://lamitna.com/assets/ArOg-image.png';
    }
    // If Arabic OG image is set but English is active, use English OG image
    else if (!isArabic && ogImage?.includes('ArOg-image.png')) {
      ogImage = 'https://lamitna.com/assets/EnOr-image.png';
    }

    if (ogImage) {
      this.updateMetaTag(
        'property',
        'og:image',
        ogImage,
        `<meta property="og:image" content="${ogImage}" />`,
      );
    }

    if (fullConfig.url) {
      this.updateMetaTag(
        'property',
        'og:url',
        fullConfig.url,
        `<meta property="og:url" content="${fullConfig.url}" />`,
      );
    }

    // Twitter tags (English)
    this.updateMetaTag(
      'name',
      'twitter:card',
      'summary_large_image',
      `<meta name="twitter:card" content="summary_large_image" />`,
    );

    this.updateMetaTag(
      'name',
      'twitter:title',
      fullConfig.title,
      `<meta name="twitter:title" content="${fullConfig.title}" />`,
    );

    this.updateMetaTag(
      'name',
      'twitter:description',
      fullConfig.description,
      `<meta name="twitter:description" content="${fullConfig.description}" />`,
    );

    if (fullConfig.image) {
      this.updateMetaTag(
        'name',
        'twitter:image',
        fullConfig.image,
        `<meta name="twitter:image" content="${fullConfig.image}" />`,
      );
    }

    // Canonical URL
    if (fullConfig.url) {
      this.setCanonicalUrl(fullConfig.url);
    }
  }

  /**
   * Set canonical URL to prevent duplicate content issues
   */
  setCanonicalUrl(url: string) {
    let canonicalLink = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement;

    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }

    canonicalLink.setAttribute('href', url);
  }

  /**
   * Add structured data (JSON-LD schema)
   */
  addStructuredData(schema: any) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  /**
   * Generate organization schema
   */
  getOrganizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Lamitna',
      url: this.baseUrl,
      logo: `${this.baseUrl}/assets/logo.png`,
      description:
        'Event booking platform connecting customers with professional service providers',
      sameAs: [
        'https://www.facebook.com/lamitna',
        'https://www.instagram.com/lamitna',
        'https://www.twitter.com/lamitna',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'support@lamitna.com',
      },
    };
  }

  /**
   * Generate breadcrumb schema
   */
  getBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  /**
   * Generate service schema for service detail pages
   */
  getServiceSchema(service: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name || service.title,
      description: service.description,
      image: service.image,
      provider: {
        '@type': 'Organization',
        name: service.supplierName || 'Lamitna',
      },
      areaServed: 'KW',
      priceRange: service.priceRange || 'Contact for pricing',
      ratingValue: service.rating || 4.5,
      reviewCount: service.reviewCount || 1,
    };
  }

  /**
   * Get the canonical URL for current route
   */
  getCanonicalUrl(): string {
    return `${this.baseUrl}${this.router.url}`;
  }

  /**
   * Initialize router listeners for auto-setting canonical URLs
   */
  private initializeRouterListeners() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Auto-set canonical URL on navigation
        this.setCanonicalUrl(this.getCanonicalUrl());
      });
  }

  /**
   * Update or create meta tag
   */
  private updateMetaTag(
    attrName: string,
    attrValue: string,
    content: string,
    htmlString?: string,
  ) {
    const tag = this.metaService.getTag(`${attrName}="${attrValue}"`);

    if (tag) {
      tag.setAttribute('content', content);
    } else {
      this.metaService.addTag({
        [attrName]: attrValue,
        content: content,
      });
    }
  }

  /**
   * Reset to default SEO
   */
  resetToDefaults() {
    this.setPageSEO(this.defaultConfig);
  }
}
