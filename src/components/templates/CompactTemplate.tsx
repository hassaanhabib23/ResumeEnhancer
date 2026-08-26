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
      className="mb-1.5 border-b pb-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
      style={{ fontFamily: font, color, borderColor: color + '55' }}
    >
      {children}
    </h2>
  )
}

// Single-column template — every reorderable section flows through one
// list in order. Certifications/Languages are laid out side-by-side in a
// 2-col grid when they land next to each other, but that's a visual
// pairing, not a separate zone (see the `certLangPairVisible` handling
// below).
const DEFAULT_ORDER: ReorderableSection[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
]

export default function CompactTemplate({
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
    {
      key: 'email',
      value: contact.email,
      placeholder: 'Email',
      onCommit: (v: string) => updateContact(data.id, { email: v }),
    },
    {
      key: 'phone',
      value: contact.phone,
      placeholder: 'Phone',
      onCommit: (v: string) => updateContact(data.id, { phone: v }),
    },
    {
      key: 'location',
      value: contact.location,
      placeholder: 'Location',
      onCommit: (v: string) => updateContact(data.id, { location: v }),
    },
    {
      key: 'website',
      value: contact.website,
      placeholder: 'Website',
      onCommit: (v: string) => updateContact(data.id, { website: v }),
    },
    {
      key: 'linkedin',
      value: contact.linkedin,
      placeholder: 'LinkedIn',
      onCommit: (v: string) => updateContact(data.id, { linkedin: v }),
    },
    {
      key: 'github',
      value: contact.github,
      placeholder: 'GitHub',
      onCommit: (v: string) => updateContact(data.id, { github: v }),
    },
  ].filter((f) => editable || f.value)

  const nodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    summary: (editable || data.summary) && (
      <section key="summary">
        <SectionTitle color={theme.accent} font={fonts.heading}>Summary</SectionTitle>
        <p className="text-[9.5px] leading-snug text-ink-600">
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
        <SectionTitle color={theme.accent} font={fonts.heading}>Experience</SectionTitle>
        <div className="space-y-1.5">
          {data.experience.map((e) => (
            <div key={e.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <h3 className="text-[10.5px] font-semibold text-ink-900">
                  <EditableText
                    editable={editable}
                    value={e.role}
                    placeholder="Role"
                    onCommit={(v) => updateExperience(data.id, e.id, { role: v })}
                  />
                  <span className="font-normal text-ink-500">
                    {' — '}
                    <EditableText
                      editable={editable}
                      value={e.company}
                      placeholder="Company"
                      onCommit={(v) => updateExperience(data.id, e.id, { company: v })}
                    />
                  </span>
                  {(editable || e.location) && (
                    <span className="font-normal text-ink-400">
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
                <span className="whitespace-nowrap text-[9px] font-medium text-ink-400">
                  {dateRange(e.startDate, e.endDate, e.current)}
                </span>
              </div>
              <ul className="mt-0.5 space-y-0.5 text-[9.5px] leading-snug text-ink-600">
                {(editable ? e.bullets : e.bullets.filter(Boolean)).map((b, i) => (
                  <li key={i} className="flex gap-1.5 pl-0.5">
                    <span className="text-ink-300">·</span>
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
        <SectionTitle color={theme.accent} font={fonts.heading}>Education</SectionTitle>
        <div className="space-y-1">
          {data.education.map((e) => (
            <div key={e.id} className="flex flex-wrap items-baseline justify-between gap-x-2">
              <h3 className="text-[10px] font-semibold text-ink-900">
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
                <span className="font-normal text-ink-500">
                  {' — '}
                  <EditableText
                    editable={editable}
                    value={e.school}
                    placeholder="School"
                    onCommit={(v) => updateEducation(data.id, e.id, { school: v })}
                  />
                </span>
                {e.gpa && <span className="font-normal text-ink-400"> · GPA {e.gpa}</span>}
              </h3>
              <span className="whitespace-nowrap text-[9px] font-medium text-ink-400">
                {dateRange(e.startDate, e.endDate, false)}
              </span>
            </div>
          ))}
        </div>
      </section>
    ),
    skills: (editable || data.skills.length > 0) && (
      <section key="skills">
        <SectionTitle color={theme.accent} font={fonts.heading}>Skills</SectionTitle>
        <p className="text-[9.5px] leading-snug text-ink-600">
          {data.skills.map((s, i) => (
            <span key={s.id}>
              <EditableText
                editable={editable}
                value={s.name}
                placeholder="Skill"
                onCommit={(v) => updateSkill(data.id, s.id, { name: v })}
              />
              {i < data.skills.length - 1 && <span className="text-ink-300"> &nbsp;•&nbsp; </span>}
            </span>
          ))}
        </p>
      </section>
    ),
    projects: (editable || data.projects.length > 0) && (
      <section key="projects">
        <SectionTitle color={theme.accent} font={fonts.heading}>Projects</SectionTitle>
        <div className="space-y-1">
          {data.projects.map((p) => (
            <div key={p.id}>
              <h3 className="text-[10px] font-semibold text-ink-900">
                <EditableText
                  editable={editable}
                  value={p.name}
                  placeholder="Project name"
                  onCommit={(v) => updateProject(data.id, p.id, { name: v })}
                />
                {(editable || p.tech) && (
                  <span className="font-normal text-ink-400">
                    {' ('}
                    <EditableText
                      editable={editable}
                      value={p.tech}
                      placeholder="Tech used"
                      onCommit={(v) => updateProject(data.id, p.id, { tech: v })}
                    />
                    {')'}
                  </span>
                )}
              </h3>
              {(editable || p.description) && (
                <p className="text-[9.5px] leading-snug text-ink-600">
                  <EditableText
                    editable={editable}
                    multiline
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
  }

  const certNode = (editable || data.certifications.length > 0) && (
    <section key="certifications">
      <SectionTitle color={theme.accent} font={fonts.heading}>Certifications</SectionTitle>
      <div className="space-y-0.5 text-[9.5px] text-ink-600">
        {data.certifications.map((c) => (
          <div key={c.id}>
            <EditableText
              editable={editable}
              value={c.name}
              placeholder="Certification"
              onCommit={(v) => updateCertification(data.id, c.id, { name: v })}
            />
            {(editable || c.issuer) && (
              <span className="text-ink-400">
                {' — '}
                <EditableText
                  editable={editable}
                  value={c.issuer}
                  placeholder="Issuer"
                  onCommit={(v) => updateCertification(data.id, c.id, { issuer: v })}
                />
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
  const langNode = (editable || data.languages.length > 0) && (
    <section key="languages">
      <SectionTitle color={theme.accent} font={fonts.heading}>Languages</SectionTitle>
      <div className="space-y-0.5 text-[9.5px] text-ink-600">
        {data.languages.map((l) => (
          <div key={l.id}>
            <EditableText
              editable={editable}
              value={l.name}
              placeholder="Language"
              onCommit={(v) => updateLanguage(data.id, l.id, { name: v })}
            />{' '}
            <span className="text-ink-400">
              {'· '}
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
  )
  const certLangPairVisible = editable || data.certifications.length > 0 || data.languages.length > 0

  const order = orderedSections(data, DEFAULT_ORDER, DEFAULT_ORDER)

  // Certifications and Languages render as a paired 2-col grid when they
  // land next to each other in the resolved order (matching the template's
  // original look); otherwise each renders as its own full-width section
  // in place.
  const rendered: React.ReactNode[] = []
  for (let i = 0; i < order.length; i++) {
    const key = order[i]
    const next = order[i + 1]
    if (key === 'certifications' && next === 'languages') {
      if (certLangPairVisible) {
        rendered.push(
          <div className="grid grid-cols-2 gap-x-6" key="certifications-languages-pair">
            {certNode}
            {langNode}
          </div>,
        )
      }
      i++
      continue
    }
    if (key === 'languages' && next === 'certifications') {
      if (certLangPairVisible) {
        rendered.push(
          <div className="grid grid-cols-2 gap-x-6" key="languages-certifications-pair">
            {langNode}
            {certNode}
          </div>,
        )
      }
      i++
      continue
    }
    if (key === 'certifications') rendered.push(certNode)
    else if (key === 'languages') rendered.push(langNode)
    else rendered.push(nodes[key])
  }

  return (
    <div
      id="resume-page"
      style={{ width: PAGE_WIDTH, fontFamily: fonts.body }}
      className="min-h-[1123px] bg-white px-10 py-8 text-[10px] leading-snug text-ink-800"
    >
      <header className="border-b border-ink-900 pb-2">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h1
            className="text-[16px] font-bold leading-tight tracking-tight text-ink-900"
            style={{ fontFamily: fonts.heading }}
          >
            <EditableText
              editable={editable}
              value={contact.fullName}
              placeholder="Your Name"
              onCommit={(v) => updateContact(data.id, { fullName: v })}
            />
          </h1>
          <span className="text-[11px] font-medium text-ink-500">
            <EditableText
              editable={editable}
              value={contact.title}
              placeholder="Your Job Title"
              onCommit={(v) => updateContact(data.id, { title: v })}
            />
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-1.5 text-[9.5px] text-ink-500">
          {contactFields.map((f, i, arr) => (
            <span key={f.key} className="flex items-center gap-1.5">
              <EditableText
                editable={editable}
                value={f.value}
                placeholder={f.placeholder}
                onCommit={f.onCommit}
              />
              {i < arr.length - 1 && <span style={{ color: theme.accent }}>•</span>}
            </span>
          ))}
        </div>
      </header>

      <div className="mt-2.5 space-y-2.5">{rendered}</div>
    </div>
  )
}
