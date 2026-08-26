import type { ReorderableSection, ResumeData, SkillItem, SkillStyle } from '../../lib/types'
import { THEME_COLORS } from '../../lib/theme'
import EditableText from './EditableText'

export const PAGE_WIDTH = 794 // ~A4 at 96dpi

export function themeOf(data: ResumeData) {
  return THEME_COLORS[data.colorTheme]
}

// Groups skills by their optional `category` label (e.g. "Languages",
// "Frameworks & Tools" — common on IT/developer resumes), preserving each
// category's first-appearance order. If NO skill in the list has a category
// set, this returns a single group with an empty category label holding
// every skill in original order — callers should treat an empty category
// as "no heading", so a resume that never uses categories renders exactly
// as it did before this feature existed.
export function groupSkillsByCategory(skills: SkillItem[]): { category: string; skills: SkillItem[] }[] {
  if (!skills.some((s) => s.category?.trim())) {
    return [{ category: '', skills }]
  }
  const order: string[] = []
  const buckets = new Map<string, SkillItem[]>()
  for (const s of skills) {
    const key = s.category?.trim() || 'Other'
    if (!buckets.has(key)) {
      buckets.set(key, [])
      order.push(key)
    }
    buckets.get(key)!.push(s)
  }
  return order.map((category) => ({ category, skills: buckets.get(category)! }))
}

const SANS_STACK = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
const SERIF_STACK = 'Lora, Georgia, "Times New Roman", serif'

// Every layout can be rendered in either font pairing, which is one of the
// three independent dimensions (layout x color x font) that combine into
// the full template gallery.
export function fontsOf(data: ResumeData): { heading: string; body: string } {
  if (data.fontVariant === 'serif') {
    return { heading: SERIF_STACK, body: SANS_STACK }
  }
  return { heading: SANS_STACK, body: SANS_STACK }
}

// Mixes a hex color toward white by `amount` (0-1). Used instead of Tailwind's
// opacity-modifier classes (e.g. text-white/70) and CSS filters, both of which
// can render as oklab/oklch color functions that html2canvas's PDF export
// cannot parse.
export function lighten(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const mix = (c: number) => Math.round(c + (255 - c) * amount)
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

// Resolves the section order to actually render for one "zone" of a template
// (e.g. a template's sidebar column, or its whole single-column flow).
//
// - `zoneSections` is the fixed set of sections that structurally live in
//   this zone for this template (drag-and-drop reorders sections WITHIN a
//   zone, it never moves a section across zones — a sidebar section stays
//   in the sidebar).
// - `templateDefaultOrder` is this template's own hand-tuned default order
//   (falls back to when the user hasn't opened the reorder panel yet, i.e.
//   `data.sectionOrder` is undefined) — this is what keeps every template
//   looking exactly as it did before this feature existed until the user
//   opts in.
export function orderedSections(
  data: ResumeData,
  zoneSections: readonly ReorderableSection[],
  templateDefaultOrder: readonly ReorderableSection[],
): ReorderableSection[] {
  const chosen = data.sectionOrder ?? templateDefaultOrder
  const zoneSet = new Set(zoneSections)
  const seen = new Set<ReorderableSection>()
  const result: ReorderableSection[] = []
  for (const s of chosen) {
    if (zoneSet.has(s) && !seen.has(s)) {
      result.push(s)
      seen.add(s)
    }
  }
  // Safety net: if `chosen` is missing a section this zone expects (e.g. an
  // older saved resume with a partial/corrupt sectionOrder), append it in
  // the template's own default relative position rather than dropping it.
  for (const s of templateDefaultOrder) {
    if (zoneSet.has(s) && !seen.has(s)) {
      result.push(s)
      seen.add(s)
    }
  }
  return result
}

const SKILL_LEVEL_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Basic',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
}

// Renders a skill's proficiency (1-5) in whichever visual style the resume
// has chosen (data.skillStyle, defaulting to 'bar' for older saved resumes).
// 'bar' keeps its own original name-above-bar layout; the other three are
// compact enough to sit inline next to the skill name.
export function SkillBar({
  name,
  level,
  color,
  editable = false,
  onNameCommit,
  style = 'bar',
}: {
  name: string
  level: number
  color: string
  editable?: boolean
  onNameCommit?: (next: string) => void
  style?: SkillStyle
}) {
  const clampedLevel = Math.min(5, Math.max(0, Math.round(level)))
  const nameNode =
    editable && onNameCommit ? (
      <EditableText editable value={name} placeholder="Skill" onCommit={onNameCommit} />
    ) : (
      <span>{name || 'Skill'}</span>
    )

  if (style === 'dots') {
    return (
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
        {nameNode}
        <div className="flex shrink-0 gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full"
              style={
                i < clampedLevel
                  ? { background: color }
                  : { background: 'transparent', border: `1px solid ${lighten(color, 0.55)}` }
              }
            />
          ))}
        </div>
      </div>
    )
  }

  if (style === 'blocks') {
    return (
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
        {nameNode}
        <div className="flex shrink-0 gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className="h-2 w-2.5 rounded-[1px]"
              style={{ background: i < clampedLevel ? color : lighten(color, 0.82) }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (style === 'label') {
    return (
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
        {nameNode}
        {/* Plain colored text rather than a tinted pill: some templates pass
            a literal white `color` for sidebar contrast, and lightening
            white toward white would make a filled pill invisible. */}
        <span className="shrink-0 text-[9.5px] font-semibold uppercase tracking-wide" style={{ color }}>
          {SKILL_LEVEL_LABELS[clampedLevel] ?? 'Skilled'}
        </span>
      </div>
    )
  }

  // 'bar' — original default look.
  return (
    <div className="mb-2">
      <div className="mb-1 flex items-center justify-between text-[11px]">{nameNode}</div>
      <div className="h-1.5 w-full rounded-full" style={{ background: 'rgba(0,0,0,0.1)' }}>
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${(clampedLevel / 5) * 100}%`, background: color }}
        />
      </div>
    </div>
  )
}
