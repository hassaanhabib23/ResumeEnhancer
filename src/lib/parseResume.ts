// Best-effort heuristic parser: turns raw resume text (extracted from a
// PDF/DOCX/text upload) into a partial ResumeData. There's no AI/service
// call here — this is regex + layout heuristics, so results are a rough
// first draft the user is expected to review and correct in the builder,
// not a guarantee of accuracy.

import type {
  ResumeData,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  LanguageItem,
} from './types'
import { makeId } from './sampleData'

// Certifications also absorbs "Awards / Honors" style sections — ResumeData
// has no dedicated field for those, and certifications is the closest fit
// (short "name — issuer, date" lines), so real content lands somewhere
// reviewable instead of being silently dropped.
const SECTION_HEADERS: Record<string, string[]> = {
  summary: [
    'summary',
    'profile',
    'objective',
    'about me',
    'about',
    'career summary',
    'professional summary',
    'executive summary',
    'personal statement',
    'summary of qualifications',
  ],
  experience: [
    'experience',
    'work experience',
    'professional experience',
    'employment history',
    'employment',
    'work history',
    'relevant experience',
    'career history',
    'work',
  ],
  education: [
    'education',
    'academic background',
    'academic history',
    'education and training',
    'educational background',
  ],
  skills: [
    'skills',
    'technical skills',
    'core competencies',
    'competencies',
    'key skills',
    'skills and tools',
    'skills & tools',
    'areas of expertise',
    'expertise',
    'technical proficiencies',
    'proficiencies',
  ],
  projects: [
    'projects',
    'personal projects',
    'selected projects',
    'key projects',
    'academic projects',
    'project experience',
  ],
  certifications: [
    'certifications',
    'certificates',
    'licenses',
    'licenses & certifications',
    'licenses and certifications',
    'certifications & licenses',
    'awards',
    'honors',
    'awards & honors',
    'awards and honors',
    'honors & awards',
    'honors and awards',
    'achievements',
  ],
  languages: ['languages', 'language skills', 'language proficiency'],
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i
const PHONE_RE = /(\+?\(?\d[\d\s().-]{7,}\d)/
const LINKEDIN_RE = /(linkedin\.com\/[a-z0-9\-_/]+)/i
const GITHUB_RE = /((?:github|gitlab)\.com\/[a-z0-9\-_/]+)/i
const WEBSITE_RE = /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s,;]*)?)\b/i
const DATE_TOKEN_RE =
  /\b(19|20)\d{2}\b|present|current|now\b/i
const YEAR_RE = /\b(19|20)\d{2}\b/g
const PRESENT_RE = /present|current\b|now\b/i
const MONTH_RE =
  /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b\.?/gi
const BULLET_PREFIX_RE = /^[•\-*◦▪·‣o]\s+/
// A short "City, ST" / "City, Country" segment — same shape as the contact
// header's location detector, but requiring the word after the comma to be
// capitalized (a place name) so it doesn't false-positive on ordinary bullet
// sentences that happen to contain a comma (e.g. "..., exceeding targets").
const LOCATION_RE = /,\s*[A-Z]{2}\b|,\s*[A-Z][a-z]+$/

// Strips date-range tokens (years, "Present"/"Current", month names) out of
// a line, leaving whatever role/company/title text is left. Used both to
// pull the non-date text out of a dated header line, and to tell whether a
// line is *just* a date range with nothing else on it.
function stripDateTokens(line: string): string {
  return line.replace(YEAR_RE, '').replace(PRESENT_RE, '').replace(MONTH_RE, '').replace(/\bmonths?\b/gi, '')
}

// Best-effort "Jan 2021 - Present" / "2021 - 2024" / "2019" date-range
// extraction from a single line. Only years are reliably recognized (month
// names vary too much to parse safely); the builder's date inputs are fine
// with a year-only value.
function extractDateRange(line: string): { startDate: string; endDate: string; current: boolean } {
  const years = [...line.matchAll(YEAR_RE)].map((m) => m[0])
  const isCurrent = PRESENT_RE.test(line)
  if (years.length >= 2) {
    return { startDate: years[0], endDate: years[1], current: false }
  }
  if (years.length === 1) {
    return { startDate: years[0], endDate: isCurrent ? '' : years[0], current: isCurrent }
  }
  return { startDate: '', endDate: '', current: isCurrent }
}

function normalizeLines(text: string): string[] {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l, i, arr) => l.length > 0 || (i > 0 && arr[i - 1].length > 0)) // collapse repeated blanks
}

