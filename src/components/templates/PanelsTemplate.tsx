import { useResumeStore } from '../../lib/store'
import type { ReorderableSection, ResumeData } from '../../lib/types'
import { dateRange } from '../../lib/format'
import { themeOf, fontsOf, PAGE_WIDTH, orderedSections, lighten } from './shared'
import EditableText from './EditableText'

// PANELS: no columns anywhere. Every section — including the header — is
// its own full-width horizontal band, stacked top to bottom, alternating
// background tint. This is deliberately NOT a variant of the sidebar
// layouts (Modern/SidebarRight/etc.) or the plain single-column layouts
// (Classic/Minimal/etc.) — it's a third structural family: a stack of
// bands read like cards in a feed, rather than columns or an unbroken flow.
const DEFAULT_ORDER: ReorderableSection[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
]

const SECTION_TITLES: Record<ReorderableSection, string> = {
  summary: 'Profile',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
}

export default function PanelsTemplate({
  data,
  editable = false,
}: {
  data: ResumeData
  editable?: boolean
}) {
  const theme = themeOf(data)
  const fonts = fontsOf(data)
  const { contact } = data
  const {
    updateContact,
    updateSummary,
    updateExperience,
    updateEducation,
    updateSkill,
    updateProject,
    updateCertification,
    updateLanguage,
  } = useResumeStore()

  const contactFields = [
    { key: 'email', value: contact.email, placeholder: 'Email', onCommit: (v: string) => updateContact(data.id, { email: v }) },
    { key: 'phone', value: contact.phone, placeholder: 'Phone', onCommit: (v: string) => updateContact(data.id, { phone: v }) },
    { key: 'location', value: contact.location, placeholder: 'City, Country', onCommit: (v: string) => updateContact(data.id, { location: v }) },
    { key: 'website', value: contact.website, placeholder: 'Website', onCommit: (v: string) => updateContact(data.id, { website: v }) },
    { key: 'linkedin', value: contact.linkedin, placeholder: 'LinkedIn', onCommit: (v: string) => updateContact(data.id, { linkedin: v }) },
    { key: 'github', value: contact.github, placeholder: 'GitHub', onCommit: (v: string) => updateContact(data.id, { github: v }) },
  ]
  const visibleContactFields = editable ? contactFields : contactFields.filter((f) => f.value)

  const bodyFont = fonts.body

  const nodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    summary: (editable || data.summary) && (
      <p className="text-[12.5px] leading-relaxed text-ink-700">
        <EditableText
          editable={editable}
          multiline
          rich
          value={data.summary}
          placeholder="A short summary of your experience and strengths…"
          onCommit={(v) => updateSummary(data.id, v)}
        />
      </p>
    ),
    experience: (editable || data.experience.length > 0) && (
      <div className="space-y-5">
        {data.experience.map((e) => (
          <div key={e.id}>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[13.5px] font-semibold text-ink-900">
                <EditableText
                  editable={editable}
                  value={e.role}
                  placeholder="Role"
                  onCommit={(v) => updateExperience(data.id, e.id, { role: v })}
                />
                {(editable || e.company) && (
                  <>
                    {' · '}
                    <EditableText
                      editable={editable}
                      value={e.company}
                      placeholder="Company"
                      onCommit={(v) => updateExperience(data.id, e.id, { company: v })}
                    />
                  </>
                )}
              </h3>
              <span className="whitespace-nowrap text-[10.5px] text-ink-400">
                {dateRange(e.startDate, e.endDate, e.current)}
              </span>
            </div>
            {(editable || e.location) && (
              <p className="text-[11px] text-ink-400">
                <EditableText
                  editable={editable}
                  value={e.location}
                  placeholder="Location"
                  onCommit={(v) => updateExperience(data.id, e.id, { location: v })}
                />
              </p>
            )}
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[11.5px] leading-relaxed text-ink-600">
              {(editable ? e.bullets : e.bullets.filter(Boolean)).map((b, i) => (
                <li key={i}>
                  <EditableText
                    editable={editable}
                    multiline
                    rich
                    value={b}
                    placeholder="Describe an accomplishment…"
                    onCommit={(v) => {
                      const bullets = [...e.bullets]
                      bullets[i] = v
                      updateExperience(data.id, e.id, { bullets })
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
    education: (editable || data.education.length > 0) && (
      <div className="space-y-3">
        {data.education.map((e) => (
          <div key={e.id} className="flex items-baseline justify-between gap-3">
            <div>
              <h3 className="text-[12.5px] font-semibold text-ink-900">
                <EditableText
                  editable={editable}
                  value={e.degree}
                  placeholder="Degree"
                  onCommit={(v) => updateEducation(data.id, e.id, { degree: v })}
                />
                {(editable || e.field) && (
                  <>
                    {', '}
                    <EditableText
                      editable={editable}
                      value={e.field}
                      placeholder="Field of study"
                      onCommit={(v) => updateEducation(data.id, e.id, { field: v })}
                    />
                  </>
                )}
              </h3>
              <p className="text-[11px] text-ink-400">
                <EditableText
                  editable={editable}
                  value={e.school}
                  placeholder="School"
                  onCommit={(v) => updateEducation(data.id, e.id, { school: v })}
                />
                {(editable || e.location) && (
                  <>
                    {' · '}
                    <EditableText
                      editable={editable}
                      value={e.location}
                      placeholder="Location"
                      onCommit={(v) => updateEducation(data.id, e.id, { location: v })}
                    />
                  </>
                )}
              </p>
            </div>
            <span className="whitespace-nowrap text-[10.5px] text-ink-400">
              {dateRange(e.startDate, e.endDate, false)}
            </span>
          </div>
        ))}
      </div>
    ),
    skills: (editable || data.skills.length > 0) && (
      <div className="flex flex-wrap gap-2">
        {(editable ? data.skills : data.skills.filter((s) => s.name)).map((s) => (
          <span
            key={s.id}
            className="rounded-full px-3 py-1 text-[11px] font-medium"
            style={{ background: lighten(theme.accent, 0.85), color: theme.text }}
          >
            <EditableText
              editable={editable}
              value={s.name}
              placeholder="Skill"
              onCommit={(v) => updateSkill(data.id, s.id, { name: v })}
            />
          </span>
        ))}
      </div>
    ),
    projects: (editable || data.projects.length > 0) && (
      <div className="space-y-3">
        {data.projects.map((p) => (
          <div key={p.id}>
            <h3 className="text-[12.5px] font-semibold text-ink-900">
              <EditableText
                editable={editable}
                value={p.name}
                placeholder="Project name"
                onCommit={(v) => updateProject(data.id, p.id, { name: v })}
              />
              {(editable || p.tech) && (
                <span className="ml-2 text-[10.5px] font-normal text-ink-400">
                  <EditableText
                    editable={editable}
                    value={p.tech}
                    placeholder="Tech used"
                    onCommit={(v) => updateProject(data.id, p.id, { tech: v })}
                  />
                </span>
              )}
            </h3>
            <p className="text-[11.5px] leading-relaxed text-ink-600">
              <EditableText
                editable={editable}
                multiline
                rich
                value={p.description}
                placeholder="What did you build?"
                onCommit={(v) => updateProject(data.id, p.id, { description: v })}
              />
            </p>
          </div>
        ))}
      </div>
    ),
    certifications: (editable || data.certifications.length > 0) && (
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11.5px] text-ink-600">
        {data.certifications.map((c) => (
          <div key={c.id}>
            <EditableText
              editable={editable}
              value={c.name}
              placeholder="Certification"
              onCommit={(v) => updateCertification(data.id, c.id, { name: v })}
            />
            {' — '}
            <span className="text-ink-400">
              <EditableText
                editable={editable}
                value={c.issuer}
                placeholder="Issuer"
                onCommit={(v) => updateCertification(data.id, c.id, { issuer: v })}
              />
              {c.date ? `, ${c.date}` : ''}
            </span>
          </div>
        ))}
      </div>
    ),
    languages: (editable || data.languages.length > 0) && (
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11.5px] text-ink-600">
        {data.languages.map((l) => (
          <div key={l.id}>
            <EditableText
              editable={editable}
              value={l.name}
              placeholder="Language"
              onCommit={(v) => updateLanguage(data.id, l.id, { name: v })}
            />
            {' — '}
            <span className="text-ink-400">
              <EditableText
                editable={editable}
                value={l.level}
                placeholder="Level"
                onCommit={(v) => updateLanguage(data.id, l.id, { level: v })}
              />
            </span>
          </div>
        ))}
      </div>
    ),
  }

  const order = orderedSections(data, DEFAULT_ORDER, DEFAULT_ORDER)
  const visibleOrder = order.filter((key) => nodes[key])

  return (
    <div
      id="resume-page"
      style={{ width: PAGE_WIDTH, fontFamily: bodyFont }}
      className="min-h-[1123px] bg-white text-ink-900"
    >
      {/* Header panel — always first, its own full-width band */}
      <div className="px-12 py-10" style={{ background: lighten(theme.accent, 0.92) }}>
        {contact.photo && (
          <img
            src={contact.photo}
            alt=""
            className="mb-4 h-16 w-16 rounded-full object-cover"
            style={{ boxShadow: `0 0 0 3px ${lighten(theme.accent, 0.6)}` }}
          />
        )}
        <h1 className="text-[26px] font-bold tracking-tight" style={{ fontFamily: fonts.heading, color: theme.text }}>
          <EditableText
            editable={editable}
            value={contact.fullName}
            placeholder="Your Name"
            onCommit={(v) => updateContact(data.id, { fullName: v })}
          />
        </h1>
        <p className="mt-1 text-sm font-medium" style={{ color: theme.accent }}>
          <EditableText
            editable={editable}
            value={contact.title}
            placeholder="Your Job Title"
            onCommit={(v) => updateContact(data.id, { title: v })}
          />
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-ink-500">
          {visibleContactFields.map((f, i) => (
            <span key={f.key} className="flex items-center gap-3">
              <EditableText editable={editable} value={f.value} placeholder={f.placeholder} onCommit={f.onCommit} />
              {i < visibleContactFields.length - 1 && <span className="text-ink-300">•</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Section panels — alternating tint by rendered position, not by
          which section it is, so alternation stays clean no matter what
          order the user drags sections into. */}
      {visibleOrder.map((key, i) => (
        <div
          key={key}
          className="px-12 py-6"
          style={{ background: i % 2 === 0 ? '#ffffff' : lighten(theme.accent, 0.96) }}
        >
          <h2
            className="mb-3 inline-block rounded px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-widest leading-none"
            style={{ background: theme.accent, color: '#ffffff' }}
          >
            {SECTION_TITLES[key]}
          </h2>
          {nodes[key]}
        </div>
      ))}
    </div>
  )
}
