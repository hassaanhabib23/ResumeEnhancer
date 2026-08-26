import { useResumeStore } from '../../lib/store'
import type { ReorderableSection, ResumeData } from '../../lib/types'
import { dateRange } from '../../lib/format'
import { themeOf, fontsOf, PAGE_WIDTH, orderedSections, lighten, groupSkillsByCategory } from './shared'
import EditableText from './EditableText'

// Local monospace stack — used only in this template for dates, section
// labels, and other small meta text, to read like a spec sheet / terminal.
// None of the other templates load a mono font, so this is scoped here
// (mirrors how SANS_STACK/SERIF_STACK are hardcoded fallback stacks in
// shared.tsx rather than a Google Fonts import).
const MONO_STACK =
  '"JetBrains Mono", "Fira Code", ui-monospace, "SF Mono", Menlo, Consolas, monospace'

function SectionTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <h2
      className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
      style={{ fontFamily: MONO_STACK, color }}
    >
      <span aria-hidden="true" style={{ color: lighten(color, 0.35) }}>
        //
      </span>
      {children}
    </h2>
  )
}

// Single-column, information-forward layout. Must match
// DEFAULT_SECTION_ORDER_BY_TEMPLATE['tech-grid'] in lib/types.ts exactly —
// note Skills sits after Projects here, not right after Education.
const DEFAULT_ORDER: ReorderableSection[] = [
  'summary',
  'experience',
  'education',
  'projects',
  'skills',
  'languages',
  'certifications',
]

