import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const { data: pages } = await supabase
    .from('dream_pages')
    .select('slug, updated_at')
    .order('view_count', { ascending: false })

  const dreamPages: MetadataRoute.Sitemap = (pages || []).map((page) => ({
    url: `https://trynightnotes.com/dream-meaning/${page.slug}`,
    lastModified: new Date(page.updated_at || '2026-03-30').toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://trynightnotes.com',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://trynightnotes.com/privacy',
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://trynightnotes.com/most-common-dreams',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...dreamPages,
  ]
}