function findSectionKey(line: string): string | null {
  const clean = line
    .toLowerCase()
    .replace(/^[•\-*◦▪·‣]\s*/, '') // stray leading bullet
    .replace(/^\(?(?:[ivx]+|[0-9]{1,2})[.)]\s*/, '') // "1." / "I." / "(2)" numbering
    .replace(/\([^)]*\)/g, '') // trailing/parenthetical decoration, e.g. "Skills (Technical)"
    .replace(/[:：]\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (clean.length > 40 || clean.length === 0) return null
  for (const [key, headers] of Object.entries(SECTION_HEADERS)) {
    if (headers.includes(clean)) return key
  }
  return null
}

function splitSections(lines: string[]): { header: string[]; sections: Record<string, string[]> } {
  const sections: Record<string, string[]> = {}
  const header: string[] = []
  let current: string | null = null

  for (const line of lines) {
    const key = findSectionKey(line)
    if (key) {
      current = key
      sections[key] = sections[key] ?? []
      continue
    }
    if (current) {
      sections[current].push(line)
    } else {
      header.push(line)
    }
  }
  return { header, sections }
}

function extractContactFromHeader(headerLines: string[]) {
  const joined = headerLines.join('\n')
  const email = joined.match(EMAIL_RE)?.[0] ?? ''
  const phone = joined.match(PHONE_RE)?.[0]?.trim() ?? ''
  const linkedin = joined.match(LINKEDIN_RE)?.[0] ?? ''
  const github = joined.match(GITHUB_RE)?.[0] ?? ''

  let website = ''
  for (const line of headerLines) {
    // Skip the whole line if it's an email, LinkedIn, or GitHub URL —
    // WEBSITE_RE's generic "word.word" pattern can otherwise match a
    // fragment like "jordan.rivera" out of "jordan.rivera@example.com", or
    // pick up github.com itself as the "website".
    if (EMAIL_RE.test(line) || LINKEDIN_RE.test(line) || GITHUB_RE.test(line)) continue
    const m = line.match(WEBSITE_RE)
    if (m) {
      website = m[0]
      break
    }
  }

  // Name: first non-empty line that isn't itself an email/phone/url and is
  // reasonably short (a real name, not a paragraph).
  const nonEmpty = headerLines.filter(Boolean)
  const fullName =
    nonEmpty.find(
      (l) => l.length < 60 && !EMAIL_RE.test(l) && !PHONE_RE.test(l) && !/https?:\/\//.test(l),
    ) ?? ''

  // Title: the next short line after the name that isn't contact info.
  const nameIdx = nonEmpty.indexOf(fullName)
  const title =
    nonEmpty
      .slice(nameIdx + 1)
      .find(
        (l) =>
          l.length < 80 &&
          !EMAIL_RE.test(l) &&
          !PHONE_RE.test(l) &&
          !LINKEDIN_RE.test(l) &&
          !GITHUB_RE.test(l) &&
          !/https?:\/\//.test(l),
      ) ?? ''

  // Location: a "City, ST" / "City, Country" style segment. Contact header
  // lines are often "email | phone | City, ST" on one line — search each
  // pipe/bullet-separated segment individually rather than the whole line,
  // so location doesn't end up as the entire contact-info line.
  let location = ''
  outer: for (const line of headerLines) {
    for (const seg of line.split(/\s*[|•·]\s*/)) {
      const trimmed = seg.trim()
      if (!trimmed) continue
      if (
        EMAIL_RE.test(trimmed) ||
        PHONE_RE.test(trimmed) ||
        LINKEDIN_RE.test(trimmed) ||
        GITHUB_RE.test(trimmed) ||
        /https?:\/\//.test(trimmed)
      )
        continue
      if (/,\s*[A-Z]{2}\b/.test(trimmed) || /,\s*[A-Za-z]{3,}$/.test(trimmed)) {
        location = trimmed
        break outer
      }
    }
  }

  return { fullName, title, email, phone, linkedin, github, website, location }
}

// "Role at Company" / "Role, Company" / "Role — Company" — best-effort split
// of a plain (no date, no bullet) line into role/company for when a resume
// puts the title/company on their own line, separate from the date range.
function splitRoleCompany(line: string): { role: string; company: string } {
  const parts = line.split(/\s+at\s+|\s*[|•·—]\s*|,\s*/i).filter(Boolean)
  if (parts.length >= 2) return { role: parts[0].trim(), company: parts[1].trim() }
  return { role: line, company: '' }
}

