// Emits dist/404.html from the built SPA shell (dist/index.html).
//
// Why: Cloudflare Pages serves /index.html with HTTP 200 for every unmatched
// path while no 404.html exists (the _redirects catch-all is ignored by
// Pages' validator as an "infinite loop"). With a 404.html present, Pages
// serves it with a genuine 404 status for unmatched paths. The file is the
// app shell — so React still boots and renders its own NotFound page — with
// not-found title/meta, no canonical, and a crawlable content block inside
// #root (replaced by React on mount) carrying the NotFound page's own copy.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = path.join(repoRoot, 'dist')
const shellPath = path.join(distRoot, 'index.html')
const outPath = path.join(distRoot, '404.html')

const TITLE = 'Page Not Found | TMACK48'
const DESCRIPTION = 'This page is off the grid.'

const contentBlock = `<main>
      <h1>Off the Grid</h1>
      <p>This page isn't part of the TMACK48 universe — yet. Let's get you back to the action.</p>
      <p><a href="/">Back to Home</a> · <a href="/music">Music</a> · <a href="/videos">Videos</a> · <a href="/news">News</a> · <a href="/about">About</a> · <a href="/contact">Contact</a></p>
    </main>`

let html = fs.readFileSync(shellPath, 'utf8')

html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${TITLE}</title>`)
html = html.replace(
  /<meta name="description" content="[^"]*"\s*\/?>/,
  `<meta name="description" content="${DESCRIPTION}" />`,
)
html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${TITLE}" />`)
html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${DESCRIPTION}" />`)
html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${TITLE}" />`)
html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${DESCRIPTION}" />`)
// A 404 page must not canonicalize itself to the homepage or claim its URL.
html = html.replace(/\s*<link rel="canonical"[^>]*>/, '')
html = html.replace(/\s*<meta property="og:url"[^>]*>/, '')
if (/<meta name="robots"[^>]*>/.test(html)) {
  html = html.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, follow" />')
} else {
  html = html.replace('</title>', '</title>\n    <meta name="robots" content="noindex, follow" />')
}
// Crawlable not-found content inside #root; React replaces it on mount.
html = html.replace(/(<div id="root">)/, `$1${contentBlock}`)

fs.writeFileSync(outPath, html)
console.log(`generate-404: wrote ${path.relative(repoRoot, outPath)} (${Buffer.byteLength(html)} bytes)`)
