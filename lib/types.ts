export interface Profile {
  id: string
  email: string
  name?: string
  timezone: string
  morning_email_enabled: boolean
  evening_reminder_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  user_id: string
  load_before: number
  load_after: number
  open_loops?: string
  emotional_residue?: string
  tomorrow_anchor?: string
  started_at: string
  completed_at?: string
  duration_seconds?: number
  load_delta: number
  created_at: string
}

export interface MorningCheckin {
  id: string
  user_id: string
  session_id?: string
  sharpness: number
  created_at: string
}

export interface Streak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_session_date?: string
  updated_at: string
}

export interface WeeklyAnalysis {
  id: string
  user_id: string
  week_start: string
  week_end: string
  total_sessions: number
  avg_load_drop: number
  avg_sharpness?: number
  patterns: Pattern[]
  insights: string
  common_themes: Record<string, number>
  created_at: string
}

export interface Pattern {
  type: 'timing' | 'theme' | 'correlation' | 'trend'
  title: string
  description: string
}

export interface WeekDay {
  day: string
  date: Date
  delta: number | null
  completed: boolean
  isToday: boolean
  isBest: boolean
}
