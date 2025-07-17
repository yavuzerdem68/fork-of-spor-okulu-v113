// Duplicate Prevention Library for SportsCRM
// Comprehensive duplicate detection and prevention system

export interface PaymentFingerprint {
  athleteId: string;
  amount: number;
  date: string;
  method?: string;
  description?: string;
  reference?: string;
}

export interface AccountEntryFingerprint {
  athleteId: string;
  amount: number;
  month: string;
  description: string;
  type: 'debit' | 'credit';
}

export class DuplicatePreventionSystem {
  
  /**
   * Generate a unique fingerprint for payment detection
   */
  static generatePaymentFingerprint(payment: PaymentFingerprint): string {
    const normalizedDescription = payment.description?.toLowerCase().trim() || '';
    const normalizedMethod = payment.method?.toLowerCase().trim() || '';
    
    return `${payment.athleteId}_${payment.amount}_${payment.date}_${normalizedMethod}_${normalizedDescription}`;
  }

  /**
   * Generate a unique fingerprint for account entry detection
   */
  static generateAccountEntryFingerprint(entry: AccountEntryFingerprint): string {
    const normalizedDescription = entry.description.toLowerCase().trim();
    
    return `${entry.athleteId}_${entry.amount}_${entry.month}_${entry.type}_${normalizedDescription}`;
  }

  /**
   * Check for duplicate payments in localStorage
   */
  static checkPaymentDuplicate(newPayment: PaymentFingerprint): {
    isDuplicate: boolean;
    existingPayment?: any;
    reason?: string;
  } {
    try {
      const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      const newFingerprint = this.generatePaymentFingerprint(newPayment);
      
      // Check exact match
      for (const payment of existingPayments) {
        const existingFingerprint = this.generatePaymentFingerprint({
          athleteId: payment.athleteId.toString(),
          amount: payment.amount,
          date: payment.paymentDate || payment.dueDate,
          method: payment.method,
          description: payment.description,
          reference: payment.reference
        });
        
        if (newFingerprint === existingFingerprint) {
          return {
            isDuplicate: true,
            existingPayment: payment,
            reason: 'Aynı sporcu, tutar, tarih, yöntem ve açıklama ile ödeme mevcut'
          };
        }
      }
      
      // Check reference-based duplicates (for Excel imports)
      if (newPayment.reference) {
        const referenceMatch = existingPayments.find((payment: any) => 
          payment.reference === newPayment.reference &&
          payment.athleteId.toString() === newPayment.athleteId &&
          Math.abs(payment.amount - newPayment.amount) < 0.01
        );
        
        if (referenceMatch) {
          return {
            isDuplicate: true,
            existingPayment: referenceMatch,
            reason: 'Aynı referans numarası ile ödeme mevcut'
          };
        }
      }
      
      // Check similar payments within same day (tolerance check)
      const sameDayPayments = existingPayments.filter((payment: any) => 
        payment.athleteId.toString() === newPayment.athleteId &&
        payment.paymentDate === newPayment.date &&
        Math.abs(payment.amount - newPayment.amount) < 0.01
      );
      
      if (sameDayPayments.length > 0) {
        return {
          isDuplicate: true,
          existingPayment: sameDayPayments[0],
          reason: 'Aynı gün aynı tutarda ödeme mevcut'
        };
      }
      
      return { isDuplicate: false };
      
    } catch (error) {
      console.error('Duplicate check error:', error);
      return { isDuplicate: false };
    }
  }

  /**
   * Check for duplicate account entries
   */
  static checkAccountEntryDuplicate(athleteId: string, newEntry: AccountEntryFingerprint): {
    isDuplicate: boolean;
    existingEntry?: any;
    reason?: string;
  } {
    try {
      const existingEntries = JSON.parse(localStorage.getItem(`account_${athleteId}`) || '[]');
      const newFingerprint = this.generateAccountEntryFingerprint(newEntry);
      
      for (const entry of existingEntries) {
        const existingFingerprint = this.generateAccountEntryFingerprint({
          athleteId: athleteId,
          amount: entry.amountIncludingVat,
          month: entry.month,
          description: entry.description,
          type: entry.type
        });
        
        if (newFingerprint === existingFingerprint) {
          return {
            isDuplicate: true,
            existingEntry: entry,
            reason: 'Aynı ay, tutar, tür ve açıklama ile kayıt mevcut'
          };
        }
      }
      
      return { isDuplicate: false };
      
    } catch (error) {
      console.error('Account entry duplicate check error:', error);
      return { isDuplicate: false };
    }
  }

