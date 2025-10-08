import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  EVENT_CATEGORIES,
  CategoryConfig,
} from '../models/constants/categories.const';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  constructor(private translate: TranslateService) {}

  // Get translated text
  get(key: string, params?: any): Observable<string> {
    return this.translate.get(key, params);
  }

  // Get instant translation (use only when sure translation is loaded)
  instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  // Get translated categories
  getTranslatedCategories(): CategoryConfig[] {
    return EVENT_CATEGORIES.map((category) => ({
      ...category,
      label: this.instant(`categories.${category.value}`),
      subcategories: category.subcategories.map((sub) => ({
        ...sub,
        label: this.instant(`subcategories.${sub.value}`),
      })),
    }));
  }

  // Get translated cities
  // getTranslatedCities(): string[] {
  //   const cities = [
  //     'Amman',
  //     'Irbid',
  //     'Zarqa',
  //     'Aqaba',
  //     'Salt',
  //     'Madaba',
  //     'Karak',
  //     'Tafilah',
  //   ];
  //   return cities.map((city) => this.instant(`cities.${city.toLowerCase()}`));
  // }

  // Get translated city by value
  // getTranslatedCity(cityValue: string): string {
  //   return this.instant(`cities.${cityValue.toLowerCase()}`) || cityValue;
  // }
  // Update the getTranslatedCity method
  getTranslatedCity(cityValue: string): string {
    if (!cityValue) return '';

    const city = cityValue.toLowerCase();

    // Check if it's a Jordanian city
    if (
      [
        'amman',
        'irbid',
        'zarqa',
        'jerash',
        'balqa',
        'aqaba',
        'salt',
        'madaba',
        'karak',
        'tafilah',
      ].includes(city)
    ) {
      return this.translate.instant(`cities.jordan.${city}`);
    }

    // Check if it's a Kuwaiti city
    if (
      [
        'kuwait_city',
        'ahmadi',
        'hawalli',
        'jahra',
        'farwaniya',
        'mubarak_al_kabeer',
        'salmiya',
        'fahaheel',
      ].includes(city)
    ) {
      return this.translate.instant(`cities.kuwait.${city}`);
    }

    // Fallback to original city name if no translation found
    return cityValue;
  }

  // Update the getTranslatedCities method
  getTranslatedCities(): { value: string; label: string }[] {
    const jordanCities = [
      'amman',
      'irbid',
      'zarqa',
      'jerash',
      'balqa',
      'aqaba',
      'salt',
      'madaba',
      'karak',
      'tafilah',
    ];

    const kuwaitCities = [
      'kuwait_city',
      'ahmadi',
      'hawalli',
      'jahra',
      'farwaniya',
      'mubarak_al_kabeer',
      'salmiya',
      'fahaheel',
    ];

    return [
      ...jordanCities.map((city) => ({
        value: city,
        label: this.instant(`cities.jordan.${city}`),
      })),
      ...kuwaitCities.map((city) => ({
        value: city,
        label: this.instant(`cities.kuwait.${city}`),
      })),
    ];
  }
  // Get translated category by value
  getTranslatedCategory(categoryValue: string): string {
    return this.instant(`categories.${categoryValue}`) || categoryValue;
  }

  // Get translated subcategory by value
  getTranslatedSubcategory(subcategoryValue: string): string {
    return (
      this.instant(`subcategories.${subcategoryValue}`) || subcategoryValue
    );
  }

  // Get translated people ranges
  getTranslatedPeopleRanges(): any[] {
    return [
      { min: 50, max: 100, label: this.instant('peopleRanges.50-100') },
      { min: 100, max: 150, label: this.instant('peopleRanges.100-150') },
      { min: 150, max: 200, label: this.instant('peopleRanges.150-200') },
      { min: 200, max: 300, label: this.instant('peopleRanges.200-300') },
      { min: 300, max: 500, label: this.instant('peopleRanges.300-500') },
      { min: 500, max: null, label: this.instant('peopleRanges.500+') },
    ];
  }

  // Helper method to check if translation key exists
  hasTranslation(key: string): boolean {
    const translation = this.translate.instant(key);
    return translation !== key;
  }

  // Get translation with fallback
  getTranslationWithFallback(
    key: string,
    fallback: string,
    params?: any
  ): string {
    const translation = this.instant(key, params);
    return translation !== key ? translation : fallback;
  }
}
