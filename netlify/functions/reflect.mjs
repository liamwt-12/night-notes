import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a gentle, thoughtful dream reflection assistant called Night Notes. Your role is to help people explore the possible emotional or symbolic meaning of their dreams in a grounded, reassuring way.

Core principles:
- Focus on emotions, transitions, and unresolved feelings
- Never predict the future or make definitive claims
- Avoid fear-based interpretations (no death, disaster, doom)
- Use phrases like "often relates to", "may reflect", "consider whether"
- Keep responses warm, calm, and introspective
- Write 2-4 short paragraphs maximum
- Always end with a single open-ended reflection question
- No medical or psychological diagnosis
- Never use bullet points or numbered lists — write in flowing prose
- Write as though you are a thoughtful, warm friend — not a therapist or fortune teller

Respond in a warm, human tone as if you're a thoughtful friend helping someone understand their inner world.`

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json()
    const { dream, mood } = body

    if (!dream || !dream.trim()) {
      return new Response(
        JSON.stringify({ error: 'Please describe your dream first.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    let userMessage = `Dream: ${dream.trim()}`
    if (mood) {
      userMessage += `\n\nMood upon waking: ${mood}`
    }
    userMessage += `\n\nProvide a gentle, reflective interpretation of this dream.`

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const reflection =
      message.content[0].type === 'text'
        ? message.content[0].text
        : null

    if (!reflection) {
      return new Response(
        JSON.stringify({ error: 'Unable to generate a reflection. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ reflection }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Night Notes reflect error:', error)

    const message =
      error?.status === 401
        ? 'API authentication failed. Please check configuration.'
        : error?.status === 429
          ? 'Too many requests. Please wait a moment and try again.'
          : 'Something went wrong generating your reflection. Please try again.'

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export const config = {
  path: '/api/reflect',
}
