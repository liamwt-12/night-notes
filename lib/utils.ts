import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parseISO } from 'date-fns'
import type { Session, WeekDay } from './types'

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'h:mm a')
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEE, MMM d')
}

export function getWeekData(sessions: Session[]): WeekDay[] {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Find best session
  const weekSessions = sessions.filter(s => {
    if (!s.completed_at) return false
    const d = parseISO(s.completed_at)
    return d >= weekStart && d <= weekEnd
  })
  
  const bestSession = weekSessions.reduce((best, s) => 
    (s.load_delta || 0) > (best?.load_delta || 0) ? s : best
  , weekSessions[0])

  return days.map(date => {
    const dayLabel = format(date, 'EEE')[0]
    const session = weekSessions.find(s => 
      s.completed_at && format(parseISO(s.completed_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )

    return {
      day: dayLabel,
      date,
      delta: session?.load_delta ?? null,
      completed: !!session,
      isToday: isToday(date),
      isBest: session?.id === bestSession?.id,
    }
  })
}

export function calculateAvgDrop(sessions: Session[]): number {
  const completed = sessions.filter(s => s.load_delta !== null)
  if (completed.length === 0) return 0
  const total = completed.reduce((sum, s) => sum + (s.load_delta || 0), 0)
  return Math.round((total / completed.length) * 10) / 10
}
