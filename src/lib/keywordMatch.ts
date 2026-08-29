// Best-effort, fully client-side job-description keyword matcher. Not an
// AI service — this is word/phrase frequency analysis: it tokenizes the
// pasted job description, strips common English stopwords, ranks what's
// left by frequency (single words and two-word phrases), and checks
// whether each candidate keyword appears anywhere in the resume's text
// (skills, summary, experience bullets, education, projects,
// certifications). Good enough to catch obvious gaps, not a substitute
// for actually reading the job posting.

import type { ResumeData } from './types'
import { plainTextOf } from './richText'

const STOPWORDS = new Set([
  'the', 'and', 'a', 'an', 'to', 'of', 'in', 'on', 'for', 'with', 'is', 'are',
  'be', 'as', 'at', 'by', 'or', 'that', 'this', 'will', 'you', 'your', 'we',
  'our', 'their', 'from', 'have', 'has', 'had', 'it', 'its', 'job', 'role',
  'team', 'years', 'year', 'experience', 'including', 'etc', 'strong',
  'ability', 'skills', 'skill', 'work', 'working', 'able', 'must', 'who',
  'what', 'all', 'any', 'can', 'may', 'should', 'would', 'about', 'into',
  'across', 'per', 'via', 'they', 'them', 'us', 'if', 'not', 'other',
  'such', 'while', 'within', 'these', 'those', 'each', 'more', 'most',
  'you’ll', 'we’re', 'do', 'does', 'done', 'been', 'being', 'also',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

export function extractKeywords(jobText: string, max = 24): string[] {
  const words = tokenize(jobText)
  const freq = new Map<string, number>()

  for (const w of words) {
    if (w.length < 3 || STOPWORDS.has(w) || /^\d+$/.test(w)) continue
    freq.set(w, (freq.get(w) ?? 0) + 1)
  }

  // Two-word phrases tend to be more specific/meaningful skills or tools
  // ("product management", "machine learning") — weight them a bit higher.
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i]
    const w2 = words[i + 1]
    if (w1.length < 3 || w2.length < 3 || STOPWORDS.has(w1) || STOPWORDS.has(w2)) continue
    const bigram = `${w1} ${w2}`
    freq.set(bigram, (freq.get(bigram) ?? 0) + 1.5)
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w)
}

export function resumeSearchText(data: ResumeData): string {
  return [
    data.contact.title,
    plainTextOf(data.summary),
    ...data.skills.map((s) => s.name),
    ...data.experience.flatMap((e) => [e.role, e.company, ...e.bullets.map(plainTextOf)]),
    ...data.education.map((e) => `${e.degree} ${e.field} ${e.school}`),
    ...data.projects.map((p) => `${p.name} ${plainTextOf(p.description)} ${p.tech}`),
    ...data.certifications.map((c) => c.name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

// A handful of very common abbreviation/full-form pairs — without this, a
// resume that says "JavaScript" gets marked as missing the JD keyword "js"
// (and vice versa) even though they mean the same thing.
const SYNONYM_GROUPS: string[][] = [
  ['javascript', 'js'],
  ['typescript', 'ts'],
  ['machine learning', 'ml'],
  ['artificial intelligence', 'ai'],
  ['user interface', 'ui'],
  ['user experience', 'ux'],
  ['continuous integration', 'ci'],
  ['continuous deployment', 'cd'],
  ['search engine optimization', 'seo'],
  ['search engine marketing', 'sem'],
  ['quality assurance', 'qa'],
  ['application programming interface', 'api'],
  ['objective key results', 'okr'],
  ['key performance indicator', 'kpi'],
  ['customer relationship management', 'crm'],
]

function synonymsOf(keyword: string): string[] {
  const group = SYNONYM_GROUPS.find((g) => g.includes(keyword))
  return group ? group.filter((w) => w !== keyword) : []
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Whole-word/whole-phrase match — a plain `text.includes(k)` would let a
// short keyword like "java" match inside an unrelated word like
// "javascript", or "art" match inside "start". Lookaround (not \b) so it
// still works around keywords containing symbols ("c++", "c#", "node.js").
function containsWholeWord(text: string, term: string): boolean {
  const pattern = new RegExp(`(?<![a-z0-9])${escapeRegex(term)}(?![a-z0-9])`, 'i')
  return pattern.test(text)
}

// Light, safe suffix stripping so "manage" / "managed" / "managing" /
// "management" are treated as the same word — full stemming is overkill
// (and risks false positives) for this use case. Only applied to unigrams;
// words this short are left alone to avoid over-stemming ("as" -> "a").
function stem(word: string): string {
  if (word.length <= 4) return word
  if (/ies$/.test(word)) return word.slice(0, -3) + 'y'
  if (/ing$/.test(word) && word.length > 6) return word.slice(0, -3)
  if (/ement$/.test(word) && word.length > 8) return word.slice(0, -5)
  if (/ed$/.test(word) && word.length > 5) return word.slice(0, -2)
  if (/es$/.test(word) && word.length > 5) return word.slice(0, -2)
  if (/s$/.test(word) && !/ss$/.test(word) && word.length > 4) return word.slice(0, -1)
  return word
}

function stemSetsOf(text: string): { unigrams: Set<string>; bigrams: Set<string> } {
  const words = tokenize(text)
  const unigrams = new Set(words.map(stem))
  const bigrams = new Set<string>()
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.add(`${stem(words[i])} ${stem(words[i + 1])}`)
  }
  return { unigrams, bigrams }
}

function keywordAppears(
  keyword: string,
  text: string,
  stems: { unigrams: Set<string>; bigrams: Set<string> },
): boolean {
  const candidates = [keyword, ...synonymsOf(keyword)]
  for (const term of candidates) {
    if (containsWholeWord(text, term)) return true
    const isBigram = term.includes(' ')
    const stemmed = term
      .split(' ')
      .map(stem)
      .join(' ')
    if (isBigram ? stems.bigrams.has(stemmed) : stems.unigrams.has(stemmed)) return true
  }
  return false
}

export interface KeywordMatchResult {
  matched: string[]
  missing: string[]
  coverage: number // 0-100
}

export function matchKeywords(keywords: string[], data: ResumeData): KeywordMatchResult {
  const text = resumeSearchText(data)
  const stems = stemSetsOf(text)
  const matched: string[] = []
  const missing: string[] = []
  for (const k of keywords) {
    if (keywordAppears(k, text, stems)) matched.push(k)
    else missing.push(k)
  }
  return {
    matched,
    missing,
    coverage: keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0,
  }
}
