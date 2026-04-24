#!/usr/bin/env node
/**
 * Blog renderer — takes an approved markdown draft and produces a standalone
 * HTML page under landing/blog/<slug>.html matching the Cue design system.
 *
 * Usage:
 *   node landing/scripts/blog-render.mjs --slug ambient-voice-agent
 *   node landing/scripts/blog-render.mjs --slug ambient-voice-agent --dry
 *
 * Input:  docs/marketing/blog-drafts/<slug>.md   (frontmatter + markdown)
 * Output: landing/blog/<slug>.html               (full page, schema.org Article)
 *
 * Design: shared.css (nav/footer) + blog.css (prose typography).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import { marked } from 'marked'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '../..')
const DRAFT_DIR = join(REPO_ROOT, 'docs/marketing/blog-drafts')
const OUT_DIR = join(REPO_ROOT, 'landing/blog')

const argv = process.argv.slice(2)
const slug = argv[argv.indexOf('--slug') + 1]
const DRY = argv.includes('--dry')
if (!slug || slug.startsWith('-')) {
  console.error('Usage: blog-render.mjs --slug <name>')
  process.exit(1)
}

const mdPath = join(DRAFT_DIR, `${slug}.md`)
if (!existsSync(mdPath)) {
  console.error(`Draft not found: ${mdPath}`)
  process.exit(1)
}

const raw = readFileSync(mdPath, 'utf-8')
const { data: fm, content } = matter(raw)

// Drop the first H1 from markdown if it matches the title (we render the title
// in the header section instead, for cleaner layout).
const firstH1 = content.match(/^#\s+(.+)$/m)
let body = content
if (firstH1) body = body.replace(firstH1[0], '').trim()

marked.setOptions({ gfm: true, breaks: false })
const html = marked.parse(body)

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const url = `https://heycue.io/blog/${fm.slug}`
const readingMin = Math.max(1, Math.round(body.split(/\s+/).length / 220))
const publishDate = fm.publish_date
const author = fm.author || 'Cue'
const authorName = author.split(',')[0].trim()

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: fm.title_blog,
  description: fm.meta_description,
  author: { '@type': 'Person', name: authorName },
  publisher: {
    '@type': 'Organization',
    name: 'Cue',
    logo: { '@type': 'ImageObject', url: 'https://heycue.io/icon.png' },
  },
  datePublished: publishDate,
  dateModified: publishDate,
  mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  image: 'https://heycue.io/og-image.png',
  url,
}

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://heycue.io/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://heycue.io/blog' },
    { '@type': 'ListItem', position: 3, name: fm.title_blog, item: url },
  ],
}

const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(fm.title_blog)} — Cue</title>

<meta name="description" content="${esc(fm.meta_description)}" />
<meta name="author" content="${esc(author)}" />
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
<link rel="canonical" href="${url}" />

<meta property="og:type" content="article" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${esc(fm.title_blog)}" />
<meta property="og:description" content="${esc(fm.meta_description)}" />
<meta property="og:image" content="https://heycue.io/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Cue" />
<meta property="article:published_time" content="${publishDate}" />
<meta property="article:author" content="${esc(authorName)}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(fm.title_social || fm.title_blog)}" />
<meta name="twitter:description" content="${esc(fm.meta_description)}" />
<meta name="twitter:image" content="https://heycue.io/og-image.png" />

<link rel="icon" type="image/png" href="/favicon.png" />
<link rel="apple-touch-icon" href="/icon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" onload="this.onload=null;this.rel='stylesheet'" />
<noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" /></noscript>
<link rel="stylesheet" href="/shared.css?v=${Date.now()}" />
<link rel="stylesheet" href="/blog.css?v=${Date.now()}" />

<!-- Cloudflare Web Analytics — pageviews + referrers, zero-config, GDPR-safe -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "c9e1d1b8f5a84c0a9d5e2f3a7b8c9e1d"}'></script>

<!-- Google Analytics 4 — property: cue-ai-desktop -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-X6BT55F7Z6"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-X6BT55F7Z6', { send_page_view: true });
</script>

<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(breadcrumb, null, 2)}
</script>
</head>
<body>

<div id="scroll-progress"></div>

<nav>
  <a href="/" class="nav-logo">
    <img class="logo-svg" src="/icon-light.png" alt="Cue" />
    <span>Cue</span>
  </a>
  <ul class="nav-links">
    <li><a href="/#how">How it works</a></li>
    <li><a href="/features">Features</a></li>
    <li><a href="/alternatives">Compare</a></li>
    <li><a href="/updates">Updates</a></li>
    <li><a href="/#faq">FAQ</a></li>
  </ul>
  <a href="/#download" class="btn-nav">Download</a>
</nav>

<main class="post-page">
  <header class="post-header">
    <div class="post-eyebrow"><span class="dot"></span>Blog</div>
    <h1 class="post-title">${esc(fm.title_blog)}</h1>
    <div class="post-meta">
      <span>${esc(author)}</span>
      <span class="sep">·</span>
      <time datetime="${publishDate}">${new Date(publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
      <span class="sep">·</span>
      <span>${readingMin} min read</span>
    </div>
  </header>

  <article class="post-body">
${html}
  </article>

  <div class="post-twitter">
    <a class="twitter-card" href="https://x.com/Pro420461340" target="_blank" rel="noopener">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="#1a1714"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      <div class="twitter-card-text">
        <div class="twitter-card-title">Follow Cue on X</div>
        <div class="twitter-card-handle">For ship notes, voice demos, and weekly changelogs.</div>
      </div>
      <span class="twitter-card-follow">Follow</span>
    </a>
  </div>

  <div class="post-cta">
    <div class="post-cta-eyebrow">Ready to try</div>
    <h3>Cue your AI.</h3>
    <p>Voice-activated AI that lives on your screen, next to whatever you're already doing.</p>
    <a href="/#download" class="btn-cta">
      Download for Mac &amp; Windows
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    </a>
  </div>
</main>

<footer>
  <div class="footer-left">
    <img width="16" height="16" src="/icon-light.png" alt="Cue" style="border-radius:4px;" />
    © 2026 Cue · heycue.io
  </div>
  <ul class="footer-links">
    <li><a href="/">Home</a></li>
    <li><a href="/features">Features</a></li>
    <li><a href="/updates">Updates</a></li>
    <li><a href="/privacy.html">Privacy</a></li>
    <li><a href="/terms.html">Terms</a></li>
  </ul>
</footer>

<script>
  // Scroll progress bar (composited transform, no layout thrash)
  const prog = document.getElementById('scroll-progress')
  let ticking = false
  const SLUG = ${JSON.stringify(fm.slug)}
  const TRACK = (typeof gtag === 'function')
  const fired = { 25: false, 50: false, 100: false }
  window.addEventListener('scroll', () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const h = document.documentElement
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100
      prog.style.transform = 'scaleX(' + (pct / 100) + ')'
      // Scroll-depth milestones → GA4 event (fires once each)
      for (const m of [25, 50, 100]) {
        if (!fired[m] && pct >= m - 1) {
          fired[m] = true
          if (TRACK) gtag('event', 'blog_read_' + m, { slug: SLUG, depth_pct: m })
        }
      }
      ticking = false
    })
  }, { passive: true })
  // CTA click tracking (dark pill + twitter card)
  document.querySelectorAll('.btn-cta, .twitter-card').forEach(el => {
    el.addEventListener('click', () => {
      if (!TRACK) return
      const kind = el.classList.contains('btn-cta') ? 'download' : 'twitter'
      gtag('event', 'blog_cta_click', { slug: SLUG, cta: kind })
    })
  })
  // Time-on-page (sends on unload)
  const t0 = Date.now()
  window.addEventListener('pagehide', () => {
    if (!TRACK) return
    gtag('event', 'blog_time_on_page', { slug: SLUG, seconds: Math.round((Date.now() - t0) / 1000) })
  })
</script>

</body>
</html>
`

if (DRY) {
  console.log(page.slice(0, 2000))
  console.log(`\n[approx ${page.length} bytes, ${readingMin} min read]`)
  process.exit(0)
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })
const outPath = join(OUT_DIR, `${fm.slug}.html`)
writeFileSync(outPath, page)
console.log(`Rendered → ${outPath}`)
console.log(`Bytes: ${page.length} · Reading: ${readingMin} min · URL: ${url}`)
