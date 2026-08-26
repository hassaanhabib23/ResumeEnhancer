import type { LayoutId, ColorTheme, FontVariant } from './types'
import { THEME_LABELS } from './theme'

export type TemplateCategory =
  | 'Simple & ATS'
  | 'Professional'
  | 'Modern'
  | 'Executive'
  | 'Creative'
  | 'Academic & Formal'
  | 'Skill-Based'

export interface LayoutDef {
  id: LayoutId
  name: string
  category: TemplateCategory
  blurb: string
}

// Each entry here is a genuinely distinct TEMPLATE — its own component with
// its own column structure, section placement, and visual treatment (see
// src/components/templates/*.tsx). Color palette and font pairing are a
// separate customization applied on top of whichever layout you pick (see
// the builder's "Design" panel) — they don't multiply this list. A layout
// recolored is still that same layout, not a different template.
export const LAYOUTS: LayoutDef[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    category: 'Simple & ATS',
    blurb: 'Clean single column that keeps every ATS parser happy.',
  },
  {
    id: 'compact',
    name: 'Compact',
    category: 'Simple & ATS',
    blurb: 'Dense, no-frills layout built to fit a long history on one page.',
  },
  {
    id: 'classic',
    name: 'Classic',
    category: 'Professional',
    blurb: 'Traditional centered header, reads well in conservative industries.',
  },
  {
    id: 'modern',
    name: 'Modern',
    category: 'Professional',
    blurb: 'Bold header with a left accent sidebar. Great for tech and design.',
  },
  {
    id: 'sidebar-right',
    name: 'Double Column',
    category: 'Professional',
    blurb: 'Two-column layout with the accent sidebar on the right.',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    category: 'Modern',
    blurb: 'Experience and education laid out along a vertical timeline.',
  },
  {
    id: 'banner',
    name: 'Banner',
    category: 'Modern',
    blurb: 'Full-width color header banner with a two-column body below.',
  },
  {
    id: 'executive',
    name: 'Executive',
    category: 'Executive',
    blurb: 'Quiet, whitespace-heavy layout for senior and director roles.',
  },
  {
    id: 'creative-blocks',
    name: 'Creative Blocks',
    category: 'Creative',
    blurb: 'Rounded color cards per section — energetic, for design roles.',
  },
  {
    id: 'academic',
    name: 'Academic',
    category: 'Academic & Formal',
    blurb: 'Formal long-form layout for academic, legal, or government CVs.',
  },
  {
    id: 'ats-plain',
    name: 'ATS Plain',
    category: 'Simple & ATS',
    blurb: 'Black-and-white, single column, zero graphics — built to survive any resume parser.',
  },
  {
    id: 'functional',
    name: 'Skills-First',
    category: 'Skill-Based',
    blurb: 'Leads with strengths and achievements, ideal for career changes or employment gaps.',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    category: 'Professional',
    blurb: 'Refined whitespace-heavy two-column with a soft photo frame, no solid color blocks.',
  },
  {
    id: 'diagonal',
    name: 'Diagonal',
    category: 'Modern',
    blurb: 'Bold diagonal color break behind the header — contemporary and eye-catching.',
  },
  {
    id: 'dark-premium',
    name: 'Dark Premium',
    category: 'Executive',
    blurb: 'Full dark canvas with a bright accent — a confident, premium look for senior roles.',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    category: 'Creative',
    blurb: 'Magazine-style layout with a pull-quote summary and grid-based sections.',
  },
  {
    id: 'header-band',
    name: 'Header Band',
    category: 'Professional',
    blurb: 'Full-width color band with an overlapping photo — polished and distinctive.',
  },
  {
    id: 'infographic',
    name: 'Infographic',
    category: 'Creative',
    blurb: 'Icon-driven contact row and progress-ring skills for a visual, at-a-glance resume.',
  },
  {
    id: 'panels',
    name: 'Panels',
    category: 'Modern',
    blurb: 'No columns at all — every section gets its own full-width band with alternating tints, read top to bottom like a stack of cards.',
  },
  {
    id: 'portfolio-grid',
    name: 'Portfolio Grid',
    category: 'Creative',
    blurb: 'Experience and projects render as bordered cards in a two-column grid — built for design and portfolio-driven roles.',
  },
  {
    id: 'framed',
    name: 'Framed',
    category: 'Academic & Formal',
    blurb: 'A thin double-rule frame around the whole page with a centered, symmetric header — formal and ceremonial.',
  },
  {
    id: 'tech-grid',
    name: 'Tech Grid',
    category: 'Skill-Based',
    blurb: 'Skills render as a tag-pill grid and dates use a monospace accent — built for engineers and technical roles.',
  },
]

export const COLOR_THEMES = Object.keys(THEME_LABELS) as ColorTheme[]
export const FONT_VARIANTS: FontVariant[] = ['sans', 'serif']

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Simple & ATS',
  'Professional',
  'Modern',
  'Executive',
  'Creative',
  'Academic & Formal',
  'Skill-Based',
]

export function layoutOf(layoutId: LayoutId): LayoutDef {
  return LAYOUTS.find((l) => l.id === layoutId) ?? LAYOUTS[0]
}
