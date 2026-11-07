/**
 * Natural-voice text-to-speech for Mr Big Nuts (public chatbot).
 *
 * POST /api/tts  { "text": "..." }  ->  audio/mpeg
 *
 * Proxies ElevenLabs so the API key never ships to the browser. The key
 * lives ONLY in the Pages project environment as the secret
 * ELEVENLABS_API_KEY (set in the Cloudflare dashboard by the Boss — it
 * is never committed to this repo). Until that secret exists this
 * endpoint answers 501 and the client falls back to the browser voice.
 *
 * Guardrails: text is hard-capped, one short reply per call, and the
 * ElevenLabs account is on a fixed character plan that cannot bill
 * overages — when the monthly characters run out, upstream errors make
 * the client fall back to the browser voice until the cycle resets.
 */

interface Env {
  ELEVENLABS_API_KEY?: string;
  ELEVENLABS_VOICE_ID?: string;
}

/** Roger — laid-back, casual, resonant. A guy's guy voice for Mr Big Nuts. */
const DEFAULT_VOICE_ID = "CwhRBWXzGAHq8TQ4Fs17";
const MAX_CHARS = 320;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function cleanText(raw: string): string {
  return raw
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_#>`]/g, "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CHARS);
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const apiKey = context.env.ELEVENLABS_API_KEY;
  if (!apiKey) return json({ error: "tts_not_configured" }, 501);

  let text = "";
  try {
    const body = (await context.request.json()) as { text?: unknown };
    if (typeof body.text === "string") text = cleanText(body.text);
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  if (!text) return json({ error: "empty_text" }, 400);

  const voiceId = context.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  let upstream: Response;
  try {
    upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.8,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      }
    );
  } catch {
    return json({ error: "tts_unreachable" }, 502);
  }
  if (!upstream.ok || !upstream.body) {
    return json({ error: "tts_upstream", status: upstream.status }, 502);
  }
  return new Response(upstream.body, {
    status: 200,
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
};

export const onRequestGet = async (): Promise<Response> =>
  json({ error: "method_not_allowed" }, 405);
