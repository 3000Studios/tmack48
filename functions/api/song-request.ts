interface Env {
  /** Optional webhook to forward song requests to (Zapier/Make/Sheets/Discord, etc.). */
  SONG_REQUEST_FORWARD_URL?: string;
  /** Optional fallback inbox. */
  CONTACT_EMAIL?: string;
}

interface Payload {
  name?: string;
  email?: string;
  /** Mood / vibe / theme the fan wants. */
  vibe?: string;
  /** Free-form details. */
  details?: string;
  /** Honeypot. */
  company?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let data: Payload;
  try {
    data = (await request.json()) as Payload;
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  if (data.company) return json({ ok: true }); // silently drop bots

  const vibe = (data.vibe ?? "").trim();
  const details = (data.details ?? "").trim();
  if (!vibe && !details) {
    return json({ ok: false, error: "Tell us what you want to hear." }, 400);
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    return json({ ok: false, error: "That email looks off." }, 400);
  }

  const record = {
    name: (data.name ?? "Anonymous").trim() || "Anonymous",
    email: (data.email ?? "").trim(),
    vibe,
    details,
    site: "tmack48.com",
    receivedAt: new Date().toISOString(),
  };

  if (env.SONG_REQUEST_FORWARD_URL) {
    try {
      const res = await fetch(env.SONG_REQUEST_FORWARD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      if (res.ok) return json({ ok: true });
    } catch {
      // fall through to mailto fallback
    }
  }

  const to = env.CONTACT_EMAIL || "tmack48@tmack48.com";
  const subject = `[Song request] ${vibe || "New idea"}`;
  const body = `From: ${record.name} ${record.email ? `<${record.email}>` : ""}\n\nVibe: ${vibe}\n\nDetails:\n${details}`;
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return json({ ok: false, mailto });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
