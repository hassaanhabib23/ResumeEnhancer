import type { ResumeData, ReorderableSection } from './types'

export const DEFAULT_EXPORT_ORDER: ReorderableSection[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
]

// The flat, whole-document section order used by exporters that build one
// linear document (DOCX, plain-text PDF) rather than a column-based
// template — respects the resume's custom order and hidden sections the
// same way the live preview does, just without a per-template column split.
export function exportSectionOrder(data: ResumeData): ReorderableSection[] {
  const chosen = data.sectionOrder ?? DEFAULT_EXPORT_ORDER
  const hidden = new Set(data.hiddenSections ?? [])
  const seen = new Set<ReorderableSection>()
  const result: ReorderableSection[] = []
  for (const s of chosen) {
    if (!seen.has(s) && !hidden.has(s)) {
      result.push(s)
      seen.add(s)
    }
  }
  for (const s of DEFAULT_EXPORT_ORDER) {
    if (!seen.has(s) && !hidden.has(s)) {
      result.push(s)
      seen.add(s)
    }
  }
  return result
}
