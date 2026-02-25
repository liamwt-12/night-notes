'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns'
import { getWeekData, calculateAvgDrop } from '@/lib/utils'
import type { Session, MorningCheckin, WeeklyAnalysis } from '@/lib/types'

export default function InsightsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [checkins, setCheckins] = useState<MorningCheckin[]>([])
  const [analysis, setAnalysis] = useState<WeeklyAnalysis | null>(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/')
      return
    }

    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .gte('completed_at', weekStart.toISOString())
      .lte('completed_at', weekEnd.toISOString())
      .order('completed_at', { ascending: false })

    const { data: streakData } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .single()

    const { data: checkinsData } = await supabase
      .from('morning_checkins')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', weekStart.toISOString())

    const { data: analysisData } = await supabase
      .from('weekly_analyses')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', format(weekStart, 'yyyy-MM-dd'))
      .single()

    setSessions((sessionsData as Session[]) || [])
    setCheckins((checkinsData as MorningCheckin[]) || [])
    setAnalysis(analysisData as WeeklyAnalysis | null)
    setStreak(streakData?.current_streak || 0)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-4 h-4 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const avgDrop = calculateAvgDrop(sessions)
  const weekData = getWeekData(sessions)
  
  const bestSession = sessions.reduce((best, s) => 
    (s.load_delta || 0) > (best?.load_delta || 0) ? s : best
  , sessions[0])

  const avgSharpness = checkins.length > 0
    ? checkins.reduce((sum, c) => sum + c.sharpness, 0) / checkins.length
    : 0

  return (
    <div className="max-w-md mx-auto px-6 min-h-screen pb-20 bg-black">
      {/* Header */}
      <header className="flex justify-between items-baseline py-6 border-b border-gray-900">
        <h1 className="font-serif text-lg italic text-white">This Week</h1>
        <span className="text-xs text-gray-700">
          {format(weekStart, 'MMM d')} – {format(weekEnd, 'd')}
        </span>
      </header>

      {/* Hero stat */}
      <section className="py-12 border-b border-gray-900 text-center">
        <p className="text-xs text-gray-700 tracking-widest uppercase mb-4">Average mental load drop</p>
        <div className="font-serif text-7xl text-white tracking-tight">−{Math.abs(avgDrop).toFixed(1)}</div>
        <p className="text-sm text-gray-500 mt-3">across {sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
      </section>

      {/* Stats */}
      <section className="py-6 border-b border-gray-900">
        <div className="flex justify-between items-baseline py-3 border-b border-gray-900">
          <span className="text-sm text-gray-500">Current streak</span>
          <span className="font-serif text-2xl text-white">{streak} nights</span>
        </div>
        <div className="flex justify-between items-baseline py-3 border-b border-gray-900">
          <span className="text-sm text-gray-500">Morning sharpness</span>
          <span className="font-serif text-2xl text-white">{avgSharpness > 0 ? avgSharpness.toFixed(1) : '—'} avg</span>
        </div>
        <div className="flex justify-between items-baseline py-3">
          <span className="text-sm text-gray-500">Best session</span>
          <span className="font-serif text-2xl text-white">
            {bestSession ? `${format(parseISO(bestSession.completed_at!), 'EEE')} −${bestSession.load_delta}` : '—'}
          </span>
        </div>
      </section>

      {/* Week grid */}
      <section className="py-6 border-b border-gray-900">
        <p className="text-xs text-gray-700 tracking-widest uppercase mb-5">Daily drops</p>
        <div className="grid grid-cols-7 gap-2">
          {weekData.map((day, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-gray-700 mb-2">{day.day}</div>
              <div className={`font-serif text-base py-2 border rounded ${
                day.isBest ? 'bg-white text-black border-white' :
                day.completed ? 'bg-gray-900/50 text-white border-gray-800' :
                day.isToday ? 'bg-transparent text-gray-500 border-gray-700' :
                'bg-transparent text-gray-700 border-gray-900'
              }`}>
                {day.delta !== null ? `−${day.delta}` : day.isToday ? '?' : '—'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pattern */}
      {analysis?.patterns?.[0] && (
        <section className="py-6 border-b border-gray-900">
          <p className="text-xs text-gray-700 tracking-widest uppercase mb-4">Pattern</p>
          <p className="font-serif text-lg text-gray-400 leading-relaxed">
            {analysis.patterns[0].description}
          </p>
        </section>
      )}

      <Link href="/app" className="block text-center py-6 text-sm text-gray-700 hover:text-gray-500">
        ← Back
      </Link>
    </div>
  )
}
