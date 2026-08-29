export interface ContactInfo {
  fullName: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  github: string
  photo: string // data URL, optional
}

export interface ExperienceItem {
  id: string
  company: string
  role: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  bullets: string[]
}

export interface EducationItem {
  id: string
  school: string
  degree: string
  field: string
  location: string
  startDate: string
  endDate: string
  gpa: string
}

export interface SkillItem {
  id: string
  name: string
  level: number // 1-5
  // Optional grouping label (e.g. "Languages", "Frameworks", "Cloud & DevOps")
  // — common on IT/developer resumes. Undefined/empty = ungrouped, which
  // renders exactly like before this field existed. See
  // templates/shared.tsx `groupSkillsByCategory()`.
  category?: string
}

export interface ProjectItem {
  id: string
  name: string
  description: string
  link: string
  tech: string
}

export interface CertificationItem {
  id: string
  name: string
  issuer: string
  date: string
}

export interface LanguageItem {
  id: string
  name: string
  level: string
}

// A "layout" IS a template — its own distinct column structure, section
// placement, and visual treatment (see src/components/templates/*.tsx).
// Color palette and font pairing are a separate customization applied on
// top of whichever layout is chosen (see the builder's "Design" panel) —
// they never turn one layout into a different "template".
export type LayoutId =
  | 'modern'
  | 'classic'
  | 'minimal'
  | 'sidebar-right'
  | 'timeline'
  | 'banner'
  | 'compact'
  | 'executive'
  | 'creative-blocks'
  | 'academic'
  | 'ats-plain'
  | 'functional'
  | 'elegant'
  | 'diagonal'
  | 'dark-premium'
  | 'editorial'
  | 'header-band'
  | 'infographic'
  | 'panels'
  | 'portfolio-grid'
  | 'framed'
  | 'tech-grid'

export type ColorTheme =
  | 'brand'
  | 'ink'
  | 'gold'
  | 'forest'
  | 'crimson'
  | 'navy'
  | 'teal'
  | 'slate'
  | 'rose'
  | 'amber'
  | 'steel'
  | 'olive'
  | 'plum'
  | 'charcoal'
  | 'rust'
  | 'emerald'
  | 'indigo'
  | 'mustard'
export type FontVariant = 'sans' | 'serif'

// How a skill's proficiency level renders wherever a template shows one.
// 'bar' is the original/default look; the others are alternate visual
// languages for the same 1-5 level value.
export type SkillStyle = 'bar' | 'dots' | 'blocks' | 'label'
export const SKILL_STYLES: SkillStyle[] = ['bar', 'dots', 'blocks', 'label']
export const SKILL_STYLE_LABELS: Record<SkillStyle, string> = {
  bar: 'Bar',
  dots: 'Dots',
  blocks: 'Blocks',
  label: 'Label',
}

// Kept as an alias so existing call sites reading "templateId" still make sense.
export type TemplateId = LayoutId

// The 7 content sections a resume can be made of (Contact is always a fixed
// header/top block, never part of this reorderable set). `sectionOrder` on
// ResumeData is optional and intentionally left unset until the user opens
// the drag-and-drop "Reorder sections" panel — every template falls back to
// its own existing hand-tuned default order (see each template's
// `DEFAULT_SECTION_ORDER` constant) when it's undefined, so choosing a
// template doesn't change look until the user opts into reordering.
export const REORDERABLE_SECTIONS = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
] as const

export type ReorderableSection = (typeof REORDERABLE_SECTIONS)[number]

export const SECTION_LABELS: Record<ReorderableSection, string> = {
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
}

