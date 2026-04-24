#!/usr/bin/env node
/**
 * Blog writer — takes a BRIEF and asks Gemini 2.5 Pro to expand it into a
 * long-form markdown draft. Opus handles brief + review; Gemini handles the
 * token-heavy long-form expansion (~10-15x cheaper).
 *
 * Usage:
 *   node landing/scripts/blog-write.mjs --brief ambient-voice-agent
 *   node landing/scripts/blog-write.mjs --brief ambient-voice-agent --dry   # prompt preview
 *
 * Output:
 *   docs/marketing/blog-drafts/<slug>.md  ← markdown for CEO review + HN/Medium
 *
 * HTML rendering (schema.org Article + metadata) is a separate step after
 * CEO signs off on the markdown.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '../..')
const DRAFT_DIR = join(REPO_ROOT, 'docs/marketing/blog-drafts')

// ── CLI ─────────────────────────────────────────────────
const argv = process.argv.slice(2)
const briefName = argv[argv.indexOf('--brief') + 1]
const DRY = argv.includes('--dry')
if (!briefName || briefName.startsWith('-')) {
  console.error('Usage: blog-write.mjs --brief <name>')
  process.exit(1)
}

// ── Vertex auth (VERTEX_PROJECT must be set via env, see .env.example) ─────
const VERTEX_PROJECT = process.env.VERTEX_PROJECT
if (!VERTEX_PROJECT) {
  console.error('ERROR: VERTEX_PROJECT env var is required. See .env.example.')
  process.exit(1)
}
const VERTEX_LOCATION = process.env.VERTEX_LOCATION || 'us-central1'
const MODEL = 'gemini-2.5-pro'

async function getAccessToken() {
  const credPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    join(process.env.HOME, '.config/gcloud/application_default_credentials.json')
  if (!existsSync(credPath)) throw new Error(`No ADC at ${credPath}`)
  const cred = JSON.parse(readFileSync(credPath, 'utf-8'))
  if (cred.type !== 'authorized_user') throw new Error(`Unsupported cred: ${cred.type}`)
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: cred.client_id,
      client_secret: cred.client_secret,
      refresh_token: cred.refresh_token,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Token refresh failed: ${JSON.stringify(data)}`)
  return data.access_token
}

async function callGemini(prompt, token) {
  const endpoint = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT}/locations/${VERTEX_LOCATION}/publishers/google/models/${MODEL}:generateContent`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 16384,
        thinkingConfig: { thinkingBudget: 4096 },
      },
    }),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 500)}`)
  const data = await res.json()
  const usage = data.usageMetadata || {}
  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('\n') || ''
  return { text, usage }
}

// ── Build prompt ─────────────────────────────────────────

function buildPrompt(brief) {
  const outlineText = brief.outline
    .map(s => {
      const title = s.heading ? `§${s.id} ${s.heading}` : `§${s.id} (Thesis opener, no heading)`
      const lines = [`### ${title} (target: ${s.wordTarget} words)`]
      if (s.opensWith) lines.push(`**OPENS WITH**: ${s.opensWith}`)
      lines.push(`**BEATS**:\n${s.beats.map(b => `- ${b}`).join('\n')}`)
      if (s.transitionsToNext) lines.push(`**BRIDGE TO NEXT SECTION (must end with this idea)**: ${s.transitionsToNext}`)
      return lines.join('\n')
    })
    .join('\n\n')

  const ceoText = Object.entries(brief.ceoAnswers)
    .map(([q, a]) => `**${q.toUpperCase()}**:\n${a}`)
    .join('\n\n')

  const styleRef = brief.styleReference
    ? `
# Style references (imitate the rhythm, not the words)
- Primary: **${brief.styleReference.primary}** — ${brief.styleReference.primaryNote}
- Secondary: **${brief.styleReference.secondary}** — ${brief.styleReference.secondaryNote}
- Spice (use sparingly, 1-2 declarative sentences per essay): **${brief.styleReference.spice}** — ${brief.styleReference.spiceNote}
`
    : ''

  const characters = brief.characterContinuity
    ? `
# Character continuity (narrative thread — DO NOT drop)
- Main: ${brief.characterContinuity.mainCharacter}
- Supporting: ${brief.characterContinuity.supportingCharacter}
- Usage across sections:
${brief.characterContinuity.characterUsage.map(u => '  - ' + u).join('\n')}

These two characters MUST thread through the essay. The friend in the kitchen is introduced in §1, referenced briefly in §4, and the essay CLOSES by returning to her scene in §8. If you drop the character and don't return to her, the essay fails.
`
    : ''

  return `你是 Cue 创始人的代笔，在为产品博客写一篇**英文首篇文章**。CEO 已经给了骨架和原始口述答案，你的工作是把骨架写成完整的长文，同时**严格遵守品牌声音规则**和**story + style 规则**。

# Title (blog canonical)
${brief.titleVariants.blog}

# Thesis (核心论点)
${brief.thesis}
${styleRef}${characters}
# CEO 口述原文（这是事实源，引用或改写时不能扭曲原意）
${ceoText}

# 文章大纲（严格按此结构 + 字数目标写）

**Critical**: Each section has an OPENS WITH cue and a BRIDGE TO NEXT cue. The opens-with shapes the first 1-2 sentences of that section. The bridge-to-next MUST be the last sentence or last paragraph of that section, so each section visibly hands off to the next. This is non-negotiable — the biggest failure mode of v1 was disconnected sections. Do not drop the bridges.

${outlineText}

# 三个 pull quote（必须**一字不差**分别出现在文中合适位置，通常用 > blockquote 突出）
${brief.pullQuotes.map((q, i) => `${i + 1}. "${q}"`).join('\n')}

# 事实约束（违反任何一条 = 返工）
${brief.factsToRespect.map(f => `- ${f}`).join('\n')}

# 品牌声音规则（HARD）
- 语言：American English
- 禁用词（完全禁止）：${brief.brandVoice.banned.join(', ')}
- 短段落，每段 ≤ 3 句
- 不写 "first"、"best"、"only"、"revolutionary" 等无数据支撑的绝对词
- 第一人称（我 / 我们）OK，这是创始人 essay 不是 press release
- 禁止 em dash (—)，用逗号/句号/ "and" 代替

# 文章结尾（必须一字不差作为最后一段）
${brief.brandVoice.signatureLine}

# 结尾后面的 CTA（一行，markdown）
[Try Cue free. No credit card.](https://heycue.io)

---

# 输出格式要求

直接输出完整的 **Markdown** 文章，从 H1 标题开始。不要加任何前言、不要加 "Here's the blog post:" 之类的解释。

H1 用 blog canonical 标题（${brief.titleVariants.blog}）。
每个 §N 段用 H2（##）。
Pull quote 用 > blockquote。
整篇字数目标：${brief.targetWords} 字（英文 words，不是字符）。

现在开始写：`
}

// ── Main ─────────────────────────────────────────────────

async function main() {
  const briefPath = join(__dirname, `blog-briefs/${briefName}.mjs`)
  if (!existsSync(briefPath)) {
    console.error(`Brief not found: ${briefPath}`)
    process.exit(1)
  }
  const { BRIEF } = await import(briefPath)
  console.log(`[blog-write] brief=${BRIEF.slug} targetWords=${BRIEF.targetWords}`)

  const prompt = buildPrompt(BRIEF)
  if (DRY) {
    console.log('─── PROMPT PREVIEW ───')
    console.log(prompt)
    console.log(`\n[approx prompt tokens: ${Math.round(prompt.length / 4)}]`)
    return
  }

  console.log('[vertex] fetching token...')
  const token = await getAccessToken()
  console.log('[vertex] calling Gemini 2.5 Pro...')
  const { text, usage } = await callGemini(prompt, token)

  if (!existsSync(DRAFT_DIR)) mkdirSync(DRAFT_DIR, { recursive: true })
  const outPath = join(DRAFT_DIR, `${BRIEF.slug}.md`)
  const frontmatter = `---
slug: ${BRIEF.slug}
url: ${BRIEF.urlSlug}
title_blog: ${BRIEF.titleVariants.blog}
title_hn: ${BRIEF.titleVariants.hn}
title_social: ${BRIEF.titleVariants.social}
meta_description: ${BRIEF.metaDescription}
publish_date: ${BRIEF.publishDate}
author: ${BRIEF.author}
model: ${MODEL}
generated_at: ${new Date().toISOString()}
prompt_tokens: ${usage.promptTokenCount || '?'}
output_tokens: ${usage.candidatesTokenCount || '?'}
total_tokens: ${usage.totalTokenCount || '?'}
---

`
  writeFileSync(outPath, frontmatter + text)
  console.log(`\nDraft written → ${outPath}`)
  console.log(`Tokens: prompt=${usage.promptTokenCount} output=${usage.candidatesTokenCount} total=${usage.totalTokenCount}`)
  console.log(`Word count (approx): ${text.split(/\s+/).length}`)

  // Quick brand-voice sanity check
  const violations = []
  for (const word of BRIEF.brandVoice.banned) {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    const matches = text.match(re)
    if (matches) violations.push(`${word}: ${matches.length}x`)
  }
  if (text.includes('—')) violations.push('em dash (—) found')
  if (violations.length) {
    console.warn(`\n⚠ Brand voice violations:\n${violations.map(v => '  - ' + v).join('\n')}`)
  } else {
    console.log('\n✓ Brand voice check passed')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
