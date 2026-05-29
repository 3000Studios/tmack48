interface Env {
  /** Optional webhook (Mailchimp/ConvertKit/Beehiiv/Zapier) to forward signups to. */
  NEWSLETTER_FORWARD_URL?: string;
  /** Optional fallback inbox for signups. */
  CONTACT_EMAIL?: string;
}

interface Payload {
  email?: string;
  /** Optional referral / source tag. */
  source?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let data: Payload;
  try {
    data = (await request.json()) as Payload;
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const email = (data.email ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "Please enter a valid email." }, 400);
  }

  if (env.NEWSLETTER_FORWARD_URL) {
    try {
      const res = await fetch(env.NEWSLETTER_FORWARD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: data.source ?? "site", site: "tmack48.com" }),
      });
      if (res.ok) return json({ ok: true });
    } catch {
      // fall through to mailto fallback
    }
  }

  // No provider configured — return a mailto so the visitor can still reach the artist.
  const to = env.CONTACT_EMAIL || "tmack48@tmack48.com";
  const mailto = `mailto:${to}?subject=${encodeURIComponent("Newsletter signup")}&body=${encodeURIComponent(
    `Add me to the TMACK48 list: ${email}`
  )}`;
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
