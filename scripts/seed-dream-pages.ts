/**
 * Seed script: pre-generates dream symbol pages.
 *
 * Usage:
 *   npx tsx scripts/seed-dream-pages.ts
 *
 * Requires these env vars:
 *   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ANTHROPIC_API_KEY
 *
 * Or set SITE_URL to call the generation API endpoint instead:
 *   SITE_URL=https://trynightnotes.com npx tsx scripts/seed-dream-pages.ts
 */

const SYMBOLS = [
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
]

// Deduplicate (drowning appears twice in the spec)
const uniqueSymbols = Array.from(new Set(SYMBOLS))

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function seedViaAPI(siteUrl: string) {
  console.log(`Seeding via API at ${siteUrl}`)
  console.log(`${uniqueSymbols.length} symbols to generate\n`)

  for (let i = 0; i < uniqueSymbols.length; i++) {
    const symbol = uniqueSymbols[i]
    console.log(`[${i + 1}/${uniqueSymbols.length}] Generating: ${symbol}`)

    try {
      const res = await fetch(`${siteUrl}/api/generate-dream-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      })

      if (res.ok) {
        const data = await res.json()
        console.log(`  ✓ ${data.meta_title || 'saved'}`)
      } else {
        const err = await res.text()
        console.log(`  ✗ ${res.status}: ${err}`)
      }
    } catch (error) {
      console.log(`  ✗ Error: ${error}`)
    }

    // 2s delay between requests to avoid rate limits
    if (i < uniqueSymbols.length - 1) {
      await sleep(2000)
    }
  }

  console.log('\nDone!')
}

async function seedDirect() {
  // Dynamic imports for direct mode
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const { createClient } = await import('@supabase/supabase-js')

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!supabaseUrl || !supabaseKey || !anthropicKey) {
    console.error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const anthropic = new Anthropic({ apiKey: anthropicKey })

  console.log(`Seeding directly (${uniqueSymbols.length} symbols)\n`)

  for (let i = 0; i < uniqueSymbols.length; i++) {
    const symbol = uniqueSymbols[i]
    const slug = symbol.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const displaySymbol = symbol.replace(/-/g, ' ')

    // Check if already exists
    const { data: existing } = await supabase
      .from('dream_pages')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (existing) {
      console.log(`[${i + 1}/${uniqueSymbols.length}] ${symbol} — already exists, skipping`)
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
      }
    } catch (error) {
      console.log(`  ✗ Error: ${error}`)
    }

    // 2s delay between requests
    if (i < uniqueSymbols.length - 1) {
      await sleep(2000)
    }
  }

  console.log('\nDone!')
}

// Main
const siteUrl = process.env.SITE_URL
if (siteUrl) {
  seedViaAPI(siteUrl)
} else {
  seedDirect()
}
