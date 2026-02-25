'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [streak, setStreak] = useState(0)
  const [visible, setVisible] = useState(false)

  const delta = parseInt(searchParams.get('delta') || '0')
  const before = searchParams.get('before') || '0'
  const after = searchParams.get('after') || '0'

  useEffect(() => {
    loadStreak()
    setTimeout(() => setVisible(true), 100)
  }, [])

  async function loadStreak() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .single()

    if (data) setStreak(data.current_streak)
  }

  return (
    <div className="max-w-md mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center bg-black">
      <div className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="mb-8">
          <div className="font-serif text-[120px] leading-none tracking-tight text-white">
            −{Math.abs(delta)}
          </div>
          <p className="text-sm text-gray-500 mt-4">{before} → {after}</p>
        </div>

        <h1 className="font-serif text-3xl text-gray-100 mb-2">Day closed.</h1>
        <p className="text-gray-700 mb-16">Night {streak}. See you in the morning.</p>

        <button
          onClick={() => router.push('/app')}
          className="px-12 py-3 border border-gray-800 rounded-lg text-gray-500 hover:border-gray-600 hover:text-gray-300 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}
