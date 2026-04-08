export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function slugify(symbol: string): string {
  return symbol.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  try {
    const { symbol } = await request.json()
    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
    }

    const slug = slugify(symbol)

    const { data: existing } = await supabase
      .from('dream_pages')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await supabase
      .from('dream_pages')
      .update({ view_count: (existing.view_count || 0) + 1 })
      .eq('slug', slug)

    return NextResponse.json(existing)
  } catch (error) {
    console.error('Generate dream page error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
