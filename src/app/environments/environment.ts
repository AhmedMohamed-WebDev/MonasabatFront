// src/app/environments/environment.ts

export const environment = {
  production: false, // Development environment
  apiUrl: 'http://localhost:5000/api', // Local development API URL
  appName: 'Lamitna',
  version: '1.0.0',

  // Feature flags
  features: {
    enableOtpAuth: true,
    enableWhatsApp: true,
    enableSocialLogin: false,
    enableAnalytics: false,
  },

  // OTP Configuration
  otp: {
    length: 6,
    expiryMinutes: 5,
    resendCooldownSeconds: 60,
  },

  // WhatsApp Configuration
  whatsapp: {
    enabled: true,
    provider: 'mock', // 'twilio' | '360dialog' | 'mock'
    apiKey: '', // Add your WhatsApp API key
    fromNumber: '+962XXXXXXXXX', // Your WhatsApp business number
  },

  // Storage keys
  storage: {
    tokenKey: 'auth_token',
    userKey: 'auth_user',
    redirectKey: 'redirect_url',
  },
};
