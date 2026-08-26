import { useResumeStore } from '../../lib/store'
import type { ReorderableSection, ResumeData } from '../../lib/types'
import { dateRange } from '../../lib/format'
import { themeOf, fontsOf, PAGE_WIDTH, SkillBar, lighten, orderedSections, groupSkillsByCategory } from './shared'
import EditableText from './EditableText'

// This template's own default section order per zone — used whenever the
// user hasn't opened the drag-and-drop "Reorder sections" panel yet
// (data.sectionOrder is undefined), so it renders exactly as it always has.
const SIDEBAR_DEFAULT: ReorderableSection[] = ['skills', 'languages', 'certifications']
const MAIN_DEFAULT: ReorderableSection[] = ['summary', 'experience', 'education', 'projects']

export default function ModernTemplate({
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

  const sidebarNodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    skills: (editable || data.skills.length > 0) && (
      <div className="mt-8" key="skills">
        <h2
          className="mb-3 text-xs font-bold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Skills
        </h2>
        {groupSkillsByCategory(data.skills).map((group) => (
          <div key={group.category || '_none'} className="mb-3 last:mb-0">
            {group.category && (
              <p
                className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {group.category}
              </p>
            )}
            {group.skills.map((s) => (
              <SkillBar
                key={s.id}
                name={s.name}
                level={s.level}
                color="#ffffff"
                editable={editable}
                onNameCommit={(v) => updateSkill(data.id, s.id, { name: v })}
                style={data.skillStyle}
              />
            ))}
          </div>
        ))}
      </div>
    ),
    languages: (editable || data.languages.length > 0) && (
      <div className="mt-8" key="languages">
        <h2
          className="mb-3 text-xs font-bold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Languages
        </h2>
        <div className="space-y-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {data.languages.map((l) => (
            <div key={l.id} className="flex justify-between">
              <EditableText
                editable={editable}
                value={l.name}
                placeholder="Language"
                onCommit={(v) => updateLanguage(data.id, l.id, { name: v })}
              />
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>
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
      <div className="mt-8" key="certifications">
        <h2
          className="mb-3 text-xs font-bold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Certifications
        </h2>
        <div className="space-y-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
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
              <div style={{ color: 'rgba(255,255,255,0.6)' }}>
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
      <section className="mb-7" key="summary">
        <h2
          className="mb-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: theme.accent }}
        >
          Profile
        </h2>
        <p className="text-[12px] leading-relaxed text-ink-700">
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
    experience: (editable || data.experience.length > 0) && (
      <section className="mb-7" key="experience">
        <h2
          className="mb-3 text-xs font-bold uppercase tracking-widest"
          style={{ color: theme.accent }}
        >
          Experience
        </h2>
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
                <span className="whitespace-nowrap text-[10px] text-ink-400">
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
      </section>
    ),
    education: (editable || data.education.length > 0) && (
      <section className="mb-7" key="education">
        <h2
          className="mb-3 text-xs font-bold uppercase tracking-widest"
          style={{ color: theme.accent }}
        >
          Education
        </h2>
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
      <section key="projects">
        <h2
          className="mb-3 text-xs font-bold uppercase tracking-widest"
          style={{ color: theme.accent }}
        >
          Projects
        </h2>
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
      <aside style={{ background: theme.text }} className="w-[34%] px-7 py-10 text-white">
        {contact.photo && (
          <img
            src={contact.photo}
            alt=""
            style={{ boxShadow: '0 0 0 4px rgba(255,255,255,0.2)' }}
            className="mb-6 h-24 w-24 rounded-full object-cover"
          />
        )}
        <h1 className="text-xl font-bold leading-tight" style={{ fontFamily: fonts.heading }}>
          <EditableText
            editable={editable}
            value={contact.fullName}
            placeholder="Your Name"
            onCommit={(v) => updateContact(data.id, { fullName: v })}
          />
        </h1>
        <p className="mt-1 text-sm font-medium" style={{ color: lighten(theme.accent, 0.35) }}>
          <EditableText
            editable={editable}
            value={contact.title}
            placeholder="Your Job Title"
            onCommit={(v) => updateContact(data.id, { title: v })}
          />
        </p>

        <div
          className="mt-7 space-y-2 text-[11px] leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          {(editable || contact.email) && (
            <div>
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
            <div>
              <EditableText
                editable={editable}
                value={contact.website}
                placeholder="Website"
                onCommit={(v) => updateContact(data.id, { website: v })}
              />
            </div>
          )}
          {(editable || contact.linkedin) && (
            <div>
              <EditableText
                editable={editable}
                value={contact.linkedin}
                placeholder="LinkedIn"
                onCommit={(v) => updateContact(data.id, { linkedin: v })}
              />
            </div>
          )}
          {(editable || contact.github) && (
            <div>
              <EditableText
                editable={editable}
                value={contact.github}
                placeholder="GitHub"
                onCommit={(v) => updateContact(data.id, { github: v })}
              />
            </div>
          )}
        </div>

        {sidebarOrder.map((key) => sidebarNodes[key])}
      </aside>

      <main className="flex-1 px-8 py-10">{mainOrder.map((key) => mainNodes[key])}</main>
    </div>
  )
}
