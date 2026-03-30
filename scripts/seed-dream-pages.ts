/**
 * Seed script: pre-generates dream symbol pages directly via Supabase + Anthropic.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_KEY=... ANTHROPIC_API_KEY=... npx tsx scripts/seed-dream-pages.ts
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const SYMBOLS = [
  // Original 49
  'teeth', 'falling', 'being-chased', 'water', 'snakes',
  'flying', 'houses', 'exes', 'death', 'pregnancy',
  'spiders', 'dogs', 'cars', 'running', 'school',
  'fire', 'blood', 'wedding', 'naked', 'late',
  'lost', 'ocean', 'forest', 'stairs', 'mirror',
  'phone', 'money', 'baby', 'cats', 'birds',
  'drowning', 'hospital', 'train', 'fighting', 'kissing',
  'crying', 'cheating', 'wolf', 'bridge', 'elevator',
  'tornado', 'darkness', 'childhood-home', 'being-watched', 'paralysis',
  'teeth-falling-out', 'earthquake', 'being-lost', 'missing-flight',

  // Animals
  'lion', 'bear', 'horse', 'rabbit', 'fish',
  'shark', 'eagle', 'owl', 'butterfly', 'bee',
  'rat', 'mouse', 'frog', 'turtle', 'elephant',
  'tiger', 'deer', 'fox', 'pig', 'chicken',
  'cow', 'goat', 'whale', 'dolphin', 'penguin',
  'crocodile', 'gorilla', 'bat', 'scorpion', 'jellyfish',

  // People
  'mother', 'father', 'sister', 'brother', 'grandmother',
  'grandfather', 'boss', 'teacher', 'stranger', 'celebrity',
  'dead-person', 'old-friend', 'child', 'baby-girl', 'baby-boy',
  'twin', 'soldier', 'doctor', 'priest', 'witch',

  // Places
  'beach', 'mountain', 'cave', 'desert', 'jungle',
  'city', 'village', 'church', 'school-classroom', 'office',
  'prison', 'castle', 'mansion', 'apartment', 'garden',
  'park', 'library', 'hospital-room', 'airport', 'subway',
  'spaceship',

  // Situations
  'exam', 'interview', 'wedding-day', 'funeral', 'party',
  'being-attacked', 'saving-someone', 'being-saved', 'winning', 'losing',
  'being-fired', 'getting-married', 'divorce', 'giving-birth', 'dying',
  'flying-a-plane', 'driving-car', 'swimming', 'climbing', 'falling-into-water',

  // Objects
  'key', 'door', 'window', 'clock', 'book',
  'letter', 'gift', 'knife', 'gun', 'ring',
  'crown', 'treasure', 'map', 'compass', 'ladder',
  'rope', 'candle', 'ice', 'gold', 'silver',
  'diamond', 'broken-glass', 'locked-box', 'empty-room', 'old-photograph',

  // Body
  'hair-falling-out', 'pregnant-belly', 'broken-leg', 'blind', 'deaf',
  'flying-body', 'invisible', 'shrinking', 'growing', 'losing-voice',
  'running-but-slow', 'hands', 'eyes', 'mouth',

  // Nature
  'rain', 'snow', 'flood', 'storm', 'rainbow',
  'sunset', 'full-moon', 'eclipse', 'earthquake-ground', 'volcanic-eruption',
  'thunder', 'lightning', 'fog', 'wind', 'drought',

  // Emotions
  'being-judged', 'being-ignored', 'being-loved', 'feeling-proud', 'feeling-ashamed',
  'feeling-free', 'feeling-trapped', 'feeling-powerful', 'feeling-small',
]

const uniqueSymbols = Array.from(new Set(SYMBOLS))

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function seed() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!supabaseUrl || !supabaseKey || !anthropicKey) {
    console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const anthropic = new Anthropic({ apiKey: anthropicKey })

  let generated = 0
  let skipped = 0

  console.log(`Seeding ${uniqueSymbols.length} dream symbols\n`)

  for (let i = 0; i < uniqueSymbols.length; i++) {
    const symbol = uniqueSymbols[i]
    const slug = slugify(symbol)
    const displaySymbol = symbol.replace(/-/g, ' ')

    // Skip if already exists
    const { data: existing } = await supabase
      .from('dream_pages')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (existing) {
      console.log(`[${i + 1}/${uniqueSymbols.length}] ${symbol} — already exists, skipping`)
      skipped++
      continue
    }

    console.log(`[${i + 1}/${uniqueSymbols.length}] Generating: ${symbol}`)

    try {
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
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.log(`  ✗ Failed to parse response`)
        continue
      }

      const content = JSON.parse(jsonMatch[0])

      const { error } = await supabase.from('dream_pages').insert({
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
        view_count: 0,
      })

      if (error) {
        console.log(`  ✗ DB error: ${error.message}`)
      } else {
        console.log(`  ✓ ${content.meta_title}`)
        generated++
      }
    } catch (error) {
      console.log(`  ✗ Error: ${error}`)
    }

    // 2s delay between requests
    if (i < uniqueSymbols.length - 1) {
      await sleep(2000)
    }
  }

  console.log(`\nDone! Generated: ${generated}, Skipped: ${skipped}`)
}

seed()
