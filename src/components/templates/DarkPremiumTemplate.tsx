import type { ReorderableSection, ResumeData } from '../../lib/types'
import { dateRange, initials } from '../../lib/format'
import { themeOf, fontsOf, PAGE_WIDTH, orderedSections } from './shared'
import { useResumeStore } from '../../lib/store'
import EditableText from './EditableText'

const DARK_BG = '#15131c'
const TEXT_PRIMARY = '#f5f4f8'
const TEXT_BODY = 'rgba(255,255,255,0.85)'
const TEXT_MUTED = 'rgba(255,255,255,0.5)'
const TEXT_FAINT = 'rgba(255,255,255,0.65)'
const DOT_EMPTY = 'rgba(255,255,255,0.15)'
const RULE_FAINT = 'rgba(255,255,255,0.12)'

function SectionHeading({
  children,
  color,
  font,
}: {
  children: React.ReactNode
  color: string
  font: string
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="h-[7px] w-[7px] shrink-0" style={{ background: color }} />
      <h2
        className="text-[11px] font-bold uppercase tracking-[0.28em]"
        style={{ color, fontFamily: font }}
      >
        {children}
      </h2>
      <span className="h-px flex-1" style={{ background: RULE_FAINT }} />
    </div>
  )
}

function DotRating({ level, color }: { level: number; color: string }) {
  const dots = [0, 1, 2, 3, 4]
  return (
    <div className="flex items-center gap-[3px]">
      {dots.map((i) => (
        <span
          key={i}
          className="h-[7px] w-[7px] rounded-full"
          style={{ background: i < level ? color : DOT_EMPTY }}
        />
      ))}
    </div>
  )
}

// This template's own default section order per zone — used whenever the
// user hasn't opened the drag-and-drop "Reorder sections" panel yet
// (data.sectionOrder is undefined), so it renders exactly as it always has.
const SIDEBAR_DEFAULT: ReorderableSection[] = ['skills', 'languages', 'certifications']
const MAIN_DEFAULT: ReorderableSection[] = ['summary', 'experience', 'education', 'projects']