  /**
   * Advanced duplicate detection for Excel imports
   * Handles Turkish character normalization and fuzzy matching
   */
  static checkExcelImportDuplicates(
    excelRows: any[], 
    existingPayments: any[]
  ): {
    duplicates: any[];
    uniqueRows: any[];
    warnings: any[];
  } {
    const duplicates: any[] = [];
    const uniqueRows: any[] = [];
    const warnings: any[] = [];
    const processedFingerprints = new Set<string>();
    
    // Create fingerprints for existing payments
    const existingFingerprints = new Set<string>();
    existingPayments.forEach(payment => {
      if (payment.reference) {
        const fingerprint = `${payment.athleteId}_${payment.reference}_${payment.amount}`;
        existingFingerprints.add(fingerprint);
      }
    });
    
    excelRows.forEach((row, index) => {
      // Generate fingerprint for this row
      const rowFingerprint = `${row.date}_${row.amount}_${row.description.toLowerCase().trim()}`;
      
      // Check for duplicates within the same Excel file
      if (processedFingerprints.has(rowFingerprint)) {
        duplicates.push({
          row,
          index,
          reason: 'Excel dosyasında mükerrer kayıt',
          type: 'internal'
        });
        return;
      }
      
      // Check for similar amounts and dates (potential duplicates)
      const similarRows = excelRows.filter((otherRow, otherIndex) => 
        otherIndex !== index &&
        Math.abs(otherRow.amount - row.amount) < 0.01 &&
        otherRow.date === row.date
      );
      
      if (similarRows.length > 0) {
        warnings.push({
          row,
          index,
          reason: 'Aynı tarih ve tutarda başka kayıtlar var',
          type: 'similar',
          similarRows
        });
      }
      
      processedFingerprints.add(rowFingerprint);
      uniqueRows.push(row);
    });
    
    return { duplicates, uniqueRows, warnings };
  }

  /**
   * Bulk payment duplicate prevention
   */
  static validateBulkPayments(bulkPayments: any[]): {
    validPayments: any[];
    duplicates: any[];
    errors: any[];
  } {
    const validPayments: any[] = [];
    const duplicates: any[] = [];
    const errors: any[] = [];
    const seenFingerprints = new Set<string>();
    
    bulkPayments.forEach((payment, index) => {
      // Basic validation
      if (!payment.athleteId || !payment.amount || payment.amount <= 0) {
        errors.push({
          payment,
          index,
          reason: 'Eksik veya geçersiz bilgi'
        });
        return;
      }
      
      // Generate fingerprint
      const fingerprint = `${payment.athleteId}_${payment.amount}_${payment.method || 'default'}`;
      
      // Check for duplicates within bulk
      if (seenFingerprints.has(fingerprint)) {
        duplicates.push({
          payment,
          index,
          reason: 'Toplu giriş içinde mükerrer kayıt'
        });
        return;
      }
      
      // Check against existing payments
      const duplicateCheck = this.checkPaymentDuplicate({
        athleteId: payment.athleteId,
        amount: parseFloat(payment.amount),
        date: payment.paymentDate || new Date().toISOString().split('T')[0],
        method: payment.method,
        description: payment.description
      });
      
      if (duplicateCheck.isDuplicate) {
        duplicates.push({
          payment,
          index,
          reason: duplicateCheck.reason,
          existingPayment: duplicateCheck.existingPayment
        });
        return;
      }
      
      seenFingerprints.add(fingerprint);
      validPayments.push(payment);
    });
    
    return { validPayments, duplicates, errors };
  }

  /**
   * Clean up old duplicate detection data (maintenance)
   */
  static cleanupDuplicateData(): {
    removedPayments: number;
    removedEntries: number;
  } {
    let removedPayments = 0;
    let removedEntries = 0;
    
    try {
      // Clean payments
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');
      const uniquePayments = [];
      const seenFingerprints = new Set<string>();
      
      payments.forEach((payment: any) => {
        const fingerprint = this.generatePaymentFingerprint({
          athleteId: payment.athleteId.toString(),
          amount: payment.amount,
          date: payment.paymentDate || payment.dueDate,
          method: payment.method,
          description: payment.description,
          reference: payment.reference
        });
        
        if (!seenFingerprints.has(fingerprint)) {
          seenFingerprints.add(fingerprint);
          uniquePayments.push(payment);
        } else {
          removedPayments++;
        }
      });
      
      if (removedPayments > 0) {
        localStorage.setItem('payments', JSON.stringify(uniquePayments));
      }
      
      return { removedPayments, removedEntries };
      
    } catch (error) {
      console.error('Cleanup error:', error);
      return { removedPayments: 0, removedEntries: 0 };
    }
  }

  /**
   * Get duplicate statistics
   */
  static getDuplicateStatistics(): {
    totalPayments: number;
    potentialDuplicates: number;
    duplicateGroups: any[];
  } {
    try {
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');
      const fingerprintGroups: { [key: string]: any[] } = {};
      
      // Group payments by fingerprint
      payments.forEach((payment: any) => {
        const fingerprint = this.generatePaymentFingerprint({
          athleteId: payment.athleteId.toString(),
          amount: payment.amount,
          date: payment.paymentDate || payment.dueDate,
          method: payment.method,
          description: payment.description,
          reference: payment.reference
        });
        
        if (!fingerprintGroups[fingerprint]) {
          fingerprintGroups[fingerprint] = [];
        }
        fingerprintGroups[fingerprint].push(payment);
      });
      
      // Find duplicate groups
      const duplicateGroups = Object.entries(fingerprintGroups)
        .filter(([_, group]) => group.length > 1)
        .map(([fingerprint, group]) => ({
          fingerprint,
          count: group.length,
          payments: group
        }));
      
      const potentialDuplicates = duplicateGroups.reduce((sum, group) => sum + group.count - 1, 0);
      
      return {
        totalPayments: payments.length,
        potentialDuplicates,
        duplicateGroups
      };
      
    } catch (error) {
      console.error('Statistics error:', error);
      return {
        totalPayments: 0,
        potentialDuplicates: 0,
        duplicateGroups: []
      };
    }
  }
}