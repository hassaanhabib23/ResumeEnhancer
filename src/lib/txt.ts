// Plain-text export — the simplest, most universally-pasteable format (some
// online job-application forms only accept plain text, not PDF/DOCX
// uploads). Built from the same section order every other exporter uses
// (see lib/resumeOutline.ts), with rich-text fields flattened to plain text.
import type { ResumeData, ReorderableSection } from './types'
import { dateRange } from './format'
import { plainTextOf } from './richText'
import { groupSkillsByCategory } from '../components/templates/shared'
import { exportSectionOrder } from './resumeOutline'

const RULE = '-'.repeat(40)

function heading(text: string): string[] {
  return [text.toUpperCase(), RULE]
}

function contactLine(data: ResumeData): string {
  const { contact } = data
  return [contact.email, contact.phone, contact.location, contact.website, contact.linkedin, contact.github]
    .filter(Boolean)
    .join('  |  ')
}

function sectionLines(data: ResumeData, section: ReorderableSection): string[] {
  switch (section) {
    case 'summary': {
      const text = plainTextOf(data.summary)
      if (!text) return []
      return [...heading('Profile'), text, '']
    }
    case 'experience': {
      if (data.experience.length === 0) return []
      const lines = heading('Experience')
      for (const e of data.experience) {
        lines.push(`${[e.role, e.company].filter(Boolean).join(' - ')}  (${dateRange(e.startDate, e.endDate, e.current)})`)
        if (e.location) lines.push(e.location)
        for (const b of e.bullets.map(plainTextOf).filter(Boolean)) lines.push(`  * ${b}`)
        lines.push('')
      }
      return lines
    }
    case 'education': {
      if (data.education.length === 0) return []
      const lines = heading('Education')
      for (const e of data.education) {
        lines.push(`${[e.degree, e.field].filter(Boolean).join(', ')}  (${dateRange(e.startDate, e.endDate, false)})`)
        const meta = [e.school, e.gpa && `GPA: ${e.gpa}`].filter(Boolean).join(' - ')
        if (meta) lines.push(meta)
        lines.push('')
      }
      return lines
    }
    case 'skills': {
      if (data.skills.length === 0) return []
      const lines = heading('Skills')
      for (const g of groupSkillsByCategory(data.skills)) {
        const names = g.skills.map((s) => s.name).filter(Boolean).join(', ')
        lines.push(g.category ? `${g.category}: ${names}` : names)
      }
      lines.push('')
      return lines
    }
    case 'projects': {
      if (data.projects.length === 0) return []
      const lines = heading('Projects')
      for (const p of data.projects) {
        lines.push([p.name, p.tech].filter(Boolean).join('  -  '))
        const desc = plainTextOf(p.description)
        if (desc) lines.push(desc)
        if (p.link) lines.push(p.link)
        lines.push('')
      }
      return lines
    }
    case 'certifications': {
      if (data.certifications.length === 0) return []
      const lines = heading('Certifications')
      for (const c of data.certifications) {
        lines.push([c.name, c.issuer, c.date].filter(Boolean).join(' - '))
      }
      lines.push('')
      return lines
    }
    case 'languages': {
      if (data.languages.length === 0) return []
      const lines = heading('Languages')
      lines.push(data.languages.map((l) => `${l.name} (${l.level})`).join('  |  '))
      lines.push('')
      return lines
    }
  }
}

export function resumeToPlainText(data: ResumeData): string {
  const { contact } = data
  const lines: string[] = [contact.fullName || 'Your Name']
  if (contact.title) lines.push(contact.title)
  const contactText = contactLine(data)
  if (contactText) lines.push(contactText)
  lines.push('')

  for (const section of exportSectionOrder(data)) {
    lines.push(...sectionLines(data, section))
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

export function exportResumeToTxt(data: ResumeData, fileName: string) {
  const blob = new Blob([resumeToPlainText(data)], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileName}.txt`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
