'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 1 | 2 | 3 | 4 | 5

export default function RitualPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({
    load_before: null as number | null,
    open_loops: '',
    emotional_residue: '',
    tomorrow_anchor: '',
    load_after: null as number | null,
    started_at: new Date().toISOString(),
  })

  const progress = (step / 5) * 100

  function canContinue() {
    if (step === 1) return data.load_before !== null
    if (step === 4) return data.tomorrow_anchor.trim().length > 0
    if (step === 5) return data.load_after !== null
    return true
  }

  async function handleNext() {
    if (step < 5) {
      setStep((s) => (s + 1) as Step)
    } else {
      await saveSession()
    }
  }

  async function saveSession() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/')
      return
    }

    const { error } = await supabase.from('sessions').insert({
      user_id: user.id,
      load_before: data.load_before,
      load_after: data.load_after,
      open_loops: data.open_loops || null,
      emotional_residue: data.emotional_residue || null,
      tomorrow_anchor: data.tomorrow_anchor || null,
      started_at: data.started_at,
      completed_at: new Date().toISOString(),
      duration_seconds: Math.round((Date.now() - new Date(data.started_at).getTime()) / 1000),
    })

    if (error) {
      console.error(error)
      setSaving(false)
      return
    }

    const delta = (data.load_before || 0) - (data.load_after || 0)
    router.push(`/complete?delta=${delta}&before=${data.load_before}&after=${data.load_after}`)
  }

  return (
    <div className="max-w-md mx-auto px-6 min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="flex justify-between items-center py-6">
        <span className="text-xs text-gray-700 tracking-widest">{step} / 5</span>
        <button
          onClick={() => router.push('/app')}
          className="w-8 h-8 flex items-center justify-center border border-gray-900 rounded-md text-gray-700 hover:border-gray-700 hover:text-gray-500"
        >
          ×
        </button>
      </header>

      {/* Progress */}
      <div className="h-px bg-gray-900 mb-12">
        <div className="h-full bg-gray-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col justify-center">
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="font-serif text-3xl text-white mb-12 leading-tight">
              How heavy does your mind feel?
            </h1>
            <div className="flex gap-3 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setData({ ...data, load_before: n })}
                  className={`flex-1 aspect-square max-w-14 rounded-xl border text-lg font-medium transition-all ${
                    data.load_before === n
                      ? 'bg-white border-white text-black'
                      : 'bg-gray-900/50 border-gray-800 text-gray-700 hover:border-gray-600'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-700">
              <span>Light</span>
              <span>Heavy</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="font-serif text-3xl text-white mb-4 leading-tight">What's still open?</h1>
            <p className="text-gray-500 text-sm mb-8">Tasks, decisions, unfinished business.</p>
            <textarea
              value={data.open_loops}
              onChange={(e) => setData({ ...data, open_loops: e.target.value })}
              placeholder="The things on your mind..."
              className="w-full h-40 bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-white placeholder-gray-700 resize-none focus:border-gray-600"
              autoFocus
            />
            <p className="text-xs text-gray-700 mt-3">Don't filter. Just dump it.</p>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h1 className="font-serif text-3xl text-white mb-4 leading-tight">What's sitting with you emotionally?</h1>
            <p className="text-gray-500 text-sm mb-8">A conversation, a feeling, something you can't shake.</p>
            <textarea
              value={data.emotional_residue}
              onChange={(e) => setData({ ...data, emotional_residue: e.target.value })}
              placeholder="Name it to tame it..."
              className="w-full h-40 bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-white placeholder-gray-700 resize-none focus:border-gray-600"
              autoFocus
            />
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <h1 className="font-serif text-3xl text-white mb-4 leading-tight">One thing you'll do first tomorrow?</h1>
            <p className="text-gray-500 text-sm mb-8">Not your to-do list. The first domino.</p>
            <input
              type="text"
              value={data.tomorrow_anchor}
              onChange={(e) => setData({ ...data, tomorrow_anchor: e.target.value })}
              placeholder="Your morning anchor..."
              className="w-full bg-transparent border-b border-gray-800 py-4 text-lg text-white placeholder-gray-700 focus:border-gray-500"
              autoFocus
            />
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in">
            <h1 className="font-serif text-3xl text-white mb-12 leading-tight">
              How does your mind feel now?
            </h1>
            <div className="flex gap-3 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setData({ ...data, load_after: n })}
                  className={`flex-1 aspect-square max-w-14 rounded-xl border text-lg font-medium transition-all ${
                    data.load_after === n
                      ? 'bg-white border-white text-black'
                      : 'bg-gray-900/50 border-gray-800 text-gray-700 hover:border-gray-600'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-700">
              <span>Light</span>
              <span>Heavy</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="pb-12 pt-8">
        <button
          onClick={handleNext}
          disabled={!canContinue() || saving}
          className="w-full py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : step === 5 ? 'Finish' : 'Continue'}
        </button>
        {(step === 2 || step === 3) && (
          <button
            onClick={() => setStep((s) => (s + 1) as Step)}
            className="w-full py-3 text-gray-700 text-sm mt-2 hover:text-gray-500"
          >
            Skip
          </button>
        )}
      </footer>
    </div>
  )
}
