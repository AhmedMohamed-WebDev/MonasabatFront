import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class AppNameService {
  constructor(
    private translate: TranslateService,
    private title: Title
  ) {}

  init() {
    const applyTitle = () => {
      const appName =
        this.translate.instant('appName') ||
        this.translate.instant('header.brandName') ||
        'Lamitna';

      const current = this.title.getTitle() || '';
      if (current.includes('|')) {
        const left = current.split('|')[0].trim();
        this.title.setTitle(`${left} | ${appName}`);
      } else {
        this.title.setTitle(appName);
      }
    };

    this.translate.onLangChange.subscribe(() => applyTitle());
    // Apply once during init
    applyTitle();
  }

  getAppName(): string {
    return (
      this.translate.instant('appName') || this.translate.instant('header.brandName') || 'Lamitna'
    );
  }
}
