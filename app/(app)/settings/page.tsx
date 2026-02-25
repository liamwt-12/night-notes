'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>({})
  const [streak, setStreak] = useState<any>(null)

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

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const { data: streakData } = await supabase.from('streaks').select('*').eq('user_id', user.id).single()

    setProfile(profileData || {})
    setStreak(streakData)
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      morning_email_enabled: profile.morning_email_enabled,
      evening_reminder_enabled: profile.evening_reminder_enabled,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    setSaving(false)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleExport() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: sessions } = await supabase.from('sessions').select('*').eq('user_id', user.id)
    const { data: checkins } = await supabase.from('morning_checkins').select('*').eq('user_id', user.id)

    const exportData = { exported_at: new Date().toISOString(), sessions, morning_checkins: checkins, streak }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `night-notes-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-4 h-4 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-6 min-h-screen pb-20 bg-black">
      <header className="flex justify-between items-center py-6 border-b border-gray-900">
        <h1 className="font-serif text-lg text-white">Settings</h1>
        <Link href="/app" className="text-sm text-gray-700 hover:text-gray-500">Done</Link>
      </header>

      <section className="py-6 border-b border-gray-900">
        <p className="text-xs text-gray-700 tracking-widest uppercase mb-4">Account</p>
        <p className="text-sm text-gray-500">Email</p>
        <p className="text-white">{profile.email}</p>
        {streak && (
          <div className="flex gap-8 mt-4">
            <div>
              <p className="text-sm text-gray-500">Current streak</p>
              <p className="text-white">{streak.current_streak} nights</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Longest streak</p>
              <p className="text-white">{streak.longest_streak} nights</p>
            </div>
          </div>
        )}
      </section>

      <section className="py-6 border-b border-gray-900">
        <p className="text-xs text-gray-700 tracking-widest uppercase mb-4">Notifications</p>
        <div className="space-y-6">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white">Morning email</p>
              <p className="text-sm text-gray-500">Daily briefing at 7am</p>
            </div>
            <button
              onClick={() => setProfile({ ...profile, morning_email_enabled: !profile.morning_email_enabled })}
              className={`w-12 h-7 rounded-full transition-colors ${profile.morning_email_enabled ? 'bg-white' : 'bg-gray-800'}`}
            >
              <div className={`w-5 h-5 rounded-full transition-transform ${profile.morning_email_enabled ? 'bg-black translate-x-6' : 'bg-gray-600 translate-x-1'}`} />
            </button>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white">Evening reminder</p>
              <p className="text-sm text-gray-500">Nudge at 10pm</p>
            </div>
            <button
              onClick={() => setProfile({ ...profile, evening_reminder_enabled: !profile.evening_reminder_enabled })}
              className={`w-12 h-7 rounded-full transition-colors ${profile.evening_reminder_enabled ? 'bg-white' : 'bg-gray-800'}`}
            >
              <div className={`w-5 h-5 rounded-full transition-transform ${profile.evening_reminder_enabled ? 'bg-black translate-x-6' : 'bg-gray-600 translate-x-1'}`} />
            </button>
          </label>
        </div>
        <button onClick={handleSave} disabled={saving} className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </section>

      <section className="py-6 border-b border-gray-900">
        <p className="text-xs text-gray-700 tracking-widest uppercase mb-4">Your Data</p>
        <button onClick={handleExport} className="text-white hover:text-gray-300">Export all data (JSON) →</button>
      </section>

      <section className="py-6">
        <button onClick={handleSignOut} className="text-red-500 hover:text-red-400">Sign out</button>
      </section>
    </div>
  )
}
