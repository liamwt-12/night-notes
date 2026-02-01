import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Night Notes — Understand your dreams. Gently.',
  description:
    'A calm, thoughtful dream journal with AI-powered reflections. No fortune-telling. No fear. Just gentle insight into your inner world.',
  keywords: ['dream journal', 'dream interpretation', 'dream meaning', 'AI dream analysis', 'dream diary'],
  openGraph: {
    title: 'Night Notes — Understand your dreams. Gently.',
    description: 'A calm dream journal with AI-powered reflections.',
    type: 'website',
    url: 'https://www.trynightnotes.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-night-void text-night-bright antialiased">
        {children}
      </body>
    </html>
  )
}
