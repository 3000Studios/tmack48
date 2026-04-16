interface Env {
  CONTACT_FORWARD_URL?: string;
  CONTACT_EMAIL?: string;
}

interface Payload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  type?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let data: Payload;
  try {
    data = (await request.json()) as Payload;
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  if (!data.name || !data.email || !data.subject || !data.message) {
    return json({ ok: false, error: "Missing fields" }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return json({ ok: false, error: "Invalid email" }, 400);
  }

  // Optional: forward to a webhook (e.g. Zapier, Make, Formspree, etc.) if configured.
  if (env.CONTACT_FORWARD_URL) {
    try {
      await fetch(env.CONTACT_FORWARD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, site: "tmack48.com" }),
      });
      return json({ ok: true });
    } catch {
      // Fall through to mailto fallback
    }
  }

  // Fallback: return a mailto so the browser opens the user's email client.
  const to = env.CONTACT_EMAIL || "booking@tmack48.com";
  const subject = `[${data.type ?? "Inquiry"}] ${data.subject}`;
  const body = `From: ${data.name} <${data.email}>\n\n${data.message}`;
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
