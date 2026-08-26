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
      className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-800"
      style={{ fontFamily: font, color }}
    >
      {children}
    </h2>
  )
}

// Draws the vertical rail behind a stack of timeline rows. Rows are simple
// flex children (marker column + content column) so the rail's horizontal
// position lines up with every marker without any per-row math.
function TimelineTrack({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="relative">
      <div
        className="absolute bottom-1 left-[11px] top-1 w-[2px] rounded-full"
        style={{ background: color + '30' }}
      />
      <div className="space-y-6">{children}</div>
    </div>
  )
}

function TimelineDot({ color }: { color: string }) {
  return (
    <div className="relative z-10 mt-0.5 flex h-[22px] w-[22px] flex-none items-center justify-center">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: color, boxShadow: '0 0 0 3px #ffffff' }}
      />
    </div>
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

export default function TimelineTemplate({
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
      <section key="summary">
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Profile
        </SectionTitle>
        <p className="text-[12px] leading-relaxed text-ink-600">
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
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Experience
        </SectionTitle>
        <TimelineTrack color={theme.accent}>
          {data.experience.map((e) => (
            <div key={e.id} className="flex gap-4">
              <TimelineDot color={theme.accent} />
              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="text-[13px] font-semibold text-ink-900">
                    <EditableText
                      editable={editable}
                      value={e.role}
                      placeholder="Role"
                      onCommit={(v) => updateExperience(data.id, e.id, { role: v })}
                    />{' '}
                    <span className="font-normal text-ink-400">
                      {'— '}
                      <EditableText
                        editable={editable}
                        value={e.company}
                        placeholder="Company"
                        onCommit={(v) => updateExperience(data.id, e.id, { company: v })}
                      />
                    </span>
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
                <ul className="mt-1.5 space-y-1 text-[11.5px] leading-relaxed text-ink-600">
                  {(editable ? e.bullets : e.bullets.filter(Boolean)).map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span style={{ color: theme.accent }}>•</span>
                      <span>
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
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </TimelineTrack>
      </section>
    ),
    education: (editable || data.education.length > 0) && (
      <section key="education">
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Education
        </SectionTitle>
        <TimelineTrack color={theme.accent}>
          {data.education.map((e) => (
            <div key={e.id} className="flex gap-4">
              <TimelineDot color={theme.accent} />
              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
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
                    )}{' '}
                    <span className="font-normal text-ink-400">
                      {'— '}
                      <EditableText
                        editable={editable}
                        value={e.school}
                        placeholder="School"
                        onCommit={(v) => updateEducation(data.id, e.id, { school: v })}
                      />
                    </span>
                  </h3>
                  <span className="whitespace-nowrap text-[10px] text-ink-400">
                    {dateRange(e.startDate, e.endDate, false)}
                  </span>
                </div>
                <p className="text-[11px] text-ink-400">
                  <EditableText
                    editable={editable}
                    value={e.location}
                    placeholder="Location"
                    onCommit={(v) => updateEducation(data.id, e.id, { location: v })}
                  />
                  {e.gpa ? ` · GPA ${e.gpa}` : ''}
                </p>
              </div>
            </div>
          ))}
        </TimelineTrack>
      </section>
    ),
    skills: (editable || data.skills.length > 0) && (
      <section key="skills">
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Skills
        </SectionTitle>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((s) => (
            <span
              key={s.id}
              className="rounded-full px-3 py-1 text-[10.5px] font-medium"
              style={{ background: theme.accentSoft, color: theme.text }}
            >
              <EditableText
                editable={editable}
                value={s.name}
                placeholder="Skill"
                onCommit={(v) => updateSkill(data.id, s.id, { name: v })}
              />
            </span>
          ))}
        </div>
      </section>
    ),
    projects: (editable || data.projects.length > 0) && (
      <section key="projects">
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Projects
        </SectionTitle>
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

  const certNode = (editable || data.certifications.length > 0) && (
    <section key="certifications">
      <SectionTitle color={theme.accent} font={fonts.heading}>
        Certifications
      </SectionTitle>
      <div className="space-y-2 text-[11.5px]">
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
    </section>
  )
  const langNode = (editable || data.languages.length > 0) && (
    <section key="languages">
      <SectionTitle color={theme.accent} font={fonts.heading}>
        Languages
      </SectionTitle>
      <div className="space-y-1.5 text-[11.5px] text-ink-600">
        {data.languages.map((l) => (
          <div key={l.id} className="flex justify-between">
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
          <div className="grid grid-cols-2 gap-8" key="certifications-languages-pair">
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
          <div className="grid grid-cols-2 gap-8" key="languages-certifications-pair">
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
      className="min-h-[1123px] bg-white px-14 py-12 text-ink-900"
    >
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1
            className="text-[26px] font-bold tracking-tight"
            style={{ fontFamily: fonts.heading }}
          >
            <EditableText
              editable={editable}
              value={contact.fullName}
              placeholder="Your Name"
              onCommit={(v) => updateContact(data.id, { fullName: v })}
            />
          </h1>
          <p className="mt-1 text-[13.5px] font-semibold" style={{ color: theme.accent }}>
            <EditableText
              editable={editable}
              value={contact.title}
              placeholder="Your Job Title"
              onCommit={(v) => updateContact(data.id, { title: v })}
            />
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-ink-500">
            {visibleContactFields.map((f) => (
              <span key={f.key}>
                <EditableText editable={editable} value={f.value} placeholder={f.placeholder} onCommit={f.onCommit} />
              </span>
            ))}
          </div>
        </div>
        {contact.photo && (
          <img
            src={contact.photo}
            alt=""
            style={{ boxShadow: `0 0 0 3px ${theme.accent}33` }}
            className="h-16 w-16 flex-none rounded-full object-cover"
          />
        )}
      </header>

      <div className="mt-6 h-[3px] w-full rounded-full" style={{ background: theme.accent }} />

      <div className="mt-7 space-y-8">{rendered}</div>
    </div>
  )
}
