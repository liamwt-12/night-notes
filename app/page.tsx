import type { Metadata } from 'next'
import LandingClient from './landing-client'

export const metadata: Metadata = {
  title: 'Night Notes — Dream Journal & Interpretation',
  description: 'Write what you remember from last night. Understand what it means. A private ritual for catching dreams before they disappear.',
  openGraph: {
    title: 'Night Notes — Dream Journal & Interpretation',
    description: 'Write what you remember from last night. Understand what it means.',
    url: 'https://trynightnotes.com',
    siteName: 'Night Notes',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Night Notes — Dream Journal & Interpretation',
    description: 'Write what you remember from last night. Understand what it means.',
  },
  alternates: {
    canonical: 'https://trynightnotes.com',
  },
}

export default function Page() {
  return <LandingClient />
}
