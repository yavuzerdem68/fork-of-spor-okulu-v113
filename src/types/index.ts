// Define enums locally to avoid Prisma dependency during build
export enum UserRole {
  ADMIN = 'ADMIN',
  COACH = 'COACH',
  PARENT = 'PARENT'
}

export enum AthleteStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  CURRENT = 'CURRENT'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  OTHER = 'OTHER'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}

export enum AccountEntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

// Base types that match Prisma models
export interface User {
  id: string
  email: string
  username?: string | null
  password: string
  firstName: string
  lastName: string
  phone?: string | null
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Athlete {
  id: string
  firstName: string
  lastName: string
  tcNo?: string | null
  birthDate?: Date | null
  age?: number | null
  gender?: string | null
  school?: string | null
  class?: string | null
  photo?: string | null
  status: AthleteStatus
  paymentStatus: PaymentStatus
  registrationDate: Date
  createdAt: Date
  updatedAt: Date
  parentId: string
}

export interface Training {
  id: string
  name: string
  description?: string | null
  startDate: Date
  endDate: Date
  location?: string | null
  isRecurring: boolean
  recurringDays: string[]
  maxParticipants?: number | null
  createdAt: Date
  updatedAt: Date
  coachId: string
  sportsBranchId?: string | null
  trainingGroupId?: string | null
}

export interface Payment {
  id: string
  athleteId: string
  amount: number
  currency: string
  description?: string | null
  paymentDate: Date
  method: PaymentMethod
  status: PaymentStatus
  reference?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AccountEntry {
  id: string
  athleteId: string
  type: AccountEntryType
  description: string
  amountExcludingVat: number
  vatRate: number
  vatAmount: number
  amountIncludingVat: number
  unitCode?: string | null
  month?: string | null
  invoiceNumber?: string | null
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Extended types with relations
export interface AthleteWithRelations extends Athlete {
  parent: {
    id: string
    user: {
      firstName: string
      lastName: string
      email: string
      phone: string | null
    }
    tcNo: string | null
    relation: string | null
  }
  sportsBranches: {
    sportsBranch: {
      id: string
      name: string
    }
  }[]
  trainingGroups: {
    trainingGroup: {
      id: string
      name: string
    }
  }[]
  payments: Payment[]
  accountEntries: AccountEntry[]
}

export interface UserWithProfile extends User {
  adminProfile?: {
    id: string
    permissions: any
  } | null
  coachProfile?: {
    id: string
    sportsBranches: string[]
    trainingGroups: string[]
  } | null
  parentProfile?: {
    id: string
    tcNo: string | null
    relation: string | null
    athletes: Athlete[]
  } | null
}

export interface TrainingWithRelations extends Training {
  coach: {
    id: string
    user: {
      firstName: string
      lastName: string
    }
  }
  sportsBranch?: {
    id: string
    name: string
  } | null
  trainingGroup?: {
    id: string
    name: string
  } | null
  attendances: {
    id: string
    athlete: {
      id: string
      firstName: string
      lastName: string
    }
    status: AttendanceStatus
  }[]
}

// Form types
export interface AthleteFormData {
  firstName: string
  lastName: string
  tcNo?: string
  birthDate?: string
  age?: number
  gender?: string
  school?: string
  class?: string
  photo?: string
  sportsBranches: string[]
  parent: {
    firstName: string
    lastName: string
    email: string
    phone: string
    tcNo?: string
    relation?: string
  }
}

export interface UserFormData {
  email: string
  username?: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  // Role-specific data
  adminData?: {
    permissions?: any
  }
  coachData?: {
    sportsBranches: string[]
    trainingGroups: string[]
  }
  parentData?: {
    tcNo?: string
    relation?: string
  }
}

export interface TrainingFormData {
  name: string
  description?: string
  startDate: string
  endDate: string
  location?: string
  isRecurring: boolean
  recurringDays: string[]
  maxParticipants?: number
  sportsBranchId?: string
  trainingGroupId?: string
}

export interface PaymentFormData {
  athleteId: string
  amount: number
  currency: string
  description?: string
  paymentDate: string
  method: PaymentMethod
  reference?: string
}

export interface AccountEntryFormData {
  athleteId: string
  type: AccountEntryType
  description: string
  amountExcludingVat: number
  vatRate: number
  unitCode?: string
  month?: string
  invoiceNumber?: string
}

// Filter and search types
export interface AthleteFilters {
  search?: string
  sportsBranch?: string
  status?: AthleteStatus
  paymentStatus?: PaymentStatus
  parentId?: string
  page?: number
  limit?: number
  sortBy?: 'firstName' | 'lastName' | 'registrationDate' | 'birthDate'
  sortOrder?: 'asc' | 'desc'
}

export interface TrainingFilters {
  search?: string
  coachId?: string
  sportsBranchId?: string
  trainingGroupId?: string
  startDate?: string
  endDate?: string
  isRecurring?: boolean
  page?: number
  limit?: number
  sortBy?: 'startDate' | 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface PaymentFilters {
  athleteId?: string
  status?: PaymentStatus
  method?: PaymentMethod
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sortBy?: 'paymentDate' | 'amount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// Dashboard statistics
export interface DashboardStats {
  totalAthletes: number
  activeAthletes: number
  totalTrainings: number
  upcomingTrainings: number
  totalPayments: number
  monthlyRevenue: number
  overduePayments: number
  attendanceRate: number
}

// Bulk operations
export interface BulkAthleteData {
  athletes: AthleteFormData[]
  skipDuplicates?: boolean
  mergeStrategy?: 'skip' | 'update' | 'merge'
}

export interface BulkPaymentData {
  payments: {
    athleteIdentifier: string // TC No, name, or ID
    amount: number
    description: string
    paymentDate: string
    method: PaymentMethod
    reference?: string
  }[]
  matchingStrategy?: 'tcNo' | 'name' | 'id'
  autoMatch?: boolean
}

// Migration types
export interface MigrationResult {
  success: boolean
  migratedCount: number
  errors: string[]
  warnings: string[]
  summary: {
    users: number
    athletes: number
    trainings: number
    payments: number
    accountEntries: number
  }
}

// Audit log types
export interface AuditLogEntry {
  action: string
  resource: string
  resourceId?: string
  details?: any
  ipAddress?: string
  userAgent?: string
}

// System settings
export interface SystemSettings {
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
  currency: string
  timezone: string
  defaultVatRate: number
  paymentMethods: PaymentMethod[]
  sportsBranches: string[]
  trainingLocations: string[]
  emailNotifications: boolean
  smsNotifications: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
}

// PWA types
export interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface ServiceWorkerMessage {
  type: 'SKIP_WAITING' | 'CACHE_UPDATED' | 'OFFLINE_READY'
  payload?: any
}

// Performance monitoring
export interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  databaseQueryTime: number
  memoryUsage: number
  errorRate: number
  timestamp: string
}

