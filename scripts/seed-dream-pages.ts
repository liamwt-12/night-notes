/**
 * Seed script: pre-generates dream symbol pages via the API endpoint.
 *
 * Usage:
 *   SITE_URL=https://trynightnotes.com npx tsx scripts/seed-dream-pages.ts
 */

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

const MAX_RETRIES = 3
const RETRY_DELAY = 3000

async function generateWithRetry(siteUrl: string, symbol: string): Promise<{ ok: boolean; title?: string; error?: string }> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${siteUrl}/api/generate-dream-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      })

      if (res.status === 504) {
        console.log(`  ⏱ Timeout (attempt ${attempt}/${MAX_RETRIES})`)
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY)
          continue
        }
        return { ok: false, error: '504 Gateway Timeout after 3 retries' }
      }

      if (res.ok) {
        const data = await res.json()
        return { ok: true, title: data.meta_title || 'saved' }
      }

      const err = await res.text()
      return { ok: false, error: `${res.status}: ${err}` }
    } catch (error) {
      console.log(`  ⏱ Request error (attempt ${attempt}/${MAX_RETRIES}): ${error}`)
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY)
        continue
      }
      return { ok: false, error: `${error}` }
    }
  }

  return { ok: false, error: 'Max retries exceeded' }
}

async function seed() {
  const siteUrl = process.env.SITE_URL

  if (!siteUrl) {
    console.error('Missing required env var: SITE_URL')
    console.error('Usage: SITE_URL=https://trynightnotes.com npx tsx scripts/seed-dream-pages.ts')
    process.exit(1)
  }

  let generated = 0
  let failed = 0

  console.log(`Seeding ${uniqueSymbols.length} symbols via ${siteUrl}\n`)

  for (let i = 0; i < uniqueSymbols.length; i++) {
    const symbol = uniqueSymbols[i]
    console.log(`[${i + 1}/${uniqueSymbols.length}] ${symbol}`)

    const result = await generateWithRetry(siteUrl, symbol)

    if (result.ok) {
      console.log(`  ✓ ${result.title}`)
      generated++
    } else {
      console.log(`  ✗ ${result.error}`)
      failed++
    }

    // 3s delay between symbols
    if (i < uniqueSymbols.length - 1) {
      await sleep(3000)
    }
  }

  console.log(`\nDone! Generated/cached: ${generated}, Failed: ${failed}`)
}

seed()
