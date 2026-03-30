import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import LeagueTableClient from './client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Most Common Dreams & Their Meanings | Night Notes',
  description: 'Discover the most common dream symbols and what they mean. Ranked by how often people search for them.',
  openGraph: {
    title: 'Most Common Dreams & Their Meanings | Night Notes',
    description: 'Discover the most common dream symbols and what they mean.',
    url: 'https://trynightnotes.com/most-common-dreams',
    siteName: 'Night Notes',
  },
  alternates: {
    canonical: 'https://trynightnotes.com/most-common-dreams',
  },
}

async function getTopDreams() {
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const { data } = await supabase
    .from('dream_pages')
    .select('slug, symbol, intro, view_count')
    .order('view_count', { ascending: false })
    .limit(50)

  return data || []
}

export default async function MostCommonDreamsPage() {
  const dreams = await getTopDreams()

  return <LeagueTableClient dreams={dreams} />
}
