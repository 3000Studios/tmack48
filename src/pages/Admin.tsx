import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import { siteConfig } from "@/data/siteConfig";
import { ArrowRightIcon, DiamondIcon, SparkleIcon, StarIcon } from "@/components/ui/Icon";

const SESSION_KEY = "tmack48-admin-session";
const USER = "admin";
const PASSCODE = "5555";

function isSessionValid(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "ok";
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setAuthed(isSessionValid());
  }, []);

  const login = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setErr(null);
      if (user.trim() === USER && pass === PASSCODE) {
        sessionStorage.setItem(SESSION_KEY, "ok");
        setAuthed(true);
        setPass("");
      } else {
        setErr("Invalid credentials.");
      }
    },
    [user, pass]
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  }, []);

  const origin = useMemo(() => siteConfig.url.replace(/\/$/, ""), []);

  if (!authed) {
    return (
      <>
        <Seo path="/admin" title="Admin" noIndex />
        <section className="section">
          <div className="container-lux max-w-lg">
            <Reveal>
              <div className="card-premium p-8 sm:p-10">
                <div className="flex items-center gap-3 text-gold-300">
                  <DiamondIcon className="h-10 w-10" />
                  <div>
                    <span className="eyebrow">Restricted</span>
                    <h1 className="mt-1 display-title text-3xl font-black text-platinum">Admin access</h1>
                  </div>
                </div>
                <form onSubmit={login} className="mt-8 space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-platinum/60 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      autoComplete="username"
                      value={user}
                      onChange={(e) => setUser(e.target.value)}
                      className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-platinum focus:border-gold-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-platinum/60 mb-2">
                      Passcode
                    </label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-platinum focus:border-gold-400 outline-none"
                    />
                  </div>
                  {err && <p className="text-sm text-red-400">{err}</p>}
                  <button type="submit" className="btn-gold w-full justify-center">
                    Enter control room
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo path="/admin" title="Admin — Control Room" noIndex />

      <section className="section">
        <div className="container-lux">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="eyebrow">Authenticated</span>
              <h1 className="mt-2 display-title text-4xl sm:text-5xl font-black">
                <span className="gold-text">TMACK48</span> Control Room
              </h1>
              <p className="mt-3 max-w-2xl text-platinum/75">
                Operations overview — extend this dashboard with deploy hooks, analytics embeds, and merch
                inventory when you wire backends.
              </p>
            </div>
            <button type="button" onClick={logout} className="btn-ghost text-sm">
              Sign out
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Reveal>
              <div className="card-premium p-6 h-full flex flex-col">
                <SparkleIcon className="h-9 w-9 text-gold-300" />
                <h2 className="mt-4 display-title text-xl font-bold text-platinum">Site & SEO</h2>
                <p className="mt-2 text-sm text-platinum/70 flex-1">
                  Canonical URL <span className="text-gold-200">{origin}</span>. Production deploys via
                  Cloudflare Pages on <code className="text-platinum">main</code> only.
                </p>
                <a href={`${origin}/`} className="mt-4 btn-ghost text-xs inline-flex items-center gap-2">
                  Open live site <ArrowRightIcon className="h-4 w-4" />
                </a>
              </div>
            </Reveal>

            <Reveal>
              <div className="card-premium p-6 h-full flex flex-col">
                <StarIcon className="h-9 w-9 text-gold-300" />
                <h2 className="mt-4 display-title text-xl font-bold text-platinum">Stories wire</h2>
                <p className="mt-2 text-sm text-platinum/70 flex-1">
                  Hourly editions served from <code className="text-platinum">/api/stories</code> (Pages
                  Function). Swap media pool in repo under <code className="text-platinum">functions/api/stories.ts</code>.
                </p>
                <Link to="/stories" className="mt-4 btn-ghost text-xs inline-flex items-center gap-2">
                  View stories <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

            <Reveal>
              <div className="card-premium p-6 h-full flex flex-col">
                <DiamondIcon className="h-9 w-9 text-gold-300" />
                <h2 className="mt-4 display-title text-xl font-bold text-platinum">Legal surface</h2>
                <p className="mt-2 text-sm text-platinum/70 flex-1">
                  Terms state all sales final / no liability — visitors never see this admin route linked from
                  the footer.
                </p>
                <Link to="/terms" className="mt-4 btn-ghost text-xs inline-flex items-center gap-2">
                  Terms <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

            <Reveal>
              <div className="card-premium p-6 h-full flex flex-col">
                <SparkleIcon className="h-9 w-9 text-gold-300" />
                <h2 className="mt-4 display-title text-xl font-bold text-platinum">Support links</h2>
                <p className="mt-2 text-sm text-platinum/70 flex-1">
                  Payment destinations pull from env / site config — verify Cash App, PayPal, and merch URLs in
                  production dashboard.
                </p>
                <Link to="/support" className="mt-4 btn-ghost text-xs inline-flex items-center gap-2">
                  Support page <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

            <Reveal>
              <div className="card-premium p-6 h-full flex flex-col">
                <StarIcon className="h-9 w-9 text-gold-300" />
                <h2 className="mt-4 display-title text-xl font-bold text-platinum">YouTube proxy</h2>
                <p className="mt-2 text-sm text-platinum/70 flex-1">
                  Live catalog merges static seed + <code className="text-platinum">/api/youtube/*</code> when{" "}
                  <code className="text-platinum">YOUTUBE_API_KEY</code> is set in Pages secrets.
                </p>
                <Link to="/videos" className="mt-4 btn-ghost text-xs inline-flex items-center gap-2">
                  Videos <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

            <Reveal>
              <div className="card-premium p-6 h-full flex flex-col border border-gold-500/30">
                <DiamondIcon className="h-9 w-9 text-gold-300" />
                <h2 className="mt-4 display-title text-xl font-bold text-platinum">Placeholder modules</h2>
                <p className="mt-2 text-sm text-platinum/70 flex-1">
                  Slots reserved for mailing-list export, drop calendar, pixel verification, and inventory —
                  hook your free-tier Workers or KV here.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
