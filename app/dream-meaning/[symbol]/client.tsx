'use client'

import { useState } from 'react'
import Link from 'next/link'

interface DreamPage {
  slug: string
  symbol: string
  intro: string
  psychological_meaning: string
  what_researchers_say: string
  common_variations: string
  what_to_do: string
  related_symbols: string[]
  faqs: { q: string; a: string }[]
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(240,232,255,0.06)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          textAlign: 'left', gap: '24px',
        }}
      >
        <span style={{
          fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '20px',
          color: 'rgba(240,232,255,0.8)', lineHeight: 1.4,
        }}>{q}</span>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '18px', color: 'rgba(240,232,255,0.3)',
          flexShrink: 0, transition: 'transform 0.3s',
          transform: open ? 'rotate(45deg)' : 'none',
        }}>+</span>
      </button>
      {open && (
        <div style={{
          paddingBottom: '28px',
          fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
          fontSize: '17px', color: 'rgba(240,232,255,0.55)', lineHeight: 1.85,
          maxWidth: '680px',
        }}>{a}</div>
      )}
    </div>
  )
}

export default function DreamSymbolClient({ page, displaySymbol }: { page: DreamPage; displaySymbol: string }) {
  const APP_LINK = 'https://apps.apple.com/gb/app/night-notes/id6760349512'

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
        {/* Aurora background */}
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
            }}>Dream Symbol</p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(52px, 8vw, 96px)', lineHeight: 0.96, letterSpacing: '-2px',
              color: 'rgba(240,232,255,0.92)', textTransform: 'capitalize' as const,
            }}>{displaySymbol}</h1>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300,
              fontSize: '22px', color: 'rgba(240,232,255,0.65)', lineHeight: 1.8,
              maxWidth: '680px', marginTop: '24px',
            }}>{page.intro}</p>
          </section>

          {/* CTA block */}
          <section style={{
            borderTop: '1px solid rgba(240,232,255,0.06)',
            borderBottom: '1px solid rgba(240,232,255,0.06)',
            padding: '48px 0',
            marginBottom: '64px',
          }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300,
              fontSize: '20px', color: 'rgba(240,232,255,0.5)', lineHeight: 1.8,
              marginBottom: '24px', maxWidth: '580px',
            }}>
              This is the general meaning. Your dream about {displaySymbol} is specific to you.
            </p>
            <a href={APP_LINK} style={{
              display: 'inline-block', fontFamily: "'DM Sans', sans-serif", fontSize: '11px',
              letterSpacing: '3px', fontWeight: 400, textTransform: 'uppercase' as const,
              background: 'rgba(240,232,255,0.9)', color: '#080511',
              padding: '14px 28px', borderRadius: '50px', textDecoration: 'none',
              transition: 'background 0.3s',
            }}>
              Get your personal interpretation →
            </a>
          </section>

          {/* Content sections */}
          <ContentSection label="What it tends to mean" content={page.psychological_meaning} />
          <ContentSection label="What researchers say" content={page.what_researchers_say} />
          <ContentSection label="Common variations" content={page.common_variations} />
          <ContentSection label="Questions to sit with" content={page.what_to_do} />

          {/* Related symbols */}
          {page.related_symbols && page.related_symbols.length > 0 && (
            <section style={{ borderTop: '1px solid rgba(240,232,255,0.06)', padding: '64px 0' }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '8px', letterSpacing: '6px',
                fontWeight: 200, color: 'rgba(240,232,255,0.25)', textTransform: 'uppercase' as const,
                marginBottom: '24px',
              }}>People who dream about {displaySymbol} often also dream about</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {page.related_symbols.map((sym) => (
                  <Link
                    key={sym}
                    href={`/dream-meaning/${slugify(sym)}`}
                    style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '2px',
                      border: '1px solid rgba(240,232,255,0.12)', borderRadius: '50px',
                      padding: '10px 20px', textDecoration: 'none', color: 'rgba(240,232,255,0.6)',
                      textTransform: 'capitalize' as const, transition: 'border-color 0.3s, color 0.3s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(240,232,255,0.35)'; e.currentTarget.style.color = 'rgba(240,232,255,0.9)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(240,232,255,0.12)'; e.currentTarget.style.color = 'rgba(240,232,255,0.6)' }}
                  >{sym}</Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ section */}
          {page.faqs && page.faqs.length > 0 && (
            <section style={{ borderTop: '1px solid rgba(240,232,255,0.06)', padding: '64px 0' }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '8px', letterSpacing: '6px',
                fontWeight: 200, color: 'rgba(240,232,255,0.25)', textTransform: 'uppercase' as const,
                marginBottom: '24px',
              }}>Common questions</p>
              <div>
                {page.faqs.map((faq, i) => (
                  <FAQItem key={i} q={faq.q} a={faq.a} />
                ))}
              </div>
            </section>
          )}

          {/* Bottom CTA */}
          <section style={{
            borderTop: '1px solid rgba(240,232,255,0.06)',
            padding: '100px 0 80px',
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(40px, 7vw, 80px)', lineHeight: 0.96, letterSpacing: '-2px',
              color: 'rgba(240,232,255,0.88)', marginBottom: '20px',
            }}>Ready to understand<br />your dream?</h2>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300,
              fontSize: '20px', color: 'rgba(240,232,255,0.45)', marginBottom: '40px',
            }}>Write it down before it fades.</p>
            <a href={APP_LINK} style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'rgba(240,232,255,0.9)', color: '#080511',
              textDecoration: 'none', padding: '18px 36px', borderRadius: '50px',
              fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '4px',
              fontWeight: 400, textTransform: 'uppercase' as const, transition: 'background 0.3s',
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

function ContentSection({ label, content }: { label: string; content: string }) {
  if (!content) return null
  return (
    <section style={{ borderTop: '1px solid rgba(240,232,255,0.06)', padding: '64px 0' }}>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: '8px', letterSpacing: '6px',
        fontWeight: 200, color: 'rgba(240,232,255,0.25)', textTransform: 'uppercase' as const,
        marginBottom: '24px',
      }}>{label}</p>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300,
        fontSize: '19px', color: 'rgba(240,232,255,0.65)', lineHeight: 1.85,
        maxWidth: '680px',
      }}>
        {content.split('\n\n').map((para, i) => (
          <p key={i} style={{ marginBottom: i < content.split('\n\n').length - 1 ? '24px' : 0 }}>{para}</p>
        ))}
      </div>
    </section>
  )
}