// Legal-entity suffixes ("Acme Inc", "Globex Corporation") — when a standalone
// line has no separator to split on, this tells us it's more likely the
// company name than the job title, since some resumes list company before
// role rather than role before company.
const COMPANY_SUFFIX_RE = /\b(inc|llc|ltd|corp(?:oration)?|co\.?|company|group|technologies|solutions|systems|labs|studios?|partners)\.?\s*$/i

function roleCompanyFromSingleLine(line: string): { role: string; company: string } {
  const { role, company } = splitRoleCompany(line)
  if (!company && COMPANY_SUFFIX_RE.test(line)) return { role: '', company: role }
  return { role, company }
}

function parseExperienceSection(lines: string[]): ExperienceItem[] {
  const items: ExperienceItem[] = []
  let current: ExperienceItem | null = null
  // A blank line inside the section is a strong signal that one entry ended
  // and the next is about to start — without it, "Role B" / "Company B"
  // lines that follow a *complete* previous entry (dates + bullets already
  // filled in) have nothing else to distinguish them from stray content, and
  // silently get glued onto the previous entry as bullets.
  let pendingBoundary = false

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      if (current) pendingBoundary = true
      continue
    }
    const isBullet = BULLET_PREFIX_RE.test(line)
    const looksLikeEntryHeader = !isBullet && DATE_TOKEN_RE.test(line) && line.length < 120

    if (looksLikeEntryHeader) {
      const { startDate, endDate, current: isCurrent } = extractDateRange(line)
      // "Role at Company | Jan 2020 - Present" style — best-effort split.
      const withoutDates = stripDateTokens(line).trim()
      const allParts = withoutDates.split(/\s*[|•·—-]\s*/).filter(Boolean)
      // Pull a location-shaped segment (e.g. "City, ST") out of the
      // separator-delimited parts before splitting the rest into role/company,
      // so it doesn't get mistaken for the company name.
      let headerLocation = ''
      const parts: string[] = []
      for (const p of allParts) {
        if (!headerLocation && LOCATION_RE.test(p)) headerLocation = p
        else parts.push(p)
      }

      // Some resumes put "Role, Company" on one line and the date range on
      // the very next line by itself (common with right-aligned dates that
      // PDF text extraction flattens onto their own line). If the line is
      // essentially just a date (nothing but separators left after removing
      // it), no blank line came before it, and the entry we're already
      // building has no dates/bullets yet, treat this as continuing that
      // entry rather than starting a new one.
      const remainderIsJustSeparators = withoutDates.replace(/[|•·—\-,\s]/g, '').length === 0
      if (
        current &&
        !pendingBoundary &&
        remainderIsJustSeparators &&
        !current.startDate &&
        !current.endDate &&
        current.bullets.length === 0
      ) {
        current.startDate = startDate
        current.endDate = endDate
        current.current = isCurrent
        continue
      }

      if (current) items.push(current)
      pendingBoundary = false
      current = {
        id: makeId(),
        company: '',
        role: '',
        location: '',
        startDate,
        endDate,
        current: isCurrent,
        bullets: [],
      }
      if (parts.length >= 2) {
        current.role = parts[0]
        current.company = parts[1]
      } else if (parts.length === 1) {
        // No pipe/dash separator survived — still try "Role, Company" on a
        // single comma-separated chunk before giving up and dumping it all
        // into role.
        const commaSplit = parts[0].split(/,\s*/).filter(Boolean)
        if (commaSplit.length >= 2) {
          current.role = commaSplit[0].trim()
          current.company = commaSplit.slice(1).join(', ').trim()
        } else {
          current.role = parts[0]
        }
      }
      if (headerLocation) current.location = headerLocation
      continue
    }

    if (!current) {
      // Bullet/content appeared before we detected a dated header — start
      // an entry anyway so the text isn't lost.
      current = {
        id: makeId(),
        company: '',
        role: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        bullets: [],
      }
    }

    const looksLikeShortFragment = line.length < 80 && !/[.!?]$/.test(line)

    if (isBullet) {
      pendingBoundary = false
      current.bullets.push(line.replace(BULLET_PREFIX_RE, ''))
    } else if (
      !pendingBoundary &&
      !current.location &&
      current.bullets.length === 0 &&
      line.length < 60 &&
      LOCATION_RE.test(line)
    ) {
      // A "City, ST" line on its own, right after the role/company header —
      // common when a right-aligned location column gets flattened onto its
      // own line by PDF text extraction.
      current.location = line.replace(/\s*[|•·—-]\s*$/, '').trim()
    } else if (!current.company && !current.role) {
      pendingBoundary = false
      const { role, company } = roleCompanyFromSingleLine(line)
      current.role = role
      current.company = company
    } else if (pendingBoundary && looksLikeShortFragment) {
      // A blank line separated this from the previous (already-complete)
      // entry, and this line is short like a title/company, not a bullet
      // sentence — a new entry is starting.
      items.push(current)
      const { role, company } = roleCompanyFromSingleLine(line)
      current = { id: makeId(), company, role, location: '', startDate: '', endDate: '', current: false, bullets: [] }
      pendingBoundary = false
    } else if ((!current.company || !current.role) && current.bullets.length === 0 && looksLikeShortFragment) {
      // No blank line yet — the field still missing (role or company) is
      // arriving on its own line right after the first.
      if (!current.company) current.company = line
      else current.role = line
    } else {
      pendingBoundary = false
      current.bullets.push(line)
    }
  }
  if (current) items.push(current)
  return items
}

