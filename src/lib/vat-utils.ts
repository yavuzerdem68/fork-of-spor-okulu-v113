/**
 * KDV (VAT) Hesaplama ve Yuvarlama Yardımcı Fonksiyonları
 * Türk vergi mevzuatına uygun KDV hesaplamaları
 */

/**
 * KDV tutarını hesaplar ve Türk vergi mevzuatına uygun şekilde yuvarlar
 * @param amountExcludingVat KDV hariç tutar
 * @param vatRate KDV oranı (örn: 20 için %20)
 * @returns Yuvarlanmış KDV tutarı
 */
export function calculateVatAmount(amountExcludingVat: number, vatRate: number): number {
  const vatAmount = (amountExcludingVat * vatRate) / 100;
  // Türk vergi mevzuatına göre KDV tutarı kuruş cinsinden yuvarlanır
  return Math.round(vatAmount * 100) / 100;
}

/**
 * KDV dahil tutarı hesaplar
 * @param amountExcludingVat KDV hariç tutar
 * @param vatRate KDV oranı (örn: 20 için %20)
 * @returns Yuvarlanmış KDV dahil tutar
 */
export function calculateAmountIncludingVat(amountExcludingVat: number, vatRate: number): number {
  const vatAmount = calculateVatAmount(amountExcludingVat, vatRate);
  const totalAmount = amountExcludingVat + vatAmount;
  // Toplam tutar da kuruş cinsinden yuvarlanır
  return Math.round(totalAmount * 100) / 100;
}

/**
 * KDV hariç tutardan KDV dahil tutarı hesaplar (tek seferde)
 * @param amountExcludingVat KDV hariç tutar
 * @param vatRate KDV oranı (örn: 20 için %20)
 * @returns {vatAmount, amountIncludingVat} KDV tutarı ve KDV dahil tutar
 */
export function calculateVatBreakdown(amountExcludingVat: number, vatRate: number): {
  vatAmount: number;
  amountIncludingVat: number;
} {
  const vatAmount = calculateVatAmount(amountExcludingVat, vatRate);
  const amountIncludingVat = Math.round((amountExcludingVat + vatAmount) * 100) / 100;
  
  return {
    vatAmount,
    amountIncludingVat
  };
}

/**
 * KDV dahil tutardan KDV hariç tutarı hesaplar (ters hesaplama)
 * @param amountIncludingVat KDV dahil tutar
 * @param vatRate KDV oranı (örn: 20 için %20)
 * @returns {amountExcludingVat, vatAmount} KDV hariç tutar ve KDV tutarı
 */
export function calculateReverseVat(amountIncludingVat: number, vatRate: number): {
  amountExcludingVat: number;
  vatAmount: number;
} {
  const amountExcludingVat = amountIncludingVat / (1 + vatRate / 100);
  const roundedAmountExcludingVat = Math.round(amountExcludingVat * 100) / 100;
  const vatAmount = Math.round((amountIncludingVat - roundedAmountExcludingVat) * 100) / 100;
  
  return {
    amountExcludingVat: roundedAmountExcludingVat,
    vatAmount
  };
}

/**
 * Para tutarını Türk Lirası formatında gösterir (küsürat olmadan)
 * @param amount Tutar
 * @param showDecimals Ondalık kısmı göster (varsayılan: true)
 * @returns Formatlanmış tutar string'i
 */
export function formatCurrency(amount: number, showDecimals: boolean = true): string {
  const roundedAmount = Math.round(amount * 100) / 100;
  
  if (!showDecimals && roundedAmount % 1 === 0) {
    // Eğer küsürat yoksa ve küsürat gösterilmek istenmiyorsa
    return `₺${Math.round(roundedAmount).toLocaleString('tr-TR')}`;
  }
  
  return `₺${roundedAmount.toLocaleString('tr-TR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Tutarı tam sayıya yuvarlar (küsüratları kaldırır)
 * @param amount Tutar
 * @returns Yuvarlanmış tam sayı
 */
export function roundToWholeNumber(amount: number): number {
  return Math.round(amount);
}

/**
 * KDV oranlarını tanımlar (Türkiye için)
 */
export const VAT_RATES = {
  STANDARD: 20,    // Standart KDV oranı %20
  REDUCED_1: 10,   // İndirimli KDV oranı %10
  REDUCED_2: 1,    // Çok düşük KDV oranı %1
  ZERO: 0          // KDV muaf
} as const;

/**
 * KDV oranı seçenekleri (UI için)
 */
export const VAT_RATE_OPTIONS = [
  { value: VAT_RATES.ZERO, label: '%0 (Muaf)' },
  { value: VAT_RATES.REDUCED_2, label: '%1 (Çok İndirimli)' },
  { value: VAT_RATES.REDUCED_1, label: '%10 (İndirimli)' },
  { value: VAT_RATES.STANDARD, label: '%20 (Standart)' }
];

/**
 * Birden fazla KDV hesaplamasının toplamını hesaplar
 * @param items KDV hesaplama öğeleri
 * @returns Toplam KDV hariç, KDV tutarı ve KDV dahil tutarlar
 */
export function calculateTotalVat(items: Array<{
  amountExcludingVat: number;
  vatRate: number;
}>): {
  totalAmountExcludingVat: number;
  totalVatAmount: number;
  totalAmountIncludingVat: number;
} {
  let totalAmountExcludingVat = 0;
  let totalVatAmount = 0;
  
  items.forEach(item => {
    const roundedAmountExcluding = Math.round(item.amountExcludingVat * 100) / 100;
    const vatAmount = calculateVatAmount(roundedAmountExcluding, item.vatRate);
    
    totalAmountExcludingVat += roundedAmountExcluding;
    totalVatAmount += vatAmount;
  });
  
  totalAmountExcludingVat = Math.round(totalAmountExcludingVat * 100) / 100;
  totalVatAmount = Math.round(totalVatAmount * 100) / 100;
  const totalAmountIncludingVat = Math.round((totalAmountExcludingVat + totalVatAmount) * 100) / 100;
  
  return {
    totalAmountExcludingVat,
    totalVatAmount,
    totalAmountIncludingVat
  };
}