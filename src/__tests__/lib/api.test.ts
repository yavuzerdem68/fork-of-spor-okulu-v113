import { api, buildQueryString, createSuccessResponse, createErrorResponse, createPaginatedResponse, ApiError } from '@/lib/api'

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('API Library', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('buildQueryString', () => {
    it('should build query string from object', () => {
      const params = {
        page: 1,
        limit: 10,
        search: 'test',
        active: true
      }
      const result = buildQueryString(params)
      expect(result).toBe('?page=1&limit=10&search=test&active=true')
    })

    it('should handle empty object', () => {
      const result = buildQueryString({})
      expect(result).toBe('')
    })

    it('should skip undefined and null values', () => {
      const params = {
        page: 1,
        search: undefined,
        filter: null,
        active: true
      }
      const result = buildQueryString(params)
      expect(result).toBe('?page=1&active=true')
    })

    it('should handle arrays', () => {
      const params = {
        tags: ['sports', 'fitness'],
        page: 1
      }
      const result = buildQueryString(params)
      expect(result).toBe('?tags=sports&tags=fitness&page=1')
    })
  })

  describe('Response helpers', () => {
    it('should create success response', () => {
      const data = { id: 1, name: 'Test' }
      const response = createSuccessResponse(data, 'Success message')
      
      expect(response).toEqual({
        success: true,
        data,
        message: 'Success message'
      })
    })

    it('should create error response', () => {
      const response = createErrorResponse('Error message', 'ERROR_CODE')
      
      expect(response).toEqual({
        success: false,
        error: 'Error message'
      })
    })

    it('should create paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }]
      const response = createPaginatedResponse(data, 1, 10, 25)
      
      expect(response).toEqual({
        success: true,
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3
        }
      })
    })
  })

  describe('API requests', () => {
    it('should make GET request successfully', async () => {
      const mockData = { id: 1, name: 'Test' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createSuccessResponse(mockData)
      } as Response)

      const result = await api.get('/test')
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      )
      expect(result).toEqual(createSuccessResponse(mockData))
    })

    it('should make POST request with data', async () => {
      const postData = { name: 'New Item' }
      const responseData = { id: 1, ...postData }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createSuccessResponse(responseData)
      } as Response)

      const result = await api.post('/test', postData)
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
          headers: {
            'Content-Type': 'application/json'
          }
        })
      )
      expect(result).toEqual(createSuccessResponse(responseData))
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid data', code: 'VALIDATION_ERROR' })
      } as Response)

      await expect(api.get('/test')).rejects.toThrow(ApiError)
      
      try {
        await api.get('/test')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).status).toBe(400)
        expect((error as ApiError).message).toBe('Invalid data')
        expect((error as ApiError).code).toBe('VALIDATION_ERROR')
      }
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(api.get('/test')).rejects.toThrow(ApiError)
      
      try {
        await api.get('/test')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).status).toBe(0)
        expect((error as ApiError).code).toBe('NETWORK_ERROR')
      }
    })

    it('should handle timeout', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      )

      await expect(api.get('/test', { timeout: 100 })).rejects.toThrow(ApiError)
      
      try {
        await api.get('/test', { timeout: 100 })
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).code).toBe('TIMEOUT')
      }
    })
  })
})