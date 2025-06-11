import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private readonly STORAGE_KEY = 'language'; // Changed to match app.config.ts

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.initializeLanguage();
  }

  private initializeLanguage() {
    const savedLanguage = localStorage.getItem(this.STORAGE_KEY) || 'en';
    this.setLanguage(savedLanguage);
  }

  setLanguage(language: string) {
    // Update translation service
    this.translate.use(language);

    // Update HTML attributes
    this.document.documentElement.lang = language;
    this.document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

    // Update document classes for styling
    this.document.body.classList.remove('lang-en', 'lang-ar');
    this.document.body.classList.add(`lang-${language}`);

    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, language);

    // Update subject
    this.currentLanguageSubject.next(language);
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  isRTL(): boolean {
    return this.getCurrentLanguage() === 'ar';
  }

  toggleLanguage() {
    const currentLang = this.getCurrentLanguage();
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }
}
