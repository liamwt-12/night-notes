'use client'

import Link from 'next/link'

interface DreamEntry {
  slug: string
  symbol: string
  intro: string
  view_count: number
}

export default function LeagueTableClient({ dreams }: { dreams: DreamEntry[] }) {
  const APP_LINK = 'https://apps.apple.com/gb/app/night-notes/id6760349512'
  const maxViews = dreams.length > 0 ? dreams[0].view_count || 1 : 1

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400;1,700&family=DM+Sans:wght@200;300;400&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { background: #080511; }
        body { background: #080511; color: #f0e8ff; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        a { color: inherit; }
      `}</style>

      <div style={{ minHeight: '100vh', position: 'relative' }}>
        {/* Aurora */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
            top: '-200px', right: '-100px',
            background: 'radial-gradient(circle, rgba(123,63,196,0.15) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }} />
          <div style={{
            position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
            bottom: '-100px', left: '-100px',
            background: 'radial-gradient(circle, rgba(196,94,171,0.1) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          {/* Header */}
          <header style={{ paddingTop: '40px', paddingBottom: '80px' }}>
            <Link href="/" style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '10px', letterSpacing: '9px',
              fontWeight: 200, color: 'rgba(240,232,255,0.3)', textTransform: 'lowercase' as const,
              textDecoration: 'none',
            }}>night notes</Link>
          </header>

          {/* Hero */}
          <section style={{ paddingBottom: '64px' }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '9px', letterSpacing: '6px',
              fontWeight: 200, color: 'rgba(240,232,255,0.3)', textTransform: 'uppercase' as const,
              marginBottom: '16px',
            }}>Dream Dictionary</p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(36px, 6vw, 52px)', lineHeight: 1.1, letterSpacing: '-1px',
              color: 'rgba(240,232,255,0.92)',
            }}>The most dreamed<br />symbols right now</h1>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300,
              fontSize: '20px', color: 'rgba(240,232,255,0.45)', lineHeight: 1.8,
              maxWidth: '580px', marginTop: '20px',
            }}>Ranked by how often people explore their meaning. Updated as new dreams are interpreted.</p>
          </section>

          {/* Table */}
          <section style={{ borderTop: '1px solid rgba(240,232,255,0.06)' }}>
            {dreams.length === 0 ? (
              <p style={{
                fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
                fontSize: '19px', color: 'rgba(240,232,255,0.45)', padding: '64px 0',
              }}>Dream symbols are being generated. Check back soon.</p>
            ) : (
              dreams.map((dream, i) => {
                const barWidth = Math.max(8, (dream.view_count / maxViews) * 100)
                const teaser = dream.intro
                  ? dream.intro.length > 120 ? dream.intro.slice(0, 120) + '…' : dream.intro
                  : ''

                return (
                  <Link
                    key={dream.slug}
                    href={`/dream-meaning/${dream.slug}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr',
                      gap: '24px',
                      alignItems: 'start',
                      padding: '32px 0',
                      borderBottom: '1px solid rgba(240,232,255,0.06)',
                      textDecoration: 'none',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(240,232,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Rank */}
                    <span style={{
                      fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
                      fontSize: 'clamp(28px, 4vw, 40px)', color: 'rgba(240,232,255,0.1)',
                      lineHeight: 1, letterSpacing: '-1px',
                    }}>{String(i + 1).padStart(2, '0')}</span>

                    {/* Content */}
                    <div>
                      <h2 style={{
                        fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400,
                        fontSize: '24px', color: 'rgba(240,232,255,0.85)', lineHeight: 1.2,
                        textTransform: 'capitalize' as const, marginBottom: '8px',
                      }}>{dream.symbol}</h2>

                      {teaser && (
                        <p style={{
                          fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300,
                          fontSize: '16px', color: 'rgba(240,232,255,0.4)', lineHeight: 1.7,
                          marginBottom: '14px', maxWidth: '580px',
                        }}>{teaser}</p>
                      )}

                      {/* Relative bar */}
                      <div style={{
                        height: '2px', background: 'rgba(240,232,255,0.06)',
                        borderRadius: '1px', overflow: 'hidden', maxWidth: '300px',
                      }}>
                        <div style={{
                          height: '100%', width: `${barWidth}%`,
                          background: 'rgba(123,63,196,0.5)',
                          borderRadius: '1px',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </section>

          {/* Bottom CTA */}
          <section style={{ padding: '100px 0 80px' }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 0.96, letterSpacing: '-2px',
              color: 'rgba(240,232,255,0.88)', marginBottom: '20px',
            }}>What did you<br />dream last night?</h2>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300,
              fontSize: '20px', color: 'rgba(240,232,255,0.45)', marginBottom: '40px',
            }}>Write it down before it fades.</p>
            <a href={APP_LINK} style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'rgba(240,232,255,0.9)', color: '#080511',
              textDecoration: 'none', padding: '18px 36px', borderRadius: '50px',
              fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '4px',
              fontWeight: 400, textTransform: 'uppercase' as const,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              Download for iOS
            </a>
          </section>

          {/* Footer */}
          <footer style={{
            borderTop: '1px solid rgba(240,232,255,0.06)',
            padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '16px',
          }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '9px', letterSpacing: '6px',
              fontWeight: 200, color: 'rgba(240,232,255,0.18)',
            }}>night notes · trynightnotes.com</span>
            <div style={{ display: 'flex', gap: '28px' }}>
              <Link href="/privacy" style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '9px', letterSpacing: '3px',
                fontWeight: 200, color: 'rgba(240,232,255,0.18)', textDecoration: 'none',
                textTransform: 'uppercase' as const,
              }}>Privacy</Link>
              <a href="mailto:hello@trynightnotes.com" style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '9px', letterSpacing: '3px',
                fontWeight: 200, color: 'rgba(240,232,255,0.18)', textDecoration: 'none',
                textTransform: 'uppercase' as const,
              }}>Support</a>
            </div>
          </footer>

          <div style={{ height: '40px' }} />
        </div>
      </div>
    </>
  )
}