export default function DarkPremiumTemplate({
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

  const mainNodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    summary: (editable || data.summary) && (
      <section key="summary">
        <SectionHeading color={theme.accent} font={fonts.heading}>
          Summary
        </SectionHeading>
        <p className="text-[12px] leading-relaxed" style={{ color: TEXT_BODY }}>
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
      <section key="experience">
        <SectionHeading color={theme.accent} font={fonts.heading}>
          Experience
        </SectionHeading>
        <div className="space-y-6">
          {data.experience.map((e) => (
            <div key={e.id}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[13px] font-bold" style={{ color: TEXT_PRIMARY }}>
                  <EditableText
                    editable={editable}
                    value={e.role}
                    placeholder="Role"
                    onCommit={(v) => updateExperience(data.id, e.id, { role: v })}
                  />
                </h3>
                <span className="whitespace-nowrap text-[10px] tracking-wide" style={{ color: TEXT_MUTED }}>
                  {dateRange(e.startDate, e.endDate, e.current)}
                </span>
              </div>
              <p className="text-[11.5px]" style={{ color: TEXT_MUTED }}>
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
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[11.5px] leading-relaxed" style={{ color: TEXT_BODY }}>
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
      <section key="education">
        <SectionHeading color={theme.accent} font={fonts.heading}>
          Education
        </SectionHeading>
        <div className="space-y-3">
          {data.education.map((e) => (
            <div key={e.id} className="flex items-baseline justify-between gap-3">
              <div>
                <h3 className="text-[12.5px] font-bold" style={{ color: TEXT_PRIMARY }}>
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
                <p className="text-[11px]" style={{ color: TEXT_MUTED }}>
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
                </p>
              </div>
              <span className="whitespace-nowrap text-[10px] tracking-wide" style={{ color: TEXT_MUTED }}>
                {dateRange(e.startDate, e.endDate, false)}
              </span>
            </div>
          ))}
        </div>
      </section>
    ),
    projects: (editable || data.projects.length > 0) && (
      <section key="projects">
        <SectionHeading color={theme.accent} font={fonts.heading}>
          Projects
        </SectionHeading>
        <div className="space-y-3">
          {data.projects.map((p) => (
            <div key={p.id}>
              <h3 className="text-[12.5px] font-bold" style={{ color: TEXT_PRIMARY }}>
                <EditableText
                  editable={editable}
                  value={p.name}
                  placeholder="Project name"
                  onCommit={(v) => updateProject(data.id, p.id, { name: v })}
                />
                {(editable || p.tech) && (
                  <span className="ml-2 text-[10.5px] font-normal" style={{ color: TEXT_MUTED }}>
                    <EditableText
                      editable={editable}
                      value={p.tech}
                      placeholder="Tech used"
                      onCommit={(v) => updateProject(data.id, p.id, { tech: v })}
                    />
                  </span>
                )}
              </h3>
              <p className="text-[11.5px] leading-relaxed" style={{ color: TEXT_BODY }}>
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
      <section key="skills">
        <SectionHeading color={theme.accent} font={fonts.heading}>
          Skills
        </SectionHeading>
        <div className="space-y-2.5">
          {data.skills.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3">
              <span className="text-[11px]" style={{ color: TEXT_BODY }}>
                <EditableText
                  editable={editable}
                  value={s.name}
                  placeholder="Skill"
                  onCommit={(v) => updateSkill(data.id, s.id, { name: v })}
                />
              </span>
              <DotRating level={s.level} color={theme.accent} />
            </div>
          ))}
        </div>
      </section>
    ),
    languages: (editable || data.languages.length > 0) && (
      <section key="languages">
        <SectionHeading color={theme.accent} font={fonts.heading}>
          Languages
        </SectionHeading>
        <div className="space-y-1.5 text-[11px]">
          {data.languages.map((l) => (
            <div key={l.id} className="flex justify-between gap-2">
              <span style={{ color: TEXT_BODY }}>
                <EditableText
                  editable={editable}
                  value={l.name}
                  placeholder="Language"
                  onCommit={(v) => updateLanguage(data.id, l.id, { name: v })}
                />
              </span>
              <span style={{ color: TEXT_MUTED }}>
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
      <section key="certifications">
        <SectionHeading color={theme.accent} font={fonts.heading}>
          Certifications
        </SectionHeading>
        <div className="space-y-2.5 text-[11px]">
          {data.certifications.map((c) => (
            <div key={c.id}>
              <div className="font-semibold" style={{ color: TEXT_PRIMARY }}>
                <EditableText
                  editable={editable}
                  value={c.name}
                  placeholder="Certification"
                  onCommit={(v) => updateCertification(data.id, c.id, { name: v })}
                />
              </div>
              <div style={{ color: TEXT_MUTED }}>
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
      </section>
    ),
  }

  const sidebarOrder = orderedSections(data, SIDEBAR_DEFAULT, SIDEBAR_DEFAULT)
  const mainOrder = orderedSections(data, MAIN_DEFAULT, MAIN_DEFAULT)

  return (
    <div
      id="resume-page"
      style={{ width: PAGE_WIDTH, fontFamily: fonts.body, background: DARK_BG, color: TEXT_BODY }}
      className="min-h-[1123px] px-12 py-14"
    >
      <header className="flex items-center gap-6 pb-8" style={{ borderBottom: `1px solid ${RULE_FAINT}` }}>
        {contact.photo ? (
          <img
            src={contact.photo}
            alt=""
            style={{ boxShadow: `0 0 0 3px ${theme.accent}` }}
            className="h-24 w-24 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            style={{
              boxShadow: `0 0 0 3px ${theme.accent}`,
              background: 'rgba(255,255,255,0.06)',
              color: theme.accent,
              fontFamily: fonts.heading,
            }}
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-xl font-bold"
          >
            {initials(contact.fullName || 'Y N')}
          </div>
        )}

        <div className="min-w-0">
          <h1
            className="text-[34px] font-extrabold leading-tight tracking-tight"
            style={{ fontFamily: fonts.heading, color: TEXT_PRIMARY }}
          >
            <EditableText
              editable={editable}
              value={contact.fullName}
              placeholder="Your Name"
              onCommit={(v) => updateContact(data.id, { fullName: v })}
            />
          </h1>
          <p
            className="mt-1 text-[13px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: theme.accent }}
          >
            <EditableText
              editable={editable}
              value={contact.title}
              placeholder="Your Job Title"
              onCommit={(v) => updateContact(data.id, { title: v })}
            />
          </p>

          {(editable || hasContact) && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[10.5px]" style={{ color: TEXT_FAINT }}>
              {(editable || contact.email) && (
                <span>
                  <EditableText
                    editable={editable}
                    value={contact.email}
                    placeholder="you@email.com"
                    onCommit={(v) => updateContact(data.id, { email: v })}
                  />
                </span>
              )}
              {(editable || contact.phone) && (
                <span>
                  <EditableText
                    editable={editable}
                    value={contact.phone}
                    placeholder="Phone"
                    onCommit={(v) => updateContact(data.id, { phone: v })}
                  />
                </span>
              )}
              {(editable || contact.location) && (
                <span>
                  <EditableText
                    editable={editable}
                    value={contact.location}
                    placeholder="City, Country"
                    onCommit={(v) => updateContact(data.id, { location: v })}
                  />
                </span>
              )}
              {(editable || contact.website) && (
                <span>
                  <EditableText
                    editable={editable}
                    value={contact.website}
                    placeholder="Website"
                    onCommit={(v) => updateContact(data.id, { website: v })}
                  />
                </span>
              )}
              {(editable || contact.linkedin) && (
                <span>
                  <EditableText
                    editable={editable}
                    value={contact.linkedin}
                    placeholder="LinkedIn"
                    onCommit={(v) => updateContact(data.id, { linkedin: v })}
                  />
                </span>
              )}
              {(editable || contact.github) && (
                <span>
                  <EditableText
                    editable={editable}
                    value={contact.github}
                    placeholder="GitHub"
                    onCommit={(v) => updateContact(data.id, { github: v })}
                  />
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="mt-9 flex gap-10">
        <main className="flex-1 space-y-8" style={{ minWidth: 0 }}>
          {mainOrder.map((key) => mainNodes[key])}
        </main>

        <aside className="w-[30%] shrink-0 space-y-8">
          {sidebarOrder.map((key) => sidebarNodes[key])}
        </aside>
      </div>
    </div>
  )
}
