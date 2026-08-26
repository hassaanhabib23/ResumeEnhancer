import type { ReorderableSection, ResumeData } from '../../lib/types'
import { dateRange } from '../../lib/format'
import { themeOf, fontsOf, PAGE_WIDTH, SkillBar, lighten, orderedSections } from './shared'
import EditableText from './EditableText'
import { useResumeStore } from '../../lib/store'

// This template's own default section order per zone — used whenever the
// user hasn't opened the drag-and-drop "Reorder sections" panel yet
// (data.sectionOrder is undefined), so it renders exactly as it always has.
// Note: `summary` is intentionally excluded — it renders as a pull-quote
// above the grid, permanently pinned like the contact/header block, never
// part of the reorderable zone system for this template.
const MAIN_DEFAULT: ReorderableSection[] = ['experience', 'education']
const SIDE_DEFAULT: ReorderableSection[] = ['skills', 'languages', 'certifications', 'projects']

function ColumnTitle({
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
      className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-500"
      style={{ fontFamily: font }}
    >
      <span className="inline-block h-[3px] w-4" style={{ background: color }} />
      {children}
    </h2>
  )
}

export default function EditorialTemplate({
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

  const contactFields: { key: string; value: string; placeholder: string; onCommit: (v: string) => void }[] = [
    { key: 'email', value: contact.email, placeholder: 'Email', onCommit: (v) => updateContact(data.id, { email: v }) },
    { key: 'phone', value: contact.phone, placeholder: 'Phone', onCommit: (v) => updateContact(data.id, { phone: v }) },
    { key: 'location', value: contact.location, placeholder: 'Location', onCommit: (v) => updateContact(data.id, { location: v }) },
    { key: 'website', value: contact.website, placeholder: 'Website', onCommit: (v) => updateContact(data.id, { website: v }) },
    { key: 'linkedin', value: contact.linkedin, placeholder: 'LinkedIn', onCommit: (v) => updateContact(data.id, { linkedin: v }) },
    { key: 'github', value: contact.github, placeholder: 'GitHub', onCommit: (v) => updateContact(data.id, { github: v }) },
  ]
  const visibleContactFields = contactFields.filter((f) => editable || f.value)

  const hasSideColumn =
    editable ||
    data.skills.length > 0 ||
    data.languages.length > 0 ||
    data.certifications.length > 0 ||
    data.projects.length > 0

  const mainNodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    experience: (editable || data.experience.length > 0) && (
      <section className="mb-9" key="experience">
        <ColumnTitle color={theme.accent} font={fonts.heading}>
          Experience
        </ColumnTitle>
        <div className="space-y-6">
          {data.experience.map((e) => (
            <div key={e.id}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[14.5px] font-bold" style={{ fontFamily: fonts.heading }}>
                  <EditableText
                    editable={editable}
                    value={e.role}
                    placeholder="Role"
                    onCommit={(v) => updateExperience(data.id, e.id, { role: v })}
                  />
                </h3>
                <span className="whitespace-nowrap text-[10px] text-ink-400">
                  {dateRange(e.startDate, e.endDate, e.current)}
                </span>
              </div>
              <p className="text-[11.5px] font-medium" style={{ color: theme.accent }}>
                <EditableText
                  editable={editable}
                  value={e.company}
                  placeholder="Company"
                  onCommit={(v) => updateExperience(data.id, e.id, { company: v })}
                />
                {(editable || e.location) && (
                  <>
                    {'  ·  '}
                    <EditableText
                      editable={editable}
                      value={e.location}
                      placeholder="Location"
                      onCommit={(v) => updateExperience(data.id, e.id, { location: v })}
                    />
                  </>
                )}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[11.5px] leading-relaxed text-ink-600">
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
      </section>
    ),
    education: (editable || data.education.length > 0) && (
      <section className="mb-9" key="education">
        <ColumnTitle color={theme.accent} font={fonts.heading}>
          Education
        </ColumnTitle>
        <div className="space-y-4">
          {data.education.map((e) => (
            <div key={e.id} className="flex items-baseline justify-between gap-3">
              <div>
                <h3 className="text-[13px] font-bold" style={{ fontFamily: fonts.heading }}>
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
                <p className="text-[11px] text-ink-500">
                  <EditableText
                    editable={editable}
                    value={e.school}
                    placeholder="School"
                    onCommit={(v) => updateEducation(data.id, e.id, { school: v })}
                  />
                  {(editable || e.location) && (
                    <>
                      {'  ·  '}
                      <EditableText
                        editable={editable}
                        value={e.location}
                        placeholder="Location"
                        onCommit={(v) => updateEducation(data.id, e.id, { location: v })}
                      />
                    </>
                  )}
                  {e.gpa ? `  ·  GPA ${e.gpa}` : ''}
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
  }

  const sideNodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    skills: (editable || data.skills.length > 0) && (
      <section className="mb-9" key="skills">
        <ColumnTitle color={theme.accent} font={fonts.heading}>
          Skills
        </ColumnTitle>
        {data.skills.map((s) => (
          <SkillBar
            key={s.id}
            name={s.name}
            level={s.level}
            color={theme.accent}
            editable={editable}
            onNameCommit={(v) => updateSkill(data.id, s.id, { name: v })}
            style={data.skillStyle}
          />
        ))}
      </section>
    ),
    languages: (editable || data.languages.length > 0) && (
      <section className="mb-9" key="languages">
        <ColumnTitle color={theme.accent} font={fonts.heading}>
          Languages
        </ColumnTitle>
        <div className="space-y-2 text-[11px] text-ink-600">
          {data.languages.map((l) => (
            <div key={l.id} className="flex justify-between gap-2">
              <EditableText
                editable={editable}
                value={l.name}
                placeholder="Language"
                onCommit={(v) => updateLanguage(data.id, l.id, { name: v })}
              />
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
    certifications: (editable || data.certifications.length > 0) && (
      <section className="mb-9" key="certifications">
        <ColumnTitle color={theme.accent} font={fonts.heading}>
          Certifications
        </ColumnTitle>
        <div className="space-y-3 text-[11px] text-ink-600">
          {data.certifications.map((c) => (
            <div key={c.id}>
              <div className="font-semibold text-ink-900">
                <EditableText
                  editable={editable}
                  value={c.name}
                  placeholder="Certification"
                  onCommit={(v) => updateCertification(data.id, c.id, { name: v })}
                />
              </div>
              <div className="text-ink-400">
                <EditableText
                  editable={editable}
                  value={c.issuer}
                  placeholder="Issuer"
                  onCommit={(v) => updateCertification(data.id, c.id, { issuer: v })}
                />
                {c.date ? `  ·  ${c.date}` : ''}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    projects: (editable || data.projects.length > 0) && (
      <section className="mb-9" key="projects">
        <ColumnTitle color={theme.accent} font={fonts.heading}>
          Projects
        </ColumnTitle>
        <div className="space-y-3.5 text-[11px] text-ink-600">
          {data.projects.map((p) => (
            <div key={p.id}>
              <h3 className="text-[11.5px] font-semibold text-ink-900">
                <EditableText
                  editable={editable}
                  value={p.name}
                  placeholder="Project name"
                  onCommit={(v) => updateProject(data.id, p.id, { name: v })}
                />
              </h3>
              {(editable || p.tech) && (
                <p className="text-[10px] text-ink-400">
                  <EditableText
                    editable={editable}
                    value={p.tech}
                    placeholder="Tech used"
                    onCommit={(v) => updateProject(data.id, p.id, { tech: v })}
                  />
                </p>
              )}
              <p className="leading-relaxed">
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
      </section>
    ),
  }

  const mainOrder = orderedSections(data, MAIN_DEFAULT, MAIN_DEFAULT)
  const sideOrder = orderedSections(data, SIDE_DEFAULT, SIDE_DEFAULT)

  return (
    <div
      id="resume-page"
      style={{ width: PAGE_WIDTH, fontFamily: fonts.body }}
      className="min-h-[1123px] bg-white px-14 pb-14 pt-12 text-ink-900"
    >
      {/* Masthead */}
      <header>
        <h1
          className="text-[58px] font-bold leading-[0.95] tracking-[-0.02em]"
          style={{ fontFamily: fonts.heading, color: theme.text }}
        >
          <EditableText
            editable={editable}
            value={contact.fullName}
            placeholder="Your Name"
            onCommit={(v) => updateContact(data.id, { fullName: v })}
          />
        </h1>
        <p
          className="mt-3 text-[13px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: theme.accent }}
        >
          <EditableText
            editable={editable}
            value={contact.title}
            placeholder="Your Job Title"
            onCommit={(v) => updateContact(data.id, { title: v })}
          />
        </p>

        {visibleContactFields.length > 0 && (
          <div
            className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-b py-2.5 text-[10.5px] text-ink-500"
            style={{ borderColor: lighten(theme.text, 0.82) }}
          >
            {visibleContactFields.map((f, i) => (
              <span key={f.key} className="flex items-center gap-4">
                <EditableText editable={editable} value={f.value} placeholder={f.placeholder} onCommit={f.onCommit} />
                {i < visibleContactFields.length - 1 && (
                  <span aria-hidden style={{ color: lighten(theme.text, 0.7) }}>
                    /
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Pull quote */}
      {(editable || data.summary) && (
        <section className="my-10 max-w-[640px]">
          <span
            aria-hidden
            className="block text-5xl font-bold leading-none"
            style={{ fontFamily: fonts.heading, color: theme.accent }}
          >
            &ldquo;
          </span>
          <p
            className="-mt-4 text-[19px] italic leading-[1.55] text-ink-800"
            style={{ fontFamily: fonts.heading }}
          >
            <EditableText
              editable={editable}
              multiline
              rich
              value={data.summary}
              placeholder="A short summary of your experience and strengths…"
              onCommit={(v) => updateSummary(data.id, v)}
            />
          </p>
        </section>
      )}

      {/* Editorial grid */}
      <div className={hasSideColumn ? 'grid grid-cols-3 gap-x-10' : 'grid grid-cols-1'}>
        <div className={hasSideColumn ? 'col-span-2' : 'col-span-1'}>
          {mainOrder.map((key) => mainNodes[key])}
        </div>

        {hasSideColumn && (
          <div className="col-span-1 border-l pl-8" style={{ borderColor: lighten(theme.text, 0.85) }}>
            {sideOrder.map((key) => sideNodes[key])}
          </div>
        )}
      </div>
    </div>
  )
}