// The flat "conceptual" section order shown as the starting point in the
// drag-and-drop Reorder panel for each layout, before the user has dragged
// anything — mirrors that layout's own default per-zone order (see each
// template file's own DEFAULT_ORDER / SIDEBAR_DEFAULT+MAIN_DEFAULT
// constants) so a small first edit in the panel doesn't silently reshuffle
// sections the user never touched. Two-zone (sidebar + main) layouts list
// main-column sections first, then sidebar sections — the interleaving here
// is cosmetic (only relative order *within* each zone matters to
// `orderedSections()`), it just keeps the panel's starting list predictable.
export const DEFAULT_SECTION_ORDER_BY_TEMPLATE: Record<LayoutId, ReorderableSection[]> = {
  modern: ['summary', 'experience', 'education', 'projects', 'skills', 'languages', 'certifications'],
  classic: ['summary', 'experience', 'education', 'skills', 'languages', 'projects', 'certifications'],
  minimal: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'],
  'sidebar-right': ['summary', 'experience', 'education', 'projects', 'skills', 'languages', 'certifications'],
  timeline: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'],
  banner: ['summary', 'experience', 'education', 'projects', 'skills', 'languages', 'certifications'],
  compact: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'],
  executive: ['summary', 'experience', 'education', 'projects', 'skills', 'languages', 'certifications'],
  'creative-blocks': ['summary', 'experience', 'skills', 'education', 'projects', 'certifications', 'languages'],
  academic: ['summary', 'education', 'experience', 'certifications', 'projects', 'skills', 'languages'],
  'ats-plain': ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'],
  functional: ['summary', 'skills', 'experience', 'education', 'projects', 'certifications', 'languages'],
  elegant: ['summary', 'experience', 'education', 'projects', 'skills', 'languages', 'certifications'],
  diagonal: ['summary', 'experience', 'education', 'projects', 'skills', 'languages', 'certifications'],
  'dark-premium': ['summary', 'experience', 'education', 'projects', 'skills', 'languages', 'certifications'],
  // Editorial pins Summary as a fixed pull-quote outside the reorderable
  // zones entirely — it's listed here so the panel still shows all 7
  // sections, but dragging it has no visual effect on this one layout.
  editorial: ['summary', 'experience', 'education', 'skills', 'languages', 'certifications', 'projects'],
  'header-band': ['summary', 'experience', 'education', 'projects', 'skills', 'languages', 'certifications'],
  infographic: ['summary', 'experience', 'education', 'projects', 'skills', 'languages', 'certifications'],
  panels: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'],
  'portfolio-grid': ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'],
  framed: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'],
  'tech-grid': ['summary', 'experience', 'education', 'projects', 'skills', 'languages', 'certifications'],
}

export interface ResumeData {
  id: string
  name: string // internal name for dashboard, e.g. "Product Manager - Google"
  updatedAt: string
  templateId: LayoutId
  colorTheme: ColorTheme
  fontVariant: FontVariant
  // Undefined = 'bar' (the original look), so existing saved resumes render
  // unchanged. Applies wherever a template shows a skill proficiency level.
  skillStyle?: SkillStyle
  contact: ContactInfo
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: SkillItem[]
  projects: ProjectItem[]
  certifications: CertificationItem[]
  languages: LanguageItem[]
  // User's custom drag-and-drop section order (whole-resume, not per-template).
  // Undefined = "use each template's own default order". See templates/shared.tsx
  // `orderedSections()` for how this is applied within a template's zones.
  sectionOrder?: ReorderableSection[]
  // Sections explicitly hidden from the rendered/exported resume (still
  // editable in the builder — the data isn't deleted, just not shown).
  // Undefined/empty = nothing hidden, so existing resumes are unaffected.
  hiddenSections?: ReorderableSection[]
}

// Job Application Tracker — independent of any single resume (an
// application optionally references the resume used, via `resumeId`, but
// keeps its own lifecycle so deleting a resume doesn't lose the tracker
// history).
export type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected'

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'saved',
  'applied',
  'interviewing',
  'offer',
  'rejected',
]

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  rejected: 'Rejected',
}

export interface JobApplication {
  id: string
  company: string
  role: string
  status: ApplicationStatus
  link: string
  appliedDate: string
  notes: string
  resumeId?: string
  updatedAt: string
}

export const SECTION_KEYS = [
  'contact',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
] as const

export type SectionKey = (typeof SECTION_KEYS)[number]
