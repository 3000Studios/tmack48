import { useCallback, useEffect, useMemo, useState } from "react";
import { videos as catalog } from "@/data/videos";
import {
  EMPTY_OVERRIDES,
  parseYouTubeId,
  saveOverrides,
  type CustomSection,
  type SiteOverrides,
} from "@/lib/siteOverrides";
import { DiamondIcon, SparkleIcon, StarIcon } from "@/components/ui/Icon";

/**
 * The Website Editor (Boss order 2026-11-07) — built for somebody who
 * doesn't live in code: big plain-language panels, pickers instead of
 * file names, and ONE Publish button. Publishing writes to the site's
 * live config (KV) — the public page picks the changes up on its next
 * load, no deploy, no waiting.
 */

const inputCls =
  "w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-platinum focus:border-gold-400 outline-none";
const labelCls = "block text-xs uppercase tracking-[0.2em] text-platinum/60 mb-2";
const smallBtn =
  "btn-ghost !px-3 !py-1.5 text-[11px] uppercase tracking-[0.14em] disabled:opacity-40";

interface AnalyticsSummary {
  totalViews: number;
  todayViews: number;
  topPages: { path: string; count: number }[];
  errors: { msg: string; path: string; ts: number }[];
  storageConnected: boolean;
}

interface DevMessage {
  id: string;
  name: string;
  topic: string;
  message: string;
  ts: number;
  emailed: boolean;
}

