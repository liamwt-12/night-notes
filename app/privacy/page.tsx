'use client'

export default function Privacy() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&family=DM+Sans:wght@200;300;400&family=Cormorant+Garamond:ital,wght@1,300&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { background: #080511; }
        body { background: #080511; color: #f0e8ff; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        .atm { position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background: radial-gradient(ellipse 60% 40% at 70% 10%, rgba(123,63,196,0.12) 0%, transparent 60%); }
        .wrap { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; padding: 120px 40px 80px; }
        .back { display: inline-flex; align-items: center; gap: 8px; font-size: 9px; letter-spacing: 4px;
          color: rgba(240,232,255,0.3); text-decoration: none; text-transform: uppercase; font-weight: 200;
          margin-bottom: 60px; transition: color 0.3s; }
        .back:hover { color: rgba(240,232,255,0.6); }
        h1 { font-family: 'Playfair Display', serif; font-style: italic; font-weight: 400;
          font-size: 48px; color: rgba(240,232,255,0.88); letter-spacing: -1px; margin-bottom: 12px; }
        .updated { font-size: 9px; letter-spacing: 5px; color: rgba(240,232,255,0.2);
          text-transform: uppercase; font-weight: 200; margin-bottom: 60px; }
        h2 { font-family: 'Playfair Display', serif; font-style: italic; font-weight: 400;
          font-size: 22px; color: rgba(240,232,255,0.7); margin: 48px 0 16px; }
        p { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300;
          font-size: 18px; color: rgba(240,232,255,0.5); line-height: 1.85; margin-bottom: 16px; }
        ul { margin: 0 0 16px 24px; }
        li { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300;
          font-size: 18px; color: rgba(240,232,255,0.5); line-height: 1.85; margin-bottom: 8px; }
        a { color: rgba(196,94,171,0.7); text-decoration: none; transition: color 0.3s; }
        a:hover { color: rgba(196,94,171,1); }
        .divider { height: 1px; background: rgba(240,232,255,0.055); margin: 48px 0; }
        .contact { background: rgba(240,232,255,0.03); border: 1px solid rgba(240,232,255,0.07);
          border-radius: 12px; padding: 28px 32px; margin-top: 48px; }
      `}</style>

      <div className="atm"></div>
      <div className="wrap">
        <a href="/" className="back">← Night Notes</a>

        <h1>Privacy Policy</h1>
        <p className="updated">Last updated: March 2026</p>

        <p>Night Notes (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is built by Useful for Humans. We take your privacy seriously. Your dreams are personal. This policy explains exactly what we collect and why.</p>

        <h2>What we collect</h2>
        <p>When you use Night Notes, we collect the following information:</p>
        <ul>
          <li><strong>Account information</strong> — your Apple ID email address, provided when you sign in with Apple. If you use Apple&apos;s private relay, we receive a relay address.</li>
          <li><strong>Dream content</strong> — the text of dreams you write or speak into the app. This is stored securely in our database (Supabase) and used to generate your interpretation.</li>
          <li><strong>Interpretations</strong> — the AI-generated interpretations of your dreams, stored alongside your dream entries.</li>
          <li><strong>Preferences</strong> — your dreamer type selection, wake time reminder preference, and timezone.</li>
          <li><strong>Subscription status</strong> — whether you have an active Pro subscription, managed through Apple&apos;s App Store.</li>
        </ul>

        <h2>How we use your data</h2>
        <ul>
          <li>To generate dream interpretations using the Anthropic Claude API. Your dream text is sent to Anthropic&apos;s API for this purpose and subject to <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">Anthropic&apos;s privacy policy</a>.</li>
          <li>To store your dream journal securely so you can access it across devices.</li>
          <li>To send morning reminder notifications at the time you choose. These are local notifications — we do not use a push notification service.</li>
          <li>To generate weekly and monthly journal summaries.</li>
        </ul>

        <div className="divider"></div>

        <h2>What we do not do</h2>
        <ul>
          <li>We do not sell your data. Ever.</li>
          <li>We do not share your dream content with any third party except Anthropic (for interpretation) and Supabase (for storage).</li>
          <li>We do not use your data for advertising.</li>
          <li>We do not use analytics SDKs or tracking tools.</li>
          <li>We do not share your data with data brokers.</li>
        </ul>

        <h2>Data storage and security</h2>
        <p>Your data is stored in Supabase, a secure cloud database with row-level security. Your dream content is associated with your user account and is not accessible to other users. We use industry-standard encryption in transit and at rest.</p>

        <h2>Data retention</h2>
        <p>Your data is retained for as long as you have an account with Night Notes. If you delete your account, your data will be permanently deleted within 30 days. To request account deletion, contact us at <a href="mailto:hello@trynightnotes.com">hello@trynightnotes.com</a>.</p>

        <h2>Your rights</h2>
        <p>You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at <a href="mailto:hello@trynightnotes.com">hello@trynightnotes.com</a>. If you are in the UK or EU, you have additional rights under GDPR/UK GDPR including the right to data portability and the right to object to processing.</p>

        <h2>Children</h2>
        <p>Night Notes is not directed at children under 13. We do not knowingly collect personal data from children under 13. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.</p>

        <h2>Changes to this policy</h2>
        <p>We may update this privacy policy from time to time. We will notify you of significant changes by updating the date at the top of this page. Continued use of the app after changes constitutes acceptance of the updated policy.</p>

        <div className="contact">
          <p style={{marginBottom: 0}}>Questions about your privacy? Contact us at <a href="mailto:hello@trynightnotes.com">hello@trynightnotes.com</a></p>
        </div>
      </div>
    </>
  )
}
