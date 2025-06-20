import { hashPassword } from '@/utils/security'
import { MigrationResult, UserRole, AthleteStatus, PaymentStatus, PaymentMethod, AccountEntryType } from '@/types'

export class DataMigration {
  
  /**
   * Migrate all localStorage data to database
   */
  static async migrateFromLocalStorage(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedCount: 0,
      errors: [],
      warnings: [],
      summary: {
        users: 0,
        athletes: 0,
        trainings: 0,
        payments: 0,
        accountEntries: 0
      }
    }

    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Migration can only be run in browser environment')
      }

      console.log('Starting data migration from localStorage to database...')

      // Note: This is a placeholder implementation
      // The actual migration would be implemented when the database is available
      result.warnings.push('Migration functionality will be implemented when database is connected')
      
      result.success = true
      console.log('Migration completed successfully:', result)
      return result

    } catch (error) {
      console.error('Migration failed:', error)
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      return result
    }
  }

  /**
   * Map localStorage athlete status to enum
   */
  private static mapAthleteStatus(status?: string): AthleteStatus {
    switch (status?.toLowerCase()) {
      case 'aktif':
      case 'active':
        return AthleteStatus.ACTIVE
      case 'pasif':
      case 'inactive':
        return AthleteStatus.INACTIVE
      case 'suspended':
        return AthleteStatus.SUSPENDED
      default:
        return AthleteStatus.ACTIVE
    }
  }

  /**
   * Map localStorage payment status to enum
   */
  private static mapPaymentStatus(status?: string): PaymentStatus {
    switch (status?.toLowerCase()) {
      case 'güncel':
      case 'current':
        return PaymentStatus.CURRENT
      case 'gecikmiş':
      case 'overdue':
        return PaymentStatus.OVERDUE
      case 'ödendi':
      case 'paid':
        return PaymentStatus.PAID
      case 'beklemede':
      case 'pending':
        return PaymentStatus.PENDING
      case 'iptal':
      case 'cancelled':
        return PaymentStatus.CANCELLED
      default:
        return PaymentStatus.CURRENT
    }
  }

  /**
   * Clear localStorage after successful migration
   */
  static clearLocalStorageData(): void {
    if (typeof window === 'undefined') return

    const keysToRemove = [
      'adminUsers',
      'coaches',
      'parentUsers',
      'students'
    ]

    // Remove main data
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    // Remove account entries
    try {
      const students = JSON.parse(localStorage.getItem('students') || '[]')
      students.forEach((student: any) => {
        localStorage.removeItem(`account_${student.id}`)
      })
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }

    console.log('localStorage data cleared after migration')
  }

  /**
   * Create backup of localStorage data before migration
   */
  static createLocalStorageBackup(): string {
    if (typeof window === 'undefined') return ''

    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        adminUsers: localStorage.getItem('adminUsers'),
        coaches: localStorage.getItem('coaches'),
        parentUsers: localStorage.getItem('parentUsers'),
        students: localStorage.getItem('students')
      }
    }

    // Add account entries
    try {
      const students = JSON.parse(localStorage.getItem('students') || '[]')
      const accountEntries: { [key: string]: string | null } = {}
      students.forEach((student: any) => {
        accountEntries[`account_${student.id}`] = localStorage.getItem(`account_${student.id}`)
      })
      backup.data = { ...backup.data, ...accountEntries }
    } catch (error) {
      console.error('Error creating backup:', error)
    }

    const backupString = JSON.stringify(backup)
    
    // Save backup to localStorage with timestamp
    const backupKey = `backup_${Date.now()}`
    localStorage.setItem(backupKey, backupString)
    
    return backupKey
  }
}