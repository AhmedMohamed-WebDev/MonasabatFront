import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
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

    // Phone number validation for Jordan and Kuwait
    const jordanPhoneRegex = /^(\+962|962|0)?7[789]\d{7}$/;
    const kuwaitPhoneRegex = /^(\+965|965|0)?[569]\d{7}$/;

    const cleanedPhone = this.phone.replace(/[\s\-\(\)]/g, '');
    if (
      !jordanPhoneRegex.test(cleanedPhone) &&
      !kuwaitPhoneRegex.test(cleanedPhone)
    ) {
      this.error = this.translate.instant('auth.validation.phoneInvalid');
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.success = '';

    try {
      const cleanPhone = this.phone.replace(/[\s\-\(\)]/g, '');
      // Store the response which now includes the OTP
      const response: any = await this.authService.sendOTP(
        cleanPhone,
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
      const response: AuthResponse = await this.authService.verifyOTP(
        this.phone.trim(),
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

  formatPhoneNumber() {
    // Remove all non-digit characters
    let value = this.phone.replace(/\D/g, '');

    // Remove leading zeros or country code
    if (value.startsWith('962')) {
      value = value.substring(3);
    } else if (value.startsWith('0')) {
      value = value.substring(1);
    }

    // Ensure maximum length of 9 digits for Jordan numbers
    if (value.length > 9) {
      value = value.substring(0, 9);
    }

    // Format as (07X) XXX-XXXX
    if (value.length > 0) {
      this.phone =
        value.length <= 3
          ? `(${value})`
          : value.length <= 6
          ? `(${value.substring(0, 3)}) ${value.substring(3)}`
          : `(${value.substring(0, 3)}) ${value.substring(
              3,
              6
            )}-${value.substring(6)}`;
    }
  }
}
