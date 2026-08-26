import { useResumeStore } from '../../lib/store'
import type { ReorderableSection, ResumeData } from '../../lib/types'
import { dateRange } from '../../lib/format'
import { themeOf, fontsOf, PAGE_WIDTH, orderedSections } from './shared'
import EditableText from './EditableText'

function SectionTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest" style={{ color }}>
      {children}
    </h2>
  )
}

function Chip({
  value,
  placeholder,
  color,
  editable,
  onCommit,
}: {
  value: string
  placeholder: string
  color: string
  editable: boolean
  onCommit: (v: string) => void
}) {
  return (
    <span
      className="rounded-full bg-white px-3 py-1 text-[10.5px] font-medium text-ink-600"
      style={{ border: `1px solid ${color}33` }}
    >
      <EditableText editable={editable} value={value} placeholder={placeholder} onCommit={onCommit} />
    </span>
  )
}

// Single-column template — every reorderable section flows through one
// list in order (spacing between blocks comes from the `gap-5` flex-column
// wrapper, not per-section margins). The default order intentionally puts
// Skills before Education, distinctive to this template. Certifications and
// Languages render as a paired flex row when they land next to each other
// (matching the template's original look); otherwise each renders as its
// own full-width card in place — see the pairing handling below.
const DEFAULT_ORDER: ReorderableSection[] = [
  'summary',
  'experience',
  'skills',
  'education',
  'projects',
  'certifications',
  'languages',
]

