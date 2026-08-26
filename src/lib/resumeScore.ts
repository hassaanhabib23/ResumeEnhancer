// Heuristic, fully client-side "Resume Score" — no AI call, no server. It
// checks the same structural things recruiters and ATS parsers actually
// care about (contact completeness, quantified bullets, action-verb
// strength, section completeness) and gives a 0-100 score with concrete
// fixes. This is best-effort scoring, not a guarantee any specific ATS
// or recruiter will score it the same way — it's disclosed as such in the
// UI.

import type { ResumeData } from './types'
import { startsWithWeakPhrase } from './actionVerbs'

export interface ScoreCheck {
  id: string
  label: string
  status: 'pass' | 'warn' | 'fail'
  detail: string
  weight: number
  earned: number
}

export interface ResumeScoreResult {
  score: number
  grade: string
  checks: ScoreCheck[]
}

const HAS_NUMBER_RE = /\d/

function gradeFor(score: number): string {
  if (score >= 85) return 'Strong'
  if (score >= 65) return 'Good — a few gaps'
  if (score >= 40) return 'Needs work'
  return 'Just getting started'
}

export function computeResumeScore(data: ResumeData): ResumeScoreResult {
  const checks: ScoreCheck[] = []
  const allBullets = data.experience.flatMap((e) => e.bullets.filter(Boolean))

  // 1. Contact completeness — 10 pts
  {
    const weight = 10
    const present = [data.contact.email, data.contact.phone, data.contact.location].filter(
      Boolean,
    ).length
    const earned = Math.round((present / 3) * weight)
    checks.push({
      id: 'contact',
      label: 'Contact information',
      status: present === 3 ? 'pass' : present >= 2 ? 'warn' : 'fail',
      detail:
        present === 3
          ? 'Email, phone, and location are all filled in.'
          : 'Add your email, phone, and location — recruiters and ATS software both expect all three up top.',
      weight,
      earned,
    })
  }

  // 2. Job title — 5 pts
  {
    const weight = 5
    const has = Boolean(data.contact.title.trim())
    checks.push({
      id: 'title',
      label: 'Headline / job title',
      status: has ? 'pass' : 'warn',
      detail: has
        ? 'You have a headline under your name.'
        : "Add a one-line title under your name (e.g. \"Senior Product Designer\") — it's often the first thing a recruiter reads.",
      weight,
      earned: has ? weight : 0,
    })
  }

  // 3. Summary — 10 pts
  {
    const weight = 10
    const len = data.summary.trim().length
    const status = len >= 60 && len <= 600 ? 'pass' : len > 0 ? 'warn' : 'fail'
    checks.push({
      id: 'summary',
      label: 'Summary',
      status,
      detail:
        status === 'pass'
          ? 'Your summary is a solid length.'
          : len === 0
            ? 'Add a 2-3 sentence summary — many ATS systems and recruiters scan this first.'
            : len < 60
              ? 'Your summary is quite short — aim for 2-3 full sentences.'
              : 'Your summary is long — trim it to the most relevant 2-3 sentences.',
      weight,
      earned: status === 'pass' ? weight : status === 'warn' ? Math.round(weight * 0.5) : 0,
    })
  }

  // 4. Experience present — 10 pts
  {
    const weight = 10
    const has = data.experience.length > 0
    checks.push({
      id: 'experience',
      label: 'Work experience',
      status: has ? 'pass' : 'fail',
      detail: has
        ? `${data.experience.length} role${data.experience.length > 1 ? 's' : ''} listed.`
        : 'Add at least one role — an empty experience section is the single biggest red flag for both ATS and recruiters.',
      weight,
      earned: has ? weight : 0,
    })
  }

  // 5. Bullets per role — 10 pts
  {
    const weight = 10
    const rolesWithFew = data.experience.filter((e) => e.bullets.filter(Boolean).length < 2)
    const status =
      data.experience.length === 0
        ? 'warn'
        : rolesWithFew.length === 0
          ? 'pass'
          : rolesWithFew.length < data.experience.length
            ? 'warn'
            : 'fail'
    const ratio =
      data.experience.length === 0 ? 0 : 1 - rolesWithFew.length / data.experience.length
    checks.push({
      id: 'bullets-per-role',
      label: 'Bullet points per role',
      status,
      detail:
        status === 'pass'
          ? 'Every role has at least 2 bullet points.'
          : `${rolesWithFew.length} role${rolesWithFew.length === 1 ? '' : 's'} could use more detail — aim for 2-4 bullets each.`,
      weight,
      earned: Math.round(ratio * weight),
    })
  }

  // 6. Quantified achievements — 20 pts (this is the biggest single factor
  // in whether a resume reads as "impressive" vs. vague)
  {
    const weight = 20
    const withNumbers = allBullets.filter((b) => HAS_NUMBER_RE.test(b)).length
    const ratio = allBullets.length === 0 ? 0 : withNumbers / allBullets.length
    const status = allBullets.length === 0 ? 'fail' : ratio >= 0.4 ? 'pass' : ratio > 0 ? 'warn' : 'fail'
    checks.push({
      id: 'quantified',
      label: 'Quantified achievements',
      status,
      detail:
        allBullets.length === 0
          ? 'No bullet points yet — add specific, measurable accomplishments.'
          : status === 'pass'
            ? `${withNumbers}/${allBullets.length} bullets include a number or percentage — that reads as concrete impact.`
            : `Only ${withNumbers}/${allBullets.length} bullets include a number. Add metrics where you can (%, $, time saved, team size, users) — this is the single biggest lever for a resume that "ranks" well with recruiters.`,
      weight,
      earned: Math.round(ratio * weight),
    })
  }

  // 7. Action-verb strength — 15 pts
  {
    const weight = 15
    const weak = allBullets.filter(startsWithWeakPhrase)
    const ratio = allBullets.length === 0 ? 0 : 1 - weak.length / allBullets.length
    const status = allBullets.length === 0 ? 'fail' : weak.length === 0 ? 'pass' : weak.length <= 2 ? 'warn' : 'fail'
    checks.push({
      id: 'action-verbs',
      label: 'Strong action verbs',
      status,
      detail:
        allBullets.length === 0
          ? 'Add bullet points, then lead each one with a strong verb.'
          : weak.length === 0
            ? 'No bullets start with a weak phrase like "responsible for" or "worked on".'
            : `${weak.length} bullet${weak.length === 1 ? '' : 's'} start${weak.length === 1 ? 's' : ''} with a weak phrase ("responsible for", "worked on"...) — swap in a stronger verb from the reference list below.`,
      weight,
      earned: Math.round(ratio * weight),
    })
  }

  // 8. Skills — 10 pts
  {
    const weight = 10
    const count = data.skills.length
    const status = count >= 5 ? 'pass' : count > 0 ? 'warn' : 'fail'
    checks.push({
      id: 'skills',
      label: 'Skills list',
      status,
      detail:
        status === 'pass'
          ? `${count} skills listed.`
          : count === 0
            ? 'Add your key skills — this is also where job-description keywords usually get matched.'
            : `Only ${count} skills listed — aim for at least 5-8 relevant ones.`,
      weight,
      earned: Math.min(weight, Math.round((count / 5) * weight)),
    })
  }

  // 9. Education — 5 pts
  {
    const weight = 5
    const has = data.education.length > 0
    checks.push({
      id: 'education',
      label: 'Education',
      status: has ? 'pass' : 'warn',
      detail: has ? 'Education section is filled in.' : 'Add your education, even briefly — most ATS templates expect this section to exist.',
      weight,
      earned: has ? weight : 0,
    })
  }

  // 10. Bullet length sanity — 5 pts
  {
    const weight = 5
    const tooShort = allBullets.filter((b) => b.trim().length > 0 && b.trim().length < 20).length
    const status = allBullets.length === 0 ? 'warn' : tooShort === 0 ? 'pass' : 'warn'
    checks.push({
      id: 'bullet-length',
      label: 'Bullet point detail',
      status,
      detail:
        tooShort === 0
          ? 'Bullet points have enough detail to be meaningful.'
          : `${tooShort} bullet${tooShort === 1 ? ' is' : 's are'} very short — expand with what you did and the result.`,
      weight,
      earned: allBullets.length === 0 ? 0 : tooShort === 0 ? weight : Math.round(weight * 0.4),
    })
  }

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
  const totalEarned = checks.reduce((s, c) => s + c.earned, 0)
  const score = totalWeight === 0 ? 0 : Math.round((totalEarned / totalWeight) * 100)

  return { score, grade: gradeFor(score), checks }
}
