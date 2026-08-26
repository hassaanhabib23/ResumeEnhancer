import { useResumeStore } from '../../lib/store'
import type { ReorderableSection, ResumeData } from '../../lib/types'
import { dateRange, initials } from '../../lib/format'
import { themeOf, fontsOf, PAGE_WIDTH, SkillBar, lighten, orderedSections, groupSkillsByCategory } from './shared'
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
      className="mb-3 text-[11px] font-bold uppercase tracking-widest"
      style={{ color, fontFamily: font }}
    >
      {children}
    </h2>
  )
}

// Single-column template. Skills ("Core Strengths") is always immediately
// followed by the fixed, non-reorderable "Key Achievements" block (see
// below) regardless of where the user drags Skills to. Certifications and
// Languages render as a paired flex row when they land next to each other
// in the resolved order (matching the template's original look); otherwise
// each renders as its own full-width section.
const DEFAULT_ORDER: ReorderableSection[] = [
  'summary',
  'skills',
  'experience',
  'education',
  'projects',
  'certifications',
  'languages',
]

export default function FunctionalTemplate({
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

  const hasContact =
    editable ||
    contact.email ||
    contact.phone ||
    contact.location ||
    contact.website ||
    contact.linkedin ||
    contact.github

  // Computed purely for display by flattening bullet text out of every
  // experience entry — there's no clean 1:1 mapping back to a single source
  // bullet, so this list is intentionally left non-editable even when
  // `editable` is true (see FunctionalTemplate task notes). It is NOT one of
  // the 7 reorderable sections: it always renders glued immediately after
  // Skills, wherever the user drags Skills to.
  const achievements = data.experience
    .flatMap((e) => e.bullets.filter(Boolean))
    .slice(0, 6)

  const achievementsNode = achievements.length > 0 && (
    <section className="mt-7" key="achievements">
      <SectionTitle color={theme.accent} font={fonts.heading}>
        Key Achievements
      </SectionTitle>
      <ul className="grid grid-cols-1 gap-2">
        {achievements.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-700">
            <span
              className="mt-[3px] flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
              style={{ background: theme.accent }}
            >
              ✓
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </section>
  )

  const nodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    summary: (editable || data.summary) && (
      <section className="mt-6" key="summary">
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
    skills: (editable || data.skills.length > 0) && (
      <section className="mt-7 rounded-xl p-5" style={{ background: theme.accentSoft }} key="skills">
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Core Strengths
        </SectionTitle>
        {groupSkillsByCategory(data.skills).map((group) => (
          <div key={group.category || '_none'} className="mb-4 last:mb-0">
            {group.category && (
              <p
                className="mb-2 text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: theme.accent }}
              >
                {group.category}
              </p>
            )}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {group.skills.map((s) => (
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
          </div>
        ))}
      </section>
    ),
    experience: (editable || data.experience.length > 0) && (
      <section className="mt-7" key="experience">
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Experience
        </SectionTitle>
        <div className="space-y-1.5">
          {data.experience.map((e) => (
            <div key={e.id} className="flex items-baseline justify-between gap-3 text-[11px]">
              <span className="text-ink-700">
                <span className="font-semibold text-ink-900">
                  <EditableText
                    editable={editable}
                    value={e.role}
                    placeholder="Role"
                    onCommit={(v) => updateExperience(data.id, e.id, { role: v })}
                  />
                </span>
                {(editable || e.company) && (
                  <>
                    {' — '}
                    <EditableText
                      editable={editable}
                      value={e.company}
                      placeholder="Company"
                      onCommit={(v) => updateExperience(data.id, e.id, { company: v })}
                    />
                  </>
                )}
              </span>
              <span className="whitespace-nowrap text-[10px] tracking-wide text-ink-400">
                {dateRange(e.startDate, e.endDate, e.current)}
              </span>
            </div>
          ))}
        </div>
      </section>
    ),
    education: (editable || data.education.length > 0) && (
      <section className="mt-7" key="education">
        <SectionTitle color={theme.accent} font={fonts.heading}>
          Education
        </SectionTitle>
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
              <span className="whitespace-nowrap text-[10px] tracking-wide text-ink-400">
                {dateRange(e.startDate, e.endDate, false)}
              </span>
            </div>
          ))}
        </div>
      </section>
    ),
    projects: (editable || data.projects.length > 0) && (
      <section className="mt-7" key="projects">
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
    <section className="flex-1" key="certifications">
      <SectionTitle color={theme.accent} font={fonts.heading}>
        Certifications
      </SectionTitle>
      <div className="space-y-2.5 text-[10.5px] text-ink-600">
        {data.certifications.map((c) => (
          <div key={c.id}>
            <div className="font-medium text-ink-800">
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

  const languagesNode = (editable || data.languages.length > 0) && (
    <section className="flex-1" key="languages">
      <SectionTitle color={theme.accent} font={fonts.heading}>
        Languages
      </SectionTitle>
      <div className="space-y-1.5 text-[10.5px] text-ink-600">
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
  )

  const order = orderedSections(data, DEFAULT_ORDER, DEFAULT_ORDER)

  const rendered: React.ReactNode[] = []
  let skillsHandled = false
  let summaryInsertIndex = -1 // index right after Summary's node in `rendered`
  for (let i = 0; i < order.length; i++) {
    const key = order[i]
    const next = order[i + 1]
    if (key === 'certifications' && next === 'languages') {
      rendered.push(
        (certificationsNode || languagesNode) && (
          <div className="mt-7 flex gap-8" key="certifications-languages-pair">
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
          <div className="mt-7 flex gap-8" key="languages-certifications-pair">
            {languagesNode}
            {certificationsNode}
          </div>
        ),
      )
      i++
      continue
    }
    if (key === 'certifications') {
      rendered.push(
        certificationsNode && (
          <div className="mt-7" key="certifications">
            {certificationsNode}
          </div>
        ),
      )
      continue
    }
    if (key === 'languages') {
      rendered.push(
        languagesNode && (
          <div className="mt-7" key="languages">
            {languagesNode}
          </div>
        ),
      )
      continue
    }
    if (key === 'skills') {
      rendered.push(nodes.skills)
      rendered.push(achievementsNode)
      skillsHandled = true
      continue
    }
    rendered.push(nodes[key])
    if (key === 'summary') summaryInsertIndex = rendered.length
  }
  // Safety net: Skills is always one of the 7 REORDERABLE_SECTIONS and
  // `orderedSections` always includes every zone section, so this shouldn't
  // normally trigger — but if Skills were ever missing, glue Key Achievements
  // right after Summary (or at the very top) instead of dropping it.
  if (!skillsHandled) {
    const insertAt = summaryInsertIndex === -1 ? 0 : summaryInsertIndex
    rendered.splice(insertAt, 0, achievementsNode)
  }

  return (
    <div
      id="resume-page"
      style={{ width: PAGE_WIDTH, fontFamily: fonts.body }}
      className="min-h-[1123px] bg-white px-12 py-12 text-ink-900"
    >
      <header className="flex items-center gap-5">
        {contact.photo ? (
          <img
            src={contact.photo}
            alt=""
            className="h-20 w-20 flex-shrink-0 rounded-full object-cover"
            style={{ boxShadow: `0 0 0 3px ${lighten(theme.accent, 0.7)}` }}
          />
        ) : (
          <div
            className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
            style={{ background: theme.accent }}
          >
            {initials(displayName)}
          </div>
        )}
        <div className="min-w-0">
          <h1
            className="text-[28px] font-bold leading-tight"
            style={{ fontFamily: fonts.heading, color: theme.text }}
          >
            <EditableText
              editable={editable}
              value={contact.fullName}
              placeholder="Your Name"
              onCommit={(v) => updateContact(data.id, { fullName: v })}
            />
          </h1>
          <p className="mt-1 text-[13px] font-semibold" style={{ color: theme.accent }}>
            <EditableText
              editable={editable}
              value={contact.title}
              placeholder="Your Job Title"
              onCommit={(v) => updateContact(data.id, { title: v })}
            />
          </p>
        </div>
      </header>

      {hasContact && (
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-b border-t border-ink-100 py-2.5 text-[10.5px] text-ink-500">
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

      {rendered}
    </div>
  )
}
