'use client'

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400;1,700&family=DM+Sans:wght@200;300;400&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');
        
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { background: #080511; scroll-behavior: smooth; }
        body {
          background: #080511;
          color: #f0e8ff;
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        .atm {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }
        .orb1 {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          top: -200px; right: -100px;
          background: radial-gradient(circle, rgba(123,63,196,0.2) 0%, transparent 65%);
          filter: blur(80px);
          animation: float1 18s ease-in-out infinite alternate;
        }
        .orb2 {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          bottom: -100px; left: -100px;
          background: radial-gradient(circle, rgba(196,94,171,0.15) 0%, transparent 65%);
          filter: blur(80px);
          animation: float2 22s ease-in-out infinite alternate;
        }
        @keyframes float1 { from{transform:translate(0,0)} to{transform:translate(-60px,80px)} }
        @keyframes float2 { from{transform:translate(0,0)} to{transform:translate(80px,-60px)} }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 28px 52px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .wm {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px; letter-spacing: 9px; font-weight: 200;
          color: rgba(240,232,255,0.3); text-transform: lowercase;
        }
        .nav-dl {
          font-family: 'DM Sans', sans-serif; font-size: 9px;
          letter-spacing: 3px; font-weight: 300;
          border: 1px solid rgba(240,232,255,0.15);
          padding: 9px 22px; border-radius: 40px;
          color: rgba(240,232,255,0.6); text-transform: uppercase;
          text-decoration: none; transition: all 0.3s;
        }
        .nav-dl:hover { border-color: rgba(240,232,255,0.35); color: rgba(240,232,255,0.9); }

        .hero {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: flex; flex-direction: column;
          justify-content: flex-end;
          padding: 0 52px 80px;
        }
        .hero-tag {
          font-size: 9px; letter-spacing: 6px; font-weight: 200;
          color: rgba(240,232,255,0.25); text-transform: uppercase;
          margin-bottom: 28px;
          animation: fadein 1.2s ease 0.4s both;
        }
        .hero-h {
          font-family: 'Playfair Display', serif;
          font-style: italic; font-weight: 400;
          font-size: clamp(52px, 8vw, 100px);
          line-height: 0.96; letter-spacing: -2px;
          color: rgba(240,232,255,0.9);
          margin-bottom: 28px;
          animation: fadein 1.4s ease 0.6s both;
        }
        .hero-h span { color: rgba(240,232,255,0.3); display: block; font-size: 0.55em; margin-top: 10px; }
        .hero-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(16px, 1.8vw, 22px);
          color: rgba(240,232,255,0.45); line-height: 1.85;
          max-width: 480px; margin-bottom: 48px;
          animation: fadein 1.2s ease 1s both;
        }
        .hero-cta {
          display: inline-flex; align-items: center; gap: 12px;
          background: rgba(240,232,255,0.9); color: #080511;
          text-decoration: none; padding: 18px 36px; border-radius: 50px;
          font-size: 11px; letter-spacing: 4px; font-weight: 400;
          text-transform: uppercase; transition: background 0.3s;
          animation: fadein 1.2s ease 1.4s both;
        }
        .hero-cta:hover { background: white; }
        .hero-cta svg { width: 14px; height: 14px; flex-shrink: 0; }

        .free-note {
          font-size: 9px; letter-spacing: 3px; font-weight: 200;
          color: rgba(240,232,255,0.2); margin-top: 16px;
          animation: fadein 1.2s ease 1.6s both;
        }

        @keyframes fadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }

        /* WHAT IT DOES */
        .what {
          position: relative; z-index: 1;
          border-top: 1px solid rgba(240,232,255,0.055);
          padding: 100px 52px;
        }
        .what-grid {
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0;
        }
        .what-item {
          padding: 48px 40px 48px 0;
          border-right: 1px solid rgba(240,232,255,0.055);
        }
        .what-item:last-child { border-right: none; padding-right: 0; padding-left: 40px; }
        .what-item:nth-child(2) { padding-left: 40px; }
        .what-num {
          font-family: 'Playfair Display', serif;
          font-style: italic; font-size: clamp(44px,5vw,64px);
          color: rgba(240,232,255,0.1); line-height: 1; margin-bottom: 16px;
          letter-spacing: -2px;
        }
        .what-label {
          font-size: 8px; letter-spacing: 6px; font-weight: 200;
          color: rgba(240,232,255,0.22); text-transform: uppercase; margin-bottom: 12px;
        }
        .what-text {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 17px; font-weight: 300;
          color: rgba(240,232,255,0.5); line-height: 1.8;
        }

        /* FINAL CTA */
        .final {
          position: relative; z-index: 1;
          border-top: 1px solid rgba(240,232,255,0.055);
          min-height: 60vh;
          display: flex; flex-direction: column;
          justify-content: center;
          padding: 100px 52px 120px;
        }
        .final-orb {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          top: 50%; left: 50%; transform: translate(-50%,-50%);
          background: radial-gradient(circle, rgba(123,63,196,0.1) 0%, transparent 60%);
          filter: blur(60px); pointer-events: none;
        }
        .final-h {
          font-family: 'Playfair Display', serif;
          font-style: italic; font-weight: 400;
          font-size: clamp(52px,10vw,120px);
          line-height: 0.92; letter-spacing: -3px;
          color: rgba(240,232,255,0.88); margin-bottom: 48px;
          position: relative; z-index: 1;
        }
        .final-buttons {
          display: flex; align-items: center; gap: 36px;
          position: relative; z-index: 1; flex-wrap: wrap;
        }
        .final-dl {
          display: inline-flex; align-items: center; gap: 10px;
          background: rgba(240,232,255,0.9); color: #080511;
          text-decoration: none; padding: 18px 36px; border-radius: 50px;
          font-size: 11px; letter-spacing: 4px; font-weight: 400;
          text-transform: uppercase; transition: background 0.3s;
        }
        .final-dl:hover { background: white; }
        .final-free {
          font-size: 9px; letter-spacing: 3px; font-weight: 200;
          color: rgba(240,232,255,0.2); margin-top: 20px;
          position: relative; z-index: 1;
        }

        footer {
          position: relative; z-index: 1;
          border-top: 1px solid rgba(240,232,255,0.055);
          padding: 24px 52px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .ft-wm { font-size: 9px; letter-spacing: 6px; font-weight: 200; color: rgba(240,232,255,0.18); }
        .ft-links { display: flex; gap: 28px; }
        .ft-a {
          font-size: 9px; letter-spacing: 3px; font-weight: 200;
          color: rgba(240,232,255,0.18); text-decoration: none;
          text-transform: uppercase; transition: color 0.3s;
        }
        .ft-a:hover { color: rgba(240,232,255,0.45); }

        @media (max-width: 768px) {
          nav { padding: 20px 24px; }
          .hero { padding: 0 24px 80px; }
          .what { padding: 80px 24px; }
          .what-grid { grid-template-columns: 1fr; }
          .what-item { border-right: none; border-bottom: 1px solid rgba(240,232,255,0.055); padding: 40px 0 !important; }
          .final { padding: 80px 24px 100px; }
          .final-buttons { flex-direction: column; align-items: flex-start; gap: 20px; }
          footer { padding: 20px 24px; flex-direction: column; gap: 16px; text-align: center; }
          .ft-links { flex-wrap: wrap; justify-content: center; }
        }
      `}</style>

      <div className="atm">
        <div className="orb1"></div>
        <div className="orb2"></div>
      </div>

      <nav>
        <span className="wm">night notes</span>
        <a href="https://apps.apple.com/app/id6759646628" className="nav-dl">Download</a>
      </nav>

      <section className="hero">
        <p className="hero-tag">Dream Journal & Interpretation · iOS</p>
        <h1 className="hero-h">
          What did your<br />sleep try to<br />tell you?
          <span>You&apos;re already forgetting it.</span>
        </h1>
        <p className="hero-sub">
          Write what you remember from last night — or speak it before it fades.
          Night Notes tells you what it might mean.
        </p>
        <a href="https://apps.apple.com/app/id6759646628" className="hero-cta">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          Download free
        </a>
        <p className="free-note">7 interpretations free · Pro from 99p</p>
      </section>

      <section className="what">
        <div className="what-grid">
          <div className="what-item">
            <div className="what-num">01</div>
            <div className="what-label">Write or speak</div>
            <p className="what-text">Type what you remember, or tap the microphone and speak while it&apos;s still fresh. Your words appear as you talk.</p>
          </div>
          <div className="what-item">
            <div className="what-num">02</div>
            <div className="what-label">Understand it</div>
            <p className="what-text">Every interpretation is personal and considered. Not generic. Not templated. Written specifically for what you shared.</p>
          </div>
          <div className="what-item">
            <div className="what-num">03</div>
            <div className="what-label">Remember it</div>
            <p className="what-text">Your dreams are stored privately. Browse your journal, find patterns, see which symbols keep returning over time.</p>
          </div>
        </div>
      </section>

      <section className="final">
        <div className="final-orb"></div>
        <h2 className="final-h">Begin<br />tonight.</h2>
        <div className="final-buttons">
          <a href="https://apps.apple.com/app/id6759646628" className="final-dl">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            Download for iOS
          </a>
        </div>
        <p className="final-free">7 interpretations free · Pro from 99p first month · £29.99/year</p>
      </section>

      <footer>
        <span className="ft-wm">night notes · trynightnotes.com</span>
        <div className="ft-links">
          <a href="/privacy" className="ft-a">Privacy</a>
          <a href="mailto:hello@trynightnotes.com" className="ft-a">Support</a>
        </div>
      </footer>
    </>
  )
}
