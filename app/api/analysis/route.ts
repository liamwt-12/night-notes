import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const weekAgo = subDays(new Date(), 7)

    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('completed_at', weekAgo.toISOString())
      .order('completed_at', { ascending: false })

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ error: 'No sessions found' }, { status: 404 })
    }

    const { data: checkins } = await supabase
      .from('morning_checkins')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', weekAgo.toISOString())

    const sessionSummary = sessions.map(s => ({
      date: format(new Date(s.completed_at), 'EEEE'),
      time: format(new Date(s.completed_at), 'HH:mm'),
      load_before: s.load_before,
      load_after: s.load_after,
      delta: s.load_delta,
      open_loops: s.open_loops,
      emotional_residue: s.emotional_residue,
      tomorrow_anchor: s.tomorrow_anchor,
    }))

    const checkinSummary = (checkins || []).map(c => ({
      date: format(new Date(c.created_at), 'EEEE'),
      sharpness: c.sharpness,
      had_shutdown: !!c.session_id,
    }))

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze this user's weekly shutdown ritual data. Be specific and actionable.

Sessions:
${JSON.stringify(sessionSummary, null, 2)}

Morning check-ins:
${JSON.stringify(checkinSummary, null, 2)}

Return JSON with:
1. "patterns": Array of 2-3 patterns (type: timing/theme/correlation/trend, title, description with specific numbers)
2. "insights": 2-3 sentence summary
3. "common_themes": Object with theme words and counts from open_loops/emotional_residue

Use their actual words. Be specific. Return only valid JSON.`
      }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    let analysis
    try {
      analysis = JSON.parse(responseText)
    } catch {
      return NextResponse.json({ error: 'Failed to parse analysis' }, { status: 500 })
    }

    const avgLoadDrop = sessions.reduce((sum, s) => sum + (s.load_delta || 0), 0) / sessions.length
    const avgSharpness = checkins?.length ? checkins.reduce((sum, c) => sum + c.sharpness, 0) / checkins.length : null

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

    await supabase.from('weekly_analyses').upsert({
      user_id: userId,
      week_start: format(weekStart, 'yyyy-MM-dd'),
      week_end: format(weekEnd, 'yyyy-MM-dd'),
      total_sessions: sessions.length,
      avg_load_drop: avgLoadDrop,
      avg_sharpness: avgSharpness,
      patterns: analysis.patterns,
      insights: analysis.insights,
      common_themes: analysis.common_themes,
    }, { onConflict: 'user_id,week_start' })

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
