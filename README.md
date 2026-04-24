# Cue Landing — heycue.io

The marketing site for [Cue](https://heycue.io), a voice AI agent for macOS and Windows.

Static HTML + CSS + vanilla JS, served via Cloudflare Pages. No framework, no build step for the pages themselves. Translation and blog scripts live in `scripts/`.

---

## Quick start

```bash
# 1. Clone
git clone https://github.com/Sophon-LLC/heycue-landing.git
cd heycue-landing

# 2. Preview locally (any static server works)
npx serve .
# → open http://localhost:3000

# 3. (Optional) Install script dependencies if you plan to run translators
npm install
```

That's it for viewing and editing. The HTML files are editable by hand.

---

## Project layout

```
heycue-landing/
├── index.html              # English home (canonical)
├── zh.html                 # Simplified Chinese
├── zh-tw.html              # Traditional Chinese
├── ja.html                 # Japanese
├── ko.html                 # Korean
├── privacy.html            # Privacy policy
├── terms.html              # Terms of service
├── welcome.html            # Post-install welcome page
├── design-scenarios.html   # Internal design reference
├── og-image.html           # Source for og-image.png (regenerate via Puppeteer)
│
├── shared.css              # Global styles
├── blog.css                # Blog post styles
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Crawler directives
├── llms.txt                # AI engine "resume" (see llmstxt.org)
│
├── assets/                 # Images, video, avatars
│   ├── cue-hero.mp4        # Homepage hero video (9MB)
│   ├── cue-hero-poster.jpg
│   └── *.png               # Team avatars
├── memoji/                 # Memoji illustrations
├── blog/                   # Blog posts (HTML)
│
├── scripts/                # Content tooling (Node.js)
│   ├── translate.mjs       # Batch translate EN → zh/zh-tw/ja/ko
│   ├── blog-write.mjs      # Generate blog post from a brief
│   ├── blog-render.mjs     # Render blog MD → HTML
│   ├── blog-briefs/        # Blog outlines (input to blog-write.mjs)
│   └── *-translations.json # Cached translation output
│
└── .env.example            # Env var template (copy to .env)
```

---

## Editing content

### Text-only changes (most common)
Edit the relevant `.html` file directly. For example, to change the hero tagline in English: edit `index.html`, find the `<h1>`, commit, open a PR.

**For translations**: if you change English copy that appears in multiple languages, also update the corresponding text in `zh.html`, `zh-tw.html`, `ja.html`, `ko.html`. Or run `scripts/translate.mjs` (see below).

### CSS changes
`shared.css` is global. `blog.css` only affects blog posts. We keep custom CSS per-page inline (inside `<style>` tags) when it's page-specific.

### Adding a new page
1. Duplicate an existing page (e.g. `terms.html`) as your starting point
2. Update the `<title>`, meta description, canonical link, OG tags
3. Add the new URL to `sitemap.xml`
4. If the page has translations, add them to each language file
5. Open a PR

### Adding a new competitor comparison (`vs-xxx.html`)
Discussed in `CONTRIBUTING.md` → "Competitor pages".

---

## Running the scripts (optional, for translators and blog writers)

The scripts call Vertex AI Gemini 2.5 Pro. You need:

1. A Google Cloud project with Vertex AI API enabled (free tier: $300 credit, ~50000 tokens/day free)
2. Authenticated credentials via `gcloud auth application-default login`
3. A `.env` file (copy from `.env.example`) with `VERTEX_PROJECT=your-project-id`

```bash
# Translate to all 4 languages
node scripts/translate.mjs

# Translate only to Chinese
node scripts/translate.mjs --lang zh

# Preview what will be translated without calling the API
node scripts/translate.mjs --dry-run

# Write a blog post from a brief
node scripts/blog-write.mjs --brief ambient-voice-agent

# Render a blog markdown file to HTML
node scripts/blog-render.mjs blog-drafts/my-post.md
```

If you don't need to run scripts (you're only editing HTML/CSS), skip this section.

---

## Deploy

Deployed to Cloudflare Pages. Maintainers deploy with:

```bash
wrangler pages deploy . --project-name heycue --branch=main --commit-dirty=true
```

**Important for maintainers**: the `--branch=main` flag is required to deploy to Production. Without it, deployment goes to Preview only. Verify with `wrangler pages deployment list --project-name heycue | head -3`.

Contributors do NOT deploy. Open a PR, a maintainer will review and merge, CI handles the rest.

---

## Browser support

- Chrome/Edge/Safari/Firefox latest 2 versions
- Mobile Safari (iOS 16+)
- Mobile Chrome (Android 12+)
- IE is not supported

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- PR workflow
- Brand voice and tone rules (what words to avoid)
- Competitor page template
- Translation guidelines per language
- Known pitfalls (things that break SEO if done wrong)

---

## Contact

- Product: Cue (https://heycue.io)
- Company: Sophon LLC
- Maintainer: Oscar Zamora (oscarzamora199907@gmail.com)
- Beta community: https://t.me/+iubyiE607WYwNDQx

---

## License

MIT — see [LICENSE](./LICENSE).

The Cue name, logo, and brand assets are trademarks of Sophon LLC. If you fork to build a different product, replace the brand assets.
