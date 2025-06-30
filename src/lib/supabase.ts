import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database types
export interface Athlete {
  id: string
  created_at: string
  updated_at: string
  name: string
  surname: string
  tc_no?: string
  birth_date?: string
  phone?: string
  email?: string
  parent_name?: string
  parent_phone?: string
  parent_email?: string
  address?: string
  sports_branch?: string
  level?: string
  notes?: string
  status: 'active' | 'inactive' | 'suspended'
  metadata?: any
}

export interface Diagnostic {
  id: string
  created_at: string
  athlete_id: string
  test_date: string
  height?: number
  weight?: number
  body_fat_percentage?: number
  muscle_mass?: number
  flexibility_score?: number
  endurance_score?: number
  strength_score?: number
  speed_score?: number
  agility_score?: number
  balance_score?: number
  coordination_score?: number
  notes?: string
  metadata?: any
}

export interface Payment {
  id: string
  created_at: string
  athlete_id: string
  amount: number
  payment_date: string
  payment_method?: string
  description?: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  metadata?: any
}

export interface Training {
  id: string
  created_at: string
  title: string
  description?: string
  training_date: string
  duration_minutes?: number
  sports_branch?: string
  level?: string
  max_participants?: number
  status: 'scheduled' | 'completed' | 'cancelled'
  metadata?: any
}

export interface TrainingAttendance {
  id: string
  created_at: string
  training_id: string
  athlete_id: string
  attendance_status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
}

// Athlete operations
export const athleteService = {
  async getAll(): Promise<Athlete[]> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Athlete | null> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(athlete: Omit<Athlete, 'id' | 'created_at' | 'updated_at'>): Promise<Athlete> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('athletes')
      .insert([athlete])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Athlete>): Promise<Athlete> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('athletes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('athletes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async search(query: string): Promise<Athlete[]> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .or(`name.ilike.%${query}%,surname.ilike.%${query}%,tc_no.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Diagnostic operations
export const diagnosticService = {
  async getByAthleteId(athleteId: string): Promise<Diagnostic[]> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('diagnostics')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('test_date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(diagnostic: Omit<Diagnostic, 'id' | 'created_at'>): Promise<Diagnostic> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('diagnostics')
      .insert([diagnostic])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Diagnostic>): Promise<Diagnostic> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('diagnostics')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('diagnostics')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Payment operations
export const paymentService = {
  async getByAthleteId(athleteId: string): Promise<Payment[]> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('payment_date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Payment>): Promise<Payment> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async getMonthlyRevenue(year: number, month: number): Promise<number> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
    
    if (error) throw error
    
    return data?.reduce((sum, payment) => sum + payment.amount, 0) || 0
  }
}

// Training operations
export const trainingService = {
  async getAll(): Promise<Training[]> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('trainings')
      .select('*')
      .order('training_date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(training: Omit<Training, 'id' | 'created_at'>): Promise<Training> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('trainings')
      .insert([training])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Training>): Promise<Training> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('trainings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('trainings')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Training attendance operations
export const attendanceService = {
  async getByTrainingId(trainingId: string): Promise<TrainingAttendance[]> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('training_attendance')
      .select(`
        *,
        athletes (
          id,
          name,
          surname
        )
      `)
      .eq('training_id', trainingId)
    
    if (error) throw error
    return data || []
  },

  async markAttendance(attendance: Omit<TrainingAttendance, 'id' | 'created_at'>): Promise<TrainingAttendance> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('training_attendance')
      .upsert([attendance])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Real-time subscriptions
export const subscriptions = {
  athletes: (callback: (payload: any) => void) => {
    if (!supabase) throw new Error('Supabase not configured')
    
    return supabase
      .channel('athletes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'athletes' }, callback)
      .subscribe()
  },

  trainings: (callback: (payload: any) => void) => {
    if (!supabase) throw new Error('Supabase not configured')
    
    return supabase
      .channel('trainings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trainings' }, callback)
      .subscribe()
  }
}

// Auth helpers
export const auth = {
  async signUp(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async signOut() {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getUser() {
    if (!supabase) return null
    
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!supabase) throw new Error('Supabase not configured')
    
    return supabase.auth.onAuthStateChange(callback)
  }
}