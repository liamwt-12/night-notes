'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatTime, getWeekData, calculateAvgDrop } from '@/lib/utils'
import type { Session } from '@/lib/types'

export default function AppHome() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)
  const [avgDrop, setAvgDrop] = useState(0)
  const [weekData, setWeekData] = useState<{ completed: boolean }[]>([])

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

    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(30)

    const { data: streakData } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .single()

    if (sessions) {
      setAvgDrop(calculateAvgDrop(sessions as Session[]))
      setWeekData(getWeekData(sessions as Session[]))
    }
    
    setStreak(streakData?.current_streak || 0)
    setLoading(false)
  }

  const time = formatTime(new Date())
  const isFirstSession = streak === 0 && avgDrop === 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-4 h-4 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-6 min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="flex justify-between items-center py-6">
        <h1 className="font-serif text-base text-gray-500">Night Notes</h1>
        {streak > 0 && (
          <span className="text-sm text-gray-700">
            <strong className="text-gray-500">{streak}</strong> nights
          </span>
        )}
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <p className="text-xs text-gray-700 tracking-widest uppercase mb-12">{time}</p>

        {isFirstSession ? (
          <>
            <h2 className="font-serif text-3xl text-gray-100 mb-4">Your first shutdown</h2>
            <p className="text-gray-500 max-w-xs mb-16">
              3 minutes to close the day. Let's see how much weight you can lift.
            </p>
          </>
        ) : (
          <>
            <div className="mb-12">
              <div className="font-serif text-[100px] leading-none tracking-tight text-white">
                −{Math.abs(avgDrop).toFixed(1)}
              </div>
              <p className="text-xs text-gray-700 tracking-widest uppercase mt-4">
                Average drop this week
              </p>
            </div>
            <h2 className="font-serif text-2xl text-gray-100">Ready to close the day?</h2>
          </>
        )}

        {/* Week dots */}
        {weekData.length > 0 && (
          <div className="flex justify-center gap-3 mt-12">
            {weekData.map((day, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  day.completed ? 'bg-gray-400' : i === weekData.length - 1 ? 'bg-white' : 'bg-gray-900'
                }`}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="pb-12 space-y-3">
        <Link
          href="/ritual"
          className="block w-full py-4 bg-white text-black text-center font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          Begin shutdown
        </Link>
        <Link
          href="/insights"
          className="block w-full py-3 text-gray-700 text-center text-sm hover:text-gray-500 transition-colors"
        >
          View insights
        </Link>
      </footer>
    </div>
  )
}
