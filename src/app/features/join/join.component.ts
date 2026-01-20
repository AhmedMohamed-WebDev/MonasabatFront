import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { JoinService } from '../../core/services/join.service';
import { AuthService } from '../../core/services/auth.service';
import { PhoneService } from '../../core/services/phone.service';
import { Router } from '@angular/router';
import { JoinStatus } from '../../core/models/join.model';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CategoryConfig } from '../../core/models/constants/categories.const';
import { TranslationService } from '../../core/services/translation.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css'],
})
export class JoinComponent implements OnInit {
  joinForm: FormGroup;
  isSubmitting = false;
  showSuccess = false;
  showError = false;
  errorMessage = '';

  cities = {
    jordan: [
      { value: 'Amman', label: 'Amman' },
      { value: 'Irbid', label: 'Irbid' },
      { value: 'Zarqa', label: 'Zarqa' },
      { value: 'Aqaba', label: 'Aqaba' },
      { value: 'Salt', label: 'Salt' },
      { value: 'Madaba', label: 'Madaba' },
      { value: 'Karak', label: 'Karak' },
      { value: 'Tafilah', label: 'Tafilah' },
      { value: 'Jerash', label: 'Jerash' },
      { value: 'Balqa', label: 'Balqa' },
      { value: 'Maan', label: 'Maan' },
      { value: 'Ramtha', label: 'Ramtha' },
    ],
    kuwait: [
      { value: 'Kuwait_City', label: 'Kuwait City' },
      { value: 'Ahmadi', label: 'Ahmadi' },
      { value: 'Hawalli', label: 'Hawalli' },
      { value: 'Jahra', label: 'Jahra' },
      { value: 'Fahaheel', label: 'Fahaheel' },
      { value: 'Mubarak_Al_Kabeer', label: 'Mubarak Al-Kabeer' },
      { value: 'Salmiya', label: 'Salmiya' },
      { value: 'Farwaniya', label: 'Farwaniya' },
    ],
  };

  serviceTypes = [
    { value: 'Hall', label: 'Hall' },
    { value: 'Decoration', label: 'Decoration' },
    { value: 'Sound', label: 'Sound' },
    { value: 'Photography', label: 'Photography' },
    { value: 'Catering', label: 'Catering' },
    { value: 'Music', label: 'Music' },
    { value: 'Planning', label: 'Event Planning' },
    { value: 'Other', label: 'Other' },
  ];

  // Use service categories for the join form
  categories: CategoryConfig[] = [];
  showOtherServiceInput = false;

