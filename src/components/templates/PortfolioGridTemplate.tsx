import { useResumeStore } from '../../lib/store'
import type { ReorderableSection, ResumeData } from '../../lib/types'
import { dateRange } from '../../lib/format'
import { themeOf, fontsOf, PAGE_WIDTH, orderedSections, lighten } from './shared'
import EditableText from './EditableText'

function SectionTitle({
  children,
  color,
  font,
}: {
  children: React.ReactNode
  color: string
  font: string
}) {
  return (
    <h2
      className="mb-3 border-b pb-1.5 text-[13px] font-semibold uppercase tracking-[0.12em]"
      style={{ borderColor: color, color, fontFamily: font }}
    >
      {children}
    </h2>
  )
}

// PORTFOLIO GRID: single-column/single-zone like Classic and Panels, but the
// two sections a design/creative candidate wants to show off — Experience
// and Projects — break out of the flowing-list convention every other
// template uses and render as bordered, shadowed cards in a 2-column CSS
// grid instead. Everything else (Education, Skills, Certifications,
// Languages) stays a plain flowing section so the card treatment reads as a
// deliberate showcase accent, not "the whole resume is boxes".
const DEFAULT_ORDER: ReorderableSection[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
]

export default function PortfolioGridTemplate({
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

  const nodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    summary: (editable || data.summary) && (
      <section className="mt-7" key="summary">
        <SectionTitle color={theme.accent} font={fonts.heading}>Summary</SectionTitle>
        <p className="text-[12px] leading-relaxed text-ink-700">
          <EditableText
            editable={editable}
            multiline
            value={data.summary}
            placeholder="A short summary of your experience and strengths…"
            onCommit={(v) => updateSummary(data.id, v)}
          />
        </p>
      </section>
    ),

    // Experience: card grid, not a flowing list.
    experience: (editable || data.experience.length > 0) && (
      <section className="mt-7" key="experience">
        <SectionTitle color={theme.accent} font={fonts.heading}>Experience</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          {data.experience.map((e) => (
            <div
              key={e.id}
              className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-sm"
            >
              <div className="h-1 w-full" style={{ background: theme.accent }} />
              <div className="p-3.5">
                <h3 className="text-[12px] font-semibold leading-tight">
                  <EditableText
                    editable={editable}
                    value={e.role}
                    placeholder="Role"
                    onCommit={(v) => updateExperience(data.id, e.id, { role: v })}
                  />
                </h3>
                <p className="mt-0.5 text-[10.5px] italic text-ink-500">
                  <EditableText
                    editable={editable}
                    value={e.company}
                    placeholder="Company"
                    onCommit={(v) => updateExperience(data.id, e.id, { company: v })}
                  />
                  {(editable || e.location) && (
                    <>
                      {', '}
                      <EditableText
                        editable={editable}
                        value={e.location}
                        placeholder="Location"
                        onCommit={(v) => updateExperience(data.id, e.id, { location: v })}
                      />
                    </>
                  )}
                </p>
                <p
                  className="mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide"
                  style={{ background: lighten(theme.accent, 0.9), color: theme.text }}
                >
                  {dateRange(e.startDate, e.endDate, e.current)}
                </p>
                <ul className="mt-2 list-disc space-y-0.5 pl-3.5 text-[10px] leading-snug text-ink-600">
                  {(editable ? e.bullets : e.bullets.filter(Boolean)).map((b, i) => (
                    <li key={i}>
                      <EditableText
                        editable={editable}
                        multiline
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
            </div>
          ))}
        </div>
      </section>
    ),

    education: (editable || data.education.length > 0) && (
      <section className="mt-7" key="education">
        <SectionTitle color={theme.accent} font={fonts.heading}>Education</SectionTitle>
        <div className="space-y-3">
          {data.education.map((e) => (
            <div key={e.id} className="flex items-baseline justify-between gap-3">
              <div>
                <h3 className="text-[12.5px] font-semibold">
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
                <p className="text-[11px] italic text-ink-500">
                  <EditableText
                    editable={editable}
                    value={e.school}
                    placeholder="School"
                    onCommit={(v) => updateEducation(data.id, e.id, { school: v })}
                  />
                  {(editable || e.location) && (
                    <>
                      {', '}
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
              <span className="whitespace-nowrap text-[10px] text-ink-400">
                {dateRange(e.startDate, e.endDate, false)}
              </span>
            </div>
          ))}
        </div>
      </section>
    ),

    skills: (editable || data.skills.length > 0) && (
      <section className="mt-7" key="skills">
        <SectionTitle color={theme.accent} font={fonts.heading}>Skills</SectionTitle>
        <p className="text-[11.5px] leading-relaxed text-ink-600">
          {(editable ? data.skills : data.skills.filter((s) => s.name)).map((s, i, arr) => (
            <span key={s.id}>
              <EditableText
                editable={editable}
                value={s.name}
                placeholder="Skill"
                onCommit={(v) => updateSkill(data.id, s.id, { name: v })}
              />
              {i < arr.length - 1 && '  ·  '}
            </span>
          ))}
        </p>
      </section>
    ),

    // Projects: card grid, same treatment as Experience.
    projects: (editable || data.projects.length > 0) && (
      <section className="mt-7" key="projects">
        <SectionTitle color={theme.accent} font={fonts.heading}>Projects</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          {data.projects.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-sm"
            >
              <div className="h-1 w-full" style={{ background: theme.accent }} />
              <div className="p-3.5">
                <h3 className="text-[12px] font-semibold leading-tight">
                  <EditableText
                    editable={editable}
                    value={p.name}
                    placeholder="Project name"
                    onCommit={(v) => updateProject(data.id, p.id, { name: v })}
                  />
                </h3>
                {(editable || p.tech) && (
                  <p className="mt-0.5 text-[10px] font-medium" style={{ color: theme.accent }}>
                    <EditableText
                      editable={editable}
                      value={p.tech}
                      placeholder="Tech used"
                      onCommit={(v) => updateProject(data.id, p.id, { tech: v })}
                    />
                  </p>
                )}
                <p className="mt-1.5 text-[10.5px] leading-snug text-ink-600">
                  <EditableText
                    editable={editable}
                    multiline
                    value={p.description}
                    placeholder="What did you build?"
                    onCommit={(v) => updateProject(data.id, p.id, { description: v })}
                  />
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    ),

    certifications: (editable || data.certifications.length > 0) && (
      <section className="mt-7" key="certifications">
        <SectionTitle color={theme.accent} font={fonts.heading}>Certifications</SectionTitle>
        <div className="space-y-1 text-[11.5px] text-ink-600">
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
      </section>
    ),

    languages: (editable || data.languages.length > 0) && (
      <section className="mt-7" key="languages">
        <SectionTitle color={theme.accent} font={fonts.heading}>Languages</SectionTitle>
        <div className="space-y-1 text-[11.5px] text-ink-600">
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
      </section>
    ),
  }

  const order = orderedSections(data, DEFAULT_ORDER, DEFAULT_ORDER)

  return (
    <div
      id="resume-page"
      style={{ width: PAGE_WIDTH, fontFamily: fonts.body }}
      className="min-h-[1123px] bg-white px-12 py-12 text-ink-900"
    >
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-[27px] font-bold tracking-tight" style={{ fontFamily: fonts.heading }}>
            <EditableText
              editable={editable}
              value={contact.fullName}
              placeholder="Your Name"
              onCommit={(v) => updateContact(data.id, { fullName: v })}
            />
          </h1>
          <p className="mt-1 text-[13px] font-medium" style={{ color: theme.text }}>
            <EditableText
              editable={editable}
              value={contact.title}
              placeholder="Your Job Title"
              onCommit={(v) => updateContact(data.id, { title: v })}
            />
          </p>
          {/* Accent rule under the title — the deliberate typographic weight
              this header carries instead of a plain centered block. */}
          <div className="mt-2 h-[3px] w-12 rounded-full" style={{ background: theme.accent }} />
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-ink-500">
            {visibleContactFields.map((f, i) => (
              <span key={f.key} className="flex items-center gap-3">
                <EditableText editable={editable} value={f.value} placeholder={f.placeholder} onCommit={f.onCommit} />
                {i < visibleContactFields.length - 1 && <span className="text-ink-300">•</span>}
              </span>
            ))}
          </div>
        </div>
        {contact.photo && (
          <img
            src={contact.photo}
            alt=""
            className="h-20 w-20 shrink-0 rounded-full object-cover"
            style={{ boxShadow: `0 0 0 3px ${lighten(theme.accent, 0.7)}` }}
          />
        )}
      </header>

      <div className="mt-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {order.map((key) => nodes[key])}
      </div>
    </div>
  )
}
