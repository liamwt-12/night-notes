import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const SURFACE = `You are a thoughtful dream interpreter. Provide a grounded interpretation that:
- Acknowledges the emotional tone
- Connects symbols to real-life meanings
- Asks one reflective question
Keep to 3-4 paragraphs. Be warm, not saccharine.`;

const BENEATH = `You are a Jungian dream analyst. Provide a deeper interpretation that:
- Identifies archetypal patterns (shadow, anima/animus, the Self)
- Explores unconscious communication
- References symbolic meanings
Keep to 4-5 paragraphs. Write with depth and care.`;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { dream, mode = "surface" } = await request.json();
    if (!dream || dream.length < 10) return NextResponse.json({ error: "Dream too short" }, { status: 400 });

    const { data: canInterpret } = await supabase.rpc("can_interpret_dream", { user_uuid: user.id });
    if (!canInterpret?.allowed) return NextResponse.json({ error: "No credits" }, { status: 403 });

    const { data: creditUsed } = await supabase.rpc("use_dream_credit", { user_uuid: user.id });
    if (!creditUsed?.success) return NextResponse.json({ error: "Failed to use credit" }, { status: 403 });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: mode === "beneath" ? BENEATH : SURFACE,
      messages: [{ role: "user", content: `Here is my dream:\n\n${dream}` }],
    });

    const interpretation = message.content[0].type === "text" ? message.content[0].text : "";

    const { data: saved } = await supabase.from("dreams").insert({
      user_id: user.id, content: dream, interpretation, interpretation_mode: mode, token_used: creditUsed.type === "token"
    }).select().single();

    return NextResponse.json({ interpretation, mode, credit_type: creditUsed.type, dream_id: saved?.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic'
