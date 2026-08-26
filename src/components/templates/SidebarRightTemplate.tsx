import { useResumeStore } from '../../lib/store'
import type { ReorderableSection, ResumeData } from '../../lib/types'
import { dateRange } from '../../lib/format'
import { themeOf, fontsOf, PAGE_WIDTH, SkillBar, lighten, orderedSections } from './shared'
import EditableText from './EditableText'

// This template's own default section order per zone — used whenever the
// user hasn't opened the drag-and-drop "Reorder sections" panel yet
// (data.sectionOrder is undefined), so it renders exactly as it always has.
const SIDEBAR_DEFAULT: ReorderableSection[] = ['skills', 'languages', 'certifications']
const MAIN_DEFAULT: ReorderableSection[] = ['summary', 'experience', 'education', 'projects']

function MainSectionTitle({
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
      className="mb-3 flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.14em]"
      style={{ color, fontFamily: font }}
    >
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {children}
    </h2>
  )
}

function SidebarSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-3 border-b pb-2 text-[10.5px] font-bold uppercase tracking-[0.18em]"
      style={{ color: 'rgba(255,255,255,0.75)', borderColor: 'rgba(255,255,255,0.2)' }}
    >
      {children}
    </h2>
  )
}

export default function SidebarRightTemplate({
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

  const mainNodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    summary: (editable || data.summary) && (
      <section className="mt-7" key="summary">
        <MainSectionTitle color={theme.accent} font={fonts.heading}>Summary</MainSectionTitle>
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
      <section className="mt-7" key="experience">
        <MainSectionTitle color={theme.accent} font={fonts.heading}>Experience</MainSectionTitle>
        <div className="space-y-5">
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
              <p className="text-[11.5px] text-ink-500">
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
      <section className="mt-7" key="education">
        <MainSectionTitle color={theme.accent} font={fonts.heading}>Education</MainSectionTitle>
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
              <span className="whitespace-nowrap text-[10px] text-ink-400">
                {dateRange(e.startDate, e.endDate, false)}
              </span>
            </div>
          ))}
        </div>
      </section>
    ),
    projects: (editable || data.projects.length > 0) && (
      <section className="mt-7" key="projects">
        <MainSectionTitle color={theme.accent} font={fonts.heading}>Projects</MainSectionTitle>
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

  const sidebarNodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    skills: (editable || data.skills.length > 0) && (
      <div className="mb-8" key="skills">
        <SidebarSectionTitle>Skills</SidebarSectionTitle>
        {data.skills.map((s) => (
          <SkillBar
            key={s.id}
            name={s.name}
            level={s.level}
            color={lighten(theme.accent, 0.35)}
            editable={editable}
            onNameCommit={(v) => updateSkill(data.id, s.id, { name: v })}
            style={data.skillStyle}
          />
        ))}
      </div>
    ),
    languages: (editable || data.languages.length > 0) && (
      <div className="mb-8" key="languages">
        <SidebarSectionTitle>Languages</SidebarSectionTitle>
        <div className="space-y-1.5 text-[10.5px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {data.languages.map((l) => (
            <div key={l.id} className="flex justify-between gap-2">
              <EditableText
                editable={editable}
                value={l.name}
                placeholder="Language"
                onCommit={(v) => updateLanguage(data.id, l.id, { name: v })}
              />
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>
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
      <div className="mb-8" key="certifications">
        <SidebarSectionTitle>Certifications</SidebarSectionTitle>
        <div className="space-y-2.5 text-[10.5px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {data.certifications.map((c) => (
            <div key={c.id}>
              <div className="font-medium text-white">
                <EditableText
                  editable={editable}
                  value={c.name}
                  placeholder="Certification"
                  onCommit={(v) => updateCertification(data.id, c.id, { name: v })}
                />
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)' }}>
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

  const mainOrder = orderedSections(data, MAIN_DEFAULT, MAIN_DEFAULT)
  const sidebarOrder = orderedSections(data, SIDEBAR_DEFAULT, SIDEBAR_DEFAULT)

  return (
    <div
      id="resume-page"
      style={{ width: PAGE_WIDTH, fontFamily: fonts.body }}
      className="flex min-h-[1123px] bg-white text-ink-900"
    >
      <main className="flex-1 px-10 py-12">
        <header className="flex items-center gap-5 border-b-2 pb-6" style={{ borderColor: theme.accentSoft }}>
          {contact.photo && (
            <img
              src={contact.photo}
              alt=""
              style={{ boxShadow: `0 0 0 4px ${theme.accentSoft}` }}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
          )}
          <div>
            <h1
              className="text-[28px] font-bold leading-tight tracking-tight"
              style={{ fontFamily: fonts.heading, color: theme.text }}
            >
              <EditableText
                editable={editable}
                value={contact.fullName}
                placeholder="Your Name"
                onCommit={(v) => updateContact(data.id, { fullName: v })}
              />
            </h1>
            <p className="mt-1 text-[13px] font-medium" style={{ color: theme.accent }}>
              <EditableText
                editable={editable}
                value={contact.title}
                placeholder="Your Job Title"
                onCommit={(v) => updateContact(data.id, { title: v })}
              />
            </p>
          </div>
        </header>

        {mainOrder.map((key) => mainNodes[key])}
      </main>

      <aside style={{ background: theme.text }} className="w-[30%] px-6 py-12 text-white">
        {(editable ||
          contact.email ||
          contact.phone ||
          contact.location ||
          contact.website ||
          contact.linkedin ||
          contact.github) && (
          <div className="mb-8">
            <SidebarSectionTitle>Contact</SidebarSectionTitle>
            <div
              className="space-y-2 text-[10.5px] leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
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
    </div>
  )
}
