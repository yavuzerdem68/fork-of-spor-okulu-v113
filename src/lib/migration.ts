import { prisma } from '@/lib/db'
import { hashPassword } from '@/utils/security'
import { MigrationResult } from '@/types'
import { UserRole, AthleteStatus, PaymentStatus, PaymentMethod, AccountEntryType } from '@prisma/client'

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

      // Migrate users (admins, coaches, parents)
      await this.migrateUsers(result)
      
      // Migrate athletes
      await this.migrateAthletes(result)
      
      // Migrate trainings
      await this.migrateTrainings(result)
      
      // Migrate payments
      await this.migratePayments(result)
      
      // Migrate account entries
      await this.migrateAccountEntries(result)

      result.success = true
      result.migratedCount = Object.values(result.summary).reduce((sum, count) => sum + count, 0)
      
      console.log('Migration completed successfully:', result)
      return result

    } catch (error) {
      console.error('Migration failed:', error)
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      return result
    }
  }

  /**
   * Migrate users from localStorage
   */
  private static async migrateUsers(result: MigrationResult): Promise<void> {
    try {
      // Migrate admin users
      const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]')
      for (const admin of adminUsers) {
        try {
          const hashedPassword = await hashPassword(admin.password || 'admin123')
          
          await prisma.user.upsert({
            where: { email: admin.email },
            update: {
              firstName: admin.name || admin.firstName || 'Admin',
              lastName: admin.surname || admin.lastName || 'User',
              phone: admin.phone,
              isActive: admin.isActive !== false,
              password: hashedPassword
            },
            create: {
              email: admin.email,
              firstName: admin.name || admin.firstName || 'Admin',
              lastName: admin.surname || admin.lastName || 'User',
              phone: admin.phone,
              role: UserRole.ADMIN,
              password: hashedPassword,
              adminProfile: {
                create: {
                  permissions: admin.permissions || {}
                }
              }
            }
          })
          result.summary.users++
        } catch (error) {
          result.errors.push(`Failed to migrate admin user ${admin.email}: ${error}`)
        }
      }

      // Migrate coaches
      const coaches = JSON.parse(localStorage.getItem('coaches') || '[]')
      for (const coach of coaches) {
        try {
          const hashedPassword = await hashPassword(coach.password || 'coach123')
          
          await prisma.user.upsert({
            where: { email: coach.email },
            update: {
              firstName: coach.firstName || coach.name || 'Coach',
              lastName: coach.lastName || coach.surname || 'User',
              phone: coach.phone,
              isActive: coach.isActive !== false,
              password: hashedPassword
            },
            create: {
              email: coach.email,
              firstName: coach.firstName || coach.name || 'Coach',
              lastName: coach.lastName || coach.surname || 'User',
              phone: coach.phone,
              role: UserRole.COACH,
              password: hashedPassword,
              coachProfile: {
                create: {
                  sportsBranches: coach.sportsBranches || [],
                  trainingGroups: coach.trainingGroups || []
                }
              }
            }
          })
          result.summary.users++
        } catch (error) {
          result.errors.push(`Failed to migrate coach ${coach.email}: ${error}`)
        }
      }

      // Migrate parent users
      const parentUsers = JSON.parse(localStorage.getItem('parentUsers') || '[]')
      for (const parent of parentUsers) {
        try {
          const hashedPassword = await hashPassword(parent.password || 'parent123')
          
          await prisma.user.upsert({
            where: { email: parent.email },
            update: {
              username: parent.username,
              firstName: parent.firstName,
              lastName: parent.lastName,
              phone: parent.phone,
              isActive: parent.isActive !== false,
              password: hashedPassword
            },
            create: {
              email: parent.email,
              username: parent.username,
              firstName: parent.firstName,
              lastName: parent.lastName,
              phone: parent.phone,
              role: UserRole.PARENT,
              password: hashedPassword,
              parentProfile: {
                create: {
                  tcNo: parent.tcNo,
                  relation: parent.relation
                }
              }
            }
          })
          result.summary.users++
        } catch (error) {
          result.errors.push(`Failed to migrate parent user ${parent.email}: ${error}`)
        }
      }

    } catch (error) {
      result.errors.push(`Failed to migrate users: ${error}`)
    }
  }

  /**
   * Migrate athletes from localStorage
   */
  private static async migrateAthletes(result: MigrationResult): Promise<void> {
    try {
      const students = JSON.parse(localStorage.getItem('students') || '[]')
      
      for (const student of students) {
        try {
          // Find parent by email or phone
          const parentUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: student.parentEmail },
                { phone: student.parentPhone }
              ],
              role: UserRole.PARENT
            },
            include: { parentProfile: true }
          })

          if (!parentUser?.parentProfile) {
            result.warnings.push(`Parent not found for athlete ${student.studentName} ${student.studentSurname}`)
            continue
          }

          // Create or update athlete
          const athlete = await prisma.athlete.upsert({
            where: { 
              tcNo: student.studentTcNo || `temp_${Date.now()}_${Math.random()}`
            },
            update: {
              firstName: student.studentName,
              lastName: student.studentSurname,
              birthDate: student.studentBirthDate ? new Date(student.studentBirthDate) : null,
              age: student.studentAge ? parseInt(student.studentAge) : null,
              gender: student.studentGender,
              school: student.studentSchool,
              class: student.studentClass,
              photo: student.photo,
              status: this.mapAthleteStatus(student.status),
              paymentStatus: this.mapPaymentStatus(student.paymentStatus),
              registrationDate: student.registrationDate ? new Date(student.registrationDate) : new Date(student.createdAt || Date.now())
            },
            create: {
              firstName: student.studentName,
              lastName: student.studentSurname,
              tcNo: student.studentTcNo,
              birthDate: student.studentBirthDate ? new Date(student.studentBirthDate) : null,
              age: student.studentAge ? parseInt(student.studentAge) : null,
              gender: student.studentGender,
              school: student.studentSchool,
              class: student.studentClass,
              photo: student.photo,
              status: this.mapAthleteStatus(student.status),
              paymentStatus: this.mapPaymentStatus(student.paymentStatus),
              registrationDate: student.registrationDate ? new Date(student.registrationDate) : new Date(student.createdAt || Date.now()),
              parentId: parentUser.parentProfile.id
            }
          })

          // Handle sports branches
          if (student.sportsBranches && Array.isArray(student.sportsBranches)) {
            for (const branchName of student.sportsBranches) {
              try {
                // Find or create sports branch
                const sportsBranch = await prisma.sportsBranch.upsert({
                  where: { name: branchName },
                  update: {},
                  create: { name: branchName }
                })

                // Link athlete to sports branch
                await prisma.athleteSportsBranch.upsert({
                  where: {
                    athleteId_sportsBranchId: {
                      athleteId: athlete.id,
                      sportsBranchId: sportsBranch.id
                    }
                  },
                  update: {},
                  create: {
                    athleteId: athlete.id,
                    sportsBranchId: sportsBranch.id
                  }
                })
              } catch (error) {
                result.warnings.push(`Failed to link sports branch ${branchName} to athlete ${athlete.firstName} ${athlete.lastName}`)
              }
            }
          }

          result.summary.athletes++
        } catch (error) {
          result.errors.push(`Failed to migrate athlete ${student.studentName} ${student.studentSurname}: ${error}`)
        }
      }

    } catch (error) {
      result.errors.push(`Failed to migrate athletes: ${error}`)
    }
  }

  /**
   * Migrate account entries from localStorage
   */
  private static async migrateAccountEntries(result: MigrationResult): Promise<void> {
    try {
      const students = JSON.parse(localStorage.getItem('students') || '[]')
      
      for (const student of students) {
        try {
          // Find athlete in database
          const athlete = await prisma.athlete.findFirst({
            where: {
              OR: [
                { tcNo: student.studentTcNo },
                {
                  AND: [
                    { firstName: student.studentName },
                    { lastName: student.studentSurname }
                  ]
                }
              ]
            }
          })

          if (!athlete) {
            continue
          }

          // Get account entries for this athlete
          const accountKey = `account_${student.id}`
          const accountEntries = JSON.parse(localStorage.getItem(accountKey) || '[]')

          for (const entry of accountEntries) {
            try {
              await prisma.accountEntry.create({
                data: {
                  athleteId: athlete.id,
                  type: entry.type === 'debit' ? AccountEntryType.DEBIT : AccountEntryType.CREDIT,
                  description: entry.description,
                  amountExcludingVat: entry.amountExcludingVat,
                  vatRate: entry.vatRate,
                  vatAmount: entry.vatAmount,
                  amountIncludingVat: entry.amountIncludingVat,
                  unitCode: entry.unitCode,
                  month: entry.month,
                  invoiceNumber: entry.invoiceNumber,
                  createdAt: entry.date ? new Date(entry.date) : new Date()
                }
              })
              result.summary.accountEntries++
            } catch (error) {
              result.warnings.push(`Failed to migrate account entry for athlete ${athlete.firstName} ${athlete.lastName}`)
            }
          }

        } catch (error) {
          result.warnings.push(`Failed to process account entries for student ${student.studentName}`)
        }
      }

    } catch (error) {
      result.errors.push(`Failed to migrate account entries: ${error}`)
    }
  }

  /**
   * Migrate trainings (placeholder - implement based on your training data structure)
   */
  private static async migrateTrainings(result: MigrationResult): Promise<void> {
    try {
      // Implement training migration based on your localStorage structure
      result.warnings.push('Training migration not implemented yet')
    } catch (error) {
      result.errors.push(`Failed to migrate trainings: ${error}`)
    }
  }

  /**
   * Migrate payments (placeholder - implement based on your payment data structure)
   */
  private static async migratePayments(result: MigrationResult): Promise<void> {
    try {
      // Implement payment migration based on your localStorage structure
      result.warnings.push('Payment migration not implemented yet')
    } catch (error) {
      result.errors.push(`Failed to migrate payments: ${error}`)
    }
  }

  /**
   * Map localStorage athlete status to Prisma enum
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
   * Map localStorage payment status to Prisma enum
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
    const students = JSON.parse(localStorage.getItem('students') || '[]')
    students.forEach((student: any) => {
      localStorage.removeItem(`account_${student.id}`)
    })

    console.log('localStorage data cleared after migration')
  }

  /**
   * Create backup of localStorage data before migration
   */
  static createLocalStorageBackup(): string {
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
    const students = JSON.parse(localStorage.getItem('students') || '[]')
    const accountEntries: { [key: string]: string | null } = {}
    students.forEach((student: any) => {
      accountEntries[`account_${student.id}`] = localStorage.getItem(`account_${student.id}`)
    })
    backup.data = { ...backup.data, ...accountEntries }

    const backupString = JSON.stringify(backup)
    
    // Save backup to localStorage with timestamp
    const backupKey = `backup_${Date.now()}`
    localStorage.setItem(backupKey, backupString)
    
    return backupKey
  }
}