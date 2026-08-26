import { useResumeStore } from '../../lib/store'
import type { ReorderableSection, ResumeData } from '../../lib/types'
import { dateRange, initials } from '../../lib/format'
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
      className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.22em]"
      style={{ color, fontFamily: font }}
    >
      {children}
      <span className="mx-auto mt-1.5 block h-px w-10" style={{ background: lighten(color, 0.35) }} />
    </h2>
  )
}

// Single-column, ceremonial/formal template. The whole flow lives inside a
// double-rule page frame (see the root element below), and the header is a
// fully centered, symmetric block topped by either the person's photo or a
// circular monogram badge — never both at once.
const DEFAULT_ORDER: ReorderableSection[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
]

export default function FramedTemplate({
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
      <section className="mt-8" key="summary">
        <SectionTitle color={theme.accent} font={fonts.heading}>Summary</SectionTitle>
        <p className="text-center text-[12px] leading-relaxed text-ink-700">
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
    experience: (editable || data.experience.length > 0) && (
      <section className="mt-8" key="experience">
        <SectionTitle color={theme.accent} font={fonts.heading}>Experience</SectionTitle>
        <div className="space-y-5">
          {data.experience.map((e) => (
            <div key={e.id}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[13px] font-semibold">
                  <EditableText
                    editable={editable}
                    value={e.role}
                    placeholder="Role"
                    onCommit={(v) => updateExperience(data.id, e.id, { role: v })}
                  />
                </h3>
                <span className="whitespace-nowrap text-[10px] italic text-ink-400">
                  {dateRange(e.startDate, e.endDate, e.current)}
                </span>
              </div>
              <p className="text-[11.5px] italic text-ink-500">
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
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[11.5px] leading-relaxed text-ink-600">
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
          ))}
        </div>
      </section>
    ),
    education: (editable || data.education.length > 0) && (
      <section className="mt-8" key="education">
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
                  {e.gpa ? ` · GPA: ${e.gpa}` : ''}
                </p>
              </div>
              <span className="whitespace-nowrap text-[10px] italic text-ink-400">
                {dateRange(e.startDate, e.endDate, false)}
              </span>
            </div>
          ))}
        </div>
      </section>
    ),
    skills: (editable || data.skills.length > 0) && (
      <section className="mt-8" key="skills">
        <SectionTitle color={theme.accent} font={fonts.heading}>Skills</SectionTitle>
        <p className="text-center text-[11.5px] leading-relaxed text-ink-600">
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
    projects: (editable || data.projects.length > 0) && (
      <section className="mt-8" key="projects">
        <SectionTitle color={theme.accent} font={fonts.heading}>Projects</SectionTitle>
        <div className="space-y-3">
          {data.projects.map((p) => (
            <div key={p.id}>
              <h3 className="text-[12.5px] font-semibold">
                <EditableText
                  editable={editable}
                  value={p.name}
                  placeholder="Project name"
                  onCommit={(v) => updateProject(data.id, p.id, { name: v })}
                />
              </h3>
              <p className="text-[11.5px] leading-relaxed text-ink-600">
                <EditableText
                  editable={editable}
                  multiline
                  value={p.description}
                  placeholder="What did you build?"
                  onCommit={(v) => updateProject(data.id, p.id, { description: v })}
                />
              </p>
            </div>
          ))}
        </div>
      </section>
    ),
    certifications: (editable || data.certifications.length > 0) && (
      <section className="mt-8" key="certifications">
        <SectionTitle color={theme.accent} font={fonts.heading}>Certifications</SectionTitle>
        <div className="space-y-1 text-center text-[11.5px] text-ink-600">
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
      <section className="mt-8" key="languages">
        <SectionTitle color={theme.accent} font={fonts.heading}>Languages</SectionTitle>
        <div className="space-y-1 text-center text-[11.5px] text-ink-600">
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
      className="min-h-[1123px] bg-white text-ink-900"
    >
      {/* Outer + inner rule create the certificate-style "double frame" around
          the whole page. Generous padding on both keeps text well clear of
          the lines so nothing ever touches or crosses them. */}
      <div className="h-full min-h-[1123px] p-4" style={{ border: `1px solid ${theme.accent}` }}>
        <div
          className="h-full min-h-[1091px] px-12 py-11"
          style={{ border: `1px solid ${lighten(theme.accent, 0.35)}` }}
        >
          <header className="text-center">
            {contact.photo ? (
              <img
                src={contact.photo}
                alt=""
                className="mx-auto mb-4 h-16 w-16 rounded-full object-cover"
                style={{ border: `1px solid ${theme.accent}` }}
              />
            ) : (
              // Derived purely from the name field, which is edited separately
              // just below — this badge itself is display-only, never a text
              // field a user can click into.
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-[15px] font-semibold tracking-wide"
                style={{ border: `1px solid ${theme.accent}`, color: theme.accent, fontFamily: fonts.heading }}
              >
                {initials(contact.fullName) || '?'}
              </div>
            )}

            <h1
              className="text-[24px] font-semibold uppercase tracking-[0.08em]"
              style={{ fontFamily: fonts.heading }}
            >
              <EditableText
                editable={editable}
                value={contact.fullName}
                placeholder="Your Name"
                onCommit={(v) => updateContact(data.id, { fullName: v })}
              />
            </h1>
            <p className="mt-1.5 text-[12px] uppercase tracking-[0.14em]" style={{ color: theme.accent }}>
              <EditableText
                editable={editable}
                value={contact.title}
                placeholder="Your Job Title"
                onCommit={(v) => updateContact(data.id, { title: v })}
              />
            </p>
            <div className="mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.06em] text-ink-500">
              {visibleContactFields.map((f, i) => (
                <span key={f.key} className="flex items-center gap-3">
                  <EditableText editable={editable} value={f.value} placeholder={f.placeholder} onCommit={f.onCommit} />
                  {i < visibleContactFields.length - 1 && <span className="text-ink-300">•</span>}
                </span>
              ))}
            </div>
            <div className="mx-auto mt-6 h-px w-full" style={{ background: lighten(theme.accent, 0.55) }} />
          </header>

          <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{order.map((key) => nodes[key])}</div>
        </div>
      </div>
    </div>
  )
}
