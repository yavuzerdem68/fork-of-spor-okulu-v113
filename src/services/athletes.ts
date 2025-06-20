import { api, buildQueryString } from '@/lib/api'
import { 
  AthleteWithRelations, 
  AthleteFormData, 
  AthleteFilters, 
  PaginatedResponse,
  ApiResponse,
  BulkAthleteData
} from '@/types'

export class AthletesService {
  private static readonly BASE_PATH = '/athletes'

  // Get all athletes with filters and pagination
  static async getAthletes(filters: AthleteFilters = {}): Promise<PaginatedResponse<AthleteWithRelations>> {
    const queryString = buildQueryString(filters)
    return api.get<AthleteWithRelations[]>(`${this.BASE_PATH}${queryString}`)
  }

  // Get athlete by ID
  static async getAthlete(id: string): Promise<ApiResponse<AthleteWithRelations>> {
    return api.get<AthleteWithRelations>(`${this.BASE_PATH}/${id}`)
  }

  // Create new athlete
  static async createAthlete(data: AthleteFormData): Promise<ApiResponse<AthleteWithRelations>> {
    return api.post<AthleteWithRelations>(this.BASE_PATH, data)
  }

  // Update athlete
  static async updateAthlete(id: string, data: Partial<AthleteFormData>): Promise<ApiResponse<AthleteWithRelations>> {
    return api.put<AthleteWithRelations>(`${this.BASE_PATH}/${id}`, data)
  }

  // Delete athlete
  static async deleteAthlete(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${this.BASE_PATH}/${id}`)
  }

  // Bulk create athletes
  static async bulkCreateAthletes(data: BulkAthleteData): Promise<ApiResponse<{
    created: number
    updated: number
    errors: string[]
  }>> {
    return api.post<any>(`${this.BASE_PATH}/bulk`, data)
  }

  // Update athlete status
  static async updateAthleteStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<ApiResponse<AthleteWithRelations>> {
    return api.patch<AthleteWithRelations>(`${this.BASE_PATH}/${id}/status`, { status })
  }

  // Upload athlete photo
  static async uploadAthletePhoto(id: string, file: File): Promise<ApiResponse<{ photoUrl: string }>> {
    const formData = new FormData()
    formData.append('photo', file)
    
    return api.post<{ photoUrl: string }>(`${this.BASE_PATH}/${id}/photo`, formData, {
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      }
    })
  }

  // Get athlete statistics
  static async getAthleteStats(id: string): Promise<ApiResponse<{
    totalTrainings: number
    attendanceRate: number
    totalPayments: number
    currentBalance: number
    performanceMetrics: any[]
  }>> {
    return api.get<any>(`${this.BASE_PATH}/${id}/stats`)
  }

  // Search athletes by name or TC
  static async searchAthletes(query: string): Promise<ApiResponse<AthleteWithRelations[]>> {
    return api.get<AthleteWithRelations[]>(`${this.BASE_PATH}/search?q=${encodeURIComponent(query)}`)
  }

  // Get athletes by parent
  static async getAthletesByParent(parentId: string): Promise<ApiResponse<AthleteWithRelations[]>> {
    return api.get<AthleteWithRelations[]>(`${this.BASE_PATH}/parent/${parentId}`)
  }

  // Get athletes by sports branch
  static async getAthletesBySportsBranch(sportsBranchId: string): Promise<ApiResponse<AthleteWithRelations[]>> {
    return api.get<AthleteWithRelations[]>(`${this.BASE_PATH}/sports-branch/${sportsBranchId}`)
  }

  // Get athletes by training group
  static async getAthletesByTrainingGroup(trainingGroupId: string): Promise<ApiResponse<AthleteWithRelations[]>> {
    return api.get<AthleteWithRelations[]>(`${this.BASE_PATH}/training-group/${trainingGroupId}`)
  }

  // Export athletes to Excel
  static async exportAthletes(filters: AthleteFilters = {}): Promise<ApiResponse<{ downloadUrl: string }>> {
    const queryString = buildQueryString(filters)
    return api.get<{ downloadUrl: string }>(`${this.BASE_PATH}/export${queryString}`)
  }

  // Get duplicate athletes
  static async getDuplicateAthletes(): Promise<ApiResponse<{
    duplicates: Array<{
      criteria: string
      athletes: AthleteWithRelations[]
    }>
  }>> {
    return api.get<any>(`${this.BASE_PATH}/duplicates`)
  }

  // Merge duplicate athletes
  static async mergeDuplicateAthletes(primaryId: string, duplicateIds: string[]): Promise<ApiResponse<AthleteWithRelations>> {
    return api.post<AthleteWithRelations>(`${this.BASE_PATH}/${primaryId}/merge`, { duplicateIds })
  }

  // Get athlete attendance summary
  static async getAthleteAttendance(id: string, startDate?: string, endDate?: string): Promise<ApiResponse<{
    totalTrainings: number
    attendedTrainings: number
    attendanceRate: number
    attendanceHistory: Array<{
      date: string
      trainingName: string
      status: string
    }>
  }>> {
    const params = { startDate, endDate }
    const queryString = buildQueryString(params)
    return api.get<any>(`${this.BASE_PATH}/${id}/attendance${queryString}`)
  }

  // Get athlete payment summary
  static async getAthletePayments(id: string, startDate?: string, endDate?: string): Promise<ApiResponse<{
    totalPaid: number
    totalDue: number
    currentBalance: number
    paymentHistory: Array<{
      date: string
      amount: number
      description: string
      status: string
    }>
  }>> {
    const params = { startDate, endDate }
    const queryString = buildQueryString(params)
    return api.get<any>(`${this.BASE_PATH}/${id}/payments${queryString}`)
  }
}

// Export default instance for convenience
export const athletesService = AthletesService