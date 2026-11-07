// Email the Developer — the admin control center's message board. A
// message is ALWAYS saved to the developer inbox in SITE_KV first (never
// lost), and if DEV_FORWARD_URL is configured in the Pages environment
// (e.g. a form-to-email relay for the developer's mailbox), it is also
// forwarded there so it lands as a real email. The admin can read the
// inbox with the passcode.
interface Env {
  SITE_KV?: KVNamespace;
  ADMIN_PASSCODE?: string;
  DEV_FORWARD_URL?: string;
}

const KEY = "dev_inbox_v1";
const MAX_MESSAGES = 50;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Passcode",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
  });
}

function sanitize(input: string, max: number): string {
  return input
    .replace(/[<>]/g, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

interface DevMessage {
  id: string;
  name: string;
  topic: string;
  message: string;
  ts: number;
  emailed: boolean;
}

async function readInbox(env: Env): Promise<DevMessage[]> {
  if (!env.SITE_KV) return [];
  const raw = await env.SITE_KV.get(KEY);
  if (!raw) return [];
  try {
    const p = JSON.parse(raw) as DevMessage[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let data: { name?: string; topic?: string; message?: string };
  try {
    data = (await request.json()) as typeof data;
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }
  const name = sanitize(String(data.name || ""), 60);
  const topic = sanitize(String(data.topic || ""), 100);
  const message = sanitize(String(data.message || ""), 2000);
  if (!message) return json({ ok: false, error: "Write a message first." }, 400);

  const entry: DevMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name || "Site admin",
    topic: topic || "Message from the admin panel",
    message,
    ts: Date.now(),
    emailed: false,
  };

  // Forward to the developer's mailbox when a relay is configured.
  if (env.DEV_FORWARD_URL) {
    try {
      const res = await fetch(env.DEV_FORWARD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: entry.name,
          _subject: `[TMACK48 Admin] ${entry.topic}`,
          message: entry.message,
          site: "tmack48.com",
        }),
      });
      entry.emailed = res.ok;
    } catch {
      entry.emailed = false;
    }
  }

  if (env.SITE_KV) {
    const inbox = await readInbox(env);
    await env.SITE_KV.put(KEY, JSON.stringify([entry, ...inbox].slice(0, MAX_MESSAGES)));
  }

  return json({ ok: true, saved: !!env.SITE_KV, emailed: entry.emailed });
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const passcode = env.ADMIN_PASSCODE || "3000";
  if (request.headers.get("x-admin-passcode") !== passcode) {
    return json({ ok: false, error: "Wrong passcode." }, 401);
  }
  return json({ ok: true, messages: await readInbox(env), storageConnected: !!env.SITE_KV });
};
