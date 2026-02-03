'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Types

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

interface MoodOption {
  value: string
  label: string
  icon: string
}

interface UserSession {
  id: string
  email: string
}

const MOODS: MoodOption[] = [
  { value: 'peaceful', label: 'Peaceful', icon: '🌿' },
  { value: 'restless', label: 'Restless', icon: '💫' },
  { value: 'joyful', label: 'Joyful', icon: '✨' },
  { value: 'confused', label: 'Confused', icon: '🌀' },
  { value: 'haunting', label: 'Haunting', icon: '🌊' },
]

const FREE_LIMIT = 5

function getMonthKey(): string {
  const d = new Date()
  return `nn_${d.getFullYear()}_${d.getMonth() + 1}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Main Component

export default function Home() {
  // Auth state
  const [user, setUser] = useState<UserSession | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authSending, setAuthSending] = useState(false)
  const [authSent, setAuthSent] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Dream state
  const [dream, setDream] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [reflection, setReflection] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reflectionsUsed, setReflectionsUsed] = useState(0)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [dreamSaved, setDreamSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // View state
  const [view, setView] = useState<'input' | 'journal'>('input')
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [journalLoading, setJournalLoading] = useState(false)
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

  // UI state
  const [stars, setStars] = useState<Star[]>([])
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [mounted, setMounted] = useState(false)

  const recognitionRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const reflectionRef = useRef<HTMLDivElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)

  // --- Auth Effects ---

  useEffect(() => {
    setMounted(true)

    // Stars
    const newStars: Star[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.8 + 0.4,
      delay: Math.random() * 6,
      duration: Math.random() * 3 + 3,
    }))
    setStars(newStars)

    // Voice
    const SR =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    setVoiceSupported(!!SR)

    // Load reflection count
    try {
      const count = parseInt(localStorage.getItem(getMonthKey()) || '0', 10)
      setReflectionsUsed(isNaN(count) ? 0 : count)
    } catch {
      setReflectionsUsed(0)
    }

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' })
        checkPendingDream(session.user.id)
      }
    })

    // Listen for auth changes (magic link callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' })
          setShowAuth(false)
          setAuthSent(false)
          setAuthEmail('')
          checkPendingDream(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setJournalEntries([])
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Auto-scroll to reflection
  useEffect(() => {
    if (reflection && reflectionRef.current) {
      setTimeout(() => {
        reflectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    }
  }, [reflection])

  // Focus email input when auth modal opens
  useEffect(() => {
    if (showAuth) {
      setTimeout(() => emailInputRef.current?.focus(), 100)
    }
  }, [showAuth])

  // --- Pending Dream (saves dream during magic link flow) ---

  const savePendingDream = () => {
    try {
      const pending = { dream, mood, reflection, timestamp: Date.now() }
      localStorage.setItem('nn_pending_dream', JSON.stringify(pending))
    } catch {
      // localStorage unavailable
    }
  }

  const checkPendingDream = async (userId: string) => {
    try {
      const raw = localStorage.getItem('nn_pending_dream')
      if (!raw) return

      const pending = JSON.parse(raw)
      // Only save if it's less than 30 minutes old
      if (Date.now() - pending.timestamp > 30 * 60 * 1000) {
        localStorage.removeItem('nn_pending_dream')
        return
      }

      if (pending.dream && pending.reflection) {
        await supabase.from('dreams').insert({
          user_id: userId,
          dream_text: pending.dream,
          mood: pending.mood || null,
          reflection: pending.reflection,
        })
        localStorage.removeItem('nn_pending_dream')
        setDreamSaved(true)
        // Restore the dream view
        setDream(pending.dream)
        setMood(pending.mood || null)
        setReflection(pending.reflection)
      }
    } catch {
      // Silently fail
    }
  }

  // --- Auth Functions ---

  const handleSignIn = async () => {
    if (!authEmail.trim() || !authEmail.includes('@')) {
      setAuthError('Please enter a valid email address.')
      return
    }

    setAuthSending(true)
    setAuthError(null)

    try {
      const redirectUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://nightnotes-git.netlify.app'

      const { error } = await supabase.auth.signInWithOtp({
        email: authEmail.trim(),
        options: { emailRedirectTo: redirectUrl },
      })

      if (error) throw error
      setAuthSent(true)
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send login link. Please try again.')
    } finally {
      setAuthSending(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setView('input')
    setJournalEntries([])
  }

  // --- Save Dream ---

  const handleSaveDream = async () => {
    if (!user || !dream.trim() || !reflection) return

    setIsSaving(true)
    try {
      const { error } = await supabase.from('dreams').insert({
        user_id: user.id,
        dream_text: dream.trim(),
        mood: mood || null,
        reflection: reflection,
      })

      if (error) throw error
      setDreamSaved(true)
    } catch (err: any) {
      setError('Failed to save dream. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // --- Journal ---

  const loadJournal = async () => {
    if (!user) return

    setJournalLoading(true)
    try {
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setJournalEntries(data || [])
    } catch {
      setError('Failed to load journal.')
    } finally {
      setJournalLoading(false)
    }
  }

  const openJournal = () => {
    setView('journal')
    loadJournal()
  }

  const deleteEntry = async (id: string) => {
    try {
      await supabase.from('dreams').delete().eq('id', id)
      setJournalEntries((prev) => prev.filter((e) => e.id !== id))
    } catch {
      setError('Failed to delete entry.')
    }
  }

  // --- Voice Input ---

  const startRecording = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-GB'

    let finalTranscript = dream

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + t
        } else {
          interim = t
        }
      }
      setDream(finalTranscript + (interim ? ' ' + interim : ''))
    }

    recognition.onerror = (event: any) => {
      setIsRecording(false)
      if (event.error === 'not-allowed') {
        setError('Microphone access was denied. Please allow mic access in your browser settings.')
      } else if (event.error !== 'no-speech') {
        setError('Voice input encountered an issue. Please try again or type your dream.')
      }
    }

    recognition.onend = () => setIsRecording(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
    setError(null)
  }, [dream])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop()
    setIsRecording(false)
  }, [])

  const toggleRecording = useCallback(() => {
    if (isRecording) stopRecording()
    else startRecording()
  }, [isRecording, startRecording, stopRecording])

  // --- Submit ---

  const handleSubmit = async () => {
    if (!dream.trim()) return

    if (reflectionsUsed >= FREE_LIMIT) {
      setShowUpgrade(true)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setReflection(null)
    setDreamSaved(false)

    try {
      const response = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream: dream.trim(), mood }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to get reflection')
      if (!data.reflection) throw new Error('No reflection received. Please try again.')

      setReflection(data.reflection)

      // Track usage
      try {
        const newCount = reflectionsUsed + 1
        localStorage.setItem(getMonthKey(), newCount.toString())
        setReflectionsUsed(newCount)
      } catch {}

      // Auto-save if logged in
      if (user) {
        try {
          await supabase.from('dreams').insert({
            user_id: user.id,
            dream_text: dream.trim(),
            mood: mood || null,
            reflection: data.reflection,
          })
          setDreamSaved(true)
        } catch {}
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Reset ---

  const handleNewDream = () => {
    setDream('')
    setMood(null)
    setReflection(null)
    setError(null)
    setShowUpgrade(false)
    setDreamSaved(false)
    setView('input')
    textareaRef.current?.focus()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // --- Derived ---

  const remaining = Math.max(0, FREE_LIMIT - reflectionsUsed)
  const canSubmit = dream.trim().length > 0 && !isSubmitting

  if (!mounted) {
    return (
      <main className="relative min-h-dvh">
        <div className="ambient-bg" />
      </main>
    )
  }

  // Render

  return (
    <main className="relative min-h-dvh">
      <div className="ambient-bg" />

      {/* Star Field */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-dvh">

        {/* Header */}
        <header className="w-full px-6 py-5 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <button onClick={handleNewDream} className="flex items-center gap-3 hover:opacity-80 transition-gentle">
              <span className="text-xl" aria-hidden="true">🌙</span>
              <span className="font-display text-xl text-night-bright tracking-wide">Night Notes</span>
            </button>

            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={openJournal}
                  className="text-xs text-night-subtle hover:text-night-accent px-3 py-1.5 rounded-full border border-night-surface/50 bg-night-dark/40 transition-gentle"
                >
                  Journal
                </button>
              )}

              {user ? (
                <button
                  onClick={handleSignOut}
                  className="text-xs text-night-muted hover:text-night-subtle transition-gentle"
                >
                  Sign out
                </button>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-xs text-night-subtle hover:text-night-accent px-3 py-1.5 rounded-full border border-night-surface/50 bg-night-dark/40 transition-gentle"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>

          {/* Reflection counter - below nav on mobile */}
          {view === 'input' && !reflection && (
            <div className="flex justify-end mt-2">
              {remaining > 0 ? (
                <span className="text-xs text-night-muted">
                  {remaining} reflection{remaining !== 1 ? 's' : ''} left this month
                </span>
              ) : (
                <span className="text-xs text-night-accent">
                  Free limit reached
                </span>
              )}
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-start px-6 pb-12">
          <div className="w-full max-w-xl">

            {/* ========== INPUT VIEW ========== */}
            {view === 'input' && !reflection && (
              <div className="animate-fade-in">
                <div className="text-center mb-10 mt-4">
                  <h1 className="font-display text-4xl sm:text-5xl text-night-bright mb-3 tracking-tight">
                    What did you dream?
                  </h1>
                  <p className="text-night-subtle text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                    Describe your dream in as much detail as you can remember —
                    the feelings, the colours, the people.
                  </p>
                </div>

                {/* Textarea */}
                <div className="relative mb-6">
                  <textarea
                    ref={textareaRef}
                    value={dream}
                    onChange={(e) => setDream(e.target.value)}
                    placeholder={
                      isRecording
                        ? 'Listening... speak your dream aloud'
                        : 'I was in a house I didn\'t recognise, but it felt like home...'
                    }
                    rows={6}
                    maxLength={3000}
                    className={`glass-input w-full px-5 py-4 text-night-bright text-base leading-relaxed font-body placeholder:text-night-subtle/40 ${isRecording ? 'border-night-recording/30' : ''}`}
                    disabled={isSubmitting}
                  />

                  {voiceSupported && (
                    <button
                      onClick={toggleRecording}
                      disabled={isSubmitting}
                      className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-gentle ${isRecording ? 'bg-night-recording/20 text-night-recording' : 'bg-night-surface/50 text-night-subtle hover:text-night-accent hover:bg-night-surface'}`}
                      title={isRecording ? 'Stop recording' : 'Record your dream'}
                      aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
                    >
                      {isRecording && (
                        <span className="absolute inset-0 rounded-full bg-night-recording/20 recording-ring" />
                      )}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
                        {isRecording ? (
                          <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                        ) : (
                          <>
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" x2="12" y1="19" y2="22" />
                          </>
                        )}
                      </svg>
                    </button>
                  )}

                  <div className="flex items-center justify-between mt-2 px-1">
                    {isRecording ? (
                      <span className="text-xs text-night-recording flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-night-recording animate-pulse-soft" />
                        Listening...
                      </span>
                    ) : voiceSupported ? (
                      <span className="text-xs text-night-muted">Tap the mic to speak your dream</span>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-night-muted tabular-nums">{dream.length.toLocaleString()}/3,000</span>
                  </div>
                </div>

                {/* Mood selector */}
                <div className="mb-8">
                  <p className="text-xs text-night-muted mb-3 uppercase tracking-widest">
                    Mood upon waking
                    <span className="normal-case tracking-normal ml-1 text-night-subtle/50">(optional)</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setMood(mood === m.value ? null : m.value)}
                        className={`mood-pill ${mood === m.value ? 'active' : ''}`}
                        disabled={isSubmitting}
                      >
                        <span className="mr-1.5">{m.icon}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`w-full py-4 px-6 rounded-xl text-base font-medium transition-gentle ${canSubmit ? 'bg-night-accent/15 text-night-accent border border-night-accent/25 hover:bg-night-accent/25 hover:border-night-accent/40 active:scale-[0.98]' : 'bg-night-dark/40 text-night-muted border border-night-surface/30 cursor-not-allowed'}`}
                >
                  {isSubmitting ? 'Getting your reflection...' : 'Get Reflection'}
                </button>

                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-400/15 animate-fade-in">
                    <p className="text-sm text-red-300/80">{error}</p>
                    <button onClick={() => setError(null)} className="text-xs text-red-400/60 hover:text-red-300/80 mt-2 transition-gentle">Dismiss</button>
                  </div>
                )}

                {showUpgrade && (
                  <div className="mt-4 p-6 glass-card-elevated text-center animate-fade-in-up">
                    <p className="text-night-bright text-base mb-2">You&apos;ve used all {FREE_LIMIT} free reflections this month</p>
                    <p className="text-night-subtle text-sm mb-5">Upgrade to Premium for unlimited reflections, pattern insights, and more.</p>
                    <button className="px-6 py-3 rounded-xl bg-night-accent/20 text-night-accent border border-night-accent/30 text-sm font-medium hover:bg-night-accent/30 transition-gentle">
                      Upgrade — £4.99/month
                    </button>
                    <p className="text-xs text-night-muted mt-3">Resets on the 1st of each month</p>
                  </div>
                )}
              </div>
            )}

            {/* Loading shimmer */}
            {isSubmitting && !reflection && (
              <div className="mt-6 space-y-4 animate-fade-in">
                <div className="glass-card p-6">
                  <div className="shimmer-line w-3/4 mb-4" />
                  <div className="shimmer-line w-full mb-3" />
                  <div className="shimmer-line w-full mb-3" />
                  <div className="shimmer-line w-5/6 mb-3" />
                  <div className="shimmer-line w-2/3" />
                </div>
              </div>
            )}

            {/* ========== REFLECTION VIEW ========== */}
            {view === 'input' && reflection && (
              <div ref={reflectionRef} className="animate-fade-in-up space-y-5 mt-4">
                <div className="glass-card p-5">
                  <p className="text-xs text-night-muted uppercase tracking-widest mb-2">Your dream</p>
                  <p className="text-night-text text-sm leading-relaxed line-clamp-4">{dream}</p>
                  {mood && (
                    <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-night-accent/8 text-night-accent border border-night-accent/15">
                      {MOODS.find((m) => m.value === mood)?.icon} {MOODS.find((m) => m.value === mood)?.label}
                    </span>
                  )}
                </div>

                <div className="glass-card-elevated p-6 sm:p-8">
                  <p className="text-xs text-night-accent/70 uppercase tracking-widest mb-4">Reflection</p>
                  <div className="reflection-text text-night-bright/90 text-base leading-relaxed">
                    {reflection.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-night-muted text-center leading-relaxed px-4">
                  This is a gentle reflection, not professional advice.
                  For mental health support, please speak with a qualified professional.
                </p>

                {/* Save / Auth prompt */}
                {!user && !dreamSaved && (
                  <div className="glass-card p-5 text-center animate-fade-in">
                    <p className="text-night-bright text-sm mb-1">Want to save this to your journal?</p>
                    <p className="text-night-subtle text-xs mb-4">Create a free account to keep all your dreams in one place.</p>
                    <button
                      onClick={() => {
                        savePendingDream()
                        setShowAuth(true)
                      }}
                      className="px-5 py-2.5 rounded-xl bg-night-accent/15 text-night-accent border border-night-accent/25 text-sm font-medium hover:bg-night-accent/25 transition-gentle"
                    >
                      Save dream — sign up free
                    </button>
                  </div>
                )}

                {user && !dreamSaved && (
                  <button
                    onClick={handleSaveDream}
                    disabled={isSaving}
                    className="w-full py-3 px-5 rounded-xl text-sm font-medium bg-night-accent/10 text-night-accent border border-night-accent/20 hover:bg-night-accent/20 transition-gentle"
                  >
                    {isSaving ? 'Saving...' : 'Save to Journal'}
                  </button>
                )}

                {dreamSaved && (
                  <div className="text-center py-2 animate-fade-in">
                    <span className="text-xs text-night-accent">✓ Saved to your journal</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleNewDream}
                    className="flex-1 py-3.5 px-5 rounded-xl text-sm font-medium bg-night-accent/15 text-night-accent border border-night-accent/25 hover:bg-night-accent/25 transition-gentle active:scale-[0.98]"
                  >
                    New Dream
                  </button>
                  {user && (
                    <button
                      onClick={openJournal}
                      className="flex-1 py-3.5 px-5 rounded-xl text-sm font-medium bg-night-dark/40 text-night-subtle border border-night-surface/30 hover:text-night-bright hover:border-night-surface/50 transition-gentle active:scale-[0.98]"
                    >
                      View Journal
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ========== JOURNAL VIEW ========== */}
            {view === 'journal' && (
              <div className="animate-fade-in mt-4">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="font-display text-3xl text-night-bright tracking-tight">Your Journal</h1>
                  <button
                    onClick={handleNewDream}
                    className="text-xs text-night-accent px-3 py-1.5 rounded-full border border-night-accent/20 hover:bg-night-accent/10 transition-gentle"
                  >
                    + New Dream
                  </button>
                </div>

                {journalLoading && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="glass-card p-5">
                        <div className="shimmer-line w-1/3 mb-3" />
                        <div className="shimmer-line w-full mb-2" />
                        <div className="shimmer-line w-2/3" />
                      </div>
                    ))}
                  </div>
                )}

                {!journalLoading && journalEntries.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-night-subtle text-base mb-2">No dreams yet</p>
                    <p className="text-night-muted text-sm mb-6">Your saved dreams will appear here.</p>
                    <button
                      onClick={handleNewDream}
                      className="px-5 py-2.5 rounded-xl bg-night-accent/15 text-night-accent border border-night-accent/25 text-sm font-medium hover:bg-night-accent/25 transition-gentle"
                    >
                      Record your first dream
                    </button>
                  </div>
                )}

                {!journalLoading && journalEntries.length > 0 && (
                  <div className="space-y-4">
                    {journalEntries.map((entry) => {
                      const isExpanded = expandedEntry === entry.id
                      const moodData = MOODS.find((m) => m.value === entry.mood)

                      return (
                        <div key={entry.id} className="glass-card overflow-hidden transition-gentle">
                          <button
                            onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                            className="w-full text-left p-5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-night-muted mb-2">{formatDate(entry.created_at)}</p>
                                <p className={`text-night-text text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                                  {entry.dream_text}
                                </p>
                                {moodData && !isExpanded && (
                                  <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-night-accent/8 text-night-accent/70">
                                    {moodData.icon} {moodData.label}
                                  </span>
                                )}
                              </div>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={`text-night-muted flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              >
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-5 pb-5 animate-fade-in">
                              {moodData && (
                                <span className="inline-block mb-4 text-xs px-3 py-1 rounded-full bg-night-accent/8 text-night-accent border border-night-accent/15">
                                  {moodData.icon} {moodData.label}
                                </span>
                              )}

                              {entry.reflection && (
                                <div className="mt-2 pt-4 border-t border-night-surface/30">
                                  <p className="text-xs text-night-accent/70 uppercase tracking-widest mb-3">Reflection</p>
                                  <div className="reflection-text text-night-bright/80 text-sm leading-relaxed">
                                    {entry.reflection.split('\n\n').map((p: string, i: number) => (
                                      <p key={i}>{p}</p>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="mt-4 pt-3 border-t border-night-surface/20 flex justify-end">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (confirm('Delete this dream entry?')) deleteEntry(entry.id)
                                  }}
                                  className="text-xs text-night-muted hover:text-red-400/70 transition-gentle"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <footer className="w-full px-6 py-6 text-center">
          <p className="text-xs text-night-muted/60">Night Notes — Understand your dreams. Gently.</p>
        </footer>
      </div>

      {/* ========== AUTH MODAL ========== */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowAuth(false); setAuthSent(false); setAuthError(null) }} />

          <div className="relative w-full max-w-md mx-4 mb-0 sm:mb-0 glass-card-elevated p-8 animate-fade-in-up">
            <button
              onClick={() => { setShowAuth(false); setAuthSent(false); setAuthError(null) }}
              className="absolute top-4 right-4 text-night-muted hover:text-night-bright transition-gentle"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {!authSent ? (
              <>
                <div className="text-center mb-6">
                  <span className="text-3xl mb-3 block">🌙</span>
                  <h2 className="font-display text-2xl text-night-bright mb-2">Welcome to Night Notes</h2>
                  <p className="text-night-subtle text-sm">Enter your email and we&apos;ll send you a magic link to sign in. No password needed.</p>
                </div>

                <div className="space-y-4">
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSignIn() }}
                    placeholder="your@email.com"
                    className="glass-input w-full px-4 py-3 text-night-bright text-sm"
                    disabled={authSending}
                  />

                  <button
                    onClick={handleSignIn}
                    disabled={authSending || !authEmail.trim()}
                    className={`w-full py-3 px-5 rounded-xl text-sm font-medium transition-gentle ${authEmail.trim() ? 'bg-night-accent/15 text-night-accent border border-night-accent/25 hover:bg-night-accent/25' : 'bg-night-dark/40 text-night-muted border border-night-surface/30 cursor-not-allowed'}`}
                  >
                    {authSending ? 'Sending...' : 'Send magic link'}
                  </button>

                  {authError && (
                    <p className="text-xs text-red-300/80 text-center">{authError}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <span className="text-3xl mb-4 block">✉️</span>
                <h2 className="font-display text-2xl text-night-bright mb-2">Check your email</h2>
                <p className="text-night-subtle text-sm mb-1">
                  We sent a login link to
                </p>
                <p className="text-night-bright text-sm font-medium mb-4">{authEmail}</p>
                <p className="text-night-muted text-xs">Click the link in the email to sign in. You can close this window.</p>
                <button
                  onClick={() => { setAuthSent(false); setAuthEmail('') }}
                  className="mt-6 text-xs text-night-subtle hover:text-night-accent transition-gentle"
                >
                  Use a different email
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
