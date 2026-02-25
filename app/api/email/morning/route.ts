import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { subDays } from 'date-fns'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('morning_email_enabled', true)

    if (!profiles?.length) {
      return NextResponse.json({ message: 'No users to email' })
    }

    const emailsSent = []

    for (const profile of profiles) {
      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', profile.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1)

      const lastSession = sessions?.[0]
      if (!lastSession) continue

      const sessionDate = new Date(lastSession.completed_at)
      if (sessionDate < subDays(new Date(), 1)) continue

      const { data: streak } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', profile.id)
        .single()

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #000; color: #fff; margin: 0; padding: 40px 20px;">
  <div style="max-width: 400px; margin: 0 auto;">
    <div style="font-family: Georgia, serif; font-size: 16px; color: #666; margin-bottom: 32px;">Night Notes</div>
    <div style="font-family: Georgia, serif; font-size: 72px; color: #fff; margin-bottom: 8px;">−${lastSession.load_delta}</div>
    <div style="font-size: 14px; color: #666; margin-bottom: 32px;">${lastSession.load_before} → ${lastSession.load_after} last night</div>
    ${lastSession.tomorrow_anchor ? `
    <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Today's anchor</div>
    <div style="font-size: 18px; color: #fff; margin-bottom: 32px;">${lastSession.tomorrow_anchor}</div>
    ` : ''}
    <div style="font-size: 14px; color: #444;"><strong style="color: #666;">${streak?.current_streak || 0}</strong> night streak</div>
  </div>
</body>
</html>`

      const { error: emailError } = await resend.emails.send({
        from: 'Night Notes <hello@trynightnotes.com>',
        to: profile.email,
        subject: `−${lastSession.load_delta} last night${lastSession.tomorrow_anchor ? ` · ${lastSession.tomorrow_anchor}` : ''}`,
        html: emailHtml,
      })

      if (!emailError) emailsSent.push(profile.email)
    }

    return NextResponse.json({ message: `Sent ${emailsSent.length} emails`, emails: emailsSent })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ error: 'Email sending failed' }, { status: 500 })
  }
}