export default function SiteEditor({ passcode }: { passcode: string }) {
  const [ov, setOv] = useState<SiteOverrides>(EMPTY_OVERRIDES);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [inbox, setInbox] = useState<DevMessage[]>([]);

  // add-video form
  const [newVideoLink, setNewVideoLink] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  // section form
  const [sec, setSec] = useState({ heading: "", body: "", imageUrl: "", linkUrl: "", linkLabel: "", position: "mid-page" as CustomSection["position"] });
  // nav form
  const [navLabel, setNavLabel] = useState("");
  const [navUrl, setNavUrl] = useState("");
  // dev message form
  const [devName, setDevName] = useState("");
  const [devTopic, setDevTopic] = useState("");
  const [devBody, setDevBody] = useState("");
  const [devStatus, setDevStatus] = useState<string | null>(null);
  const [devSending, setDevSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/site-config");
        if (res.ok) {
          const data = (await res.json()) as Partial<SiteOverrides>;
          setOv({
            ...EMPTY_OVERRIDES,
            ...data,
            hiddenVideoIds: data.hiddenVideoIds ?? [],
            featuredIds: data.featuredIds ?? [],
            extraVideos: data.extraVideos ?? [],
            sections: data.sections ?? [],
            navLinks: data.navLinks ?? [],
          });
        }
      } catch {
        // keep defaults — the editor still works, publish will surface errors
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const refreshAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics", { headers: { "X-Admin-Passcode": passcode } });
      if (res.ok) setAnalytics((await res.json()) as AnalyticsSummary);
    } catch {
      // storage not live yet
    }
    try {
      const res = await fetch("/api/dev-message", { headers: { "X-Admin-Passcode": passcode } });
      if (res.ok) {
        const data = (await res.json()) as { messages: DevMessage[] };
        setInbox(data.messages ?? []);
      }
    } catch {
      // ignore
    }
  }, [passcode]);

  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  const publish = async () => {
    setSaving(true);
    setStatus(null);
    const res = await saveOverrides(passcode, ov);
    setSaving(false);
    setStatus(
      res.ok
        ? "Published! Your changes are live — open the home page and you'll see them."
        : `Couldn't publish: ${res.error}`
    );
  };

  // ---- video helpers ----
  const allVideos = useMemo(() => {
    const extras = ov.extraVideos.map((e) => ({
      videoId: e.videoId,
      title: e.title,
      thumbnailHqUrl: `https://i.ytimg.com/vi/${e.videoId}/hqdefault.jpg`,
      added: true,
    }));
    const base = catalog.map((v) => ({
      videoId: v.videoId,
      title: v.title,
      thumbnailHqUrl: v.thumbnailHqUrl,
      added: false,
    }));
    const seen = new Set(base.map((v) => v.videoId));
    return [...extras.filter((e) => !seen.has(e.videoId)), ...base];
  }, [ov.extraVideos]);

  const effectiveFeatured = useMemo(() => {
    if (ov.featuredIds.length) return ov.featuredIds;
    return catalog.filter((v) => v.featured).map((v) => v.videoId);
  }, [ov.featuredIds]);

  const setFeatured = (ids: string[]) => setOv((s) => ({ ...s, featuredIds: ids }));
  const toggleFeatured = (id: string) => {
    const cur = effectiveFeatured;
    setFeatured(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };
  const moveFeatured = (id: string, dir: -1 | 1) => {
    const cur = [...effectiveFeatured];
    const i = cur.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= cur.length) return;
    [cur[i], cur[j]] = [cur[j], cur[i]];
    setFeatured(cur);
  };
  const toggleHidden = (id: string) =>
    setOv((s) => ({
      ...s,
      hiddenVideoIds: s.hiddenVideoIds.includes(id)
        ? s.hiddenVideoIds.filter((x) => x !== id)
        : [...s.hiddenVideoIds, id],
    }));

  const addVideo = () => {
    const id = parseYouTubeId(newVideoLink);
    if (!id) {
      setStatus("That doesn't look like a YouTube link — paste the full video link.");
      return;
    }
    if (allVideos.some((v) => v.videoId === id)) {
      setStatus("That video is already on the site.");
      return;
    }
    setOv((s) => ({
      ...s,
      extraVideos: [...s.extraVideos, { videoId: id, title: newVideoTitle.trim() || "New video" }],
    }));
    setNewVideoLink("");
    setNewVideoTitle("");
    setStatus("Video added to the list below — hit Publish to put it on the site.");
  };

  const addSection = () => {
    if (!sec.heading.trim()) {
      setStatus("Give your new section a heading first.");
      return;
    }
    const next: CustomSection = {
      id: `sec-${Date.now().toString(36)}`,
      heading: sec.heading.trim(),
      body: sec.body.trim(),
      imageUrl: sec.imageUrl.trim() || undefined,
      linkUrl: sec.linkUrl.trim() || undefined,
      linkLabel: sec.linkLabel.trim() || undefined,
      position: sec.position,
    };
    setOv((s) => ({ ...s, sections: [...s.sections, next] }));
    setSec({ heading: "", body: "", imageUrl: "", linkUrl: "", linkLabel: "", position: "mid-page" });
    setStatus("Section added — hit Publish to put it on the home page.");
  };

  const addNav = () => {
    if (!navLabel.trim() || !navUrl.trim()) {
      setStatus("A menu tab needs both a name and a web address.");
      return;
    }
    setOv((s) => ({ ...s, navLinks: [...s.navLinks, { label: navLabel.trim(), url: navUrl.trim() }] }));
    setNavLabel("");
    setNavUrl("");
    setStatus("Menu tab added — hit Publish to make it appear.");
  };

  const sendDevMessage = async () => {
    if (!devBody.trim()) {
      setDevStatus("Write your message first.");
      return;
    }
    setDevSending(true);
    setDevStatus(null);
    try {
      const res = await fetch("/api/dev-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: devName.trim(),
          topic: devTopic.trim(),
          message: devBody.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; emailed?: boolean; saved?: boolean };
      if (res.ok && data.ok) {
        setDevStatus(
          data.emailed
            ? "Sent! It went to your brother's email and is saved below."
            : "Sent! It's saved in your brother's inbox below — he'll see it here."
        );
        setDevBody("");
        setDevTopic("");
        refreshAnalytics();
      } else {
        setDevStatus("Couldn't send — check your connection and try again.");
      }
    } catch {
      setDevStatus("Couldn't send — check your connection and try again.");
    } finally {
      setDevSending(false);
    }
  };

  const titleById = (id: string) => allVideos.find((v) => v.videoId === id)?.title || id;

  return (
    <div className="mt-12 space-y-8">
      <div>
        <span className="eyebrow">Website Editor</span>
        <h2 className="mt-2 display-title text-3xl sm:text-4xl font-black">
          <span className="gold-text">Edit your website</span>
        </h2>
        <p className="mt-3 max-w-2xl text-platinum/75">
          Change anything below, then hit <strong className="text-gold-200">Publish</strong>. Your changes go
          live on the public site right away — no code, no waiting.
        </p>
      </div>

      {/* ---------- VIDEOS ---------- */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <StarIcon className="h-8 w-8 text-gold-300" />
          <h3 className="display-title text-2xl font-bold text-platinum">Your videos</h3>
        </div>
        <p className="mt-2 text-sm text-platinum/70">
          The <strong className="text-gold-200">Top videos</strong> play in the big carousel at the top of the
          home page. Hide a video to take it off the whole site. Nothing is deleted — hidden videos can come
          right back.
        </p>

        <div className="mt-6">
          <label className={labelCls}>First video in the carousel (the lead video)</label>
          <select
            value={ov.heroVideoId ?? ""}
            onChange={(e) => setOv((s) => ({ ...s, heroVideoId: e.target.value || undefined }))}
            className={inputCls}
          >
            <option value="">Rotate automatically (changes every hour)</option>
            {allVideos.map((v) => (
              <option key={v.videoId} value={v.videoId}>
                {v.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6">
          <p className={labelCls}>Top videos — in this order</p>
          <ul className="space-y-2">
            {effectiveFeatured.map((id) => (
              <li key={id} className="flex items-center gap-3 rounded-xl bg-black/40 px-3 py-2">
                <span className="flex-1 truncate text-sm text-platinum">{titleById(id)}</span>
                <button type="button" className={smallBtn} onClick={() => moveFeatured(id, -1)}>
                  ↑ Up
                </button>
                <button type="button" className={smallBtn} onClick={() => moveFeatured(id, 1)}>
                  ↓ Down
                </button>
                <button type="button" className={smallBtn} onClick={() => toggleFeatured(id)}>
                  Remove
                </button>
              </li>
            ))}
            {!effectiveFeatured.length && (
              <li className="text-sm text-platinum/60">No top videos yet — add some from the list below.</li>
            )}
          </ul>
        </div>

        <div className="mt-6">
          <p className={labelCls}>All videos</p>
          <ul className="max-h-96 space-y-2 overflow-auto pr-1">
            {allVideos.map((v) => {
              const hidden = ov.hiddenVideoIds.includes(v.videoId);
              const top = effectiveFeatured.includes(v.videoId);
              return (
                <li key={v.videoId} className="flex items-center gap-3 rounded-xl bg-black/40 px-3 py-2">
                  <img src={v.thumbnailHqUrl} alt="" className="h-10 w-16 rounded-md object-cover" loading="lazy" />
                  <span className={`flex-1 truncate text-sm ${hidden ? "text-platinum/40 line-through" : "text-platinum"}`}>
                    {v.title}
                    {v.added && <span className="ml-2 text-[10px] uppercase tracking-widest text-gold-300">added by you</span>}
                  </span>
                  <button type="button" className={smallBtn} onClick={() => toggleFeatured(v.videoId)}>
                    {top ? "★ In Top" : "☆ Make Top"}
                  </button>
                  <button type="button" className={smallBtn} onClick={() => toggleHidden(v.videoId)}>
                    {hidden ? "Show it again" : "Hide"}
                  </button>
                  {v.added && (
                    <button
                      type="button"
                      className={smallBtn}
                      onClick={() =>
                        setOv((s) => ({
                          ...s,
                          extraVideos: s.extraVideos.filter((e) => e.videoId !== v.videoId),
                          featuredIds: effectiveFeatured.filter((x) => x !== v.videoId),
                        }))
                      }
                    >
                      Delete
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <label className={labelCls}>Add a video — paste its YouTube link</label>
            <input
              value={newVideoLink}
              onChange={(e) => setNewVideoLink(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>What should it be called?</label>
            <input
              value={newVideoTitle}
              onChange={(e) => setNewVideoTitle(e.target.value)}
              placeholder="My new video"
              className={inputCls}
            />
          </div>
          <button type="button" className="btn-gold justify-center" onClick={addVideo}>
            Add video
          </button>
        </div>
      </div>

      {/* ---------- WORDS ---------- */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <SparkleIcon className="h-8 w-8 text-gold-300" />
          <h3 className="display-title text-2xl font-bold text-platinum">Words at the top of the home page</h3>
        </div>
        <div className="mt-6 grid gap-4">
          <div>
            <label className={labelCls}>Big headline (leave empty for TMACK48)</label>
            <input
              value={ov.heroHeading ?? ""}
              onChange={(e) => setOv((s) => ({ ...s, heroHeading: e.target.value || undefined }))}
              placeholder="TMACK48"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>The sentence under the headline</label>
            <textarea
              value={ov.heroSubtext ?? ""}
              onChange={(e) => setOv((s) => ({ ...s, heroSubtext: e.target.value || undefined }))}
              rows={3}
              placeholder="Luxury-flashy music, cinematic visuals, and relentless energy…"
              className={inputCls}
            />
          </div>
          <label className="flex items-center gap-3 text-sm text-platinum/85">
            <input
              type="checkbox"
              checked={ov.bannerEnabled !== false}
              onChange={(e) => setOv((s) => ({ ...s, bannerEnabled: e.target.checked }))}
              className="h-5 w-5 accent-[#d4af37]"
            />
            Show the gold celebration banner under the carousel
          </label>
          <div>
            <label className={labelCls}>Banner headline</label>
            <input
              value={ov.bannerTitle ?? ""}
              onChange={(e) => setOv((s) => ({ ...s, bannerTitle: e.target.value || undefined }))}
              placeholder="JUST BUSTED 1,000 SUBSCRIBERS ON YOUTUBE"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Banner small print</label>
            <input
              value={ov.bannerText ?? ""}
              onChange={(e) => setOv((s) => ({ ...s, bannerText: e.target.value || undefined }))}
              placeholder="TaylorMade Hits just crossed 1K — thank you. Join the next 1,000."
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ---------- SECTIONS & GRAPHICS ---------- */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <DiamondIcon className="h-8 w-8 text-gold-300" />
          <h3 className="display-title text-2xl font-bold text-platinum">Add a section or a picture</h3>
        </div>
        <p className="mt-2 text-sm text-platinum/70">
          Make a new block on the home page — an announcement, a picture, a shout-out, anything. For a picture,
          paste the web address of the image (right-click an image online → “Copy image address”).
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Heading</label>
            <input value={sec.heading} onChange={(e) => setSec({ ...sec, heading: e.target.value })} placeholder="Big news" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Where should it go?</label>
            <select value={sec.position} onChange={(e) => setSec({ ...sec, position: e.target.value as CustomSection["position"] })} className={inputCls}>
              <option value="after-hero">Right under the top videos</option>
              <option value="mid-page">Middle of the page</option>
              <option value="before-footer">Near the bottom</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Words</label>
            <textarea value={sec.body} onChange={(e) => setSec({ ...sec, body: e.target.value })} rows={3} placeholder="Tell them what's up…" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Picture web address (optional)</label>
            <input value={sec.imageUrl} onChange={(e) => setSec({ ...sec, imageUrl: e.target.value })} placeholder="https://…/picture.jpg" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Button words</label>
              <input value={sec.linkLabel} onChange={(e) => setSec({ ...sec, linkLabel: e.target.value })} placeholder="Listen now" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Button goes to</label>
              <input value={sec.linkUrl} onChange={(e) => setSec({ ...sec, linkUrl: e.target.value })} placeholder="https://…" className={inputCls} />
            </div>
          </div>
        </div>
        <button type="button" className="btn-gold mt-5" onClick={addSection}>
          Add this section
        </button>
        {!!ov.sections.length && (
          <ul className="mt-6 space-y-2">
            {ov.sections.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-xl bg-black/40 px-3 py-2">
                <span className="flex-1 truncate text-sm text-platinum">
                  {s.heading} <span className="text-platinum/50">· {s.position.replace("-", " ")}</span>
                </span>
                <button
                  type="button"
                  className={smallBtn}
                  onClick={() => setOv((st) => ({ ...st, sections: st.sections.filter((x) => x.id !== s.id) }))}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------- MENU & SHOP ---------- */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <DiamondIcon className="h-8 w-8 text-gold-300" />
          <h3 className="display-title text-2xl font-bold text-platinum">Menu tabs & your shop</h3>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Your shop web address</label>
            <input
              value={ov.shopUrl ?? ""}
              onChange={(e) => setOv((s) => ({ ...s, shopUrl: e.target.value || undefined }))}
              placeholder="https://your-shop.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Shop tab name</label>
            <input
              value={ov.shopLabel ?? ""}
              onChange={(e) => setOv((s) => ({ ...s, shopLabel: e.target.value || undefined }))}
              placeholder="Shop"
              className={inputCls}
            />
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <label className={labelCls}>New tab name</label>
            <input value={navLabel} onChange={(e) => setNavLabel(e.target.value)} placeholder="Merch" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tab web address</label>
            <input value={navUrl} onChange={(e) => setNavUrl(e.target.value)} placeholder="https://…" className={inputCls} />
          </div>
          <button type="button" className="btn-gold justify-center" onClick={addNav}>
            Add tab
          </button>
        </div>
        {!!ov.navLinks.length && (
          <ul className="mt-5 space-y-2">
            {ov.navLinks.map((l) => (
              <li key={l.url} className="flex items-center gap-3 rounded-xl bg-black/40 px-3 py-2">
                <span className="flex-1 truncate text-sm text-platinum">
                  {l.label} <span className="text-platinum/50">→ {l.url}</span>
                </span>
                <button
                  type="button"
                  className={smallBtn}
                  onClick={() => setOv((s) => ({ ...s, navLinks: s.navLinks.filter((x) => x.url !== l.url) }))}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------- ANALYTICS ---------- */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <StarIcon className="h-8 w-8 text-gold-300" />
            <h3 className="display-title text-2xl font-bold text-platinum">Visitors & problems</h3>
          </div>
          <button type="button" className={smallBtn} onClick={refreshAnalytics}>
            Refresh
          </button>
        </div>
        {analytics ? (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-black/40 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-platinum/60">Total visits</p>
                <p className="mt-2 text-3xl gold-text">{analytics.totalViews}</p>
              </div>
              <div className="rounded-2xl bg-black/40 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-platinum/60">Visits today</p>
                <p className="mt-2 text-3xl gold-text">{analytics.todayViews}</p>
              </div>
              <div className="rounded-2xl bg-black/40 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-platinum/60">Problems spotted</p>
                <p className="mt-2 text-3xl gold-text">{analytics.errors.length}</p>
              </div>
            </div>
            {!!analytics.topPages.length && (
              <div className="mt-6">
                <p className={labelCls}>Most visited pages</p>
                <ul className="space-y-1.5">
                  {analytics.topPages.map((p) => (
                    <li key={p.path} className="flex justify-between rounded-xl bg-black/40 px-3 py-2 text-sm">
                      <span className="text-platinum">{p.path}</span>
                      <span className="text-gold-200">{p.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!!analytics.errors.length && (
              <div className="mt-6">
                <p className={labelCls}>Latest problems (send these to your brother if something looks broken)</p>
                <ul className="space-y-1.5">
                  {analytics.errors.slice(0, 8).map((e, i) => (
                    <li key={i} className="rounded-xl bg-black/40 px-3 py-2 text-sm text-platinum/80">
                      <span className="text-red-300">{e.msg}</span>{" "}
                      <span className="text-platinum/50">
                        · {e.path} · {new Date(e.ts).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-4 text-xs text-platinum/50">
              Counting started when this editor went live — earlier visits aren't included.
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-platinum/65">
            Visitor counting is warming up — check back in a little while.
          </p>
        )}
      </div>

      {/* ---------- EMAIL YOUR BROTHER ---------- */}
      <div className="card-premium p-6 sm:p-8 border border-gold-500/40">
        <div className="flex items-center gap-3">
          <SparkleIcon className="h-8 w-8 text-gold-300" />
          <h3 className="display-title text-2xl font-bold text-platinum">Email your brother</h3>
        </div>
        <p className="mt-2 text-sm text-platinum/70">
          Something broken? Want something changed? Write it here like you'd say it — it goes straight to your
          brother.
        </p>
        <div className="mt-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Your name</label>
              <input value={devName} onChange={(e) => setDevName(e.target.value)} placeholder="TMACK48" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>What's it about?</label>
              <input value={devTopic} onChange={(e) => setDevTopic(e.target.value)} placeholder="The videos page looks funny" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Your message</label>
            <textarea value={devBody} onChange={(e) => setDevBody(e.target.value)} rows={4} placeholder="Hey — can you fix…" className={inputCls} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" className="btn-gold" onClick={sendDevMessage} disabled={devSending}>
              {devSending ? "Sending…" : "Send to your brother to fix the shit"}
            </button>
            {devStatus && <p className="text-sm text-gold-200">{devStatus}</p>}
          </div>
        </div>
        {!!inbox.length && (
          <div className="mt-8">
            <p className={labelCls}>Messages sent to your brother</p>
            <ul className="space-y-2">
              {inbox.slice(0, 10).map((m) => (
                <li key={m.id} className="rounded-xl bg-black/40 px-3 py-2">
                  <p className="text-xs text-platinum/55">
                    {m.name} · {new Date(m.ts).toLocaleString()} · {m.topic}
                    {m.emailed ? " · emailed ✓" : " · in inbox"}
                  </p>
                  <p className="text-sm text-platinum">{m.message}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ---------- PUBLISH BAR ---------- */}
      <div className="sticky bottom-4 z-20">
        <div className="card-premium flex flex-wrap items-center gap-4 p-5 shadow-gold-xl">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-platinum">Ready when you are</p>
            <p className="truncate text-sm text-platinum/65">
              {status ?? (loaded ? "Changes you make above are NOT live until you publish." : "Loading your current site settings…")}
            </p>
          </div>
          <button type="button" className="btn-gold justify-center !px-8 !py-4 text-base" onClick={publish} disabled={saving || !loaded}>
            {saving ? "Publishing…" : "Publish — go live now"}
          </button>
        </div>
      </div>
    </div>
  );
}