const DEGREE_HINT_RE =
  /\b(b\.?[as]\.?|bachelor|m\.?[as]\.?|master|mba|ph\.?d|associate|diploma)\b/i
const SCHOOL_HINT_RE = /\b(university|college|institute|school|academy|polytechnic)\b/i

// Fills whichever of school/degree+field this line matches into an entry
// that's being built up across possibly-separate lines (degree on one line,
// school on the next is a very common resume layout — that's one education
// entry, not two).
function applyEducationHint(item: EducationItem, line: string, isSchoolLine: boolean) {
  const cleaned = line
    .replace(YEAR_RE, '')
    .replace(PRESENT_RE, '')
    .replace(/\s*[|•·—-]\s*$/, '')
    .trim()
  if (isSchoolLine) {
    if (!item.school) item.school = cleaned
  } else if (!item.degree) {
    // "B.S. in Computer Science" — split degree from field of study.
    const inSplit = cleaned.split(/\s+in\s+/i)
    if (inSplit.length >= 2) {
      item.degree = inSplit[0].trim()
      item.field = inSplit.slice(1).join(' in ').trim()
    } else {
      item.degree = cleaned
    }
  }
  const gpaMatch = line.match(/gpa[:\s]*([\d.]+)/i)
  if (gpaMatch) item.gpa = gpaMatch[1]
}

// Some resumes put degree and school on the SAME comma-separated line, e.g.
// "BA Computer Science, Small College, 2013 - 2017" — split that into
// degree/field and school instead of dumping the whole line into one field.
function applyCombinedEducationLine(item: EducationItem, line: string) {
  const cleaned = line
    .replace(YEAR_RE, '')
    .replace(PRESENT_RE, '')
    .replace(/[\s,|•·—-]+$/, '')
    .trim()
  const parts = cleaned.split(/,\s*/).filter(Boolean)
  const schoolPart = parts.find((p) => SCHOOL_HINT_RE.test(p))
  const degreePart = parts.find((p) => DEGREE_HINT_RE.test(p)) ?? parts[0]
  if (schoolPart) item.school = schoolPart.trim()
  if (degreePart) {
    const inSplit = degreePart.split(/\s+in\s+/i)
    if (inSplit.length >= 2) {
      item.degree = inSplit[0].trim()
      item.field = inSplit.slice(1).join(' in ').trim()
    } else {
      item.degree = degreePart.trim()
    }
  }
  const gpaMatch = line.match(/gpa[:\s]*([\d.]+)/i)
  if (gpaMatch) item.gpa = gpaMatch[1]
}

