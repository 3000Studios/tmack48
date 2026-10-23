// Prerenders every sitemap route of the SPA into static HTML inside dist/ at
// build time, using the built SPA shell (dist/index.html) as the template.
// Crawlers and no-JS visitors get the real content (video catalog, track
// pages, full news posts, and the static page copy) in raw HTML; the React
// app still boots from the same shell and replaces #root on render, so the
// interactive experience is unchanged. All content is derived at build time
// from the app's own data modules (src/data/*) and page components
// (src/pages/*) — no copy is invented here.
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = path.join(repoRoot, 'dist')
const srcRoot = path.join(repoRoot, 'src')
const SITE_URL = 'https://tmack48.com'

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function loadModule(entry) {
  const tmp = path.join(
    os.tmpdir(),
    `prerender-${path.basename(entry, path.extname(entry))}-${process.pid}.mjs`,
  )
  await build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: tmp,
    logLevel: 'silent',
    alias: { '@': srcRoot },
    define: { 'import.meta.env': '{}' },
  })
  try {
    return await import(pathToFileURL(tmp).href)
  } finally {
    fs.rmSync(tmp, { force: true })
  }
}

// ---------- JSX visible-text extraction (same approach as the fleet) ----------

function stripExpressions(src) {
  let out = ''
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (ch === '{') {
      let depth = 0
      let j = i
      let str = null
      for (; j < src.length; j++) {
        const c = src[j]
        if (str) {
          if (c === '\\') j++
          else if (c === str) str = null
          continue
        }
        if (c === '"' || c === "'" || c === '`') str = c
        else if (c === '{') depth++
        else if (c === '}') {
          depth--
          if (depth === 0) break
        }
      }
      const inner = src.slice(i + 1, j).trim()
      const lit = inner.match(/^(['"])((?:\\.|(?!\1)[\s\S])*)\1$/)
      if (lit) out += lit[2].replace(/\\(['"])/g, '$1')
      else if (/^`[^`]*`$/.test(inner) && !inner.includes('${')) out += inner.slice(1, -1)
      else if (inner.includes('<')) {
        // Conditional JSX ({cond && <p>…</p>} / ternaries): keep the markup
        // between the first tag and the last tag; the JS scaffolding around
        // it is dropped later by the block filters.
        const first = inner.indexOf('<')
        const last = inner.lastIndexOf('>')
        if (last > first) out += stripExpressions(inner.slice(first, last + 1))
      }
      out += ' '
      i = j + 1
    } else {
      out += ch
      i++
    }
  }
  return out
}

function decodeEntities(t) {
  return t
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'")
    .replaceAll('&nbsp;', ' ')
}

const BLOCK_TAGS = new Set([
  'p', 'li', 'div', 'section', 'article', 'blockquote', 'tr', 'label',
  'button', 'header', 'footer', 'main', 'td', 'th', 'option', 'figcaption',
])

function jsxBlocks(src) {
  const cleaned = stripExpressions(
    src
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
      .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' '),
  )
  const tokens = cleaned.split(/(<[^>]+>)/g)
  const blocks = []
  let level = 0
  let cur = ''
  const flush = () => {
    const t = decodeEntities(cur).replace(/\s+/g, ' ').trim()
    cur = ''
    if (t.length < 2) return
    if (!/[A-Za-z0-9]{2,}/.test(t)) return
    if (/^(import|export|const|let|var|function|return)\b/.test(t)) return
    if (t.includes('className') || t.includes('=>') || t.includes(');')) return
    if (blocks.length && blocks[blocks.length - 1].text === t) return
    blocks.push({ level, text: t })
  }
  for (const tok of tokens) {
    if (tok.startsWith('<')) {
      const m = tok.match(/^<\/?\s*([a-zA-Z][a-zA-Z0-9.]*)/)
      const tag = (m?.[1] ?? '').toLowerCase()
      const closing = tok.startsWith('</')
      if (/^h[1-6]$/.test(tag)) {
        flush()
        level = closing ? 0 : Number(tag[1])
      } else if (tag === 'br') {
        cur += ' '
      } else if (BLOCK_TAGS.has(tag)) {
        flush()
      }
    } else {
      cur += tok
    }
  }
  flush()
  return blocks
}

function pageBlocks(file) {
  const src = fs.readFileSync(file, 'utf8')
  const start = src.indexOf('return')
  return jsxBlocks(start >= 0 ? src.slice(start) : src)
}

function seoProps(file) {
  const src = fs.readFileSync(file, 'utf8')
  const m = src.match(/<Seo\b([\s\S]*?)\/>/)
  if (!m) return {}
  const attrs = m[1]
  const get = (k) => attrs.match(new RegExp(`${k}="([^"]*)"`))?.[1]
  return { title: get('title'), description: get('description'), path: get('path') }
}

function renderBlocks(blocks) {
  let seenH1 = false
  return blocks
    .map((b) => {
      if (b.level > 0) {
        let lvl = b.level
        if (lvl === 1) {
          if (seenH1) lvl = 2
          else seenH1 = true
        }
        return `        <h${lvl}>${esc(b.text)}</h${lvl}>`
      }
      return `        <p>${esc(b.text)}</p>`
    })
    .join('\n')
}

// ---------- shell templating (fleet pattern) ----------

function renderPage(shell, { title, description, canonical, inner }) {
  let html = shell
  const swap = (regex, replacement) => {
    if (regex.test(html)) html = html.replace(regex, replacement)
    else html = html.replace('</head>', `${replacement}\n</head>`)
  }
  swap(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
  swap(
    /<meta[^>]*name="description"[^>]*>/i,
    `<meta name="description" content="${esc(description)}" />`,
  )
  swap(/<link[^>]*rel="canonical"[^>]*>/i, `<link rel="canonical" href="${esc(canonical)}" />`)
  swap(/<meta[^>]*property="og:title"[^>]*>/i, `<meta property="og:title" content="${esc(title)}" />`)
  swap(
    /<meta[^>]*property="og:description"[^>]*>/i,
    `<meta property="og:description" content="${esc(description)}" />`,
  )
  swap(/<meta[^>]*property="og:url"[^>]*>/i, `<meta property="og:url" content="${esc(canonical)}" />`)
  swap(/<meta[^>]*name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${esc(title)}" />`)
  swap(
    /<meta[^>]*name="twitter:description"[^>]*>/i,
    `<meta name="twitter:description" content="${esc(description)}" />`,
  )
  if (/<div id="root">\s*<\/div>/.test(html)) {
    html = html.replace(/<div id="root">\s*<\/div>/, `<div id="root">${inner}</div>`)
  } else {
    html = html.replace('<div id="root">', `<div id="root">${inner}`)
  }
  return html
}

let written = 0
function writeRoute(shell, route, meta) {
  const dir = route === '/' ? distRoot : path.join(distRoot, route)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), renderPage(shell, meta))
  written++
  console.log(`prerendered ${route}`)
}

// ---------- data ----------

const shell = fs.readFileSync(path.join(distRoot, 'index.html'), 'utf8')
const { videos, featuredVideos, videoCategories } = await loadModule(path.join(srcRoot, 'data', 'videos.ts'))
const { tracks } = await loadModule(path.join(srcRoot, 'data', 'tracks.ts'))
const { posts } = await loadModule(path.join(srcRoot, 'data', 'posts.ts'))
const { upcomingEvents } = await loadModule(path.join(srcRoot, 'data', 'events.ts'))
const { gallery } = await loadModule(path.join(srcRoot, 'data', 'gallery.ts'))
const { siteConfig } = await loadModule(path.join(srcRoot, 'data', 'siteConfig.ts'))

const longs = videos.filter((v) => v.category !== 'short')
const shorts = videos.filter((v) => v.category === 'short')

const videoCard = (v, heading = 3) => `        <article>
          <h${heading}><a href="${esc(v.watchUrl)}">${esc(v.title)}</a></h${heading}>
          <p><img src="${esc(v.thumbnailUrl)}" alt="${esc(v.title)} — TMACK48" loading="lazy" /></p>
          ${v.blurb ? `<p>${esc(v.blurb)}</p>` : ''}
          <p>Category: ${esc(v.category)} · <a href="${esc(v.watchUrl)}">Watch on YouTube</a> · <a href="/music/${esc(tracks.find((t) => t.videoId === v.videoId)?.slug ?? '')}">Track page</a></p>
        </article>`

const postCard = (p) => `        <article>
          <h3><a href="/news/${esc(p.slug)}">${esc(p.title)}</a></h3>
          <p>${esc(p.publishedAt)} · ${esc(p.category)} · ${esc(p.readMinutes)} min read</p>
          <p>${esc(p.excerpt)}</p>
        </article>`

// ---------- route builders ----------

const builders = {
  '/': () => ({
    title: 'TMACK48 — Official Artist Universe',
    description: siteConfig.description,
    inner: `<main>
      <h1>TMACK48 — ${esc(siteConfig.tagline)}</h1>
      <p>${esc(siteConfig.description)}</p>
      <p><a href="${esc(siteConfig.channel.subscribeUrl)}">Subscribe on YouTube</a> · <a href="/music">Music</a> · <a href="/videos">Videos</a> · <a href="/news">News</a></p>
      <section>
        <h2>Featured videos</h2>
${featuredVideos.map((v) => videoCard(v)).join('\n')}
      </section>
      <section>
        <h2>Latest news</h2>
${posts.slice(0, 3).map((p) => postCard(p)).join('\n')}
      </section>
    </main>`,
  }),

  '/videos': () => ({
    title: 'Videos — TMACK48',
    description: `Watch the official TMACK48 video catalog: ${longs.length} music videos and drops, direct from the @TMACK48SONGS YouTube channel.`,
    inner: `<main>
      <h1>Videos</h1>
      <p>The official TMACK48 video catalog — every view on YouTube supports the artist directly.</p>
${videoCategories
  .filter((c) => c.id !== 'all' && c.id !== 'short')
  .map((c) => {
    const items = longs.filter((v) => v.category === c.id)
    if (!items.length) return ''
    return `      <section>
        <h2>${esc(c.label)}</h2>
${items.map((v) => videoCard(v)).join('\n')}
      </section>`
  })
  .join('\n')}
    </main>`,
  }),

  '/shorts': () => ({
    title: 'Shorts — TMACK48',
    description: `TMACK48 YouTube Shorts: ${shorts.length} quick hits from the universe.`,
    inner: `<main>
      <h1>Shorts</h1>
      <p>Quick hits from the TMACK48 universe — watch each Short on YouTube.</p>
${shorts.map((v) => videoCard(v)).join('\n')}
    </main>`,
  }),

  '/music': () => ({
    title: 'Music — TMACK48',
    description: `The TMACK48 catalog: ${tracks.length} tracks with track pages, videos, and updates.`,
    inner: `<main>
      <h1>Music</h1>
      <p>Every track in the TMACK48 catalog. Open a track page or watch the official video on YouTube.</p>
${tracks
  .map(
    (t) => `        <article>
          <h3><a href="/music/${esc(t.slug)}">${esc(t.title)}</a></h3>
          ${t.blurb ? `<p>${esc(t.blurb)}</p>` : ''}
          <p>Category: ${esc(t.category)} · <a href="${esc(t.watchUrl)}">Watch on YouTube</a></p>
        </article>`,
  )
  .join('\n')}
    </main>`,
  }),

  '/news': () => ({
    title: 'News — TMACK48',
    description: 'Announcements, release notes, and updates from the TMACK48 universe.',
    inner: `<main>
      <h1>News</h1>
      <p>Announcements, release notes, and moments from the movement.</p>
${posts.map((p) => postCard(p)).join('\n')}
    </main>`,
  }),

  '/gallery': () => ({
    title: 'Gallery — TMACK48',
    description: 'Visual moments from the TMACK48 universe — artwork and stills from the catalog.',
    inner: `<main>
      <h1>Gallery</h1>
${gallery
  .map(
    (g) => `        <figure>
          <a href="${esc(g.href ?? g.src)}"><img src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy" /></a>
          <figcaption>${esc(g.caption)}</figcaption>
        </figure>`,
  )
  .join('\n')}
    </main>`,
  }),

  '/tour': () => {
    const file = path.join(srcRoot, 'pages', 'Tour.tsx')
    const blocks = pageBlocks(file)
    const eventsHtml = upcomingEvents.length
      ? upcomingEvents
          .map(
            (e) => `        <article>
          <h3>${esc(e.title)}</h3>
          <p>${esc(e.date)} · ${esc(e.venue)} — ${esc(e.city)}</p>
          ${e.ticketUrl ? `<p><a href="${esc(e.ticketUrl)}">Tickets</a></p>` : ''}
        </article>`,
          )
          .join('\n')
      : ''
    return {
      title: 'Tour — TMACK48',
      description: seoProps(file).description ?? 'TMACK48 live dates and tour updates.',
      inner: `<main>
${renderBlocks(blocks)}
${eventsHtml}
    </main>`,
    }
  },
}

// /contact is a client-side redirect to /support#contact in the app —
// mirror that behavior with a real link for crawlers and no-JS visitors.
builders['/contact'] = () => ({
  title: 'Contact — TMACK48',
  description: 'Contact TMACK48 — booking, features, and business inquiries via the Connect page.',
  inner: `<main>
      <h1>Contact</h1>
      <p>Contact TMACK48 through the Connect page — booking, features, press, and business inquiries.</p>
      <p><a href="/support">Go to the Connect page</a> · <a href="${esc(siteConfig.channel.subscribeUrl)}">Subscribe on YouTube</a></p>
    </main>`,
})

// /links rows live in a data array in Links.tsx (labels/subs are the page's
// own copy); social rows render only when the URL is configured.
builders['/links'] = () => {
  const file = path.join(srcRoot, 'pages', 'Links.tsx')
  const seo = seoProps(file)
  const socialRows = [
    ['Instagram', siteConfig.social.instagram],
    ['TikTok', siteConfig.social.tiktok],
    ['X / Twitter', siteConfig.social.x],
    ['Facebook', siteConfig.social.facebook],
  ].filter(([, href]) => href)
  const rows = [
    { label: 'Subscribe on YouTube', sub: 'The main stage — all official music videos live here.', href: siteConfig.channel.subscribeUrl },
    { label: 'Watch the Latest Drops', sub: 'Full catalog, sorted and filterable.', href: '/videos' },
    { label: 'Support the Movement', sub: 'Tip, cop merch, fuel the next release.', href: '/support' },
    ...socialRows.map(([label, href]) => ({ label, href })),
  ]
  return {
    title: 'Links — TMACK48',
    description: seo.description ?? 'Every way to connect with TMACK48 — YouTube, socials, support, and booking.',
    inner: `<main>
      <h1>TMACK48 · Links</h1>
      <p>Watch, follow, support, book. All the moves, one page.</p>
${rows
  .map(
    (r) => `        <article>
          <h2><a href="${esc(r.href)}">${esc(r.label)}</a></h2>
          ${r.sub ? `<p>${esc(r.sub)}</p>` : ''}
        </article>`,
  )
  .join('\n')}
    </main>`,
  }
}

// /request is a form page — mirror the form's own labels and guidance.
builders['/request'] = () => {
  const pageFile = path.join(srcRoot, 'pages', 'SongRequest.tsx')
  const formFile = path.join(srcRoot, 'components', 'forms', 'SongRequestForm.tsx')
  const seo = seoProps(pageFile)
  const blocks = [...pageBlocks(pageFile), ...pageBlocks(formFile)]
  const seen = new Set()
  const unique = blocks.filter((b) => (seen.has(b.text) ? false : (seen.add(b.text), true)))
  return {
    title: seo.title ? `${seo.title} — TMACK48` : 'Request a Song — TMACK48',
    description: seo.description ?? 'Request a custom song from TMACK48.',
    inner: `<main>
${renderBlocks(unique)}
      <p><a href="/support">Questions? Connect with TMACK48</a> · <a href="/music">Browse the catalog</a></p>
    </main>`,
  }
}

// /stories is a live feed in the app — give crawlers the page copy plus the
// latest published content it surfaces.
builders['/stories'] = () => {
  const file = path.join(srcRoot, 'pages', 'Stories.tsx')
  const seo = seoProps(file)
  const blocks = pageBlocks(file)
  return {
    title: seo.title ? `${seo.title} — TMACK48` : 'Stories — TMACK48',
    description: seo.description ?? 'Daily stories and updates from the TMACK48 universe.',
    inner: `<main>
${renderBlocks(blocks)}
      <section>
        <h2>Latest news</h2>
${posts.slice(0, 3).map((p) => postCard(p)).join('\n')}
      </section>
      <section>
        <h2>Featured videos</h2>
${featuredVideos.slice(0, 3).map((v) => videoCard(v)).join('\n')}
      </section>
    </main>`,
  }
}

// Static pages whose copy lives in their page component (with <Seo> meta).
const STATIC_PAGES = {
  '/about': 'About.tsx',
  '/press': 'Press.tsx',
  '/support': 'Support.tsx',
  '/community': 'Community.tsx',
  '/merch': 'Merch.tsx',
  '/privacy': 'Privacy.tsx',
  '/terms': 'Terms.tsx',
  '/cookies': 'Cookies.tsx',
  '/disclaimer': 'Disclaimer.tsx',
  '/refunds': 'Refunds.tsx',
}

for (const [route, file] of Object.entries(STATIC_PAGES)) {
  builders[route] = () => {
    const full = path.join(srcRoot, 'pages', file)
    const seo = seoProps(full)
    const blocks = pageBlocks(full)
    const hasH1 = blocks.some((b) => b.level === 1)
    return {
      title: seo.title ? `${seo.title} — TMACK48` : `TMACK48 — Official Artist Universe`,
      description: seo.description ?? siteConfig.description,
      inner: `<main>
${hasH1 ? '' : `      <h1>${esc(seo.title ?? route.slice(1))}</h1>\n`}${renderBlocks(blocks)}
    </main>`,
    }
  }
}

// Dynamic detail pages.
for (const t of tracks) {
  builders[`/music/${t.slug}`] = () => {
    const related = tracks.filter((x) => x.slug !== t.slug).slice(0, 3)
    return {
      title: `${t.title} — TMACK48`,
      description: t.blurb ?? `${t.title} by TMACK48 — watch the official video on YouTube and follow the universe.`,
      inner: `<main>
      <h1>${esc(t.title)}</h1>
      ${t.blurb ? `<p>${esc(t.blurb)}</p>` : ''}
      <p>Category: ${esc(t.category)}${t.tags?.length ? ` · Tags: ${esc(t.tags.join(', '))}` : ''}</p>
      <p><img src="${esc(t.thumbnailUrl)}" alt="${esc(t.title)} — TMACK48" loading="lazy" /></p>
      <p><a href="${esc(t.watchUrl)}">Watch on YouTube</a> · <a href="/music">All music</a> · <a href="/videos">All videos</a></p>
      ${
        t.lyrics?.length
          ? `<section>
        <h2>Lyrics</h2>
${t.lyrics.map((l) => `        <p>${esc(l)}</p>`).join('\n')}
      </section>`
          : ''
      }
      <section>
        <h2>More from TMACK48</h2>
${related
  .map(
    (r) => `        <p><a href="/music/${esc(r.slug)}">${esc(r.title)}</a></p>`,
  )
  .join('\n')}
      </section>
    </main>`,
    }
  }
}

for (const p of posts) {
  builders[`/news/${p.slug}`] = () => ({
    title: `${p.title} — TMACK48`,
    description: p.excerpt,
    inner: `<main>
      <article>
        <p>${esc(p.publishedAt)} · ${esc(p.category)} · ${esc(p.readMinutes)} min read</p>
        <h1>${esc(p.title)}</h1>
        <p>${esc(p.excerpt)}</p>
${p.body.map((para) => `        <p>${esc(para)}</p>`).join('\n')}
        <p><a href="/news">More news</a> · <a href="/music">Music</a> · <a href="${esc(siteConfig.channel.subscribeUrl)}">Subscribe on YouTube</a></p>
      </article>
    </main>`,
  })
}

// ---------- run over the sitemap ----------

const sitemap = fs.readFileSync(path.join(distRoot, 'sitemap.xml'), 'utf8')
const routes = [...sitemap.matchAll(/<loc>https:\/\/tmack48\.com(\/[^<]*)<\/loc>/g)].map((m) =>
  m[1] === '' ? '/' : m[1].replace(/\/$/, '') || '/',
)

const missing = []
for (const route of [...new Set(routes)]) {
  const build = builders[route]
  if (!build) {
    missing.push(route)
    continue
  }
  const { title, description, inner } = build()
  writeRoute(shell, route, { title, description, canonical: `${SITE_URL}${route === '/' ? '/' : route}`, inner })
}
if (missing.length) console.warn(`WARNING: no builder for sitemap routes: ${missing.join(', ')}`)
console.log(`prerender complete: ${written} routes`)