export default function TechGridTemplate({
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
      <section className="mt-7" key="summary">
        <SectionTitle color={theme.accent}>Summary</SectionTitle>
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
        <SectionTitle color={theme.accent}>Experience</SectionTitle>
        <div className="space-y-5">
          {data.experience.map((e) => (
            <div key={e.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <h3 className="text-[13px] font-semibold" style={{ fontFamily: fonts.heading }}>
                  <EditableText
                    editable={editable}
                    value={e.role}
                    placeholder="Role"
                    onCommit={(v) => updateExperience(data.id, e.id, { role: v })}
                  />
                  {(editable || e.company) && (
                    <span className="font-normal text-ink-500"> · </span>
                  )}
                  {(editable || e.company) && (
                    <span className="text-[12px] font-normal italic text-ink-500">
                      <EditableText
                        editable={editable}
                        value={e.company}
                        placeholder="Company"
                        onCommit={(v) => updateExperience(data.id, e.id, { company: v })}
                      />
                    </span>
                  )}
                </h3>
                <span
                  className="whitespace-nowrap text-[10px] text-ink-500"
                  style={{ fontFamily: MONO_STACK }}
                >
                  [{dateRange(e.startDate, e.endDate, e.current) || '—'}]
                </span>
              </div>
              {(editable || e.location) && (
                <p className="mt-0.5 text-[10px] text-ink-400" style={{ fontFamily: MONO_STACK }}>
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
        <SectionTitle color={theme.accent}>Education</SectionTitle>
        <div className="space-y-3">
          {data.education.map((e) => (
            <div key={e.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <div>
                <h3 className="text-[12.5px] font-semibold" style={{ fontFamily: fonts.heading }}>
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
                <p className="text-[11px] italic text-ink-500">
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
                </p>
              </div>
              <span
                className="whitespace-nowrap text-[10px] text-ink-500"
                style={{ fontFamily: MONO_STACK }}
              >
                [{dateRange(e.startDate, e.endDate, false) || '—'}]
              </span>
            </div>
          ))}
        </div>
      </section>
    ),
    projects: (editable || data.projects.length > 0) && (
      <section className="mt-7" key="projects">
        <SectionTitle color={theme.accent}>Projects</SectionTitle>
        <div className="space-y-3">
          {data.projects.map((p) => (
            <div key={p.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <h3 className="text-[12.5px] font-semibold" style={{ fontFamily: fonts.heading }}>
                  <EditableText
                    editable={editable}
                    value={p.name}
                    placeholder="Project name"
                    onCommit={(v) => updateProject(data.id, p.id, { name: v })}
                  />
                </h3>
                {(editable || p.tech) && (
                  <span className="text-[10px] text-ink-500" style={{ fontFamily: MONO_STACK }}>
                    <EditableText
                      editable={editable}
                      value={p.tech}
                      placeholder="Tech used"
                      onCommit={(v) => updateProject(data.id, p.id, { tech: v })}
                    />
                  </span>
                )}
              </div>
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
    // The star of this template: skills render as a tag-pill grid instead of
    // the shared SkillBar progress bars (or dots/rings used elsewhere) — a
    // deliberately distinct 4th skill-visualization mechanism for this app.
    skills: (editable || data.skills.length > 0) && (
      <section className="mt-7" key="skills">
        <SectionTitle color={theme.accent}>Skills</SectionTitle>
        {groupSkillsByCategory(editable ? data.skills : data.skills.filter((s) => s.name)).map(
          (group) => (
            <div key={group.category || '_none'} className="mb-3 last:mb-0">
              {group.category && (
                <p
                  className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-wider"
                  style={{ color: theme.accent, fontFamily: MONO_STACK }}
                >
                  {group.category}
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {group.skills.map((s) => {
                  // Optional polish: vary chip background intensity by level
                  // (1-5) without reintroducing a bar/dot/ring indicator.
                  const intensity = 0.92 - (Math.min(5, Math.max(1, s.level || 3)) - 1) * 0.09
                  return (
                    <div
                      key={s.id}
                      className="truncate rounded-md border px-2.5 py-1.5 text-[11px]"
                      style={{
                        borderColor: theme.accent,
                        background: lighten(theme.accent, intensity),
                        fontFamily: MONO_STACK,
                      }}
                    >
                      <EditableText
                        editable={editable}
                        value={s.name}
                        placeholder="Skill"
                        onCommit={(v) => updateSkill(data.id, s.id, { name: v })}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ),
        )}
      </section>
    ),
    languages: (editable || data.languages.length > 0) && (
      <section className="mt-7" key="languages">
        <SectionTitle color={theme.accent}>Languages</SectionTitle>
        <div className="space-y-1 text-[11.5px] text-ink-600">
          {data.languages.map((l) => (
            <div key={l.id} className="flex items-baseline justify-between gap-3">
              <EditableText
                editable={editable}
                value={l.name}
                placeholder="Language"
                onCommit={(v) => updateLanguage(data.id, l.id, { name: v })}
              />
              <span className="text-[10px] text-ink-400" style={{ fontFamily: MONO_STACK }}>
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
      <section className="mt-7" key="certifications">
        <SectionTitle color={theme.accent}>Certifications</SectionTitle>
        <div className="space-y-1 text-[11.5px] text-ink-600">
          {data.certifications.map((c) => (
            <div key={c.id} className="flex items-baseline justify-between gap-3">
              <span>
                <EditableText
                  editable={editable}
                  value={c.name}
                  placeholder="Certification"
                  onCommit={(v) => updateCertification(data.id, c.id, { name: v })}
                />
                {' — '}
                <span className="text-ink-400">
                  <EditableText
                    editable={editable}
                    value={c.issuer}
                    placeholder="Issuer"
                    onCommit={(v) => updateCertification(data.id, c.id, { issuer: v })}
                  />
                </span>
              </span>
              {c.date && (
                <span className="whitespace-nowrap text-[10px] text-ink-400" style={{ fontFamily: MONO_STACK }}>
                  [{c.date}]
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    ),
  }

  const order = orderedSections(data, DEFAULT_ORDER, DEFAULT_ORDER)

  return (
    <div
      id="resume-page"
      style={{ width: PAGE_WIDTH, fontFamily: fonts.body }}
      className="min-h-[1123px] bg-white px-12 py-12 text-ink-900"
    >
      <header className="flex items-start gap-5 border-b pb-5" style={{ borderColor: lighten(theme.accent, 0.75) }}>
        {contact.photo && (
          <img
            src={contact.photo}
            alt=""
            className="h-16 w-16 shrink-0 rounded-md object-cover"
            style={{ boxShadow: `0 0 0 1px ${lighten(theme.accent, 0.55)}` }}
          />
        )}
        <div className="min-w-0 flex-1">
          <h1
            className="text-[26px] font-bold leading-tight tracking-tight"
            style={{ fontFamily: fonts.heading }}
          >
            <EditableText
              editable={editable}
              value={contact.fullName}
              placeholder="Your Name"
              onCommit={(v) => updateContact(data.id, { fullName: v })}
            />
          </h1>
          <p
            className="mt-1 text-[12px] font-medium"
            style={{ fontFamily: MONO_STACK, color: theme.accent }}
          >
            <EditableText
              editable={editable}
              value={contact.title}
              placeholder="Your Job Title"
              onCommit={(v) => updateContact(data.id, { title: v })}
            />
          </p>
          <div
            className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-500"
            style={{ fontFamily: MONO_STACK }}
          >
            {visibleContactFields.map((f, i) => (
              <span key={f.key} className="flex items-center gap-3">
                <EditableText editable={editable} value={f.value} placeholder={f.placeholder} onCommit={f.onCommit} />
                {i < visibleContactFields.length - 1 && <span className="text-ink-300">|</span>}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div>{order.map((key) => nodes[key])}</div>
    </div>
  )
}
