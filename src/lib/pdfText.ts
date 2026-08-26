// A real-text PDF export: draws actual PDF text objects with jsPDF instead
// of screenshotting the preview (see lib/pdf.ts, kept as the "styled" export
// that matches the chosen template exactly). This one uses one universal,
// clean layout — same idea as the DOCX export — so the result is
// selectable/copyable text and parses cleanly through ATS software, at the
// cost of not reproducing every template's specific column layout.
import { jsPDF } from 'jspdf'
import type { ResumeData, ReorderableSection, SkillItem } from './types'
import { dateRange } from './format'
import { THEME_COLORS } from './theme'
import { groupSkillsByCategory } from '../components/templates/shared'
import { parseRichRuns, type RichRun } from './richText'
import { exportSectionOrder } from './resumeOutline'

const PAGE_WIDTH = 595.28 // A4 at 72pt/in
const PAGE_HEIGHT = 841.89
const MARGIN = 50
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const BODY_SIZE = 10.5
const BODY_LINE = 14
const GRAY = '#5b5b5b'

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

interface Cursor {
  pdf: jsPDF
  y: number
}

function ensureSpace(c: Cursor, needed: number) {
  if (c.y + needed > PAGE_HEIGHT - MARGIN) {
    c.pdf.addPage()
    c.y = MARGIN
  }
}

function setFont(pdf: jsPDF, bold: boolean, italic: boolean) {
  const style = bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal'
  pdf.setFont('helvetica', style)
}

function setColor(pdf: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex)
  pdf.setTextColor(r, g, b)
}

// Word-wraps a run list (mixed bold/italic/underline segments) to
// `maxWidth`, drawing each wrapped line at `x`/advancing `c.y`, measuring
// every word in its own style so a bold word's real width is accounted for.
function drawRichRuns(
  c: Cursor,
  runs: RichRun[],
  x: number,
  maxWidth: number,
  size = BODY_SIZE,
  color = '#1a1a2e',
) {
  const { pdf } = c
  pdf.setFontSize(size)

  type Word = { text: string; bold: boolean; italic: boolean; underline: boolean }
  const lines: Word[][] = [[]]
  for (const run of runs) {
    if (run.text === '\n') {
      lines.push([])
      continue
    }
    for (const w of run.text.split(/(\s+)/).filter((s) => s !== '')) {
      lines[lines.length - 1].push({ text: w, bold: run.bold, italic: run.italic, underline: run.underline })
    }
  }

  const wrapped: Word[][] = []
  for (const paragraphWords of lines) {
    let current: Word[] = []
    let currentWidth = 0
    for (const word of paragraphWords) {
      setFont(pdf, word.bold, word.italic)
      const w = pdf.getTextWidth(word.text)
      if (/^\s+$/.test(word.text)) {
        if (currentWidth + w <= maxWidth) {
          current.push(word)
          currentWidth += w
        }
        continue
      }
      if (currentWidth + w > maxWidth && current.length > 0) {
        wrapped.push(current)
        current = [word]
        currentWidth = w
      } else {
        current.push(word)
        currentWidth += w
      }
    }
    wrapped.push(current)
  }

  for (const line of wrapped) {
    ensureSpace(c, BODY_LINE)
    let lx = x
    for (const word of line) {
      if (/^\s+$/.test(word.text)) {
        setFont(pdf, word.bold, word.italic)
        lx += pdf.getTextWidth(word.text)
        continue
      }
      setFont(pdf, word.bold, word.italic)
      setColor(pdf, color)
      pdf.text(word.text, lx, c.y)
      const w = pdf.getTextWidth(word.text)
      if (word.underline) {
        pdf.setDrawColor(...hexToRgb(color))
        pdf.setLineWidth(0.6)
        pdf.line(lx, c.y + 1.5, lx + w, c.y + 1.5)
      }
      lx += w
    }
    c.y += BODY_LINE
  }
}

function drawPlain(c: Cursor, text: string, x: number, maxWidth: number, size = BODY_SIZE, color = GRAY, bold = false) {
  const { pdf } = c
  pdf.setFontSize(size)
  setFont(pdf, bold, false)
  const lines = pdf.splitTextToSize(text, maxWidth) as string[]
  setColor(pdf, color)
  for (const line of lines) {
    ensureSpace(c, BODY_LINE)
    pdf.text(line, x, c.y)
    c.y += BODY_LINE
  }
}

function heading(c: Cursor, text: string, accent: string) {
  ensureSpace(c, 26)
  c.y += 14
  c.pdf.setFontSize(11)
  setFont(c.pdf, true, false)
  setColor(c.pdf, accent)
  c.pdf.text(text.toUpperCase(), MARGIN, c.y)
  c.y += 4
  c.pdf.setDrawColor(...hexToRgb(accent))
  c.pdf.setLineWidth(0.75)
  c.pdf.line(MARGIN, c.y, PAGE_WIDTH - MARGIN, c.y)
  c.y += 14
}

function dateOnRight(c: Cursor, dateText: string) {
  if (!dateText) return
  c.pdf.setFontSize(BODY_SIZE)
  setFont(c.pdf, false, false)
  setColor(c.pdf, GRAY)
  c.pdf.text(dateText, PAGE_WIDTH - MARGIN, c.y, { align: 'right' })
}

function skillsLine(skills: SkillItem[]): string {
  return skills.map((s) => s.name).join(', ')
}

