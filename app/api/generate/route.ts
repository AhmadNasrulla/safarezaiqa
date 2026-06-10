import { NextRequest, NextResponse } from "next/server";
import { PART_PROMPTS } from "@/app/lib/prompts";

/**
 * Secure server-side proxy to Google's Gemini API.
 *
 * The API key (GEMINI_API_KEY) never leaves the server. The browser only
 * sends a `part` identifier and optional free-text input; the actual prompt
 * lives in app/lib/prompts.ts. This keeps the credential safe and the prompt
 * engineering centralised.
 */

// Route handlers are not cached by default; this one must always run live.
export const dynamic = "force-dynamic";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Gemini API key not configured. Add GEMINI_API_KEY to .env.local and restart the dev server.",
      },
      { status: 503 },
    );
  }

  let body: { part?: string; input?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { part, input } = body;
  const config = part ? PART_PROMPTS[part] : undefined;

  if (!config) {
    return NextResponse.json(
      { error: `Unknown analysis part: "${part}".` },
      { status: 400 },
    );
  }

  const userPrompt = input?.trim()
    ? `${config.prompt}\n\nADDITIONAL FOCUS FROM THE ANALYST:\n${input.trim()}`
    : config.prompt;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  try {
    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: config.system }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.85,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiRes.ok) {
      const detail = await geminiRes.text();
      return NextResponse.json(
        {
          error: `Gemini API error (${geminiRes.status}). ${
            geminiRes.status === 400
              ? "Check that your API key is valid and the model name is correct."
              : "Please try again."
          }`,
          detail: detail.slice(0, 500),
        },
        { status: 502 },
      );
    }

    const data = await geminiRes.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? "")
        .join("") ?? undefined;

    if (!text) {
      const reason = data?.candidates?.[0]?.finishReason ?? "unknown";
      return NextResponse.json(
        { error: `No content returned by Gemini (finishReason: ${reason}).` },
        { status: 502 },
      );
    }

    return NextResponse.json({ text, model: GEMINI_MODEL });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "Could not reach the Gemini API. Check your network connection and try again.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
