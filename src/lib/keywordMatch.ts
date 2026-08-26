// Best-effort, fully client-side job-description keyword matcher. Not an
// AI service — this is word/phrase frequency analysis: it tokenizes the
// pasted job description, strips common English stopwords, ranks what's
// left by frequency (single words and two-word phrases), and checks
// whether each candidate keyword appears anywhere in the resume's text
// (skills, summary, experience bullets, education, projects,
// certifications). Good enough to catch obvious gaps, not a substitute
// for actually reading the job posting.

import type { ResumeData } from './types'

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
    data.summary,
    ...data.skills.map((s) => s.name),
    ...data.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...data.education.map((e) => `${e.degree} ${e.field} ${e.school}`),
    ...data.projects.map((p) => `${p.name} ${p.description} ${p.tech}`),
    ...data.certifications.map((c) => c.name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export interface KeywordMatchResult {
  matched: string[]
  missing: string[]
  coverage: number // 0-100
}

export function matchKeywords(keywords: string[], data: ResumeData): KeywordMatchResult {
  const text = resumeSearchText(data)
  const matched: string[] = []
  const missing: string[] = []
  for (const k of keywords) {
    if (text.includes(k)) matched.push(k)
    else missing.push(k)
  }
  return {
    matched,
    missing,
    coverage: keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0,
  }
}
