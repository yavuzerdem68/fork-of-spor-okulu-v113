/**
 * Code cleanup utilities for removing duplicated code and improving type safety
 */

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+90|0)?[5][0-9]{9}$/,
  tcNo: /^[1-9][0-9]{10}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const

// Common form validation functions
export const validateEmail = (email: string): boolean => {
  return ValidationPatterns.email.test(email)
}

export const validatePhone = (phone: string): boolean => {
  return ValidationPatterns.phone.test(phone)
}

export const validateTcNo = (tcNo: string): boolean => {
  if (!ValidationPatterns.tcNo.test(tcNo)) return false
  
  // TC Kimlik No algorithm validation
  const digits = tcNo.split('').map(Number)
  const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7]
  const check1 = (sum1 * 7 - sum2) % 10
  const check2 = (sum1 + sum2 + digits[9]) % 10
  
  return check1 === digits[9] && check2 === digits[10]
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir')
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Şifre en az bir özel karakter içermelidir')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Common date utilities
export const DateUtils = {
  formatDate: (date: Date | string, locale: string = 'tr-TR'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString(locale)
  },
  
  formatDateTime: (date: Date | string, locale: string = 'tr-TR'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleString(locale)
  },
  
  calculateAge: (birthDate: Date | string): number => {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  },
  
  isValidDate: (date: any): boolean => {
    return date instanceof Date && !isNaN(date.getTime())
  },
  
  parseDate: (dateString: string): Date | null => {
    if (!dateString) return null
    
    // Handle Turkish date format (DD.MM.YYYY)
    const turkishMatch = dateString.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
    if (turkishMatch) {
      const [, day, month, year] = turkishMatch
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return DateUtils.isValidDate(date) ? date : null
    }
    
    // Handle ISO format
    const date = new Date(dateString)
    return DateUtils.isValidDate(date) ? date : null
  }
}

// Common string utilities
export const StringUtils = {
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },
  
  capitalizeWords: (str: string): string => {
    return str.split(' ').map(StringUtils.capitalize).join(' ')
  },
  
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  },
  
  truncate: (str: string, length: number, suffix: string = '...'): string => {
    if (str.length <= length) return str
    return str.slice(0, length - suffix.length) + suffix
  },
  
  removeAccents: (str: string): string => {
    const accents = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
    }
    return str.replace(/[çğıöşüÇĞİÖŞÜ]/g, (match) => accents[match as keyof typeof accents] || match)
  },
  
  similarity: (str1: string, str2: string): number => {
    const normalize = (s: string) => StringUtils.removeAccents(s.toLowerCase().trim())
    const a = normalize(str1)
    const b = normalize(str2)
    
    if (a === b) return 100
    
    // Levenshtein distance
    const matrix: number[][] = []
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    const maxLength = Math.max(a.length, b.length)
    const distance = matrix[b.length][a.length]
    return Math.round(((maxLength - distance) / maxLength) * 100)
  }
}

// Common number utilities
export const NumberUtils = {
  formatCurrency: (amount: number, currency: string = 'TRY', locale: string = 'tr-TR'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount)
  },
  
  formatNumber: (num: number, locale: string = 'tr-TR'): string => {
    return new Intl.NumberFormat(locale).format(num)
  },
  
  parseNumber: (str: string): number | null => {
    const cleaned = str.replace(/[^\d.,]/g, '').replace(',', '.')
    const num = parseFloat(cleaned)
    return isNaN(num) ? null : num
  },
  
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max)
  },
  
  round: (value: number, decimals: number = 2): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
  }
}

// Common array utilities
export const ArrayUtils = {
  unique: <T>(array: T[]): T[] => {
    return [...new Set(array)]
  },
  
  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key])
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {} as Record<string, T[]>)
  },
  
  sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
  },
  
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  },
  
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}

// Common object utilities
export const ObjectUtils = {
  pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key]
      }
    })
    return result
  },
  
  omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj }
    keys.forEach(key => {
      delete result[key]
    })
    return result
  },
  
  isEmpty: (obj: any): boolean => {
    if (obj == null) return true
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0
    if (obj instanceof Map || obj instanceof Set) return obj.size === 0
    return Object.keys(obj).length === 0
  },
  
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
    if (obj instanceof Array) return obj.map(item => ObjectUtils.deepClone(item)) as unknown as T
    if (typeof obj === 'object') {
      const cloned = {} as T
      Object.keys(obj).forEach(key => {
        (cloned as any)[key] = ObjectUtils.deepClone((obj as any)[key])
      })
      return cloned
    }
    return obj
  }
}

// Common localStorage utilities with type safety
export const StorageUtils = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch {
      return defaultValue || null
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }
}

// Common error handling
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const ErrorUtils = {
  createError: (message: string, code?: string, statusCode?: number, details?: any): AppError => {
    return new AppError(message, code, statusCode, details)
  },
  
  isAppError: (error: any): error is AppError => {
    return error instanceof AppError
  },
  
  formatError: (error: any): string => {
    if (ErrorUtils.isAppError(error)) {
      return error.message
    }
    if (error instanceof Error) {
      return error.message
    }
    return String(error)
  }
}

// Performance monitoring utilities
export const PerformanceUtils = {
  measure: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now()
    try {
      const result = await fn()
      const end = performance.now()
      console.log(`${name} took ${end - start} milliseconds`)
      return result
    } catch (error) {
      const end = performance.now()
      console.error(`${name} failed after ${end - start} milliseconds:`, error)
      throw error
    }
  },
  
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },
  
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }
}