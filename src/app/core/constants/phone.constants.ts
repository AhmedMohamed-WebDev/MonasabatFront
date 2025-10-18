export const PHONE_CONFIG = {
  JORDAN: {
    COUNTRY_CODE: '+962',
    MOBILE_PREFIXES: ['7'],
    // Accept operator second-digit 5-9 (Orange 75, Umniah 76, Zain 77/78/79)
    OPERATOR_CODES: ['5', '6', '7', '8', '9'],
    // Allow flexible lengths (local and international forms). Prefer regex validation.
    MIN_LENGTH: 10, // examples: 07XXXXXXXX (10 chars) or +9627XXXXXXXX (13 chars including +)
    MAX_LENGTH: 13,
    DISPLAY_FORMAT: '+962 7X XXX XXXX',
  },
  KUWAIT: {
    COUNTRY_CODE: '+965',
    MOBILE_PREFIXES: ['5', '6', '9'],
    MIN_LENGTH: 12, // Including +965
    MAX_LENGTH: 12,
    DISPLAY_FORMAT: '+965 X XXX XXXX',
  },
  ERROR_MESSAGES: {
    INVALID: 'Please enter a valid phone number',
    FORMAT: 'Phone number format is invalid',
    REQUIRED: 'Phone number is required',
  },
};
