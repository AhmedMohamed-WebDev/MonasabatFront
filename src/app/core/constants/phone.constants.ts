export const PHONE_CONFIG = {
  JORDAN: {
    COUNTRY_CODE: '+962',
    MOBILE_PREFIXES: ['7'],
    OPERATOR_CODES: ['7', '8', '9'], // Zain (77,78,79), Umniah (76,77,78), Orange (75,76,77)
    MIN_LENGTH: 12, // Including +962
    MAX_LENGTH: 12,
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
