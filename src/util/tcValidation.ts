/**
 * TC Kimlik Numarası validation utility
 * Turkish National ID validation according to official algorithm
 */

export interface TCValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Clean TC Kimlik No by removing non-digit characters
 */
export function cleanTCKimlikNo(tcNo: string): string {
  if (!tcNo) return '';
  return tcNo.replace(/\D/g, '');
}

/**
 * Validate TC Kimlik Numarası according to Turkish algorithm
 * Rules:
 * 1. Must be exactly 11 digits
 * 2. Cannot start with 0
 * 3. Last digit must be even
 * 4. Algorithm: sum of first 10 digits' units digit equals 11th digit
 * 5. Additional checksum validation
 */
export function validateTCKimlikNo(tcNo: string): TCValidationResult {
  if (!tcNo) {
    return { isValid: false, error: "TC Kimlik numarası gereklidir" };
  }

  const cleanTc = cleanTCKimlikNo(tcNo);

  // Check length
  if (cleanTc.length !== 11) {
    return { isValid: false, error: "TC Kimlik numarası 11 haneli olmalıdır" };
  }

  // Check if all characters are digits
  if (!/^\d{11}$/.test(cleanTc)) {
    return { isValid: false, error: "TC Kimlik numarası sadece rakamlardan oluşmalıdır" };
  }

  // Cannot start with 0
  if (cleanTc[0] === '0') {
    return { isValid: false, error: "TC Kimlik numarası 0 ile başlayamaz" };
  }

  // Convert to array of numbers
  const digits = cleanTc.split('').map(Number);

  // Last digit must be even (this is part of the Turkish algorithm)
  if (digits[10] % 2 !== 0) {
    return { isValid: false, error: "TC Kimlik numarası son rakamı çift sayı olmalıdır" };
  }

  // Algorithm validation
  // Sum of first 10 digits
  const sumFirst10 = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0);
  
  // The 11th digit should be the units digit of the sum of first 10 digits
  if (sumFirst10 % 10 !== digits[10]) {
    return { isValid: false, error: "TC Kimlik numarası algoritması uyuşmuyor" };
  }

  // Additional checksum validation (more complex algorithm)
  // Sum of digits at odd positions (1st, 3rd, 5th, 7th, 9th)
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  
  // Sum of digits at even positions (2nd, 4th, 6th, 8th)
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  
  // Check: (oddSum * 7 - evenSum) % 10 should equal 10th digit
  const checksum = (oddSum * 7 - evenSum) % 10;
  if (checksum !== digits[9]) {
    return { isValid: false, error: "TC Kimlik numarası kontrol algoritması uyuşmuyor" };
  }

  return { isValid: true };
}

/**
 * Format TC Kimlik No for display (adds spaces for readability)
 */
export function formatTCKimlikNo(tcNo: string): string {
  const clean = cleanTCKimlikNo(tcNo);
  if (clean.length !== 11) return clean;
  
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 8)} ${clean.slice(8, 11)}`;
}

/**
 * Mask TC Kimlik No for privacy (shows only first 3 and last 2 digits)
 */
export function maskTCKimlikNo(tcNo: string): string {
  const clean = cleanTCKimlikNo(tcNo);
  if (clean.length !== 11) return clean;
  
  return `${clean.slice(0, 3)}****${clean.slice(9, 11)}`;
}