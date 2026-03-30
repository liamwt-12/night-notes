import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import DreamSymbolClient from './client'

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getDreamPage(symbol: string) {
  const supabase = getSupabase()
  const slug = symbol.toLowerCase()

  const { data: existing } = await supabase
    .from('dream_pages')
    .select('*')
    .eq('slug', slug)
    .single()

  if (existing) {
    // Increment view count (fire and forget)
    supabase
      .from('dream_pages')
      .update({ view_count: (existing.view_count || 0) + 1 })
      .eq('slug', slug)
      .then(() => {})

    return existing
  }

  // Generate via API if not cached
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/generate-dream-page`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol: slug }),
    cache: 'no-store',
  })

  if (!res.ok) return null
  return res.json()
}

export async function generateMetadata({ params }: { params: { symbol: string } }): Promise<Metadata> {
  const page = await getDreamPage(params.symbol)
  const displaySymbol = params.symbol.replace(/-/g, ' ')

  if (!page) {
    return {
      title: `Dreaming About ${displaySymbol} | Night Notes`,
      description: `Discover what dreaming about ${displaySymbol} means. Personal dream interpretation powered by psychology.`,
    }
  }

  return {
    title: page.meta_title,
    description: page.meta_desc,
    openGraph: {
      title: page.meta_title,
      description: page.meta_desc,
      url: `https://trynightnotes.com/dream-meaning/${params.symbol}`,
      siteName: 'Night Notes',
      type: 'article',
    },
    alternates: {
      canonical: `https://trynightnotes.com/dream-meaning/${params.symbol}`,
    },
  }
}

export default async function DreamMeaningPage({ params }: { params: { symbol: string } }) {
  const page = await getDreamPage(params.symbol)
  const displaySymbol = params.symbol.replace(/-/g, ' ')

  if (!page) {
    return (
      <div style={{ background: '#080511', color: '#f0e8ff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'serif', fontSize: '20px', opacity: 0.5 }}>Could not load this dream symbol. Try again later.</p>
      </div>
    )
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (page.faqs || []).map((faq: { q: string; a: string }) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <DreamSymbolClient page={page} displaySymbol={displaySymbol} />
    </>
  )
}