function drawSection(c: Cursor, data: ResumeData, section: ReorderableSection, accent: string) {
  switch (section) {
    case 'summary': {
      if (!data.summary.trim()) return
      heading(c, 'Profile', accent)
      drawRichRuns(c, parseRichRuns(data.summary), MARGIN, CONTENT_WIDTH)
      break
    }
    case 'experience': {
      if (data.experience.length === 0) return
      heading(c, 'Experience', accent)
      data.experience.forEach((e, i) => {
        if (i > 0) c.y += 8
        ensureSpace(c, BODY_LINE)
        const titleLine = [e.role, e.company].filter(Boolean).join(' · ')
        c.pdf.setFontSize(BODY_SIZE)
        setFont(c.pdf, true, false)
        setColor(c.pdf, '#1a1a2e')
        c.pdf.text(titleLine, MARGIN, c.y)
        dateOnRight(c, dateRange(e.startDate, e.endDate, e.current))
        c.y += BODY_LINE
        if (e.location) drawPlain(c, e.location, MARGIN, CONTENT_WIDTH)
        for (const b of e.bullets.filter(Boolean)) {
          ensureSpace(c, BODY_LINE)
          c.pdf.setFontSize(BODY_SIZE)
          setFont(c.pdf, false, false)
          setColor(c.pdf, '#1a1a2e')
          c.pdf.text('•', MARGIN + 4, c.y)
          drawRichRuns(c, parseRichRuns(b), MARGIN + 16, CONTENT_WIDTH - 16)
        }
      })
      break
    }
    case 'education': {
      if (data.education.length === 0) return
      heading(c, 'Education', accent)
      data.education.forEach((e, i) => {
        if (i > 0) c.y += 6
        ensureSpace(c, BODY_LINE)
        c.pdf.setFontSize(BODY_SIZE)
        setFont(c.pdf, true, false)
        setColor(c.pdf, '#1a1a2e')
        c.pdf.text([e.degree, e.field].filter(Boolean).join(', '), MARGIN, c.y)
        dateOnRight(c, dateRange(e.startDate, e.endDate, false))
        c.y += BODY_LINE
        const meta = [e.school, e.gpa && `GPA: ${e.gpa}`].filter(Boolean).join(' · ')
        if (meta) drawPlain(c, meta, MARGIN, CONTENT_WIDTH)
      })
      break
    }
    case 'skills': {
      if (data.skills.length === 0) return
      heading(c, 'Skills', accent)
      const groups = groupSkillsByCategory(data.skills)
      for (const g of groups) {
        const line = g.category ? `${g.category}: ${skillsLine(g.skills)}` : skillsLine(g.skills)
        drawPlain(c, line, MARGIN, CONTENT_WIDTH, BODY_SIZE, '#1a1a2e')
      }
      break
    }
    case 'projects': {
      if (data.projects.length === 0) return
      heading(c, 'Projects', accent)
      data.projects.forEach((p, i) => {
        if (i > 0) c.y += 6
        ensureSpace(c, BODY_LINE)
        c.pdf.setFontSize(BODY_SIZE)
        setFont(c.pdf, true, false)
        setColor(c.pdf, '#1a1a2e')
        const titleWidth = c.pdf.getTextWidth(p.name)
        c.pdf.text(p.name, MARGIN, c.y)
        if (p.tech) {
          setFont(c.pdf, false, false)
          setColor(c.pdf, GRAY)
          c.pdf.text(`  ·  ${p.tech}`, MARGIN + titleWidth, c.y)
        }
        c.y += BODY_LINE
        if (p.description.trim()) drawRichRuns(c, parseRichRuns(p.description), MARGIN, CONTENT_WIDTH)
        if (p.link) drawPlain(c, p.link, MARGIN, CONTENT_WIDTH, BODY_SIZE, accent)
      })
      break
    }
    case 'certifications': {
      if (data.certifications.length === 0) return
      heading(c, 'Certifications', accent)
      for (const cert of data.certifications) {
        ensureSpace(c, BODY_LINE)
        const text = [cert.name, cert.issuer].filter(Boolean).join(' — ')
        c.pdf.setFontSize(BODY_SIZE)
        setFont(c.pdf, true, false)
        setColor(c.pdf, '#1a1a2e')
        c.pdf.text(text, MARGIN, c.y)
        if (cert.date) dateOnRight(c, cert.date)
        c.y += BODY_LINE
      }
      break
    }
    case 'languages': {
      if (data.languages.length === 0) return
      heading(c, 'Languages', accent)
      const line = data.languages.map((l) => `${l.name} (${l.level})`).join('   ·   ')
      drawPlain(c, line, MARGIN, CONTENT_WIDTH, BODY_SIZE, '#1a1a2e')
      break
    }
  }
}

export async function exportResumeToTextPdf(data: ResumeData, fileName: string) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const c: Cursor = { pdf, y: MARGIN }
  const accent = THEME_COLORS[data.colorTheme].accent
  const { contact } = data

  pdf.setFontSize(22)
  setFont(pdf, true, false)
  setColor(pdf, '#1a1a2e')
  pdf.text(contact.fullName || 'Your Name', MARGIN, c.y + 16)
  c.y += 16

  if (contact.title) {
    c.y += 20
    pdf.setFontSize(13)
    setFont(pdf, false, false)
    setColor(pdf, accent)
    pdf.text(contact.title, MARGIN, c.y)
  }

  const contactText = [contact.email, contact.phone, contact.location, contact.website, contact.linkedin, contact.github]
    .filter(Boolean)
    .join('   ·   ')
  if (contactText) {
    c.y += 18
    drawPlain(c, contactText, MARGIN, CONTENT_WIDTH, 9.5)
  }

  for (const section of exportSectionOrder(data)) {
    drawSection(c, data, section, accent)
  }

  pdf.save(`${fileName}.pdf`)
}