function parseEducationSection(lines: string[]): EducationItem[] {
  const items: EducationItem[] = []
  let current: EducationItem | null = null
  let pendingBoundary = false

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      if (current) pendingBoundary = true
      continue
    }
    const isSchoolLine = SCHOOL_HINT_RE.test(line)
    const isDegreeLine = DEGREE_HINT_RE.test(line)
    const hintMatches = isSchoolLine || isDegreeLine
    const bothHint = isSchoolLine && isDegreeLine

    // A hint line starts a brand-new entry only if there's no current entry
    // to attach to, a blank line just separated it from the last one, or
    // the current entry already has this same field filled (i.e. this is
    // clearly a different school/degree, not the other half of the current
    // one).
    const startsNewEntry =
      hintMatches &&
      (!current ||
        pendingBoundary ||
        (isSchoolLine && current.school) ||
        (isDegreeLine && current.degree))

    if (startsNewEntry) {
      if (current) items.push(current)
      const { startDate, endDate } = extractDateRange(line)
      current = { id: makeId(), school: '', degree: '', field: '', location: '', startDate, endDate, gpa: '' }
      pendingBoundary = false
      if (bothHint) applyCombinedEducationLine(current, line)
      else applyEducationHint(current, line, isSchoolLine)
      continue
    }

    pendingBoundary = false

    if (hintMatches && current) {
      if (bothHint) applyCombinedEducationLine(current, line)
      else applyEducationHint(current, line, isSchoolLine)
      continue
    }

    if (current) {
      // Date range on its own line, following the school/degree line (common
      // when a right-aligned date column gets flattened onto its own line).
      if (!current.startDate && !current.endDate && DATE_TOKEN_RE.test(line) && line.length < 60) {
        const { startDate, endDate } = extractDateRange(line)
        if (startDate || endDate) {
          current.startDate = startDate
          current.endDate = endDate
          continue
        }
      }
    }
  }
  if (current) items.push(current)
  return items
}

function parseSkillsSection(lines: string[]): SkillItem[] {
  // Some resumes group skills by category, one category per line, e.g.
  // "Programming Languages: Python, JavaScript, Go" or "Frameworks — React,
  // Node.js". Strip a short leading "Label:" / "Label —" prefix so the
  // category name itself doesn't get parsed in as a fake skill.
  const withoutCategoryLabels = lines.map((line) =>
    line.replace(/^[A-Za-z][A-Za-z /&]{1,28}[:—]\s+/, ''),
  )
  const text = withoutCategoryLabels.join(', ')
  const names = text
    .split(/[,•|·\n]/)
    .map((s) => s.replace(BULLET_PREFIX_RE, '').trim())
    .filter((s) => s.length > 0 && s.length < 40)
  const seen = new Set<string>()
  const skills: SkillItem[] = []
  for (const name of names) {
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    skills.push({ id: makeId(), name, level: 3 })
  }
  return skills.slice(0, 24)
}

const PROJECT_URL_RE = /https?:\/\/[^\s,;]+|(?:github|gitlab)\.com\/[^\s,;]+/i
// Common lowercase connector/function words that show up in sentences but
// essentially never inside a "React, Node.js, PostgreSQL" style tech-stack
// item — used below to tell the two apart.
const SENTENCE_CONNECTOR_RE =
  /\b(a|an|the|for|that|with|on|of|and|to|from|is|are|was|were|this|used|using|which|by|in)\b/i

// A "tech used" line reads like a short, comma/pipe-separated stack list —
// each item just a couple of words with no sentence-like connector words —
// rather than a prose description that merely happens to contain a comma.
function looksLikeTechList(line: string): boolean {
  if (line.length > 90) return false
  const parts = line.split(/[,|•·]/).map((s) => s.trim()).filter(Boolean)
  if (parts.length < 2) return false
  return parts.every((p) => p.split(/\s+/).length <= 4 && !SENTENCE_CONNECTOR_RE.test(p))
}

// Builds a fresh project entry from its title/first line — handling both a
// plain title ("Recipe Finder App") and a one-line "Title: description"
// bullet some resumes use instead of a multi-line block.
function startProjectFromLine(clean: string): ProjectItem {
  const link = clean.match(PROJECT_URL_RE)?.[0] ?? ''
  const withoutUrl = clean.replace(PROJECT_URL_RE, '').trim()
  const colonSplit = withoutUrl.split(/:\s+/)
  if (colonSplit.length >= 2 && colonSplit[0].length < 60) {
    return { id: makeId(), name: colonSplit[0].trim(), description: colonSplit.slice(1).join(': ').trim(), link, tech: '' }
  }
  const titleOnly = stripDateTokens(withoutUrl).replace(/\s*[|•·—-]\s*$/, '').trim()
  return { id: makeId(), name: titleOnly || withoutUrl, description: '', link, tech: '' }
}

