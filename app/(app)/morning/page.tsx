'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MorningPage() {
  const router = useRouter()
  const [sharpness, setSharpness] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastSession, setLastSession] = useState<any>(null)

  useEffect(() => {
    loadLastSession()
  }, [])

  async function loadLastSession() {
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
      .limit(1)

    if (sessions?.[0]) setLastSession(sessions[0])
  }

  async function handleSubmit() {
    if (sharpness === null) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }

    await supabase.from('morning_checkins').insert({
      user_id: user.id,
      session_id: lastSession?.id || null,
      sharpness,
    })

    router.push('/app')
  }

  return (
    <div className="max-w-md mx-auto px-6 min-h-screen flex flex-col bg-black">
      <header className="flex justify-between items-center py-6">
        <h1 className="font-serif text-base text-gray-500">Good morning</h1>
        <button onClick={() => router.push('/app')} className="text-sm text-gray-700 hover:text-gray-500">
          Skip
        </button>
      </header>

      <main className="flex-1 flex flex-col justify-center">
        {lastSession && (
          <div className="text-center mb-16">
            <p className="text-xs text-gray-700 tracking-widest uppercase mb-4">Last night</p>
            <div className="font-serif text-5xl text-white mb-2">−{lastSession.load_delta}</div>
            <p className="text-sm text-gray-500">{lastSession.load_before} → {lastSession.load_after}</p>
          </div>
        )}

        <div className="animate-fade-in">
          <h2 className="font-serif text-3xl text-white mb-12 text-center">How sharp do you feel?</h2>
          <div className="flex gap-3 justify-center mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setSharpness(n)}
                className={`w-14 h-14 rounded-xl border text-lg font-medium transition-all ${
                  sharpness === n
                    ? 'bg-white border-white text-black'
                    : 'bg-gray-900/50 border-gray-800 text-gray-700 hover:border-gray-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-700 max-w-[310px] mx-auto">
            <span>Foggy</span>
            <span>Sharp</span>
          </div>
        </div>
      </main>

      <footer className="pb-12 pt-8">
        <button
          onClick={handleSubmit}
          disabled={sharpness === null || saving}
          className="w-full py-4 bg-white text-black font-medium rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Done'}
        </button>
      </footer>
    </div>
  )
}
