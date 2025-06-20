import { AthletesService } from '@/services/athletes'
import { api } from '@/lib/api'
import { AthleteFormData, AthleteFilters } from '@/types'

// Mock the api module
jest.mock('@/lib/api')
const mockApi = api as jest.Mocked<typeof api>

describe('AthletesService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAthletes', () => {
    it('should fetch athletes with default filters', async () => {
      const mockResponse = {
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      }
      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await AthletesService.getAthletes()

      expect(mockApi.get).toHaveBeenCalledWith('/athletes')
      expect(result).toEqual(mockResponse)
    })

    it('should fetch athletes with filters', async () => {
      const filters: AthleteFilters = {
        search: 'John',
        sportsBranch: 'Basketball',
        status: 'ACTIVE',
        page: 2,
        limit: 20
      }
      const mockResponse = {
        success: true,
        data: [],
        pagination: { page: 2, limit: 20, total: 0, totalPages: 0 }
      }
      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await AthletesService.getAthletes(filters)

      expect(mockApi.get).toHaveBeenCalledWith('/athletes?search=John&sportsBranch=Basketball&status=ACTIVE&page=2&limit=20')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getAthlete', () => {
    it('should fetch single athlete by ID', async () => {
      const athleteId = 'athlete-123'
      const mockResponse = {
        success: true,
        data: { id: athleteId, firstName: 'John', lastName: 'Doe' }
      }
      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await AthletesService.getAthlete(athleteId)

      expect(mockApi.get).toHaveBeenCalledWith('/athletes/athlete-123')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createAthlete', () => {
    it('should create new athlete', async () => {
      const athleteData: AthleteFormData = {
        firstName: 'John',
        lastName: 'Doe',
        tcNo: '12345678901',
        birthDate: '2010-01-01',
        age: 14,
        gender: 'Male',
        sportsBranches: ['Basketball'],
        parent: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          phone: '+905551234567',
          tcNo: '98765432109',
          relation: 'Mother'
        }
      }
      const mockResponse = {
        success: true,
        data: { id: 'athlete-123', ...athleteData }
      }
      mockApi.post.mockResolvedValueOnce(mockResponse)

      const result = await AthletesService.createAthlete(athleteData)

      expect(mockApi.post).toHaveBeenCalledWith('/athletes', athleteData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateAthlete', () => {
    it('should update athlete', async () => {
      const athleteId = 'athlete-123'
      const updateData = { firstName: 'Johnny' }
      const mockResponse = {
        success: true,
        data: { id: athleteId, firstName: 'Johnny', lastName: 'Doe' }
      }
      mockApi.put.mockResolvedValueOnce(mockResponse)

      const result = await AthletesService.updateAthlete(athleteId, updateData)

      expect(mockApi.put).toHaveBeenCalledWith('/athletes/athlete-123', updateData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteAthlete', () => {
    it('should delete athlete', async () => {
      const athleteId = 'athlete-123'
      const mockResponse = { success: true }
      mockApi.delete.mockResolvedValueOnce(mockResponse)

      const result = await AthletesService.deleteAthlete(athleteId)

      expect(mockApi.delete).toHaveBeenCalledWith('/athletes/athlete-123')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateAthleteStatus', () => {
    it('should update athlete status', async () => {
      const athleteId = 'athlete-123'
      const status = 'INACTIVE'
      const mockResponse = {
        success: true,
        data: { id: athleteId, status: 'INACTIVE' }
      }
      mockApi.patch.mockResolvedValueOnce(mockResponse)

      const result = await AthletesService.updateAthleteStatus(athleteId, status)

      expect(mockApi.patch).toHaveBeenCalledWith('/athletes/athlete-123/status', { status })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('searchAthletes', () => {
    it('should search athletes by query', async () => {
      const query = 'John Doe'
      const mockResponse = {
        success: true,
        data: [{ id: 'athlete-123', firstName: 'John', lastName: 'Doe' }]
      }
      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await AthletesService.searchAthletes(query)

      expect(mockApi.get).toHaveBeenCalledWith('/athletes/search?q=John%20Doe')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('bulkCreateAthletes', () => {
    it('should create multiple athletes', async () => {
      const bulkData = {
        athletes: [
          {
            firstName: 'John',
            lastName: 'Doe',
            sportsBranches: ['Basketball'],
            parent: {
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane.doe@example.com',
              phone: '+905551234567'
            }
          }
        ],
        skipDuplicates: true
      }
      const mockResponse = {
        success: true,
        data: { created: 1, updated: 0, errors: [] }
      }
      mockApi.post.mockResolvedValueOnce(mockResponse)

      const result = await AthletesService.bulkCreateAthletes(bulkData)

      expect(mockApi.post).toHaveBeenCalledWith('/athletes/bulk', bulkData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getAthleteStats', () => {
    it('should fetch athlete statistics', async () => {
      const athleteId = 'athlete-123'
      const mockResponse = {
        success: true,
        data: {
          totalTrainings: 50,
          attendanceRate: 85.5,
          totalPayments: 10,
          currentBalance: 150.00,
          performanceMetrics: []
        }
      }
      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await AthletesService.getAthleteStats(athleteId)

      expect(mockApi.get).toHaveBeenCalledWith('/athletes/athlete-123/stats')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('exportAthletes', () => {
    it('should export athletes with filters', async () => {
      const filters: AthleteFilters = { status: 'ACTIVE' }
      const mockResponse = {
        success: true,
        data: { downloadUrl: 'https://example.com/export.xlsx' }
      }
      mockApi.get.mockResolvedValueOnce(mockResponse)

      const result = await AthletesService.exportAthletes(filters)

      expect(mockApi.get).toHaveBeenCalledWith('/athletes/export?status=ACTIVE')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('mergeDuplicateAthletes', () => {
    it('should merge duplicate athletes', async () => {
      const primaryId = 'athlete-123'
      const duplicateIds = ['athlete-456', 'athlete-789']
      const mockResponse = {
        success: true,
        data: { id: primaryId, firstName: 'John', lastName: 'Doe' }
      }
      mockApi.post.mockResolvedValueOnce(mockResponse)

      const result = await AthletesService.mergeDuplicateAthletes(primaryId, duplicateIds)

      expect(mockApi.post).toHaveBeenCalledWith('/athletes/athlete-123/merge', { duplicateIds })
      expect(result).toEqual(mockResponse)
    })
  })
})