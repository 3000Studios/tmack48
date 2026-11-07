// Site analytics — first-party counters in SITE_KV so the admin control
// center can show real visitor totals, today's visits, top pages and the
// latest site errors without any third-party dashboard. Writes are public
// (a page-view beacon can't carry a secret) but only ever increment
// counters / append capped error notes. Reads require the admin passcode.
interface Env {
  SITE_KV?: KVNamespace;
  ADMIN_PASSCODE?: string;
}

const KEY = "analytics_v1";
const MAX_ERRORS = 25;
const MAX_PATHS = 40;

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

interface AnalyticsState {
  total: number;
  days: Record<string, number>;
  paths: Record<string, number>;
  errors: { msg: string; path: string; ts: number }[];
  updatedAt: number;
}

const empty = (): AnalyticsState => ({ total: 0, days: {}, paths: {}, errors: [], updatedAt: 0 });

async function read(env: Env): Promise<AnalyticsState> {
  if (!env.SITE_KV) return empty();
  const raw = await env.SITE_KV.get(KEY);
  if (!raw) return empty();
  try {
    const p = JSON.parse(raw) as AnalyticsState;
    return {
      total: typeof p.total === "number" ? p.total : 0,
      days: p.days && typeof p.days === "object" ? p.days : {},
      paths: p.paths && typeof p.paths === "object" ? p.paths : {},
      errors: Array.isArray(p.errors) ? p.errors : [],
      updatedAt: p.updatedAt || 0,
    };
  } catch {
    return empty();
  }
}

function cleanPath(v: unknown): string {
  if (typeof v !== "string") return "/";
  const s = v.replace(/[<>"]/g, "").slice(0, 120);
  return s.startsWith("/") ? s : "/";
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.SITE_KV) return json({ ok: false }, 501);
  let data: { type?: string; path?: string; msg?: string };
  try {
    data = (await request.json()) as typeof data;
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }
  const state = await read(env);
  const path = cleanPath(data.path);
  if (data.type === "view") {
    state.total += 1;
    const day = new Date().toISOString().slice(0, 10);
    state.days[day] = (state.days[day] || 0) + 1;
    // keep the day map small — last 62 days
    const dayKeys = Object.keys(state.days).sort();
    while (dayKeys.length > 62) {
      const k = dayKeys.shift() as string;
      delete state.days[k];
    }
    state.paths[path] = (state.paths[path] || 0) + 1;
    const pathKeys = Object.entries(state.paths).sort((a, b) => a[1] - b[1]);
    while (pathKeys.length > MAX_PATHS) {
      const [k] = pathKeys.shift() as [string, number];
      delete state.paths[k];
    }
  } else if (data.type === "error") {
    const msg = typeof data.msg === "string" ? data.msg.replace(/[<>]/g, "").slice(0, 200) : "Unknown error";
    state.errors = [{ msg, path, ts: Date.now() }, ...state.errors].slice(0, MAX_ERRORS);
  } else {
    return json({ ok: false, error: "Unknown type" }, 400);
  }
  state.updatedAt = Date.now();
  await env.SITE_KV.put(KEY, JSON.stringify(state));
  return json({ ok: true });
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const passcode = env.ADMIN_PASSCODE || "3000";
  if (request.headers.get("x-admin-passcode") !== passcode) {
    return json({ ok: false, error: "Wrong passcode." }, 401);
  }
  const state = await read(env);
  const day = new Date().toISOString().slice(0, 10);
  const topPages = Object.entries(state.paths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, count]) => ({ path, count }));
  return json({
    ok: true,
    totalViews: state.total,
    todayViews: state.days[day] || 0,
    topPages,
    errors: state.errors,
    updatedAt: state.updatedAt,
    storageConnected: !!env.SITE_KV,
  });
};
