# 🌙 Night Notes V2 — Upgrade Guide

## What's New in V2
- **API Fix:** Standalone Netlify Function (bypasses the broken Next.js API route)
- **Voice Input:** Speak your dream using your phone's microphone
- **Premium Design:** Darker, more sophisticated aesthetic with refined animations
- **Free Tier Counter:** 5 reflections/month, then upgrade prompt
- **Error Handling:** Clear error messages instead of silent failures
- **Better AI Prompt:** Warmer, more consistent reflections

---

## How to Deploy V2

### Step 1: Update Files in GitHub

You need to **replace** these files in your GitHub repo:

| File | Action |
|------|--------|
| `app/page.tsx` | **Replace** with new version |
| `app/layout.tsx` | **Replace** with new version |
| `app/globals.css` | **Replace** with new version |
| `netlify.toml` | **Replace** with new version |
| `package.json` | **Replace** with new version |
| `tailwind.config.js` | **Replace** with new version |
| `netlify/functions/reflect.mjs` | **NEW** — Create this file |

And **DELETE** this folder:

| File/Folder | Action |
|-------------|--------|
| `app/api/reflect/route.ts` | **DELETE** (replaced by Netlify Function) |
| `app/api/` folder | **DELETE** the entire folder |

### Step 2: Create the Netlify Function folder

In GitHub, you need to create the path: `netlify/functions/`
Then upload `reflect.mjs` into that folder.

**To create folders in GitHub's web UI:**
1. Go to your repo
2. Click "Add file" → "Create new file"
3. In the filename field, type: `netlify/functions/reflect.mjs`
4. GitHub will auto-create the folders
5. Paste the contents of `reflect.mjs`
6. Commit

### Step 3: Clear Netlify Build Cache

This is important — old cached builds can cause issues:

1. Go to **app.netlify.com** → your Night Notes site
2. Go to **Site configuration** → **Build & deploy** → **Build settings**
3. Look for **"Clear cache and deploy site"** button
4. Click it to trigger a fresh build

### Step 4: Verify

After the build completes (~3-5 minutes):
1. Visit your Netlify URL
2. Enter a dream
3. You should see a reflection appear in 2-3 seconds
4. Try the voice input (tap the mic icon)

---

## File-by-File Changes

### What Changed and Why

**`netlify/functions/reflect.mjs` (NEW)**
This is the API fix. Instead of relying on Next.js API routes (which weren't converting to Netlify serverless functions), this is a standalone function that Netlify handles directly. It calls the Claude API and returns the reflection.

**`app/page.tsx` (REPLACED)**
Complete v2 frontend with voice input, free tier counter, error handling, and premium design.

**`app/layout.tsx` (REPLACED)**
Premium fonts (Playfair Display + DM Sans), better metadata for SEO.

**`app/globals.css` (REPLACED)**
Refined dark theme, glassmorphism cards, recording animation, shimmer loading.

**`netlify.toml` (REPLACED)**
Added `[functions]` section so Netlify knows where to find the standalone function.

**`package.json` (REPLACED)**
- Removed `"export": "next export"` script (this may have contributed to static-only builds)
- Removed unused dependencies (Supabase, Stripe, jsPDF) to keep the build clean — we'll add these back when needed in Phase 2
- Bumped version to 2.0.0

**`tailwind.config.js` (REPLACED)**
Updated colour palette (darker, more premium), new fonts, refined animations.

**`app/api/` folder (DELETED)**
No longer needed — the Netlify Function handles `/api/reflect` directly.

---

## Unchanged Files (Keep As-Is)
- `next.config.js` — No changes needed
- `tsconfig.json` — No changes needed
- `postcss.config.js` — No changes needed

---

## Environment Variables

Your existing environment variables in Netlify should still work.
The only one needed for V2 is:

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

The Supabase and Stripe keys can stay — they won't cause issues, and you'll need them for Phase 2.

---

## ⚠️ Security Note

Your API keys were visible in the DEPLOY.md file that was uploaded.
If that file has been shared or committed to a public repo, you should rotate these keys:

1. **Anthropic:** https://console.anthropic.com → API Keys → Create new key, delete old one
2. **Stripe:** https://dashboard.stripe.com → Developers → API keys → Roll keys
3. **Supabase:** Project settings → API → Generate new keys

Then update the new keys in your Netlify environment variables.

---

## Troubleshooting

**Build fails:**
- Make sure `app/api/` folder is completely deleted
- Check that `netlify/functions/reflect.mjs` exists in the repo
- Try "Clear cache and deploy" in Netlify

**Reflection still empty:**
- Check Netlify function logs: Site → Functions → reflect
- Verify ANTHROPIC_API_KEY is set in Netlify env vars
- Check browser console for errors (right-click → Inspect → Console)

**Voice input not working:**
- Only works in Chrome, Edge, and Safari
- Requires HTTPS (which Netlify provides)
- User must allow microphone permission
- Won't work in Firefox (falls back to typing — button hidden)

**"5 reflections left" shows wrong number:**
- Counter resets on the 1st of each month
- Stored in browser's localStorage
- Clearing browser data resets the counter

---

## What's Next (Phase 2)

After V2 is live and working:
1. Authentication (Supabase magic link)
2. Database (save dreams permanently)
3. Stripe payments (£4.99/month or £29.99/year)
4. Journal view (timeline of past dreams)
5. SEO content pages (dream interpretation articles)

---

*Night Notes V2 — Built February 2026*
