'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-20">
          <h1 className="font-serif text-xl text-gray-500">Night Notes</h1>
        </header>

        {/* Hero */}
        <main>
          <div className="text-center mb-16">
            <p className="text-xs text-gray-700 tracking-widest uppercase mb-6">
              Average mental load drop
            </p>
            <div className="font-serif text-[120px] sm:text-[140px] leading-none tracking-tight">
              −1.8
            </div>
            <p className="text-sm text-gray-500 mt-4">
              across 247 sessions from beta testers
            </p>
          </div>

          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl text-gray-100 mb-4">
              Close the day in 3 minutes.
            </h2>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              A nightly ritual that captures what's on your mind, 
              tracks the weight it lifts, and shows you patterns 
              you couldn't see yourself.
            </p>
          </div>

          {/* Stats */}
          <div className="border-t border-b border-gray-900 py-8 mb-16">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="font-serif text-2xl text-white">34%</div>
                <div className="text-xs text-gray-700 mt-1">higher morning sharpness</div>
              </div>
              <div>
                <div className="font-serif text-2xl text-white">12</div>
                <div className="text-xs text-gray-700 mt-1">avg. streak length</div>
              </div>
              <div>
                <div className="font-serif text-2xl text-white">3:12</div>
                <div className="text-xs text-gray-700 mt-1">avg. session time</div>
              </div>
            </div>
          </div>

          {/* Signup */}
          {!sent ? (
            <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-700 focus:border-gray-600 transition-colors mb-3"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending link...' : 'Start free trial'}
              </button>
              {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
              <p className="text-xs text-gray-700 text-center mt-3">
                7 days free, then £4.99/month
              </p>
            </form>
          ) : (
            <div className="text-center max-w-sm mx-auto">
              <div className="font-serif text-2xl text-white mb-2">Check your email</div>
              <p className="text-gray-500">We sent a magic link to {email}</p>
            </div>
          )}

          {/* Testimonials */}
          <section className="mt-20 border-t border-gray-900 pt-16">
            <p className="text-xs text-gray-700 tracking-widest uppercase mb-8 text-center">
              What testers said
            </p>
            <div className="space-y-8">
              <blockquote className="text-center">
                <p className="font-serif text-xl text-gray-300 italic mb-3">
                  "I actually sleep better now. The ritual of dumping everything out 
                  before bed changed how I end the day."
                </p>
                <cite className="text-sm text-gray-700">— Beta tester, founder</cite>
              </blockquote>
              <blockquote className="text-center">
                <p className="font-serif text-xl text-gray-300 italic mb-3">
                  "The patterns it surfaced were wild. I had no idea work stress 
                  showed up in 80% of my sessions."
                </p>
                <cite className="text-sm text-gray-700">— Beta tester, designer</cite>
              </blockquote>
            </div>
          </section>

          {/* How it works */}
          <section className="mt-20 border-t border-gray-900 pt-16">
            <p className="text-xs text-gray-700 tracking-widest uppercase mb-12 text-center">
              How it works
            </p>
            <div className="space-y-8 max-w-sm mx-auto">
              <div className="flex gap-6">
                <div className="text-gray-700 font-serif text-xl">1</div>
                <div>
                  <h3 className="text-white font-medium mb-1">Rate your mental load</h3>
                  <p className="text-gray-500 text-sm">How heavy does your mind feel? 1-5.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-gray-700 font-serif text-xl">2</div>
                <div>
                  <h3 className="text-white font-medium mb-1">Dump what's open</h3>
                  <p className="text-gray-500 text-sm">Unfinished tasks, lingering thoughts.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-gray-700 font-serif text-xl">3</div>
                <div>
                  <h3 className="text-white font-medium mb-1">Set tomorrow's anchor</h3>
                  <p className="text-gray-500 text-sm">One thing you'll do first.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-gray-700 font-serif text-xl">4</div>
                <div>
                  <h3 className="text-white font-medium mb-1">See the drop</h3>
                  <p className="text-gray-500 text-sm">Watch the number fall. Day closed.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="mt-20 border-t border-gray-900 pt-16 pb-20">
            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8 max-w-sm mx-auto text-center">
              <p className="text-xs text-gray-700 tracking-widest uppercase mb-4">Simple pricing</p>
              <div className="font-serif text-4xl text-white mb-2">
                £4.99<span className="text-xl text-gray-500">/month</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">or £34.99/year (save 40%)</p>
              <ul className="text-left text-sm space-y-2 mb-6">
                <li className="flex items-center gap-2 text-gray-400">
                  <span className="text-white">✓</span> Unlimited shutdown sessions
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span className="text-white">✓</span> Weekly AI-powered insights
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span className="text-white">✓</span> Morning email briefings
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span className="text-white">✓</span> Pattern detection
                </li>
              </ul>
            </div>
          </section>
        </main>

        <footer className="text-center text-xs text-gray-700 pb-8">
          <p>© 2025 Useful for Humans</p>
        </footer>
      </div>
    </div>
  )
}