  constructor(
    private fb: FormBuilder,
    private joinService: JoinService,
    private authService: AuthService,
    private phoneService: PhoneService,
    private router: Router,
    private translate: TranslateService,
    private translationService: TranslationService,
    private seoService: SeoService,
  ) {
    this.joinForm = this.fb.group({
      country: ['jordan', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      phoneCountry: ['jordan', Validators.required],
      phone: ['', [Validators.required, this.phoneValidator()]],
      city: ['', Validators.required],
      serviceType: ['', Validators.required],
      otherServiceType: [''],
      notes: [''],
    });

    // Watch for serviceType changes
    this.joinForm.get('serviceType')?.valueChanges.subscribe((value) => {
      this.showOtherServiceInput = value === 'other';
      if (this.showOtherServiceInput) {
        this.joinForm
          .get('otherServiceType')
          ?.setValidators([Validators.required]);
      } else {
        this.joinForm.get('otherServiceType')?.clearValidators();
      }
      this.joinForm.get('otherServiceType')?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    // Set SEO metadata for Join page
    this.seoService.setPageSEO({
      title: 'Join Our Network - Become a Supplier on Lamitna',
      titleAr: 'انضم إلى شبكتنا - اصبح مزود خدمات في لمتنا',
      description:
        'Join Lamitna as a service provider and grow your event business. Connect with thousands of customers looking for professional services in Kuwait.',
      descriptionAr:
        'انضم إلى لمتنا كمزود خدمات ونمي عملك في مجال الفعاليات. تواصل مع آلاف العملاء الذين يبحثون عن خدمات احترافية في الكويت.',
      keywords: [
        'join lamitna',
        'become supplier',
        'event business',
        'service provider',
        'Kuwait',
      ],
      keywordsAr: [
        'انضم لمتنا',
        'اصبح مزود خدمات',
        'عمل في الفعاليات',
        'مقدم الخدمات',
        'الكويت',
      ],
      image: 'https://lamitna.com/assets/EnOr-image.png',
      url: 'https://lamitna.com/join',
      type: 'website',
    });

    // Add breadcrumb schema
    this.seoService.addStructuredData(
      this.seoService.getBreadcrumbSchema([
        { name: 'Home', url: 'https://lamitna.com/home' },
        { name: 'Join', url: 'https://lamitna.com/join' },
      ]),
    );

    // Populate service categories
    this.categories = this.translationService.getTranslatedServiceCategories();
    this.translate.onLangChange.subscribe(() => {
      this.categories =
        this.translationService.getTranslatedServiceCategories();
    });

    // Watch for phone country changes to update phone validation
    this.joinForm.get('phoneCountry')?.valueChanges.subscribe(() => {
      this.joinForm.get('phone')?.updateValueAndValidity();
    });

    // When country changes, reset city and update validators if needed
    this.joinForm.get('country')?.valueChanges.subscribe((country) => {
      // Clear city when switching countries
      this.joinForm.get('city')?.setValue('');
      this.joinForm.get('city')?.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.joinForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.hideAlerts();

      // Normalize phone to canonical international form before submitting
      const rawPhone = this.joinForm.get('phone')?.value || '';
      let normalizedPhone = rawPhone;
      try {
        normalizedPhone = this.phoneService.formatPhoneNumber(rawPhone);
      } catch (e) {
        // Fall back to raw value if normalization fails; backend will validate
        normalizedPhone = rawPhone;
      }

      // Get form values and explicitly include phoneCountry
      const formData = {
        ...this.joinForm.value,
        phone: normalizedPhone,
        country: this.joinForm.get('country')?.value || 'jordan',
        phoneCountry: this.joinForm.get('phoneCountry')?.value || 'jordan',
      };

      this.joinService.submitJoinRequest(formData).subscribe({
        next: (response) => {
          this.showSuccess = true;
          this.joinForm.reset();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.showError = true;
          this.errorMessage =
            error.error?.message ||
            'Failed to submit request. Please try again.';
          this.isSubmitting = false;
        },
      });
    }
  }

  hideAlerts() {
    this.showSuccess = false;
    this.showError = false;
  }

  getFieldError(fieldName: string): string {
    const field = this.joinForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return this.translate.instant('join.form.validation.required', {
          field: this.translate.instant(`join.form.labels.${fieldName}`),
        });
      }
      if (field.errors['minlength']) {
        return this.translate.instant('join.form.validation.minLength', {
          field: this.translate.instant(`join.form.labels.${fieldName}`),
          count: 2,
        });
      }
      if (field.errors['pattern']) {
        const country = this.joinForm.get('phoneCountry')?.value || 'jordan';
        return this.translate.instant(
          `join.form.validation.phoneInvalid.${country}`,
        );
      }
    }
    return '';
  }

  // Add helper method to explain format
  getPhoneHint(): string {
    return 'Enter your number in any format: 07X XXX XXXX, 7X XXX XXXX, or +962 7X XXX XXXX';
  }

  checkJoinStatus(): void {
    const raw = this.joinForm.get('phone')?.value;
    if (!raw) return;

    let phone = raw;
    try {
      phone = this.phoneService.formatPhoneNumber(raw);
    } catch (e) {
      phone = raw;
    }

    if (this.authService.getCurrentUser()?.role === 'supplier') {
      this.router.navigate(['/supplier-dashboard']);
    } else {
      this.joinService.checkStatus(phone).subscribe({
        next: (status: JoinStatus) => {
          if (status === 'pending') {
            this.showPendingMessage();
          } else if (status === 'approved') {
            this.showApprovedMessage();
          }
        },
        error: (error) => {
          this.showError = true;
          this.errorMessage = error.error?.message || 'Failed to check status';
        },
      });
    }
  }

  phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const country = this.joinForm?.get('phoneCountry')?.value;

      // Jordan phone validation — accept +962, 962, 00962, 07..., or local 7... forms
      // Accept operator second digit 5-9 (75,76,77,78,79)
      const jordanRegex = /^(?:(?:\+962|00962|962)7[5-9]\d{7}|0?7[5-9]\d{7})$/;
      // Kuwait phone validation (accepts numbers starting with +965 or 5/6/9 followed by 7 digits)
      const kuwaitRegex = /^((?:(?:\+965|0)(?:5|6|9))|(?:5|6|9))\d{7}$/;

      // Normalize value by removing spaces, dashes and parentheses
      const rawVal = (control.value || '').toString().trim();
      const normalized = rawVal.replace(/[\s\-()]/g, '');

      const isValid =
        country === 'jordan'
          ? jordanRegex.test(normalized)
          : kuwaitRegex.test(normalized);

      return isValid ? null : { pattern: true };
    };
  }

  showPendingMessage() {
    this.showSuccess = true;
    this.errorMessage = this.translate.instant('join.status.pending');
  }

  showApprovedMessage() {
    this.showSuccess = true;
    this.errorMessage = this.translate.instant('join.status.approved');
  }
}
