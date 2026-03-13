'use client'

import { useEffect, useRef, useState } from 'react'

// ─── DATA ────────────────────────────────────────────────────────────
const PHONE_DREAMS = [
  {
    t: "I was in a house I didn't recognise, but somehow it was mine. Every door opened into another room. Someone was always one corridor ahead.",
    i: "The house is a map of you. Its endlessly extending corridors suggest parts of yourself still unexplored — not lost, just not yet visited. What pursues you isn't a threat. It's something asking to be seen."
  },
  {
    t: "My teeth were falling out one by one. I kept trying to hold them in place but there were too many and they kept loosening anyway.",
    i: "One of the most universal dreams across cultures. It speaks to anxiety about how you appear to others — and a quiet fear that something essential is slipping beyond your control."
  },
  {
    t: "I was flying but only just above the ground. The higher I went, the more afraid I became. I wanted to come back down.",
    i: "You have access to a freedom you aren't fully claiming. The fear isn't of falling — it's of what changes if you actually let yourself rise."
  },
]

const REFUSALS = [
  "This one wants more than a webpage can hold.\n\nCome properly. Night Notes is waiting.",
  "Something in what you wrote deserves a real answer.\n\nNot here. In the app, where it can breathe.",
  "That's not a dream to be rushed.\n\nOpen Night Notes. Write it there. Let it unfold properly.",
  "The interpretation exists.\n\nBut it belongs to you alone — not to a browser tab.",
  "Your dream is already half gone.\n\nDon't lose the other half to a loading screen.",
]

const FRAGMENTS = [
  { t: "I was in a library but all the books were about me.", m: "3:14am · Anonymous" },
  { t: "Running through corridors that kept getting longer.", m: "4:47am · Anonymous" },
  { t: "My childhood home, but every room was wrong.", m: "2:38am · Anonymous" },
  { t: "Flying but only just above the ground.", m: "5:02am · Anonymous" },
  { t: "An exam I hadn't studied for. I'm 34.", m: "6:11am · Anonymous" },
  { t: "Someone I used to know was there but wouldn't look at me.", m: "3:55am · Anonymous" },
  { t: "The water was rising and I wasn't afraid.", m: "4:23am · Anonymous" },
  { t: "I could hear music but couldn't find where it was coming from.", m: "1:47am · Anonymous" },
  { t: "Teeth again. Always the teeth.", m: "5:34am · Anonymous" },
  { t: "I was late for something important. I don't know what.", m: "3:09am · Anonymous" },
  { t: "My house, but it had rooms I'd never found before.", m: "2:51am · Anonymous" },
  { t: "The train wouldn't stop at the right station.", m: "4:15am · Anonymous" },
]

const REVIEWS = [
  { t: "I've been writing down my dreams for years but never understood them. The interpretations feel genuinely considered. Not generic. Not templated.", a: "James · 3 months" },
  { t: "The recurring dream I've had since childhood. I finally understand what it was trying to say. It hasn't come back since.", a: "Rachel · 6 weeks" },
  { t: "I didn't expect an app to make my mornings feel quieter.", a: "Sarah · 2 months" },
  { t: "Something about writing it down at all, before it disappears. That alone is worth it.", a: "Mark · 1 month" },
  { t: "My partner and I read each other's interpretations over coffee now. It's become a ritual.", a: "Emma · 4 months" },
  { t: "I was sceptical. Then it described exactly what I'd been feeling but hadn't said out loud.", a: "Tom · 5 weeks" },
  { t: "The design alone. Just opening it feels like stepping into somewhere private.", a: "Anonymous · 2 months" },
  { t: "I've never journalled before. This is the first thing that made me want to.", a: "Priya · 3 weeks" },
]

const SYMBOLS = [
  { name: "Teeth", note: "Most universal symbol" },
  { name: "Falling", note: "The body startling itself awake" },
  { name: "Being chased", note: "What pursues you" },
  { name: "Water", note: "Emotion, depth, change" },
  { name: "Houses", note: "The self as architecture" },
  { name: "Snakes", note: "Transformation & threat" },
  { name: "Flying", note: "Claiming a freedom" },
  { name: "Exes", note: "Patterns, not people" },
]

