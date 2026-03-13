export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  
  try {
    const { dream } = await request.json()
    
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: `Interpret this dream in 2-3 paragraphs, speaking directly to the dreamer. Be insightful, warm and specific. Dream: ${dream}` }]
    })
    
    const interpretation = message.content[0].type === 'text' ? message.content[0].text : ''
    
    return Response.json({ interpretation })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Failed to interpret dream' }, { status: 500 })
  }
}
