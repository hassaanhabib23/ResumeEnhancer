import { useMemo, useState } from 'react'
import type { ResumeData } from '../../lib/types'
import { computeResumeScore } from '../../lib/resumeScore'
import { extractKeywords, matchKeywords } from '../../lib/keywordMatch'
import { ACTION_VERBS } from '../../lib/actionVerbs'
import Button from '../ui/Button'

const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  pass: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  warn: { dot: 'bg-amber-500', text: 'text-amber-700' },
  fail: { dot: 'bg-red-500', text: 'text-red-600' },
}

function ScoreRing({ score }: { score: number }) {
  const r = 42
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score >= 85 ? '#10b981' : score >= 65 ? '#6636cc' : score >= 40 ? '#d9a441' : '#dc2626'
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#eeecf1" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="47" textAnchor="middle" fontSize="24" fontWeight="700" fill="#1c1926">
        {score}
      </text>
      <text x="50" y="65" textAnchor="middle" fontSize="10" fill="#8a8593">
        / 100
      </text>
    </svg>
  )
}

type Tab = 'score' | 'keywords' | 'verbs'

export default function ResumeScorePanel({
  resume,
  onClose,
}: {
  resume: ResumeData
  onClose: () => void
}) {
  const [tab, setTab] = useState<Tab>('score')
  const [jobText, setJobText] = useState('')
  const result = useMemo(() => computeResumeScore(resume), [resume])
  const keywordResult = useMemo(() => {
    if (!jobText.trim()) return null
    const keywords = extractKeywords(jobText)
    return { keywords, ...matchKeywords(keywords, resume) }
  }, [jobText, resume])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/40"
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="text-base font-semibold text-ink-900">Resume Score</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-1 border-b border-ink-100 px-5 pt-3">
          {(
            [
              ['score', 'Score & checklist'],
              ['keywords', 'Job match'],
              ['verbs', 'Action verbs'],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
                tab === id
                  ? 'border-b-2 border-brand-600 text-brand-700'
                  : 'text-ink-400 hover:text-ink-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {tab === 'score' && (
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <ScoreRing score={result.score} />
                <div>
                  <p className="text-lg font-semibold text-ink-900">{result.grade}</p>
                  <p className="mt-1 text-sm text-ink-500">
                    A heuristic check of the same things ATS software and recruiters actually
                    scan for — not a guarantee of how any specific system will score it.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {result.checks.map((c) => {
                  const style = STATUS_STYLES[c.status]
                  return (
                    <div key={c.id} className="rounded-xl border border-ink-100 p-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                        <span className="text-sm font-medium text-ink-900">{c.label}</span>
                        <span className={`ml-auto text-xs font-medium ${style.text}`}>
                          {c.earned}/{c.weight}
                        </span>
                      </div>
                      <p className="mt-1.5 pl-4 text-xs leading-relaxed text-ink-500">
                        {c.detail}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'keywords' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-ink-800">Paste a job description</p>
                <p className="mt-1 text-xs text-ink-500">
                  We'll pull out the most frequent meaningful words and phrases and check which
                  ones already show up in your resume — word/phrase matching, not an AI reading
                  of the posting.
                </p>
                <textarea
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  rows={7}
                  placeholder="Paste the full job posting here…"
                  className="mt-2 w-full rounded-lg border border-ink-200 p-3 text-sm text-ink-800 focus:border-brand-400 focus:outline-none"
                />
              </div>

              {keywordResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-ink-50 p-3">
                    <div className="text-2xl font-bold text-ink-900">{keywordResult.coverage}%</div>
                    <div className="text-xs text-ink-500">
                      of the top keywords from this posting already appear in your resume.
                    </div>
                  </div>

                  {keywordResult.missing.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-500">
                        Consider adding
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {keywordResult.missing.map((k) => (
                          <span
                            key={k}
                            className="rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-700"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {keywordResult.matched.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                        Already covered
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {keywordResult.matched.map((k) => (
                          <span
                            key={k}
                            className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'verbs' && (
            <div className="space-y-5">
              <p className="text-xs text-ink-500">
                Swap weak openers ("responsible for", "worked on", "helped with"...) for a
                stronger verb from the matching category below.
              </p>
              {Object.entries(ACTION_VERBS).map(([category, verbs]) => (
                <div key={category}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {verbs.map((v) => (
                      <span
                        key={v}
                        className="rounded-full border border-ink-200 px-2.5 py-1 text-xs text-ink-700"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-ink-100 px-5 py-4">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