// ─── SLEEPING COUNTER ────────────────────────────────────────────────
function calcSleeping() {
  const now = new Date()
  const utcH = now.getUTCHours() + now.getUTCMinutes() / 60
  const regions: [number, number][] = [
    [-5, 330], [-8, 180], [0, 290], [1, 560],
    [3, 510], [5.5, 1400], [8, 1500], [9, 180], [10, 30], [-3, 220],
  ]
  let sleeping = 0
  regions.forEach(([tz, pop]) => {
    const localH = (utcH + tz + 24) % 24
    if (localH >= 22 || localH < 7) sleeping += pop * 1e6 * 0.72
  })
  sleeping += (Math.random() - 0.5) * 8e6
  return Math.round(sleeping)
}

function fmt(n: number) {
  return n.toLocaleString('en-GB')
}

// ─── PHONE DEMO ──────────────────────────────────────────────────────
function PhoneDemo() {
  const [dreamText, setDreamText] = useState('')
  const [interpText, setInterpText] = useState('')
  const [phase, setPhase] = useState<'dream'|'thinking'|'interp'|'pause'>('dream')
  const [dreamIdx, setDreamIdx] = useState(0)
  const [showDiv, setShowDiv] = useState(false)
  const [showILabel, setShowILabel] = useState(false)
  const [showUnveil, setShowUnveil] = useState(true)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const d = PHONE_DREAMS[dreamIdx]

    if (phase === 'dream') {
      setShowDiv(false); setShowILabel(false); setInterpText(''); setShowUnveil(true)
      let ci = 0
      const type = () => {
        if (ci <= d.t.length) {
          setDreamText(d.t.slice(0, ci))
          ci++
          timeout = setTimeout(type, ci < d.t.length ? 38 : 900)
        } else {
          setPhase('thinking')
        }
      }
      timeout = setTimeout(type, 400)
    } else if (phase === 'thinking') {
      setShowDiv(true)
      timeout = setTimeout(() => setPhase('interp'), 2800)
    } else if (phase === 'interp') {
      setShowILabel(true); setShowUnveil(false)
      let ii = 0
      const type = () => {
        if (ii <= d.i.length) {
          setInterpText(d.i.slice(0, ii))
          ii++
          timeout = setTimeout(type, ii < d.i.length ? 32 : 4500)
        } else {
          setPhase('pause')
        }
      }
      type()
    } else if (phase === 'pause') {
      timeout = setTimeout(() => {
        setDreamIdx(i => (i + 1) % PHONE_DREAMS.length)
        setDreamText(''); setInterpText('')
        setShowDiv(false); setShowILabel(false); setShowUnveil(true)
        setPhase('dream')
      }, 4500)
    }

    return () => clearTimeout(timeout)
  }, [phase, dreamIdx])

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* glow beneath phone */}
      <div style={{
        position: 'absolute', width: 280, height: 500, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(196,94,171,0.18) 0%, transparent 65%)',
        filter: 'blur(40px)', pointerEvents: 'none',
        animation: 'breathe 5s ease-in-out infinite',
      }} />
      {/* phone body */}
      <div style={{
        width: 240, background: '#0d0a18',
        borderRadius: 38, border: '1px solid rgba(240,232,255,0.13)',
        padding: '16px 12px 22px',
        boxShadow: '0 0 0 1px rgba(240,232,255,0.05), 0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(123,63,196,0.14)',
        position: 'relative', zIndex: 1,
      }}>
        {/* notch */}
        <div style={{ width: 70, height: 22, background: '#0d0a18', borderRadius: '0 0 14px 14px', margin: '0 auto 10px', position: 'relative' }}>
          <div style={{ position: 'absolute', width: 9, height: 9, background: 'rgba(240,232,255,0.07)', borderRadius: '50%', top: 6, left: '50%', transform: 'translateX(-50%)' }} />
        </div>
        {/* screen */}
        <div style={{ minHeight: 400, borderRadius: 24, overflow: 'hidden', background: '#080511', padding: '24px 18px 20px', position: 'relative' }}>
          {/* aurora */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 50% at 30% 20%, rgba(123,63,196,0.28) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(196,94,171,0.2) 0%, transparent 60%)',
            animation: 'auroradrift 12s ease-in-out infinite alternate',
          }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: 5, color: 'rgba(240,232,255,0.22)', textAlign: 'center', textTransform: 'lowercase', fontWeight: 200, marginBottom: 18, position: 'relative', zIndex: 1 }}>night notes</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 7, letterSpacing: 5, color: 'rgba(240,232,255,0.2)', textTransform: 'uppercase', fontWeight: 200, marginBottom: 10, position: 'relative', zIndex: 1 }}>From last night</p>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 12, fontStyle: 'italic', fontWeight: 300, color: 'rgba(240,232,255,0.68)', lineHeight: 1.75, minHeight: 72, marginBottom: 14, position: 'relative', zIndex: 1 }}>
            {dreamText}{phase === 'dream' && <span style={{ display: 'inline-block', width: 1.5, height: 11, background: 'rgba(240,232,255,0.4)', verticalAlign: 'middle', marginLeft: 2, animation: 'blink 1s step-end infinite' }} />}
          </p>
          {showDiv && <div style={{ height: 1, background: 'rgba(240,232,255,0.07)', marginBottom: 12 }} />}
          {phase === 'thinking' && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: 3, color: 'rgba(196,94,171,0.55)', textTransform: 'uppercase', fontWeight: 200, marginBottom: 12, animation: 'pulselabel 1.8s ease-in-out infinite', position: 'relative', zIndex: 1 }}>
              Turning over the symbols…
            </p>
          )}
          {showILabel && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 7, letterSpacing: 5, color: 'rgba(196,94,171,0.4)', textTransform: 'uppercase', fontWeight: 200, marginBottom: 10, position: 'relative', zIndex: 1 }}>One way to see it</p>
          )}
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 12, fontStyle: 'italic', fontWeight: 300, color: 'rgba(240,232,255,0.85)', lineHeight: 1.8, minHeight: 60, position: 'relative', zIndex: 1 }}>
            {interpText}{(phase === 'interp') && interpText.length > 0 && interpText.length < PHONE_DREAMS[dreamIdx].i.length && <span style={{ display: 'inline-block', width: 1.5, height: 11, background: 'rgba(240,232,255,0.4)', verticalAlign: 'middle', marginLeft: 2, animation: 'blink 1s step-end infinite' }} />}
          </p>
          {showUnveil && (
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontStyle: 'italic', color: 'rgba(240,232,255,0.16)', textAlign: 'center', marginTop: 16, position: 'relative', zIndex: 1 }}>Unveil</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── TRY IT SECTION ──────────────────────────────────────────────────
function TryIt() {
  const [val, setVal] = useState('')
  const [refusal, setRefusal] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!val.trim()) return
    const r = REFUSALS[Math.floor(Math.random() * REFUSALS.length)]
    setRefusal(r)
    setSubmitted(true)
  }

  const reset = () => { setVal(''); setSubmitted(false); setRefusal('') }

  return (
    <div style={{ maxWidth: 800 }}>
      {!submitted ? (
        <>
          <textarea
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            placeholder="Write what you remember. Anything. Even a fragment."
            rows={4}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              borderBottom: '1px solid rgba(240,232,255,0.15)', outline: 'none',
              color: 'rgba(240,232,255,0.88)', fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(18px, 2.4vw, 28px)', fontStyle: 'italic', fontWeight: 300,
              lineHeight: 1.7, padding: '0 0 20px', resize: 'none', transition: 'border-color 0.3s',
              caretColor: 'rgba(196,94,171,0.7)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(196,94,171,0.4)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(240,232,255,0.15)' }}
          />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: 3, color: 'rgba(240,232,255,0.22)', fontWeight: 200, marginBottom: 28, textTransform: 'uppercase', marginTop: 8 }}>
            Press enter or click unveil when you&apos;re ready
          </p>
          <button
            onClick={handleSubmit}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: 5,
              fontWeight: 300, color: 'rgba(240,232,255,0.88)', textTransform: 'uppercase',
              border: '1px solid rgba(240,232,255,0.2)', padding: '16px 36px',
              borderRadius: 50, transition: 'all 0.4s', background: 'transparent',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(196,94,171,0.5)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(196,94,171,0.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(240,232,255,0.2)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
            Unveil
          </button>
        </>
      ) : (
        <div style={{ animation: 'fadein 1.2s ease forwards' }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(20px, 2.8vw, 34px)', fontStyle: 'italic', fontWeight: 300,
            color: 'rgba(240,232,255,0.58)', lineHeight: 1.7, maxWidth: 580, marginBottom: 36,
            whiteSpace: 'pre-line',
          }}>{refusal}</p>
          <a
            href="https://apps.apple.com/app/id6759646628"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 4,
              fontWeight: 300, background: 'rgba(240,232,255,0.92)', color: '#080511',
              padding: '17px 36px', borderRadius: 50, textTransform: 'uppercase',
              textDecoration: 'none', marginRight: 24, transition: 'background 0.3s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'white' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(240,232,255,0.92)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            Open Night Notes
          </a>
          <button
            onClick={reset}
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: 4, color: 'rgba(240,232,255,0.25)', fontWeight: 200, textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(240,232,255,0.1)', paddingBottom: 4 }}
          >
            Write another →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
