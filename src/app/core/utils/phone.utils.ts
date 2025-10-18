export class PhoneUtils {
  /**
   * Masks a phone number for security display
   * Shows only first 3 and last 2 digits
   * Example: 0791234567 -> 079*****67
   */
  static maskPhoneNumber(phone: string): string {
    if (!phone || phone.length < 5) return phone;

    const firstThree = phone.substring(0, 3);
    const lastTwo = phone.substring(phone.length - 2);
    const maskedLength = phone.length - 5;
    const maskedPart = '*'.repeat(maskedLength);

    return `${firstThree}${maskedPart}${lastTwo}`;
  }

  /**
   * Formats phone number for display with country code
   * Example: 0791234567 -> +962 79 123 4567
   */
  static formatPhoneNumber(
    phone: string,
    countryCode: string = '+962'
  ): string {
    if (!phone) return '';

    // Remove any non-digit characters
    let cleanPhone = phone.replace(/\D/g, '');

    // Accept numbers that may include leading 00 (00962...) and normalize
    if (cleanPhone.startsWith('00')) {
      cleanPhone = cleanPhone.substring(2);
    }

    // If user entered full international (9627XXXXXXXX) without plus, keep as-is
    if (cleanPhone.startsWith('962')) {
      cleanPhone = cleanPhone.substring(3);
    }

    // At this point, cleanPhone should be the local part (9 digits for Jordan mobiles)
    if (cleanPhone.length === 9 && cleanPhone.startsWith('7')) {
      // Format as +962 7X XXX XXXX
      return `${countryCode} ${cleanPhone.substring(
        0,
        1
      )} ${cleanPhone.substring(1, 4)} ${cleanPhone.substring(4)}`;
    }

    return phone;
  }

  /**
   * Creates a clickable phone link for mobile devices
   * Returns masked number for display, but full number for tel: link
   */
  static createPhoneLink(phone: string): { display: string; link: string } {
    return {
      display: this.maskPhoneNumber(phone),
      link: `tel:${phone}`,
    };
  }

  /**
   * Checks if a phone number is valid Jordan mobile number
   */
  static isValidJordanMobile(phone: string): boolean {
    if (!phone) return false;
    let cleanPhone = phone.replace(/\D/g, '');
    // normalize leading 00 -> remove the 00
    if (cleanPhone.startsWith('00')) cleanPhone = cleanPhone.substring(2);
    // remove leading country code if present
    if (cleanPhone.startsWith('962')) cleanPhone = cleanPhone.substring(3);
    // now check local form: 9 digits starting with 7 and operator 5-9
    return cleanPhone.length === 9 && /^7[5-9]\d{7}$/.test(cleanPhone);
  }
}
