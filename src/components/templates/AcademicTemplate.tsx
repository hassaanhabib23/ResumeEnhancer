import { useResumeStore } from '../../lib/store'
import type { ReorderableSection, ResumeData } from '../../lib/types'
import { dateRange } from '../../lib/format'
import { themeOf, fontsOf, PAGE_WIDTH, orderedSections } from './shared'
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
      className="mb-2 inline-block border-b pb-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-800"
      style={{ borderColor: color, fontFamily: font }}
    >
      {children}
    </h2>
  )
}

// Single-column template. Note the CV/academic-style default order — Education
// comes before Experience — which is intentional and distinctive to this
// template; it's preserved as the fallback whenever the user hasn't opened
// the drag-and-drop reorder panel (data.sectionOrder is undefined).
const DEFAULT_ORDER: ReorderableSection[] = [
  'summary',
  'education',
  'experience',
  'certifications',
  'projects',
  'skills',
  'languages',
]

export default function AcademicTemplate({
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

  const contactLine = [
    contact.email,
    contact.phone,
    contact.location,
    contact.website,
    contact.linkedin,
    contact.github,
  ].filter(Boolean)

  const nodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    summary: (editable || data.summary) && (
      <section key="summary">
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Summary
        </SectionTitle>
        <p className="text-[11.5px] leading-snug text-ink-700">
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
    ),
    education: (editable || data.education.length > 0) && (
      <section key="education">
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Education
        </SectionTitle>
        <div className="space-y-2.5">
          {data.education.map((e) => (
            <div key={e.id} className="flex items-baseline justify-between gap-3">
              <div>
                <h3 className="text-[11.5px] font-semibold">
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
                <p className="text-[10.5px] italic text-ink-500">
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
              <span className="whitespace-nowrap text-[10px] text-ink-400">
                {dateRange(e.startDate, e.endDate, false)}
              </span>
            </div>
          ))}
        </div>
      </section>
    ),
    experience: (editable || data.experience.length > 0) && (
      <section key="experience">
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Experience
        </SectionTitle>
        <div className="space-y-3.5">
          {data.experience.map((e) => (
            <div key={e.id}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[11.5px] font-semibold">
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
              <p className="text-[10.5px] italic text-ink-500">
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
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] leading-snug text-ink-600">
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
    certifications: (editable || data.certifications.length > 0) && (
      <section key="certifications">
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Certifications
        </SectionTitle>
        <div className="space-y-1 text-[11px] text-ink-600">
          {data.certifications.map((c) => (
            <div key={c.id}>
              <EditableText
                editable={editable}
                value={c.name}
                placeholder="Certification"
                onCommit={(v) => updateCertification(data.id, c.id, { name: v })}
              />
              <span className="text-ink-400">
                {(editable || c.issuer) && (
                  <>
                    {' — '}
                    <EditableText
                      editable={editable}
                      value={c.issuer}
                      placeholder="Issuer"
                      onCommit={(v) => updateCertification(data.id, c.id, { issuer: v })}
                    />
                  </>
                )}
                {c.date ? `, ${c.date}` : ''}
              </span>
            </div>
          ))}
        </div>
      </section>
    ),
    projects: (editable || data.projects.length > 0) && (
      <section key="projects">
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Projects
        </SectionTitle>
        <div className="space-y-2">
          {data.projects.map((p) => (
            <div key={p.id}>
              <h3 className="text-[11.5px] font-semibold">
                <EditableText
                  editable={editable}
                  value={p.name}
                  placeholder="Project name"
                  onCommit={(v) => updateProject(data.id, p.id, { name: v })}
                />
                {(editable || p.tech) && (
                  <span className="ml-2 text-[10px] font-normal text-ink-400">
                    <EditableText
                      editable={editable}
                      value={p.tech}
                      placeholder="Tech used"
                      onCommit={(v) => updateProject(data.id, p.id, { tech: v })}
                    />
                  </span>
                )}
              </h3>
              <p className="text-[11px] leading-snug text-ink-600">
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
    skills: (editable || data.skills.length > 0) && (
      <section key="skills">
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Skills
        </SectionTitle>
        <p className="text-[11px] leading-snug text-ink-600">
          {data.skills.map((s, i) => (
            <span key={s.id}>
              <EditableText
                editable={editable}
                value={s.name}
                placeholder="Skill"
                onCommit={(v) => updateSkill(data.id, s.id, { name: v })}
              />
              {i < data.skills.length - 1 && '  ·  '}
            </span>
          ))}
        </p>
      </section>
    ),
    languages: (editable || data.languages.length > 0) && (
      <section key="languages">
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Languages
        </SectionTitle>
        <p className="text-[11px] leading-snug text-ink-600">
          {data.languages.map((l, i) => (
            <span key={l.id}>
              <EditableText
                editable={editable}
                value={l.name}
                placeholder="Language"
                onCommit={(v) => updateLanguage(data.id, l.id, { name: v })}
              />
              {(editable || l.level) && (
                <>
                  {' ('}
                  <EditableText
                    editable={editable}
                    value={l.level}
                    placeholder="Level"
                    onCommit={(v) => updateLanguage(data.id, l.id, { level: v })}
                  />
                  {')'}
                </>
              )}
              {i < data.languages.length - 1 && '  ·  '}
            </span>
          ))}
        </p>
      </section>
    ),
  }

  const order = orderedSections(data, DEFAULT_ORDER, DEFAULT_ORDER)

  return (
    <div
      id="resume-page"
      style={{ width: PAGE_WIDTH, fontFamily: fonts.body }}
      className="min-h-[1123px] bg-white px-14 py-11 text-ink-900"
    >
      <header className="text-center">
        <h1
          className="text-[19px] font-medium uppercase tracking-[0.14em]"
          style={{ fontFamily: fonts.heading }}
        >
          <EditableText
            editable={editable}
            value={contact.fullName}
            placeholder="Your Name"
            onCommit={(v) => updateContact(data.id, { fullName: v })}
          />
        </h1>
        <div className="mx-auto mt-2 flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] uppercase tracking-[0.06em] text-ink-500">
          <span className="font-medium" style={{ color: theme.accent }}>
            <EditableText
              editable={editable}
              value={contact.title}
              placeholder="Your Job Title"
              onCommit={(v) => updateContact(data.id, { title: v })}
            />
          </span>
          {(editable || contactLine.length > 0) && <span className="text-ink-300">|</span>}
          {(editable || contact.email) && (
            <span className="flex items-center gap-2">
              <EditableText
                editable={editable}
                value={contact.email}
                placeholder="you@email.com"
                onCommit={(v) => updateContact(data.id, { email: v })}
              />
              {(editable ||
                contact.phone ||
                contact.location ||
                contact.website ||
                contact.linkedin ||
                contact.github) && <span className="text-ink-300">|</span>}
            </span>
          )}
          {(editable || contact.phone) && (
            <span className="flex items-center gap-2">
              <EditableText
                editable={editable}
                value={contact.phone}
                placeholder="Phone"
                onCommit={(v) => updateContact(data.id, { phone: v })}
              />
              {(editable || contact.location || contact.website || contact.linkedin || contact.github) && (
                <span className="text-ink-300">|</span>
              )}
            </span>
          )}
          {(editable || contact.location) && (
            <span className="flex items-center gap-2">
              <EditableText
                editable={editable}
                value={contact.location}
                placeholder="City, Country"
                onCommit={(v) => updateContact(data.id, { location: v })}
              />
              {(editable || contact.website || contact.linkedin || contact.github) && (
                <span className="text-ink-300">|</span>
              )}
            </span>
          )}
          {(editable || contact.website) && (
            <span className="flex items-center gap-2">
              <EditableText
                editable={editable}
                value={contact.website}
                placeholder="Website"
                onCommit={(v) => updateContact(data.id, { website: v })}
              />
              {(editable || contact.linkedin || contact.github) && <span className="text-ink-300">|</span>}
            </span>
          )}
          {(editable || contact.linkedin) && (
            <span className="flex items-center gap-2">
              <EditableText
                editable={editable}
                value={contact.linkedin}
                placeholder="LinkedIn"
                onCommit={(v) => updateContact(data.id, { linkedin: v })}
              />
              {(editable || contact.github) && <span className="text-ink-300">|</span>}
            </span>
          )}
          {(editable || contact.github) && (
            <span className="flex items-center gap-2">
              <EditableText
                editable={editable}
                value={contact.github}
                placeholder="GitHub"
                onCommit={(v) => updateContact(data.id, { github: v })}
              />
            </span>
          )}
        </div>
        <div className="mx-auto mt-4 w-full">
          <div className="h-[2px] w-full" style={{ background: theme.text }} />
          <div className="mt-[3px] h-px w-full" style={{ background: theme.accent }} />
        </div>
      </header>

      <div className="mt-6 space-y-5">{order.map((key) => nodes[key])}</div>
    </div>
  )
}