export default function LandingClient() {
  const [sleeping, setSleeping] = useState(0)
  const [dreaming, setDreaming] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const update = () => {
      const s = calcSleeping()
      setSleeping(s)
      setDreaming(Math.round(s * 0.2 + (Math.random() - 0.5) * 2e6))
    }
    update()
    const iv = setInterval(update, 30000)
    return () => clearInterval(iv)
  }, [])

  // scroll reveal
  useEffect(() => {
    if (!mounted) return
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('vis'); obs.unobserve(e.target) } })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [mounted])

  const fragsDoubled = [...FRAGMENTS, ...FRAGMENTS]
  const revsDoubled = [...REVIEWS, ...REVIEWS]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,900;1,400;1,700;1,900&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400;1,600&family=DM+Sans:wght@200;300;400&display=swap');
        
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { background: #080511; scroll-behavior: smooth; }
        body { color: #f0e8ff; background: #080511; font-family: 'Playfair Display', Georgia, serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
        
        @keyframes float1 { from{transform:translate(0,0) scale(1)} to{transform:translate(-80px,100px) scale(1.2)} }
        @keyframes float2 { from{transform:translate(0,0) scale(1)} to{transform:translate(100px,-80px) scale(1.15)} }
        @keyframes breathe { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.03)} }
        @keyframes auroradrift { from{opacity:0.7} to{opacity:1} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulselabel { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
        @keyframes fadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes tickerR { from{transform:translateX(-50%)} to{transform:translateX(0)} }
        @keyframes pulsedot { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }

        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 1s ease, transform 1s ease; }
        .reveal.vis { opacity: 1; transform: none; }

        .ticker-wrap { display: flex; gap: 64px; width: max-content; animation: ticker 65s linear infinite; }
        .ticker-wrap:hover { animation-play-state: paused; }
        .rev-wrap { display: flex; gap: 56px; width: max-content; animation: tickerR 85s linear infinite; }
        .rev-wrap:hover { animation-play-state: paused; }

        .sym-item { padding: 36px 0; border-right: 1px solid rgba(240,232,255,0.055); border-bottom: 1px solid rgba(240,232,255,0.055); transition: background 0.4s; text-decoration: none; display: block; cursor: pointer; }
        .sym-item:hover { background: rgba(240,232,255,0.02); }
        .sym-item:nth-child(4n) { border-right: none; }
        .sym-item:nth-last-child(-n+4) { border-bottom: none; }
        .sym-name { display: block; padding: 0 28px; font-size: clamp(17px,1.9vw,25px); font-style: italic; color: rgba(240,232,255,0.52); margin-bottom: 6px; transition: color 0.3s; }
        .sym-item:hover .sym-name { color: rgba(240,232,255,0.9); }
        .sym-note { display: block; padding: 0 28px; font-family: 'DM Sans',sans-serif; font-size: 8px; letter-spacing: 3px; color: rgba(240,232,255,0.2); font-weight: 200; text-transform: uppercase; transition: color 0.3s; }
        .sym-item:hover .sym-note { color: rgba(196,94,171,0.55); }

        .nav-link { font-family: 'DM Sans',sans-serif; font-size: 9px; letter-spacing: 4px; font-weight: 300; color: rgba(240,232,255,0.28); text-transform: uppercase; text-decoration: none; transition: color 0.3s; }
        .nav-link:hover { color: rgba(240,232,255,0.6); }
        .nav-dl { font-family: 'DM Sans',sans-serif; font-size: 9px; letter-spacing: 3px; font-weight: 300; border: 1px solid rgba(240,232,255,0.15); padding: 9px 22px; border-radius: 40px; color: rgba(240,232,255,0.55); text-transform: uppercase; text-decoration: none; transition: all 0.3s; }
        .nav-dl:hover { border-color: rgba(240,232,255,0.35); color: rgba(240,232,255,0.88); }
        .s9-dl { display: inline-flex; align-items: center; gap: 12px; font-family: 'DM Sans',sans-serif; font-size: 11px; letter-spacing: 4px; font-weight: 300; background: rgba(240,232,255,0.92); color: #080511; padding: 19px 40px; border-radius: 50px; text-transform: uppercase; transition: background 0.3s; text-decoration: none; margin-right: 40px; }
        .s9-dl:hover { background: white; }
        .s9-ghost { font-family: 'DM Sans',sans-serif; font-size: 9px; letter-spacing: 4px; color: rgba(240,232,255,0.25); font-weight: 200; text-transform: uppercase; border-bottom: 1px solid rgba(240,232,255,0.1); padding-bottom: 4px; transition: all 0.3s; text-decoration: none; }
        .s9-ghost:hover { color: rgba(240,232,255,0.5); border-color: rgba(240,232,255,0.25); }

        @media (max-width: 768px) {
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: repeat(2,1fr) !important; }
          .hide-mobile { display: none !important; }
          .pad-section { padding: 80px 24px !important; }
          .pad-nav { padding: 20px 24px !important; }
          .h-hero { font-size: 52px !important; }
          .h-cta { font-size: 64px !important; }
          .s9-dl { margin-right: 0; margin-bottom: 20px; }
          .cta-buttons { flex-direction: column; align-items: flex-start; }
          .sym-item:nth-child(4n) { border-right: 1px solid rgba(240,232,255,0.055) !important; }
          .sym-item:nth-child(2n) { border-right: none !important; }
        }
      `}</style>

      {/* ATMOSPHERE */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', top: -200, right: -150, background: 'radial-gradient(circle, rgba(123,63,196,0.22) 0%, transparent 65%)', filter: 'blur(80px)', mixBlendMode: 'screen', animation: 'float1 20s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', bottom: -100, left: -150, background: 'radial-gradient(circle, rgba(196,94,171,0.16) 0%, transparent 65%)', filter: 'blur(80px)', mixBlendMode: 'screen', animation: 'float2 25s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, opacity: 0.03 }} />
      </div>

      {/* NAV */}
      <nav className="pad-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, padding: '28px 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: 9, fontWeight: 200, color: 'rgba(240,232,255,0.28)', textTransform: 'lowercase' }}>night notes</span>
        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          <a href="#symbols" className="nav-link hide-mobile">Dictionary</a>
          <a href="#tryit" className="nav-link hide-mobile">Try it</a>
          <a href="https://apps.apple.com/app/id6759646628" className="nav-dl">Download</a>
        </div>
      </nav>

      {/* COUNTER BAR */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 150, padding: '12px 52px', display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(240,232,255,0.055)', background: 'rgba(8,5,17,0.85)', backdropFilter: 'blur(20px)' }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(196,94,171,0.6)', animation: 'pulsedot 2s ease-in-out infinite' }} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: 3, color: 'rgba(240,232,255,0.28)', fontWeight: 200, textTransform: 'uppercase' }}>
          <span style={{ color: 'rgba(196,94,171,0.7)' }}>{mounted ? fmt(dreaming) : '—'}</span> people dreaming right now
        </span>
      </div>

      {/* ── S1: OPENING ── */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 52px 80px', overflow: 'hidden' }} className="pad-section">
        {/* giant ghost number */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 'clamp(70px,13vw,150px)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1, color: 'rgba(240,232,255,0.035)', letterSpacing: -4, animation: 'breathe 6s ease-in-out infinite' }}>
            {mounted ? fmt(sleeping) : '2,187,433,901'}
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: 6, color: 'rgba(240,232,255,0.05)', textTransform: 'uppercase', fontWeight: 200, marginTop: 10 }}>people asleep on earth right now</div>
        </div>

        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'end', gap: 0 }}>
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: 6, color: 'rgba(240,232,255,0.25)', fontWeight: 200, textTransform: 'uppercase', marginBottom: 32, animation: 'fadein 1.2s ease 0.5s both' }}>Dream Journal & Interpretation · iOS</p>
            <h1 className="h-hero" style={{ fontSize: 'clamp(52px,8vw,104px)', fontStyle: 'italic', fontWeight: 400, lineHeight: 0.96, letterSpacing: -2.5, color: 'rgba(240,232,255,0.88)', animation: 'fadein 1.4s ease 0.7s both' }}>
              What did your<br />sleep try to<br />tell you?
              <span style={{ color: 'rgba(240,232,255,0.3)', display: 'block', fontSize: '0.55em', marginTop: 12, letterSpacing: -1, fontWeight: 400 }}>You&apos;re already forgetting it.</span>
            </h1>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(16px,1.8vw,22px)', fontStyle: 'italic', fontWeight: 300, color: 'rgba(240,232,255,0.5)', lineHeight: 1.85, maxWidth: 440, marginTop: 32, animation: 'fadein 1.2s ease 1.1s both' }}>
              A private ritual for the hour between sleeping and forgetting. Write what remains. Understand what it means.
            </p>
          </div>
          <div style={{ textAlign: 'right', paddingBottom: 4 }}>
            <a href="https://apps.apple.com/app/id6759646628" style={{ display: 'inline-flex', alignItems: 'center', gap: 14, fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: 5, fontWeight: 300, color: 'rgba(240,232,255,0.82)', textTransform: 'uppercase', borderBottom: '1px solid rgba(240,232,255,0.2)', paddingBottom: 10, textDecoration: 'none', animation: 'fadein 1.2s ease 1.5s both', transition: 'all 0.4s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'white'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(240,232,255,0.5)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(240,232,255,0.82)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(240,232,255,0.2)' }}
            >
              Begin tonight <span style={{ fontSize: 18, transition: 'transform 0.3s' }}>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* OVERFLOW WORD */}
      <div style={{ position: 'relative', zIndex: 1, overflow: 'hidden', borderTop: '1px solid rgba(240,232,255,0.055)', padding: '40px 0', userSelect: 'none', pointerEvents: 'none' }}>
        <div style={{ fontSize: '22vw', fontStyle: 'italic', fontWeight: 900, lineHeight: 0.85, color: 'rgba(240,232,255,0.022)', whiteSpace: 'nowrap', paddingLeft: 52, letterSpacing: -6 }}>Dreaming</div>
      </div>

      {/* ── S2: PHONE DEMO ── */}
      <section style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(240,232,255,0.055)', padding: '120px 52px' }} className="pad-section">
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: 80 }}>
          <div className="reveal">
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: 7, color: 'rgba(240,232,255,0.22)', textTransform: 'uppercase', fontWeight: 200, marginBottom: 44 }}>The ritual</p>
            <h2 style={{ fontSize: 'clamp(34px,4.5vw,58px)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 28, color: 'rgba(240,232,255,0.88)' }}>Write what you<br />remember.<br />Read what it means.</h2>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, fontStyle: 'italic', fontWeight: 300, color: 'rgba(240,232,255,0.5)', lineHeight: 1.85, maxWidth: 380 }}>
              Before the morning takes it, Night Notes holds the fragment. Then — slowly, carefully — it turns it over and reads what was underneath.
            </p>
          </div>
          <div className="reveal">
            <PhoneDemo />
          </div>
        </div>
      </section>

      {/* ── S3: TRUTH ── */}
      <section style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(240,232,255,0.055)', padding: '120px 52px' }} className="pad-section">
        <p className="reveal" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: 7, color: 'rgba(240,232,255,0.22)', textTransform: 'uppercase', fontWeight: 200, marginBottom: 48 }}>A few things we know</p>
        <p className="reveal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(22px,3vw,40px)', fontStyle: 'italic', fontWeight: 300, lineHeight: 1.65, color: 'rgba(240,232,255,0.5)', maxWidth: 900 }}>
          <strong style={{ color: 'rgba(240,232,255,0.88)', fontWeight: 400 }}>Most people dream four to six times a night.</strong> Almost none of it survives till morning. Within five minutes of waking, <strong style={{ color: 'rgba(240,232,255,0.88)', fontWeight: 400 }}>half the dream is gone.</strong> Within ten, ninety percent. The mind leaves something behind — a feeling, a shape, a fragment of image. <strong style={{ color: 'rgba(240,232,255,0.88)', fontWeight: 400 }}>Night Notes is for catching that fragment</strong> before it disappears entirely.
        </p>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', marginTop: 80, borderTop: '1px solid rgba(240,232,255,0.055)', borderBottom: '1px solid rgba(240,232,255,0.055)' }}>
          {[
            { n: '6 yrs', t: 'The average person spends six full years of their life dreaming. Most of it is never examined.' },
            { n: '5 min', t: 'After five minutes of waking, half the dream is already unreachable. The mind is covering its tracks.' },
            { n: '95%', t: 'Of dreams are forgotten by the time the morning properly begins. Last night is almost certainly already gone.' },
          ].map((m, i) => (
            <div key={i} className="reveal" style={{ padding: '52px 40px', borderRight: i < 2 ? '1px solid rgba(240,232,255,0.055)' : 'none' }}>
              <div style={{ fontSize: 'clamp(48px,6vw,76px)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1, letterSpacing: -2, color: 'rgba(240,232,255,0.13)', marginBottom: 18 }}>{m.n}</div>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, fontStyle: 'italic', fontWeight: 300, color: 'rgba(240,232,255,0.5)', lineHeight: 1.75 }}>{m.t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── S4: TRY IT ── */}
      <section id="tryit" style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(240,232,255,0.055)', padding: '120px 52px' }} className="pad-section">
        <p className="reveal" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: 7, color: 'rgba(240,232,255,0.22)', textTransform: 'uppercase', fontWeight: 200, marginBottom: 48 }}>Try it now</p>
        <h2 className="reveal" style={{ fontSize: 'clamp(38px,5.5vw,70px)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.0, letterSpacing: -2, marginBottom: 56, color: 'rgba(240,232,255,0.88)', maxWidth: 680 }}>What did you<br />dream last night?</h2>
        <div className="reveal"><TryIt /></div>
      </section>

      {/* ── S5: FRAGMENTS ── */}
      <section style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(240,232,255,0.055)', padding: '100px 0', overflow: 'hidden' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: 7, color: 'rgba(240,232,255,0.22)', textTransform: 'uppercase', fontWeight: 200, padding: '0 52px', marginBottom: 52 }}>Dreams from last night</p>
        <div className="ticker-wrap">
          {fragsDoubled.map((f, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, whiteSpace: 'nowrap', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(15px,1.6vw,20px)', fontStyle: 'italic', fontWeight: 300, color: 'rgba(240,232,255,0.42)' }}>{f.t}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: 4, color: 'rgba(240,232,255,0.18)', fontWeight: 200, textTransform: 'uppercase' }}>{f.m}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── S6: AUTHORITY ── */}
      <section style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(240,232,255,0.055)', padding: '120px 52px' }} className="pad-section">
        <h2 className="reveal" style={{ fontSize: 'clamp(32px,4.5vw,56px)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.05, letterSpacing: -1, marginBottom: 80, color: 'rgba(240,232,255,0.88)', maxWidth: 680 }}>The thinkers who spent<br />their lives in this space.</h2>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid rgba(240,232,255,0.055)' }}>
          {[
            { name: 'Sigmund Freud', dates: '1856 — 1939', q: '"Dreams are the royal road to the unconscious." The content of your dream, he argued, is rarely what the dream is actually about.' },
            { name: 'Carl Jung', dates: '1875 — 1961', q: '"Who looks outside, dreams; who looks inside, awakes." Jung saw recurring symbols as messages from a self deeper than the conscious mind.' },
            { name: 'Allan Hobson', dates: '1933 — 2021', q: 'Harvard neuroscientist who proved that even random neural firing during sleep is shaped by the mind into narrative, pattern and meaning.' },
          ].map((t, i) => (
            <div key={i} className="reveal" style={{ padding: '52px 40px 52px', paddingLeft: i > 0 ? 40 : 0, paddingRight: i < 2 ? 40 : 0, borderRight: i < 2 ? '1px solid rgba(240,232,255,0.055)' : 'none' }}>
              <p style={{ fontSize: 'clamp(20px,2.3vw,30px)', fontStyle: 'italic', fontWeight: 400, color: 'rgba(240,232,255,0.18)', marginBottom: 6, letterSpacing: -0.5 }}>{t.name}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: 4, color: 'rgba(240,232,255,0.18)', fontWeight: 200, textTransform: 'uppercase', marginBottom: 24 }}>{t.dates}</p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, fontStyle: 'italic', fontWeight: 300, color: 'rgba(240,232,255,0.5)', lineHeight: 1.8, borderLeft: '1px solid rgba(240,232,255,0.07)', paddingLeft: 18 }}>{t.q}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── S7: REVIEWS ── */}
      <section style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(240,232,255,0.055)', padding: '100px 0', overflow: 'hidden' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: 7, color: 'rgba(240,232,255,0.22)', textTransform: 'uppercase', fontWeight: 200, padding: '0 52px', marginBottom: 52 }}>Notes from people who use it</p>
        <div className="rev-wrap">
          {revsDoubled.map((r, i) => (
            <div key={i} style={{ flexShrink: 0, width: 340, padding: '32px 0', borderTop: '1px solid rgba(240,232,255,0.055)', borderBottom: '1px solid rgba(240,232,255,0.055)' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 16, fontStyle: 'italic', fontWeight: 300, color: 'rgba(240,232,255,0.55)', lineHeight: 1.75, marginBottom: 18 }}>&ldquo;{r.t}&rdquo;</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: 4, color: 'rgba(240,232,255,0.2)', fontWeight: 200, textTransform: 'uppercase' }}>— {r.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── S8: SYMBOLS ── */}
      <section id="symbols" style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(240,232,255,0.055)', padding: '120px 52px' }} className="pad-section">
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'end', marginBottom: 80, paddingBottom: 52, borderBottom: '1px solid rgba(240,232,255,0.055)' }}>
          <h2 className="reveal" style={{ fontSize: 'clamp(38px,5vw,64px)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1, letterSpacing: -1.5, color: 'rgba(240,232,255,0.88)' }}>The dream<br />dictionary.</h2>
          <p className="reveal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, fontStyle: 'italic', fontWeight: 300, color: 'rgba(240,232,255,0.5)', lineHeight: 1.85 }}>A growing archive of the symbols people return to most. Every entry written to be read, not crawled.</p>
        </div>
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {SYMBOLS.map((s, i) => (
            <a key={i} href={`/dream-meaning/${s.name.toLowerCase().replace(/ /g, '-')}`} className="sym-item">
              <span className="sym-name">{s.name}</span>
              <span className="sym-note">{s.note}</span>
            </a>
          ))}
        </div>
        <p className="reveal" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: 4, color: 'rgba(240,232,255,0.18)', fontWeight: 200, textTransform: 'uppercase', marginTop: 44 }}>2,000+ symbols in the full dictionary</p>
      </section>

      {/* ── S9: FINAL CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 52px', borderTop: '1px solid rgba(240,232,255,0.055)', overflow: 'hidden' }} className="pad-section">
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(123,63,196,0.1) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none', animation: 'breathe 8s ease-in-out infinite' }} />
        <p className="reveal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(15px,1.8vw,20px)', fontStyle: 'italic', fontWeight: 300, color: 'rgba(240,232,255,0.28)', marginBottom: 24, lineHeight: 1.7, maxWidth: 480 }}>
          Last night is already leaving you.<br />Tomorrow morning won&apos;t contain what this one did.
        </p>
        <h2 className="reveal h-cta" style={{ fontSize: 'clamp(64px,12vw,144px)', fontStyle: 'italic', fontWeight: 400, lineHeight: 0.92, letterSpacing: -4, color: 'rgba(240,232,255,0.88)', marginBottom: 52 }}>Begin<br />tonight.</h2>
        <div className="reveal cta-buttons" style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
          <a href="https://apps.apple.com/app/id6759646628" className="s9-dl">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            Download free
          </a>
          <a href="#symbols" className="s9-ghost">Explore the dictionary</a>
        </div>
        <p className="reveal" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: 3, color: 'rgba(240,232,255,0.2)', fontWeight: 200, marginTop: 28 }}>7 interpretations free · Pro from 99p first month</p>
      </section>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, padding: '28px 52px', borderTop: '1px solid rgba(240,232,255,0.055)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 44 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: 7, color: 'rgba(240,232,255,0.2)', fontWeight: 200 }}>night notes · trynightnotes.com</span>
        <div style={{ display: 'flex', gap: 28 }}>
          {[['Privacy', '/privacy'], ['Support', 'mailto:hello@trynightnotes.com'], ['Dictionary', '#symbols']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: 3, color: 'rgba(240,232,255,0.2)', fontWeight: 200, textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(240,232,255,0.5)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(240,232,255,0.2)' }}
            >{label}</a>
          ))}
        </div>
      </footer>
    </>
  )
}
