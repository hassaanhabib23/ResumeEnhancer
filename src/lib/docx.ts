import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import type { ResumeData, ReorderableSection } from './types'
import { dateRange } from './format'
import { groupSkillsByCategory } from '../components/templates/shared'

const DEFAULT_ORDER: ReorderableSection[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
]

// Walks a sanitized rich-text fragment (bold/italic/underline only — see
// lib/richText.ts) into docx TextRuns, so formatting applied in the builder
// carries over into the Word export instead of being flattened to plain text.
function runsFromRichText(html: string): TextRun[] {
  const template = document.createElement('template')
  template.innerHTML = html
  const runs: TextRun[] = []

  function walk(node: Node, bold: boolean, italics: boolean, underline: boolean) {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent
        if (text) runs.push(new TextRun({ text, bold, italics, underline: underline ? {} : undefined }))
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        if (el.tagName === 'BR') {
          runs.push(new TextRun({ text: '', break: 1 }))
          continue
        }
        const isBold = bold || el.tagName === 'B' || el.tagName === 'STRONG'
        const isItalic = italics || el.tagName === 'I' || el.tagName === 'EM'
        const isUnderline = underline || el.tagName === 'U'
        walk(el, isBold, isItalic, isUnderline)
      }
    }
  }

  walk(template.content, false, false, false)
  return runs.length ? runs : [new TextRun('')]
}

function heading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, color: '6636CC' })],
  })
}

function contactLine(data: ResumeData): string {
  const { contact } = data
  return [contact.email, contact.phone, contact.location, contact.website, contact.linkedin, contact.github]
    .filter(Boolean)
    .join('  ·  ')
}

function orderedSections(data: ResumeData): ReorderableSection[] {
  const chosen = data.sectionOrder ?? DEFAULT_ORDER
  const hidden = new Set(data.hiddenSections ?? [])
  const seen = new Set<ReorderableSection>()
  const result: ReorderableSection[] = []
  for (const s of chosen) {
    if (!seen.has(s) && !hidden.has(s)) {
      result.push(s)
      seen.add(s)
    }
  }
  for (const s of DEFAULT_ORDER) {
    if (!seen.has(s) && !hidden.has(s)) {
      result.push(s)
      seen.add(s)
    }
  }
  return result
}

function sectionParagraphs(data: ResumeData, section: ReorderableSection): Paragraph[] {
  switch (section) {
    case 'summary': {
      if (!data.summary.trim()) return []
      return [heading('Profile'), new Paragraph({ children: runsFromRichText(data.summary) })]
    }
    case 'experience': {
      if (data.experience.length === 0) return []
      const paras = [heading('Experience')]
      for (const e of data.experience) {
        paras.push(
          new Paragraph({
            spacing: { before: 160 },
            children: [
              new TextRun({ text: [e.role, e.company].filter(Boolean).join(' · '), bold: true }),
              new TextRun({ text: `\t${dateRange(e.startDate, e.endDate, e.current)}`, color: '666666' }),
            ],
            tabStops: [{ type: 'right', position: 9000 }],
          }),
        )
        if (e.location) {
          paras.push(new Paragraph({ children: [new TextRun({ text: e.location, color: '666666' })] }))
        }
        for (const b of e.bullets.filter(Boolean)) {
          paras.push(new Paragraph({ bullet: { level: 0 }, children: runsFromRichText(b) }))
        }
      }
      return paras
    }
    case 'education': {
      if (data.education.length === 0) return []
      const paras = [heading('Education')]
      for (const e of data.education) {
        paras.push(
          new Paragraph({
            spacing: { before: 120 },
            children: [
              new TextRun({ text: [e.degree, e.field].filter(Boolean).join(', '), bold: true }),
              new TextRun({ text: `\t${dateRange(e.startDate, e.endDate, false)}`, color: '666666' }),
            ],
            tabStops: [{ type: 'right', position: 9000 }],
          }),
        )
        const meta = [e.school, e.gpa && `GPA: ${e.gpa}`].filter(Boolean).join(' · ')
        if (meta) paras.push(new Paragraph({ children: [new TextRun({ text: meta, color: '666666' })] }))
      }
      return paras
    }
    case 'skills': {
      if (data.skills.length === 0) return []
      const groups = groupSkillsByCategory(data.skills)
      const paras = [heading('Skills')]
      for (const g of groups) {
        const names = g.skills.map((s) => s.name).join(', ')
        paras.push(
          new Paragraph({
            children: g.category
              ? [new TextRun({ text: `${g.category}: `, bold: true }), new TextRun(names)]
              : [new TextRun(names)],
          }),
        )
      }
      return paras
    }
    case 'projects': {
      if (data.projects.length === 0) return []
      const paras = [heading('Projects')]
      for (const p of data.projects) {
        paras.push(
          new Paragraph({
            spacing: { before: 120 },
            children: [
              new TextRun({ text: p.name, bold: true }),
              ...(p.tech ? [new TextRun({ text: `  ·  ${p.tech}`, color: '666666' })] : []),
            ],
          }),
        )
        if (p.description.trim()) paras.push(new Paragraph({ children: runsFromRichText(p.description) }))
        if (p.link) paras.push(new Paragraph({ children: [new TextRun({ text: p.link, color: '6636CC' })] }))
      }
      return paras
    }
    case 'certifications': {
      if (data.certifications.length === 0) return []
      const paras = [heading('Certifications')]
      for (const c of data.certifications) {
        const text = [c.name, c.issuer].filter(Boolean).join(' — ')
        paras.push(
          new Paragraph({
            children: [
              new TextRun({ text, bold: true }),
              ...(c.date ? [new TextRun({ text: `  ${c.date}`, color: '666666' })] : []),
            ],
          }),
        )
      }
      return paras
    }
    case 'languages': {
      if (data.languages.length === 0) return []
      const paras = [heading('Languages')]
      const line = data.languages.map((l) => `${l.name} (${l.level})`).join('  ·  ')
      paras.push(new Paragraph({ children: [new TextRun(line)] }))
      return paras
    }
  }
}

export async function exportResumeToDocx(data: ResumeData, fileName: string) {
  const { contact } = data
  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: contact.fullName || 'Your Name', bold: true, size: 40 })],
    }),
  ]
  if (contact.title) {
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: contact.title, color: '6636CC', size: 26 })],
      }),
    )
  }
  const contactText = contactLine(data)
  if (contactText) {
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: contactText, color: '666666', size: 20 })],
      }),
    )
  }

  for (const section of orderedSections(data)) {
    children.push(...sectionParagraphs(data, section))
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22 } },
      },
    },
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileName}.docx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
