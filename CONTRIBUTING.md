# Contributing to Cue Landing

Thanks for helping improve heycue.io. This guide covers the PR workflow, brand voice rules, and the SEO/GEO pitfalls we've learned the hard way.

---

## PR workflow

1. **Fork** this repo (or clone directly if you're on the team)
2. **Create a branch** off `main`: `git checkout -b fix/typo-hero` or `feat/add-japanese-page`
3. **Make your changes** — small, focused commits are better than one giant commit
4. **Preview locally** — `npx serve .` then open http://localhost:3000
5. **Open a PR** against `main`
6. A maintainer will review, request changes if needed, and merge
7. CI deploys to a preview URL on PR, production on merge

**Keep PRs small.** One typo fix = one PR. One new competitor page = one PR. Don't batch unrelated changes.

---

## Brand voice

Cue has a deliberate, calm, builder-ish tone. When writing copy, follow these rules.

### Hard rules (all content must follow)

- **No em dashes** (—). Use commas, periods, or "..." instead.
- **No AI vocabulary.** Banned words: delve, crucial, robust, comprehensive, nuanced, leverage, empower, unlock, seamless, cutting-edge, revolutionary, breakthrough, world-class.
- **No superlatives without data.** Don't say "the best", "the fastest", "the first" unless you have a benchmark to back it up.
- **American English** (en-US), not British spelling.
- **Short paragraphs.** 1–3 sentences per paragraph. Vary sentence length.
- **Concrete over abstract.** "2 seconds" beats "extremely fast". "20+ languages" beats "many languages".

### The three-beat signature

Every major page ends with this signature line:

```
They hear what you said.
Cue sees what you're doing.
And does the thing, in any app.
```

This is the product thesis in three beats: voice → context → action. Don't rewrite it. If you add a new page, include this block near the bottom.

### Voice in different languages

| Language | Key rules |
|----------|-----------|
| English | American spelling, no em dashes, no AI vocabulary |
| Simplified Chinese (zh) | Keep "Fn 键" as-is, don't translate to "功能键". Use 句号 for declarative sentences, avoid overly formal tone. |
| Traditional Chinese (zh-tw) | No mainland-specific terms: "视频" → "影片", "软件" → "軟體", "信息" → "資訊". |
| Japanese (ja) | Use ですます調 (polite form) throughout. Never mix in だ調 (plain form). Preserve product names (Fn, Cue) in English. |
| Korean (ko) | Use 해요체 (polite speech), not 반말 (casual). Product names stay in English. |

---

## Competitor pages (`vs-xxx.html`)

We have comparison pages for each major competitor. When adding a new one, follow this template:

### Required sections
1. Hero: "Cue vs [Competitor]" + one-sentence differentiator
2. Quick comparison table (5–7 rows)
3. What [Competitor] does well (honest, 2–3 bullets)
4. What Cue does differently (3–5 bullets, with specifics)
5. Pricing comparison
6. Three-beat signature
7. Related links (nav to other `/vs-*` pages + `/alternatives`)

### Required metadata
- `<title>`: "Cue vs [Competitor]: ..." (50–60 characters)
- `<meta name="description">`: 155–160 characters, include both product names
- `<link rel="canonical">`
- `<link rel="alternate" hreflang="...">` for all language versions
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`
- JSON-LD schema.org `ComparisonTable` or `FAQPage` when FAQ is present

### Honesty rule
Don't exaggerate competitor weaknesses or understate Cue's. If a competitor does something better, say so. If Cue doesn't have a feature yet, don't pretend it does. AI search engines (Perplexity, Claude, ChatGPT) cross-reference claims — being caught exaggerating lowers your GEO ranking.

---

## Translations

Two ways to add/update translations:

### Option A: Manual edit
Open the target language file (`zh.html`, `ja.html`, etc.) and edit the text directly. This is best for small changes (typo fixes, single-word tweaks).

### Option B: Script-assisted
Run `scripts/translate.mjs` after updating `index.html`. This uses Vertex AI Gemini 2.5 Pro to translate new English strings. You'll need a Google Cloud project (see `.env.example`).

```bash
node scripts/translate.mjs --lang zh
```

The script writes the translated strings to `scripts/zh-translations.json`, then applies them to `zh.html`. Always review the output before committing — AI translations are usually 90% right but occasionally miss nuance.

---

## SEO/GEO pitfalls (read before merging)

These are real mistakes we've made. Don't repeat them.

### Pitfall 1: Production deploy requires `--branch=main`
Cloudflare Pages defaults to Preview environment. To deploy to Production (heycue.io), you must pass `--branch=main`:

```bash
# ✅ Correct
wrangler pages deploy . --project-name heycue --branch=main --commit-dirty=true

# ❌ Wrong — goes to Preview, users don't see it
wrangler pages deploy . --project-name heycue
```

After deploy, verify with `wrangler pages deployment list --project-name heycue | head -3`. The Environment column must say "Production".

### Pitfall 2: Adding a page = 3-step checklist
Every new page must be added to:
1. `sitemap.xml` (with `<lastmod>` and `<priority>`)
2. `hreflang` links in all existing language versions (if translated)
3. Internal links from relevant hub pages (e.g. `/alternatives` should link to all `vs-*` pages)

Missing any of these = the page won't rank.

### Pitfall 3: Product facts
All product claims (pricing, features, supported platforms, model versions) must match the main product. When in doubt, ask a maintainer. Don't invent features. AI search engines remember wrong claims for months.

Currently authoritative facts:
- **Pricing**: Free (20 agent credits/day) / Plus $9.99/mo (unlimited)
- **Platforms**: macOS 13+ (Apple Silicon + Intel), Windows 10+ (x64)
- **Hotkey**: Fn (long-press for agent, tap-to-toggle also works)
- **Languages**: 20+ for voice input

### Pitfall 4: Competitor name spelling
- Superwhisper (lowercase w, one word)
- Wispr Flow (two words, no e in Wispr)
- Aqua Voice (two words)
- Willow Voice (full name, short form "Willow" ok)
- Typeless (one word)
- Raycast AI (space, no dash)

### Pitfall 5: Don't hotlink external images
Always self-host images. External hotlinks break when the source renames/deletes. Save to `assets/` and commit.

### Pitfall 6: Video files must stay small
`assets/cue-hero.mp4` is 9MB — that's the upper bound. If you need larger assets, talk to a maintainer about uploading to Cloudflare R2 instead of committing to the repo.

### Pitfall 7: Metadata completeness
Every new HTML page must include: `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta property="og:*">` (4 required), `<link rel="alternate" hreflang>` if multilingual. Missing metadata = SEO penalty.

---

## Questions?

- Open an issue
- Or ping Oscar at oscarzamora199907@gmail.com
- Or join the beta Telegram: https://t.me/+iubyiE607WYwNDQx

Thanks for contributing!