function parseProjectsSection(lines: string[]): ProjectItem[] {
  const items: ProjectItem[] = []
  let current: ProjectItem | null = null
  // Without tracking blank lines, a second project's title line (short,
  // no separators — indistinguishable from a description line) gets glued
  // onto the previous project's description instead of starting a new entry.
  let pendingBoundary = false

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      if (current) pendingBoundary = true
      continue
    }
    const isBullet = BULLET_PREFIX_RE.test(line)
    const clean = line.replace(BULLET_PREFIX_RE, '')
    const isTechList = !isBullet && looksLikeTechList(clean)
    // A new project starts at a short, non-bullet, non-tech-list title line.
    const looksLikeTitle = !isBullet && !isTechList && clean.length < 100

    const startsNewEntry = looksLikeTitle && (!current || pendingBoundary || current.description || current.tech)

    if (startsNewEntry) {
      if (current) items.push(current)
      current = startProjectFromLine(clean)
      pendingBoundary = false
      continue
    }

    pendingBoundary = false

    if (!current) {
      current = startProjectFromLine(clean)
      continue
    }

    const urlMatch = clean.match(PROJECT_URL_RE)
    if (urlMatch && !current.link) current.link = urlMatch[0]

    if (!current.tech && isTechList) {
      current.tech = clean.replace(PROJECT_URL_RE, '').trim()
    } else {
      const withoutUrl = clean.replace(PROJECT_URL_RE, '').trim()
      if (withoutUrl) current.description = current.description ? `${current.description} ${withoutUrl}` : withoutUrl
    }
  }
  if (current) items.push(current)
  return items
}

function parseCertificationsSection(lines: string[]): CertificationItem[] {
  return lines
    .filter(Boolean)
    .map((line) => {
      const clean = line.replace(BULLET_PREFIX_RE, '')
      const dateMatch = clean.match(DATE_TOKEN_RE)
      const withoutDate = clean
        .replace(DATE_TOKEN_RE, '')
        .replace(/,\s*$/, '')
        .trim()
      let [name, issuer] = withoutDate.split(/\s*[—|]\s*|\s+-\s+/)
      if (!issuer) {
        // No dash/pipe separator — fall back to splitting on the first
        // comma, e.g. "Employee of the Year, Acme Corp".
        const commaIdx = withoutDate.indexOf(',')
        if (commaIdx > 0) {
          name = withoutDate.slice(0, commaIdx)
          issuer = withoutDate.slice(commaIdx + 1)
        }
      }
      return {
        id: makeId(),
        name: (name?.trim() || withoutDate).replace(/,\s*$/, ''),
        issuer: (issuer?.trim() || '').replace(/,\s*$/, ''),
        date: dateMatch?.[0] ?? '',
      }
    })
    .slice(0, 12)
}

function parseLanguagesSection(lines: string[]): LanguageItem[] {
  return lines
    .join(', ')
    .split(/[,•|\n]/)
    .map((s) => s.replace(BULLET_PREFIX_RE, '').trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((entry) => {
      const [name, level] = entry.split(/\s*[-—(:)]\s*/).filter(Boolean)
      return { id: makeId(), name: name?.trim() || entry, level: level?.replace(')', '').trim() || 'Conversational' }
    })
}

export interface ParsedResume {
  patch: Partial<ResumeData>
  warnings: string[]
}

export function parseResumeText(text: string): ParsedResume {
  const lines = normalizeLines(text)
  const { header, sections } = splitSections(lines)
  const contact = extractContactFromHeader(header)
  const warnings: string[] = []

  const summaryLines = sections.summary ?? []
  const experience = sections.experience ? parseExperienceSection(sections.experience) : []
  const education = sections.education ? parseEducationSection(sections.education) : []
  const skills = sections.skills ? parseSkillsSection(sections.skills) : []
  const projects = sections.projects ? parseProjectsSection(sections.projects) : []
  const certifications = sections.certifications
    ? parseCertificationsSection(sections.certifications)
    : []
  const languages = sections.languages ? parseLanguagesSection(sections.languages) : []

  if (!contact.fullName) warnings.push("Couldn't confidently detect your name — please check Contact.")
  if (!contact.email) warnings.push("Couldn't find an email address.")
  if (experience.length === 0) warnings.push('No work experience section was detected.')
  if (education.length === 0) warnings.push('No education section was detected.')

  const patch: Partial<ResumeData> = {
    name: contact.fullName ? `${contact.fullName}'s Resume` : 'Imported Resume',
    contact: {
      fullName: contact.fullName,
      title: contact.title,
      email: contact.email,
      phone: contact.phone,
      location: contact.location,
      website: contact.website,
      linkedin: contact.linkedin,
      github: contact.github,
      photo: '',
    },
    summary: summaryLines.join(' ').trim(),
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
  }

  return { patch, warnings }
}
