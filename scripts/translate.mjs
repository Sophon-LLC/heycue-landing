#!/usr/bin/env node
/**
 * Landing page batch translator using Vertex AI Gemini 2.5 Pro
 *
 * Usage:
 *   node scripts/translate.mjs                    # translate to all target languages
 *   node scripts/translate.mjs --lang zh          # translate to Chinese only
 *   node scripts/translate.mjs --lang zh,ja,ko    # translate to specific languages
 *   node scripts/translate.mjs --dry-run          # preview extracted text without calling API
 *
 * Prerequisites:
 *   - Google Cloud ADC: ~/.config/gcloud/application_default_credentials.json
 *   - Or: GOOGLE_APPLICATION_CREDENTIALS env var
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LANDING_DIR = join(__dirname, '..')

// ── Config ──────────────────────────────────────────────
// VERTEX_PROJECT must be set via env (no fallback — see CONTRIBUTING.md "Google Cloud setup").
const VERTEX_PROJECT = process.env.VERTEX_PROJECT
if (!VERTEX_PROJECT) {
  console.error('ERROR: VERTEX_PROJECT env var is required. See .env.example.')
  process.exit(1)
}
const VERTEX_LOCATION = process.env.VERTEX_LOCATION || 'us-central1'
const MODEL = 'gemini-2.5-pro' // Gemini 2.5 Pro GA

const TARGET_LANGUAGES = {
  zh: { name: '简体中文', htmlLang: 'zh-CN', navLabel: '中文' },
  'zh-tw': { name: '繁體中文', htmlLang: 'zh-TW', navLabel: '繁中' },
  ja: { name: '日本語', htmlLang: 'ja', navLabel: '日本語' },
  ko: { name: '한국어', htmlLang: 'ko', navLabel: '한국어' },
  es: { name: 'Español', htmlLang: 'es', navLabel: 'ES' },
}

// ── Auth: get access token from ADC ─────────────────────
async function getAccessToken() {
  const credPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    join(process.env.HOME, '.config/gcloud/application_default_credentials.json')

  if (!existsSync(credPath)) {
    throw new Error(`No ADC found at ${credPath}. Run: gcloud auth application-default login`)
  }

  const cred = JSON.parse(readFileSync(credPath, 'utf-8'))

  if (cred.type === 'authorized_user') {
    // Exchange refresh token for access token
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

  throw new Error(`Unsupported credential type: ${cred.type}`)
}

// ── Vertex AI Gemini API call ───────────────────────────
async function callGemini(prompt, accessToken) {
  const endpoint = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT}/locations/${VERTEX_LOCATION}/publishers/google/models/${MODEL}:generateContent`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 65536,
        thinkingConfig: { thinkingBudget: 1024 },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${err}`)
  }

  let data
  try {
    data = await res.json()
  } catch (e) {
    const text = await res.text()
    throw new Error(`Failed to parse response: ${text.substring(0, 500)}`)
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// ── Extract translatable text from HTML ─────────────────
function extractTexts(html) {
  const texts = []
  const seen = new Set()

  // Match visible text content (between tags, excluding style/script)
  // Strategy: find all text nodes that users see
  const patterns = [
    // Tag content: >text<
    />([^<>{}\n]+?)</g,
    // Alt attributes
    /alt="([^"]+)"/g,
    // Placeholder attributes
    /placeholder="([^"]+)"/g,
    // Title tag
    /<title>([^<]+)<\/title>/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(html)) !== null) {
      const text = match[1].trim()
      // Skip: empty, pure symbols, CSS values, numbers only, URLs, hex colors
      if (
        !text ||
        text.length < 2 ||
        /^[\s\d.,;:!?·—–\-+×÷=<>{}()\[\]|\\/@#$%^&*~`'"]+$/.test(text) ||
        /^(#[0-9a-f]{3,8}|rgb|url|http|\/\/)/.test(text) ||
        /^[0-9.,]+(%|px|rem|em|vh|vw|s|ms)?$/.test(text) ||
        /^(M\d|L\d|Z|A\d|C\d)/.test(text) || // SVG paths
        text.startsWith('svg') ||
        text.startsWith('path')
      ) {
        continue
      }
      if (!seen.has(text)) {
        seen.add(text)
        texts.push(text)
      }
    }
  }

  return texts
}

// ── Build translation prompt ────────────────────────────
function buildPrompt(texts, langName, langCode) {
  return `You are a professional translator for a tech product landing page.

Product: Cue — a macOS voice AI assistant that executes tasks on your Mac.
Brand voice: Clean, confident, minimal. Like Linear or Stripe marketing.

Translate the following text strings from English to ${langName} (${langCode}).

Rules:
1. Keep brand names untranslated: "Cue", "Siri", "ChatGPT", "Claude", "Vercel", "Safari", "Notion"
2. Keep technical terms natural: "Agent", "API", "macOS" stay as-is
3. Keep keyboard shortcuts as-is: "⌥Space", "⌥H"
4. Keep version numbers as-is: "v0.5.8"
5. Match the tone: confident, concise, no filler words
6. For Chinese: use 你 not 您, casual but professional
7. For CTA buttons: keep them short and punchy
8. DO NOT translate email addresses or URLs

Return a JSON object where keys are the original English strings and values are translations.
Return ONLY the JSON, no markdown fences, no explanation.

Strings to translate:
${JSON.stringify(texts, null, 2)}`
}

// ── Apply translations to HTML ──────────────────────────
function applyTranslations(html, translations, langConfig) {
  let result = html

  // Update html lang attribute
  result = result.replace(/lang="en"/, `lang="${langConfig.htmlLang}"`)

  // Sort by length descending to avoid partial replacements
  const entries = Object.entries(translations).sort((a, b) => b[0].length - a[0].length)

  for (const [original, translated] of entries) {
    if (!translated || original === translated) continue

    // Replace in tag content: >original< → >translated<
    // Use a function to avoid issues with $ in replacement strings
    const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Replace in visible text (between tags)
    const textPattern = new RegExp(`(>\\s*)${escapedOriginal}(\\s*<)`, 'g')
    result = result.replace(textPattern, (_, before, after) => `${before}${translated}${after}`)

    // Replace in alt attributes
    const altPattern = new RegExp(`(alt=")${escapedOriginal}(")`, 'g')
    result = result.replace(altPattern, (_, before, after) => `${before}${translated}${after}`)

    // Replace in title tag
    const titlePattern = new RegExp(`(<title>)${escapedOriginal}(<\\/title>)`, 'g')
    result = result.replace(titlePattern, (_, before, after) => `${before}${translated}${after}`)
  }

  // Add language switcher to nav (before the download button)
  const langSwitcher = buildLangSwitcher(langConfig)
  result = result.replace(
    /(<a href="#download" class="btn-nav">)/,
    `${langSwitcher}$1`
  )

  return result
}

// ── Language switcher HTML ───────────────────────────────
function buildLangSwitcher(currentLang) {
  const allLangs = [
    { code: 'en', label: 'EN', file: 'index.html' },
    ...Object.entries(TARGET_LANGUAGES).map(([code, config]) => ({
      code,
      label: config.navLabel,
      file: `${code}.html`,
    })),
  ]

  const links = allLangs
    .map((lang) => {
      const isCurrent = lang.code === currentLang?.htmlLang?.split('-')[0]?.toLowerCase()
      return isCurrent
        ? `<span style="color:#1d1a1a;font-weight:600;">${lang.label}</span>`
        : `<a href="${lang.file}" style="color:#888;text-decoration:none;">${lang.label}</a>`
    })
    .join(' · ')

  return `<div style="display:flex;align-items:center;gap:4px;font-size:11px;margin-right:12px;">${links}</div>`
}

// Also add switcher to the English version
function addSwitcherToEnglish(html) {
  const allLangs = [
    { code: 'en', label: 'EN', file: 'index.html' },
    ...Object.entries(TARGET_LANGUAGES).map(([code, config]) => ({
      code,
      label: config.navLabel,
      file: `${code}.html`,
    })),
  ]

  const links = allLangs
    .map((lang) => {
      return lang.code === 'en'
        ? `<span style="color:#1d1a1a;font-weight:600;">${lang.label}</span>`
        : `<a href="${lang.file}" style="color:#888;text-decoration:none;">${lang.label}</a>`
    })
    .join(' · ')

  const switcher = `<div style="display:flex;align-items:center;gap:4px;font-size:11px;margin-right:12px;">${links}</div>`

  return html.replace(
    /(<a href="#download" class="btn-nav">)/,
    `${switcher}$1`
  )
}

// ── Main ────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const langArg = args.find((a) => a.startsWith('--lang='))?.split('=')[1]
  const targetLangs = langArg
    ? langArg.split(',').filter((l) => TARGET_LANGUAGES[l])
    : Object.keys(TARGET_LANGUAGES)

  if (targetLangs.length === 0) {
    console.error('No valid target languages. Available:', Object.keys(TARGET_LANGUAGES).join(', '))
    process.exit(1)
  }

  // Read source HTML
  const sourceHtml = readFileSync(join(LANDING_DIR, 'index.html'), 'utf-8')
  const texts = extractTexts(sourceHtml)

  console.log(`📝 Extracted ${texts.length} translatable strings`)

  if (dryRun) {
    console.log('\n--- Extracted strings ---')
    texts.forEach((t, i) => console.log(`  ${i + 1}. ${t}`))
    console.log('\n--dry-run mode, no API calls made.')
    return
  }

  // Get access token once
  console.log('🔑 Getting Vertex AI access token...')
  const accessToken = await getAccessToken()

  for (const langCode of targetLangs) {
    const langConfig = TARGET_LANGUAGES[langCode]
    console.log(`\n🌐 Translating to ${langConfig.name} (${langCode})...`)

    // Call Gemini
    const prompt = buildPrompt(texts, langConfig.name, langCode)
    let response
    try {
      response = await callGemini(prompt, accessToken)
    } catch (e) {
      console.error(`  ❌ API call failed:`, e.message)
      continue
    }

    // Parse translation JSON
    let translations
    try {
      // Strip markdown fences if present
      const cleaned = response.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim()
      translations = JSON.parse(cleaned)
    } catch (e) {
      console.error(`  ❌ Failed to parse Gemini response as JSON:`, e.message)
      console.error(`  Raw response (first 500 chars):`, response.substring(0, 500))
      // Save raw response for debugging
      writeFileSync(join(LANDING_DIR, `scripts/${langCode}-raw.txt`), response)
      continue
    }

    const translatedCount = Object.keys(translations).length
    console.log(`  ✅ Got ${translatedCount} translations`)

    // Apply translations to HTML
    const translatedHtml = applyTranslations(sourceHtml, translations, langConfig)
    const outPath = join(LANDING_DIR, `${langCode}.html`)
    writeFileSync(outPath, translatedHtml, 'utf-8')
    console.log(`  📄 Written to ${outPath}`)

    // Save translation map for reference
    writeFileSync(
      join(LANDING_DIR, `scripts/${langCode}-translations.json`),
      JSON.stringify(translations, null, 2),
      'utf-8'
    )
  }

  // Add language switcher to English version
  console.log('\n🔗 Adding language switcher to index.html...')
  const updatedEnglish = addSwitcherToEnglish(sourceHtml)
  writeFileSync(join(LANDING_DIR, 'index.html'), updatedEnglish, 'utf-8')

  console.log('\n✅ All translations complete!')
  console.log('Next: deploy with `wrangler pages deploy landing --project-name heycue`')
}

main().catch((err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
