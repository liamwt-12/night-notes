export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

function slugify(symbol: string): string {
  return symbol.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { symbol } = await request.json()
    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
    }

    const slug = slugify(symbol)

    // Check cache first
    const { data: existing } = await supabase
      .from('dream_pages')
      .select('*')
      .eq('slug', slug)
      .single()

    if (existing) {
      // Increment view count
      await supabase
        .from('dream_pages')
        .update({ view_count: (existing.view_count || 0) + 1 })
        .eq('slug', slug)

      return NextResponse.json(existing)
    }

    // Generate with Claude
    const displaySymbol = symbol.replace(/-/g, ' ')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: 'You are a dream psychology expert writing for a general audience. You write with warmth, intelligence and genuine insight. Never be generic.',
      messages: [{
        role: 'user',
        content: `Generate a comprehensive dream interpretation page for the symbol: ${displaySymbol}

Return ONLY valid JSON with exactly these fields:
{
  "meta_title": "Dreaming About ${displaySymbol}: Meaning & Interpretation | Night Notes",
  "meta_desc": "150 character description for Google",
  "intro": "2-3 sentence opening that creates immediate resonance. Make it feel personal.",
  "psychological_meaning": "400 words. Jungian and psychological perspective. Warm, specific, not generic.",
  "what_researchers_say": "250 words. What sleep researchers and psychologists actually say. Cite real concepts.",
  "common_variations": "200 words. Different versions of this dream and what each means.",
  "what_to_do": "150 words. Practical reflection questions and next steps.",
  "related_symbols": ["symbol1", "symbol2", "symbol3", "symbol4", "symbol5"],
  "faqs": [
    {"q": "question people actually search for", "a": "clear answer"},
    {"q": "question", "a": "answer"},
    {"q": "question", "a": "answer"},
    {"q": "question", "a": "answer"},
    {"q": "question", "a": "answer"}
  ]
}`
      }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    const content = JSON.parse(jsonMatch[0])

    // Save to database
    const row = {
      slug,
      symbol: displaySymbol,
      type: 'symbol',
      meta_title: content.meta_title,
      meta_desc: content.meta_desc,
      intro: content.intro,
      psychological_meaning: content.psychological_meaning,
      what_researchers_say: content.what_researchers_say,
      common_variations: content.common_variations,
      what_to_do: content.what_to_do,
      related_symbols: content.related_symbols,
      faqs: content.faqs,
      view_count: 1,
    }

    const { data: saved, error: saveError } = await supabase
      .from('dream_pages')
      .insert(row)
      .select()
      .single()

    if (saveError) {
      console.error('Save error:', saveError)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json(saved)
  } catch (error) {
    console.error('Generate dream page error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