export default function CreativeBlocksTemplate({
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

  const displayName = contact.fullName || 'Your Name'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  const cardClass = 'rounded-2xl p-6'

  const nodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    summary: (editable || data.summary) && (
      <section className={cardClass} style={{ background: theme.accentSoft }} key="summary">
        <SectionTitle color={theme.accent}>About Me</SectionTitle>
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
      <section className={cardClass} style={{ background: theme.accentSoft }} key="experience">
        <SectionTitle color={theme.accent}>Experience</SectionTitle>
        <div className="flex flex-col gap-3">
          {data.experience.map((e) => (
            <div key={e.id} className="rounded-xl bg-white p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[13px] font-bold text-ink-900">
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
                <span
                  className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                  style={{ background: theme.accentSoft, color: theme.accent }}
                >
                  {dateRange(e.startDate, e.endDate, e.current)}
                </span>
              </div>
              {(editable || e.location) && (
                <p className="mt-0.5 text-[11px] text-ink-400">
                  <EditableText
                    editable={editable}
                    value={e.location}
                    placeholder="Location"
                    onCommit={(v) => updateExperience(data.id, e.id, { location: v })}
                  />
                </p>
              )}
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
    skills: (editable || data.skills.length > 0) && (
      <section className={cardClass} style={{ background: theme.accentSoft }} key="skills">
        <SectionTitle color={theme.accent}>Skills</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((s) => (
            <span
              key={s.id}
              className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold"
              style={{
                background: theme.accent + '26',
                border: `1px solid ${theme.accent}66`,
                color: theme.accent,
              }}
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
    education: (editable || data.education.length > 0) && (
      <section className={cardClass} style={{ background: theme.accentSoft }} key="education">
        <SectionTitle color={theme.accent}>Education</SectionTitle>
        <div className="flex flex-col gap-3">
          {data.education.map((e) => (
            <div
              key={e.id}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-white p-4"
            >
              <div>
                <h3 className="text-[12.5px] font-bold text-ink-900">
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
                  {e.gpa ? ` · GPA ${e.gpa}` : ''}
                </p>
              </div>
              <span
                className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                style={{ background: theme.accentSoft, color: theme.accent }}
              >
                {dateRange(e.startDate, e.endDate, false)}
              </span>
            </div>
          ))}
        </div>
      </section>
    ),
    projects: (editable || data.projects.length > 0) && (
      <section className={cardClass} style={{ background: theme.accentSoft }} key="projects">
        <SectionTitle color={theme.accent}>Projects</SectionTitle>
        <div className="flex flex-col gap-3">
          {data.projects.map((p) => (
            <div key={p.id} className="rounded-xl bg-white p-4">
              <h3 className="text-[12.5px] font-bold text-ink-900">
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
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-600">
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

  const certificationsNode = (editable || data.certifications.length > 0) && (
    <section className={`${cardClass} flex-1`} style={{ background: theme.accentSoft }} key="certifications">
      <SectionTitle color={theme.accent}>Certifications</SectionTitle>
      <div className="flex flex-col gap-2">
        {data.certifications.map((c) => (
          <div key={c.id} className="rounded-xl bg-white p-3">
            <div className="text-[11.5px] font-semibold text-ink-900">
              <EditableText
                editable={editable}
                value={c.name}
                placeholder="Certification"
                onCommit={(v) => updateCertification(data.id, c.id, { name: v })}
              />
            </div>
            <div className="text-[10.5px] text-ink-400">
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

  const languagesNode = (editable || data.languages.length > 0) && (
    <section className={`${cardClass} flex-1`} style={{ background: theme.accentSoft }} key="languages">
      <SectionTitle color={theme.accent}>Languages</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {data.languages.map((l) => (
          <span
            key={l.id}
            className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold"
            style={{
              background: theme.accent + '26',
              border: `1px solid ${theme.accent}66`,
              color: theme.accent,
            }}
          >
            <EditableText
              editable={editable}
              value={l.name}
              placeholder="Language"
              onCommit={(v) => updateLanguage(data.id, l.id, { name: v })}
            />
            {(editable || l.level) && (
              <>
                {' · '}
                <EditableText
                  editable={editable}
                  value={l.level}
                  placeholder="Level"
                  onCommit={(v) => updateLanguage(data.id, l.id, { level: v })}
                />
              </>
            )}
          </span>
        ))}
      </div>
    </section>
  )

  const order = orderedSections(data, DEFAULT_ORDER, DEFAULT_ORDER)

  // Certifications and Languages render as a paired flex row when they land
  // next to each other in the resolved order (matching the template's
  // original look); otherwise each renders as its own full-width card.
  const rendered: React.ReactNode[] = []
  for (let i = 0; i < order.length; i++) {
    const key = order[i]
    const next = order[i + 1]
    if (key === 'certifications' && next === 'languages') {
      rendered.push(
        (certificationsNode || languagesNode) && (
          <div className="flex gap-5" key="certifications-languages-pair">
            {certificationsNode}
            {languagesNode}
          </div>
        ),
      )
      i++
      continue
    }
    if (key === 'languages' && next === 'certifications') {
      rendered.push(
        (certificationsNode || languagesNode) && (
          <div className="flex gap-5" key="languages-certifications-pair">
            {languagesNode}
            {certificationsNode}
          </div>
        ),
      )
      i++
      continue
    }
    if (key === 'certifications') rendered.push(certificationsNode)
    else if (key === 'languages') rendered.push(languagesNode)
    else rendered.push(nodes[key])
  }

  return (
    <div
      id="resume-page"
      style={{ width: PAGE_WIDTH, fontFamily: fonts.body }}
      className="min-h-[1123px] bg-white px-9 py-9 text-ink-900"
    >
      <div className="flex flex-col gap-5">
        <header
          className="flex items-center gap-6 rounded-2xl p-7"
          style={{ background: theme.accentSoft }}
        >
          {contact.photo ? (
            <img
              src={contact.photo}
              alt=""
              style={{ boxShadow: '0 0 0 4px #ffffff' }}
              className="h-24 w-24 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ background: theme.accent }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h1
              className="text-[26px] font-bold leading-tight"
              style={{ fontFamily: fonts.heading, color: theme.text }}
            >
              <EditableText
                editable={editable}
                value={contact.fullName}
                placeholder="Your Name"
                onCommit={(v) => updateContact(data.id, { fullName: v })}
              />
            </h1>
            <p className="mt-1 text-sm font-semibold" style={{ color: theme.accent }}>
              <EditableText
                editable={editable}
                value={contact.title}
                placeholder="Your Job Title"
                onCommit={(v) => updateContact(data.id, { title: v })}
              />
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(editable || contact.email) && (
                <Chip
                  value={contact.email}
                  placeholder="you@email.com"
                  color={theme.accent}
                  editable={editable}
                  onCommit={(v) => updateContact(data.id, { email: v })}
                />
              )}
              {(editable || contact.phone) && (
                <Chip
                  value={contact.phone}
                  placeholder="Phone"
                  color={theme.accent}
                  editable={editable}
                  onCommit={(v) => updateContact(data.id, { phone: v })}
                />
              )}
              {(editable || contact.location) && (
                <Chip
                  value={contact.location}
                  placeholder="City, Country"
                  color={theme.accent}
                  editable={editable}
                  onCommit={(v) => updateContact(data.id, { location: v })}
                />
              )}
              {(editable || contact.website) && (
                <Chip
                  value={contact.website}
                  placeholder="Website"
                  color={theme.accent}
                  editable={editable}
                  onCommit={(v) => updateContact(data.id, { website: v })}
                />
              )}
              {(editable || contact.linkedin) && (
                <Chip
                  value={contact.linkedin}
                  placeholder="LinkedIn"
                  color={theme.accent}
                  editable={editable}
                  onCommit={(v) => updateContact(data.id, { linkedin: v })}
                />
              )}
              {(editable || contact.github) && (
                <Chip
                  value={contact.github}
                  placeholder="GitHub"
                  color={theme.accent}
                  editable={editable}
                  onCommit={(v) => updateContact(data.id, { github: v })}
                />
              )}
            </div>
          </div>
        </header>

        {rendered}
      </div>
    </div>
  )
}
