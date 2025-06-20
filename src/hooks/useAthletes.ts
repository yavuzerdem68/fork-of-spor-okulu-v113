import { useState, useEffect, useCallback } from 'react'
import { AthletesService } from '@/services/athletes'
import { AthleteWithRelations, AthleteFilters, AthleteFormData, ApiResponse, PaginatedResponse } from '@/types'

interface UseAthletesState {
  athletes: AthleteWithRelations[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseAthletesActions {
  fetchAthletes: (filters?: AthleteFilters) => Promise<void>
  createAthlete: (data: AthleteFormData) => Promise<AthleteWithRelations | null>
  updateAthlete: (id: string, data: Partial<AthleteFormData>) => Promise<AthleteWithRelations | null>
  deleteAthlete: (id: string) => Promise<boolean>
  updateAthleteStatus: (id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => Promise<boolean>
  searchAthletes: (query: string) => Promise<AthleteWithRelations[]>
  refreshAthletes: () => Promise<void>
}

export function useAthletes(initialFilters?: AthleteFilters): UseAthletesState & UseAthletesActions {
  const [state, setState] = useState<UseAthletesState>({
    athletes: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    }
  })

  const [currentFilters, setCurrentFilters] = useState<AthleteFilters>(initialFilters || {})

  const fetchAthletes = useCallback(async (filters?: AthleteFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const filtersToUse = filters || currentFilters
      setCurrentFilters(filtersToUse)
      
      const response: PaginatedResponse<AthleteWithRelations> = await AthletesService.getAthletes(filtersToUse)
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          athletes: response.data || [],
          pagination: response.pagination,
          loading: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to fetch athletes',
          loading: false
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false
      }))
    }
  }, [currentFilters])

  const createAthlete = useCallback(async (data: AthleteFormData): Promise<AthleteWithRelations | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response: ApiResponse<AthleteWithRelations> = await AthletesService.createAthlete(data)
      
      if (response.success && response.data) {
        // Add new athlete to the list
        setState(prev => ({
          ...prev,
          athletes: [response.data!, ...prev.athletes],
          pagination: {
            ...prev.pagination,
            total: prev.pagination.total + 1
          },
          loading: false
        }))
        return response.data
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to create athlete',
          loading: false
        }))
        return null
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false
      }))
      return null
    }
  }, [])

  const updateAthlete = useCallback(async (id: string, data: Partial<AthleteFormData>): Promise<AthleteWithRelations | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response: ApiResponse<AthleteWithRelations> = await AthletesService.updateAthlete(id, data)
      
      if (response.success && response.data) {
        // Update athlete in the list
        setState(prev => ({
          ...prev,
          athletes: prev.athletes.map(athlete => 
            athlete.id === id ? response.data! : athlete
          ),
          loading: false
        }))
        return response.data
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to update athlete',
          loading: false
        }))
        return null
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false
      }))
      return null
    }
  }, [])

  const deleteAthlete = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await AthletesService.deleteAthlete(id)
      
      if (response.success) {
        // Remove athlete from the list
        setState(prev => ({
          ...prev,
          athletes: prev.athletes.filter(athlete => athlete.id !== id),
          pagination: {
            ...prev.pagination,
            total: prev.pagination.total - 1
          },
          loading: false
        }))
        return true
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to delete athlete',
          loading: false
        }))
        return false
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false
      }))
      return false
    }
  }, [])

  const updateAthleteStatus = useCallback(async (id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await AthletesService.updateAthleteStatus(id, status)
      
      if (response.success && response.data) {
        // Update athlete status in the list
        setState(prev => ({
          ...prev,
          athletes: prev.athletes.map(athlete => 
            athlete.id === id ? { ...athlete, status: response.data!.status } : athlete
          ),
          loading: false
        }))
        return true
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to update athlete status',
          loading: false
        }))
        return false
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false
      }))
      return false
    }
  }, [])

  const searchAthletes = useCallback(async (query: string): Promise<AthleteWithRelations[]> => {
    try {
      const response = await AthletesService.searchAthletes(query)
      
      if (response.success && response.data) {
        return response.data
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to search athletes'
        }))
        return []
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred'
      }))
      return []
    }
  }, [])

  const refreshAthletes = useCallback(async () => {
    await fetchAthletes(currentFilters)
  }, [fetchAthletes, currentFilters])

  // Initial fetch
  useEffect(() => {
    fetchAthletes(initialFilters)
  }, []) // Only run on mount

  return {
    ...state,
    fetchAthletes,
    createAthlete,
    updateAthlete,
    deleteAthlete,
    updateAthleteStatus,
    searchAthletes,
    refreshAthletes
  }
}

// Hook for single athlete
export function useAthlete(id: string) {
  const [athlete, setAthlete] = useState<AthleteWithRelations | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAthlete = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const response = await AthletesService.getAthlete(id)
      
      if (response.success && response.data) {
        setAthlete(response.data)
      } else {
        setError(response.error || 'Failed to fetch athlete')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchAthlete()
  }, [fetchAthlete])

  return {
    athlete,
    loading,
    error,
    refetch: fetchAthlete
  }
}