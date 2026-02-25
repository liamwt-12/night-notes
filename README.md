# Night Notes

Close the day. See the difference.

## Deploy Steps

### 1. Supabase (one-time)
1. Go to your Supabase project
2. SQL Editor → New Query
3. Paste contents of `supabase-schema.sql`
4. Click Run

### 2. GitHub
Replace all files in your `night-notes` repo with this code and push to main.

Netlify will auto-deploy.

### 3. Resend (one-time)
1. Go to resend.com → Domains
2. Add `trynightnotes.com`
3. Add the DNS records to 123-reg

### 4. Test
1. Visit trynightnotes.com
2. Sign up with your email
3. Complete a shutdown ritual
4. Check insights page

## Environment Variables (already in Netlify)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `CRON_SECRET`

## For Beta Testers
After 1 week, update landing page with real data:
- Total sessions
- Average drop
- Testimonial quotes
