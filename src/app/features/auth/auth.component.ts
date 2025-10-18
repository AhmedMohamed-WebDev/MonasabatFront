import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { PhoneService } from '../../core/services/phone.service';
import { AuthResponse, User } from '../../core/models/auth.model';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);
  private phoneService = inject(PhoneService);

  // Form data
  phone: string = '';
  otp: string = '';
  name: string = '';

  // UI state
  currentStep: 'phone' | 'otp' = 'phone';
  isLoading: boolean = false;
  error: string = '';
  success: string = '';
  isNewUser: boolean = false;
  returnUrl: string = '';

  // Translation properties
  currentLanguage: string = 'en';

  ngOnInit() {
    // Initialize language
    this.currentLanguage = this.languageService.getCurrentLanguage();

    // Subscribe to language changes
    this.languageService.currentLanguage$.subscribe((lang) => {
      this.currentLanguage = lang;
    });

    // Get return URL from route params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';

    // Store return URL in auth service
    if (this.returnUrl) {
      this.authService.setRedirectUrl(this.returnUrl);
    }

    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      this.redirectUser();
    }
  }
  async sendOTP() {
    // Name validation with translation
    if (!this.name.trim() || this.name.trim().length < 2) {
      this.error = this.translate.instant('auth.validation.nameMinLength');
      return;
    }

    if (!this.phone.trim()) {
      this.error = this.translate.instant('auth.validation.phoneRequired');
      return;
    }

    // Phone number validation: sanitize, normalize and validate as +965 (Kuwait) or +962 (Jordan)
    let apiPhone: string;
    // Remove zero-width and non-breaking spaces and trim
    const sanitizedInput = (this.phone || '')
      .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '')
      .replace(/\u00A0/g, ' ')
      .trim();
    try {
      apiPhone = this.phoneService.formatPhoneNumber(sanitizedInput);
      console.debug(
        'Auth.sendOTP: raw ->',
        JSON.stringify(this.phone),
        'sanitized ->',
        JSON.stringify(sanitizedInput),
        'normalized ->',
        apiPhone
      );
    } catch (err) {
      console.debug(
        'Auth.sendOTP: failed to normalize phone',
        JSON.stringify(this.phone),
        err
      );
      this.error = this.translate.instant('auth.validation.phoneInvalid');
      return;
    }

    const kuwaitApiRegex = /^\+965\d{8}$/;
    const jordanApiRegex = /^\+962\d{9}$/;

    if (!kuwaitApiRegex.test(apiPhone) && !jordanApiRegex.test(apiPhone)) {
      console.debug('Auth.sendOTP: normalized phone for validation', apiPhone);
      this.error = this.translate.instant('auth.validation.phoneInvalid');
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.success = '';

    try {
      const raw = this.phone;
      const apiPhone = this.phoneService.formatPhoneNumber(raw);
      // Store the response which now includes the OTP
      const response: any = await this.authService.sendOTP(
        apiPhone,
        this.name.trim()
      );

      // Show success message
      this.success = this.translate.instant('auth.messages.otpSent');

      // For development: Auto-fill OTP if provided in response
      if (response.otp) {
        this.otp = response.otp;
        console.log('Development OTP:', response.otp);
      }

      this.currentStep = 'otp';

      // Show expiry info if provided
      if (response.expiresIn) {
        const expiryMessage = this.translate.instant(
          'auth.messages.otpExpiry',
          {
            minutes: response.expiresIn,
          }
        );
        setTimeout(() => {
          this.success = expiryMessage;
        }, 3000);
      }
    } catch (error: any) {
      this.error =
        error.message || this.translate.instant('auth.messages.otpSendFailed');
    } finally {
      this.isLoading = false;
    }
  }

  async verifyOTP() {
    if (!this.otp.trim()) {
      this.error = this.translate.instant('auth.validation.otpRequired');
      return;
    }

    if (this.otp.trim().length !== 6) {
      this.error = this.translate.instant('auth.validation.otpLength');
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const sanitizedInput = (this.phone || '')
        .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '')
        .replace(/\u00A0/g, ' ')
        .trim();
      const apiPhone = this.phoneService.formatPhoneNumber(sanitizedInput);
      console.debug(
        'Auth.verifyOTP: raw ->',
        JSON.stringify(this.phone),
        'sanitized ->',
        JSON.stringify(sanitizedInput),
        'normalized ->',
        apiPhone
      );
      const response: AuthResponse = await this.authService.verifyOTP(
        apiPhone,
        this.otp.trim(),
        this.name.trim() // Always send the name
      );

      // Store JWT and user info
      this.authService.setToken(response.token);
      this.authService.setUser(response.user);

      this.success = this.translate.instant('auth.messages.loginSuccess');

      // Redirect after short delay
      setTimeout(() => {
        this.redirectUser(response.user);
      }, 1000);
    } catch (error: any) {
      this.error =
        error.message || this.translate.instant('auth.messages.otpInvalid');
    } finally {
      this.isLoading = false;
    }
  }

  private redirectUser(user?: User) {
    const currentUser = user || this.authService.getCurrentUser();
    const savedReturnUrl = this.authService.getRedirectUrl();

    if (!currentUser) {
      this.router.navigate(['/']);
      return;
    }

    // Handle role-based redirects
    switch (currentUser.role) {
      case 'admin':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'supplier':
        this.router.navigate(['/supplier-dashboard']);
        break;
      default:
        if (savedReturnUrl) {
          this.authService.clearRedirectUrl();
          this.router.navigateByUrl(savedReturnUrl);
        } else {
          this.router.navigate(['/']);
        }
    }
  }

  goBack() {
    this.currentStep = 'phone';
    this.otp = '';
    this.name = '';
    this.error = '';
    this.success = '';
    this.isNewUser = false;
  }

  clearError() {
    this.error = '';
  }

  // Normalize phone to +965... or +962... for API
  normalizePhoneForApi(input: string): string {
    let value = (input || '').replace(/[^0-9\+]/g, '');
    // If starts with +, keep it, else remove leading zeros
    if (!value.startsWith('+')) {
      // remove leading zeros
      while (value.startsWith('0')) value = value.substring(1);
    }

    // Kuwait heuristics
    if (
      value.startsWith('+965') ||
      value.startsWith('965') ||
      /^9\d{7}$/.test(value)
    ) {
      // extract local 8 digits
      const cleaned = value.replace(/^\+?965/, '');
      const local = cleaned.slice(-8);
      return `+965${local}`;
    }

    // Jordan heuristics
    if (
      value.startsWith('+962') ||
      value.startsWith('962') ||
      /^7\d{8}$/.test(value)
    ) {
      const cleaned = value.replace(/^\+?962/, '');
      const local = cleaned.slice(-9);
      return `+962${local}`;
    }

    // Fallback: return digits-only trimmed
    return value.replace(/[^0-9]/g, '');
  }

  formatPhoneNumber() {
    // Use PhoneService to normalize input to canonical international form.
    // This avoids the previous ad-hoc trimming which mangled inputs like 00962...
    try {
      const normalized = this.phoneService.formatPhoneNumber(this.phone || '');
      // Prefer a readable form — if formatForDisplay supports it, use it; otherwise use normalized
      try {
        this.phone =
          this.phoneService.formatForDisplay(normalized) || normalized;
      } catch (err) {
        this.phone = normalized;
      }
    } catch (err) {
      // If normalization fails, keep raw input (validation will catch it on submit)
      this.phone = (this.phone || '').trim();
    }
  }
}
