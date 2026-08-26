import { useResumeStore } from '../../lib/store'
import type { ReorderableSection, ResumeData } from '../../lib/types'
import { dateRange } from '../../lib/format'
import { themeOf, fontsOf, PAGE_WIDTH, orderedSections, groupSkillsByCategory } from './shared'
import EditableText from './EditableText'

function SectionTitle({ children, font }: { children: React.ReactNode; font: string }) {
  return (
    <h2
      className="mb-1.5 border-b border-ink-900 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-900"
      style={{ fontFamily: font }}
    >
      {children}
    </h2>
  )
}

// "ATS Plain" is the deliberate opposite of the colorful designed layouts:
// strictly black-and-white, single column, no photo, no bars, no icons — the
// traditional resume format built to be parsed cleanly by ATS software. The
// one exception is the job-title line, which carries the selected color
// theme's accent so the five themes remain visibly distinct.
//
// Single-column template — every reorderable section flows through one
// list in order. Unlike the other single-column layouts, no two sections
// ever pair into a grid here: staying strictly linear is part of what
// keeps this layout parsing cleanly for ATS software.
const DEFAULT_ORDER: ReorderableSection[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
]

export default function AtsPlainTemplate({
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
        <SectionTitle font={fonts.heading}>Summary</SectionTitle>
        <p className="text-[10.5px] leading-snug text-ink-700">
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
      <section key="experience">
        <SectionTitle font={fonts.heading}>Experience</SectionTitle>
        <div className="space-y-2">
          {data.experience.map((e) => (
            <div key={e.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <h3 className="text-[11px] font-bold text-ink-900">
                  <EditableText
                    editable={editable}
                    value={e.role}
                    placeholder="Role"
                    onCommit={(v) => updateExperience(data.id, e.id, { role: v })}
                  />
                  {(editable || e.company) && (
                    <span className="font-normal">
                      {' — '}
                      <EditableText
                        editable={editable}
                        value={e.company}
                        placeholder="Company"
                        onCommit={(v) => updateExperience(data.id, e.id, { company: v })}
                      />
                    </span>
                  )}
                  {(editable || e.location) && (
                    <span className="font-normal text-ink-500">
                      {' · '}
                      <EditableText
                        editable={editable}
                        value={e.location}
                        placeholder="Location"
                        onCommit={(v) => updateExperience(data.id, e.id, { location: v })}
                      />
                    </span>
                  )}
                </h3>
                <span className="whitespace-nowrap text-[9.5px] font-medium text-ink-600">
                  {dateRange(e.startDate, e.endDate, e.current)}
                </span>
              </div>
              <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[10px] leading-snug text-ink-700">
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
      <section key="education">
        <SectionTitle font={fonts.heading}>Education</SectionTitle>
        <div className="space-y-1">
          {data.education.map((e) => (
            <div key={e.id} className="flex flex-wrap items-baseline justify-between gap-x-2">
              <h3 className="text-[10.5px] font-bold text-ink-900">
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
                {(editable || e.school) && (
                  <span className="font-normal">
                    {' — '}
                    <EditableText
                      editable={editable}
                      value={e.school}
                      placeholder="School"
                      onCommit={(v) => updateEducation(data.id, e.id, { school: v })}
                    />
                  </span>
                )}
                {(editable || e.location) && (
                  <span className="font-normal text-ink-500">
                    {' · '}
                    <EditableText
                      editable={editable}
                      value={e.location}
                      placeholder="Location"
                      onCommit={(v) => updateEducation(data.id, e.id, { location: v })}
                    />
                  </span>
                )}
                {e.gpa && <span className="font-normal text-ink-500"> · GPA {e.gpa}</span>}
              </h3>
              <span className="whitespace-nowrap text-[9.5px] font-medium text-ink-600">
                {dateRange(e.startDate, e.endDate, false)}
              </span>
            </div>
          ))}
        </div>
      </section>
    ),
    skills: (editable || data.skills.length > 0) && (
      <section key="skills">
        <SectionTitle font={fonts.heading}>Skills</SectionTitle>
        {groupSkillsByCategory(data.skills).map((group) => (
          <p key={group.category || '_none'} className="text-[10px] leading-snug text-ink-700">
            {group.category && <span className="font-semibold text-ink-800">{group.category}: </span>}
            {group.skills.map((s, i) => (
              <span key={s.id}>
                <EditableText
                  editable={editable}
                  value={s.name}
                  placeholder="Skill"
                  onCommit={(v) => updateSkill(data.id, s.id, { name: v })}
                />
                {i < group.skills.length - 1 && <span className="text-ink-400"> | </span>}
              </span>
            ))}
          </p>
        ))}
      </section>
    ),
    projects: (editable || data.projects.length > 0) && (
      <section key="projects">
        <SectionTitle font={fonts.heading}>Projects</SectionTitle>
        <div className="space-y-1.5">
          {data.projects.map((p) => (
            <div key={p.id}>
              <h3 className="text-[10.5px] font-bold text-ink-900">
                <EditableText
                  editable={editable}
                  value={p.name}
                  placeholder="Project name"
                  onCommit={(v) => updateProject(data.id, p.id, { name: v })}
                />
                {(editable || p.tech) && (
                  <span className="font-normal text-ink-500">
                    {' — '}
                    <EditableText
                      editable={editable}
                      value={p.tech}
                      placeholder="Tech used"
                      onCommit={(v) => updateProject(data.id, p.id, { tech: v })}
                    />
                  </span>
                )}
              </h3>
              {(editable || p.description) && (
                <p className="text-[10px] leading-snug text-ink-700">
                  <EditableText
                    editable={editable}
                    multiline
                    rich
                    value={p.description}
                    placeholder="What did you build?"
                    onCommit={(v) => updateProject(data.id, p.id, { description: v })}
                  />
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    ),
    certifications: (editable || data.certifications.length > 0) && (
      <section key="certifications">
        <SectionTitle font={fonts.heading}>Certifications</SectionTitle>
        <div className="space-y-0.5 text-[10px] text-ink-700">
          {data.certifications.map((c) => (
            <div key={c.id}>
              <EditableText
                editable={editable}
                value={c.name}
                placeholder="Certification"
                onCommit={(v) => updateCertification(data.id, c.id, { name: v })}
              />
              {(editable || c.issuer) && (
                <span className="text-ink-500">
                  {' — '}
                  <EditableText
                    editable={editable}
                    value={c.issuer}
                    placeholder="Issuer"
                    onCommit={(v) => updateCertification(data.id, c.id, { issuer: v })}
                  />
                </span>
              )}
              {c.date && <span className="text-ink-500"> · {c.date}</span>}
            </div>
          ))}
        </div>
      </section>
    ),
    languages: (editable || data.languages.length > 0) && (
      <section key="languages">
        <SectionTitle font={fonts.heading}>Languages</SectionTitle>
        <p className="text-[10px] leading-snug text-ink-700">
          {data.languages.map((l, i) => (
            <span key={l.id}>
              <EditableText
                editable={editable}
                value={l.name}
                placeholder="Language"
                onCommit={(v) => updateLanguage(data.id, l.id, { name: v })}
              />
              {(editable || l.level) && (
                <span className="text-ink-500">
                  {' ('}
                  <EditableText
                    editable={editable}
                    value={l.level}
                    placeholder="Level"
                    onCommit={(v) => updateLanguage(data.id, l.id, { level: v })}
                  />
                  {')'}
                </span>
              )}
              {i < data.languages.length - 1 && <span className="text-ink-400"> | </span>}
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
      className="min-h-[1123px] bg-white px-12 py-12 text-[10.5px] leading-snug text-ink-800"
    >
      <header className="border-b border-ink-900 pb-3">
        <h1
          className="text-[22px] font-bold leading-tight tracking-tight text-ink-900"
          style={{ fontFamily: fonts.heading }}
        >
          <EditableText
            editable={editable}
            value={contact.fullName}
            placeholder="Your Name"
            onCommit={(v) => updateContact(data.id, { fullName: v })}
          />
        </h1>
        {(editable || contact.title) && (
          <p className="mt-0.5 text-[11.5px] font-medium" style={{ color: theme.accent }}>
            <EditableText
              editable={editable}
              value={contact.title}
              placeholder="Your Job Title"
              onCommit={(v) => updateContact(data.id, { title: v })}
            />
          </p>
        )}
        {(editable || contactLine.length > 0) && (
          <p className="mt-1.5 text-[9.5px] text-ink-600">
            {(editable || contact.email) && (
              <span>
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
                  contact.github) && <span className="text-ink-400"> | </span>}
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
                {(editable || contact.location || contact.website || contact.linkedin || contact.github) && (
                  <span className="text-ink-400"> | </span>
                )}
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
                {(editable || contact.website || contact.linkedin || contact.github) && (
                  <span className="text-ink-400"> | </span>
                )}
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
                {(editable || contact.linkedin || contact.github) && (
                  <span className="text-ink-400"> | </span>
                )}
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
                {(editable || contact.github) && <span className="text-ink-400"> | </span>}
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
          </p>
        )}
      </header>

      <div className="mt-3 space-y-3">{order.map((key) => nodes[key])}</div>
    </div>
  )
}
