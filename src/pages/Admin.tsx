import { useMemo, useState } from "react";
import Seo from "@/components/ui/Seo";
import {
  deleteComment,
  getMetrics,
  loadAdminConfig,
  loadComments,
  saveAdminConfig,
  type AdminConfig,
} from "@/lib/community";
import MrBigNutsWidget from "@/components/ui/MrBigNutsWidget";

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [cfg, setCfg] = useState<AdminConfig>(() => loadAdminConfig());
  const [comments, setComments] = useState(() => loadComments());

  const metrics = useMemo(() => getMetrics(), [comments.length]);

  return (
    <>
      <Seo path="/admin" title="Admin" description="TMACK48 admin dashboard." />
      <section className="container-lux py-16">
        {!auth ? (
          <div className="mx-auto max-w-md card-premium p-8">
            <h1 className="display-title text-3xl gold-text">Admin Login</h1>
            <div className="mt-5 space-y-3">
              <input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder=""
                className="w-full rounded-xl bg-black/40 px-3 py-2 ring-1 ring-white/15 focus:outline-none focus:ring-gold-300"
              />
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder=""
                className="w-full rounded-xl bg-black/40 px-3 py-2 ring-1 ring-white/15 focus:outline-none focus:ring-gold-300"
              />
              <button
                type="button"
                className="btn-gold w-full"
                onClick={() => setAuth(user === "admin" && pass === "5555")}
              >
                Login
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="card-premium p-6">
              <h1 className="display-title text-2xl gold-text">
                Hello Mr .T mack skippitee bippittie skeedum bo bop shizniizzle 3000 studios welcomes you to your
                dash board
              </h1>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="card-premium p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-platinum/60">Visits</p>
                <p className="mt-2 text-3xl gold-text">{metrics.visits}</p>
              </div>
              <div className="card-premium p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-platinum/60">Comments</p>
                <p className="mt-2 text-3xl gold-text">{comments.length}</p>
              </div>
              <div className="card-premium p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-platinum/60">Revenue trackers</p>
                <p className="mt-2 text-sm text-platinum/80">PayPal + Merch placeholders active</p>
              </div>
            </div>

            <div className="card-premium p-6">
              <h2 className="display-title text-xl text-platinum">Site Edit Controls</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="text-xs uppercase tracking-[0.2em] text-platinum/60">
                  Hero video id
                  <input
                    value={cfg.heroVideoId || ""}
                    onChange={(e) => setCfg((s) => ({ ...s, heroVideoId: e.target.value }))}
                    className="mt-1 w-full rounded-xl bg-black/40 px-3 py-2 normal-case tracking-normal ring-1 ring-white/15 focus:outline-none focus:ring-gold-300"
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.2em] text-platinum/60">
                  Hero title
                  <input
                    value={cfg.heroTitle || ""}
                    onChange={(e) => setCfg((s) => ({ ...s, heroTitle: e.target.value }))}
                    className="mt-1 w-full rounded-xl bg-black/40 px-3 py-2 normal-case tracking-normal ring-1 ring-white/15 focus:outline-none focus:ring-gold-300"
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.2em] text-platinum/60 md:col-span-2">
                  Hero bio
                  <textarea
                    value={cfg.heroBio || ""}
                    onChange={(e) => setCfg((s) => ({ ...s, heroBio: e.target.value }))}
                    rows={3}
                    className="mt-1 w-full rounded-xl bg-black/40 px-3 py-2 normal-case tracking-normal ring-1 ring-white/15 focus:outline-none focus:ring-gold-300"
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.2em] text-platinum/60 md:col-span-2">
                  PayPal URL
                  <input
                    value={cfg.paypalUrl || ""}
                    onChange={(e) => setCfg((s) => ({ ...s, paypalUrl: e.target.value }))}
                    className="mt-1 w-full rounded-xl bg-black/40 px-3 py-2 normal-case tracking-normal ring-1 ring-white/15 focus:outline-none focus:ring-gold-300"
                  />
                </label>
              </div>
              <button type="button" className="btn-gold mt-4" onClick={() => saveAdminConfig(cfg)}>
                Save edits
              </button>
            </div>

            <div className="card-premium p-6">
              <h2 className="display-title text-xl text-platinum">Comments board</h2>
              <ul className="mt-4 space-y-2 max-h-80 overflow-auto">
                {comments.map((c) => (
                  <li key={c.id} className="rounded-xl bg-black/40 px-3 py-2">
                    <p className="text-xs text-platinum/60">
                      {c.author} · {new Date(c.createdAt).toLocaleString()} · {c.videoId}
                    </p>
                    <p className="text-sm text-platinum">{c.body}</p>
                    <button
                      type="button"
                      className="mt-1 text-xs text-red-300 hover:text-red-200"
                      onClick={() => setComments(deleteComment(c.id))}
                    >
                      Delete
                    </button>
                  </li>
                ))}
                {!comments.length && <li className="text-xs text-platinum/60">No comments yet.</li>}
              </ul>
            </div>
          </div>
        )}
      </section>
      <MrBigNutsWidget />
    </>
  );
}
