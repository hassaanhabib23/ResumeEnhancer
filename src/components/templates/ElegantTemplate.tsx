import type { ReorderableSection, ResumeData } from '../../lib/types'
import { dateRange } from '../../lib/format'
import { themeOf, fontsOf, PAGE_WIDTH, SkillBar, lighten, orderedSections } from './shared'
import { useResumeStore } from '../../lib/store'
import EditableText from './EditableText'

function SectionTitle({
  children,
  font,
}: {
  children: React.ReactNode
  font: string
}) {
  return (
    <h2
      className="mb-3 border-b border-ink-200 pb-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-ink-500"
      style={{ fontFamily: font }}
    >
      {children}
    </h2>
  )
}

function SideTitle({
  children,
  font,
}: {
  children: React.ReactNode
  font: string
}) {
  return (
    <h2
      className="mb-4 text-[10px] font-medium uppercase tracking-[0.22em] text-ink-400"
      style={{ fontFamily: font }}
    >
      {children}
    </h2>
  )
}

// This template's own default section order per zone — used whenever the
// user hasn't opened the drag-and-drop "Reorder sections" panel yet
// (data.sectionOrder is undefined), so it renders exactly as it always has.
const SIDEBAR_DEFAULT: ReorderableSection[] = ['skills', 'languages', 'certifications']
const MAIN_DEFAULT: ReorderableSection[] = ['summary', 'experience', 'education', 'projects']

export default function ElegantTemplate({
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

  const hasContact =
    contact.email ||
    contact.phone ||
    contact.location ||
    contact.website ||
    contact.linkedin ||
    contact.github

  const sidebarNodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    skills: (editable || data.skills.length > 0) && (
      <div className="mb-10" key="skills">
        <SideTitle font={fonts.heading}>Strengths</SideTitle>
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
      </div>
    ),
    languages: (editable || data.languages.length > 0) && (
      <div className="mb-10" key="languages">
        <SideTitle font={fonts.heading}>Languages</SideTitle>
        <div className="space-y-2.5 text-[11px] text-ink-700">
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
      </div>
    ),
    certifications: (editable || data.certifications.length > 0) && (
      <div className="mb-10" key="certifications">
        <SideTitle font={fonts.heading}>Certifications</SideTitle>
        <div className="space-y-3 text-[11px] text-ink-700">
          {data.certifications.map((c) => (
            <div key={c.id}>
              <div className="font-medium text-ink-900">
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
                {c.date ? ` · ${c.date}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  }

  const mainNodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    summary: (editable || data.summary) && (
      <section className="mt-8" key="summary">
        <SectionTitle font={fonts.heading}>Summary</SectionTitle>
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
    experience: (editable || data.experience.length > 0) && (
      <section className="mt-9" key="experience">
        <SectionTitle font={fonts.heading}>Experience</SectionTitle>
        <div className="space-y-6">
          {data.experience.map((e) => (
            <div key={e.id}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[13px] font-semibold text-ink-900">
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
              <p className="text-[11.5px] italic text-ink-500">
                <EditableText
                  editable={editable}
                  value={e.company}
                  placeholder="Company"
                  onCommit={(v) => updateExperience(data.id, e.id, { company: v })}
                />
                {(editable || e.location) && (
                  <>
                    {' · '}
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
      <section className="mt-9" key="education">
        <SectionTitle font={fonts.heading}>Education</SectionTitle>
        <div className="space-y-4">
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
              <span className="whitespace-nowrap text-[10px] text-ink-400">
                {dateRange(e.startDate, e.endDate, false)}
              </span>
            </div>
          ))}
        </div>
      </section>
    ),
    projects: (editable || data.projects.length > 0) && (
      <section className="mt-9" key="projects">
        <SectionTitle font={fonts.heading}>Projects</SectionTitle>
        <div className="space-y-4">
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

  const sidebarOrder = orderedSections(data, SIDEBAR_DEFAULT, SIDEBAR_DEFAULT)
  const mainOrder = orderedSections(data, MAIN_DEFAULT, MAIN_DEFAULT)

  return (
    <div
      id="resume-page"
      style={{ width: PAGE_WIDTH, fontFamily: fonts.body }}
      className="flex min-h-[1123px] bg-white text-ink-900"
    >
      <aside
        className="w-[31%] border-r bg-white px-8 py-14"
        style={{ borderColor: lighten(theme.accent, 0.75) }}
      >
        {contact.photo && (
          <div
            className="mb-10 flex h-32 w-32 items-center justify-center rounded-full"
            style={{ background: lighten(theme.accent, 0.85) }}
          >
            <img
              src={contact.photo}
              alt=""
              style={{ boxShadow: `0 0 0 1px ${theme.accentSoft}` }}
              className="h-28 w-28 rounded-full object-cover"
            />
          </div>
        )}

        {(editable || hasContact) && (
          <div className="mb-10">
            <SideTitle font={fonts.heading}>Contact</SideTitle>
            <div className="space-y-3 text-[11px] leading-relaxed text-ink-700">
              {(editable || contact.email) && (
                <div className="break-words">
                  <EditableText
                    editable={editable}
                    value={contact.email}
                    placeholder="you@email.com"
                    onCommit={(v) => updateContact(data.id, { email: v })}
                  />
                </div>
              )}
              {(editable || contact.phone) && (
                <div>
                  <EditableText
                    editable={editable}
                    value={contact.phone}
                    placeholder="Phone"
                    onCommit={(v) => updateContact(data.id, { phone: v })}
                  />
                </div>
              )}
              {(editable || contact.location) && (
                <div>
                  <EditableText
                    editable={editable}
                    value={contact.location}
                    placeholder="City, Country"
                    onCommit={(v) => updateContact(data.id, { location: v })}
                  />
                </div>
              )}
              {(editable || contact.website) && (
                <div className="break-words">
                  <EditableText
                    editable={editable}
                    value={contact.website}
                    placeholder="Website"
                    onCommit={(v) => updateContact(data.id, { website: v })}
                  />
                </div>
              )}
              {(editable || contact.linkedin) && (
                <div className="break-words">
                  <EditableText
                    editable={editable}
                    value={contact.linkedin}
                    placeholder="LinkedIn"
                    onCommit={(v) => updateContact(data.id, { linkedin: v })}
                  />
                </div>
              )}
              {(editable || contact.github) && (
                <div className="break-words">
                  <EditableText
                    editable={editable}
                    value={contact.github}
                    placeholder="GitHub"
                    onCommit={(v) => updateContact(data.id, { github: v })}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {sidebarOrder.map((key) => sidebarNodes[key])}
      </aside>

      <main className="flex-1 px-12 py-14">
        <header>
          <h1
            className="text-[32px] font-normal leading-tight tracking-[0.02em]"
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
            className="mt-2 text-[12.5px] font-medium uppercase tracking-[0.18em]"
            style={{ color: theme.accent }}
          >
            <EditableText
              editable={editable}
              value={contact.title}
              placeholder="Your Job Title"
              onCommit={(v) => updateContact(data.id, { title: v })}
            />
          </p>
          <div className="mt-6 h-px w-full" style={{ background: lighten(theme.accent, 0.75) }} />
        </header>

        {mainOrder.map((key) => mainNodes[key])}
      </main>
    </div>
  )
}
