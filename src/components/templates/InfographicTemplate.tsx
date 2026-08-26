import type { ReorderableSection, ResumeData } from '../../lib/types'
import { dateRange } from '../../lib/format'
import { themeOf, fontsOf, PAGE_WIDTH, orderedSections } from './shared'
import { FiMail, FiPhone, FiMapPin, FiGlobe, FiLinkedin, FiGithub } from 'react-icons/fi'
import EditableText from './EditableText'
import { useResumeStore } from '../../lib/store'

const RING_TRACK = '#eeecf1'
const MAX_RINGS = 6

// This template's own default section order per zone — used whenever the
// user hasn't opened the drag-and-drop "Reorder sections" panel yet
// (data.sectionOrder is undefined), so it renders exactly as it always has.
const SIDEBAR_DEFAULT: ReorderableSection[] = ['skills', 'languages', 'certifications']
const MAIN_DEFAULT: ReorderableSection[] = ['summary', 'experience', 'education', 'projects']

const LANGUAGE_LEVELS: Record<string, number> = {
  native: 5,
  fluent: 4,
  conversational: 3,
  basic: 2,
}

function languageLevel(level: string): number {
  const key = level.trim().toLowerCase()
  return LANGUAGE_LEVELS[key] ?? 3
}

function ContactLine({
  icon,
  text,
  placeholder,
  color,
  editable,
  onCommit,
}: {
  icon: React.ReactNode
  text: string
  placeholder: string
  color: string
  editable: boolean
  onCommit: (next: string) => void
}) {
  if (!editable && !text) return null
  return (
    <div className="flex items-center gap-2 text-[11px] text-ink-600">
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full" style={{ background: color + '1a' }}>
        <span style={{ color, display: 'flex' }}>{icon}</span>
      </span>
      <span className="break-words">
        <EditableText editable={editable} value={text} placeholder={placeholder} onCommit={onCommit} />
      </span>
    </div>
  )
}

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
    <h2
      className="mb-3 flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.14em]"
      style={{ color, fontFamily: font }}
    >
      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />
      {children}
    </h2>
  )
}

function SkillRing({
  name,
  level,
  color,
  editable,
  onNameCommit,
}: {
  name: string
  level: number
  color: string
  editable: boolean
  onNameCommit: (next: string) => void
}) {
  const pct = Math.max(0, Math.min(1, level / 5))
  const radius = 24
  const stroke = 6
  const size = (radius + stroke) * 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)
  const center = size / 2

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke={RING_TRACK} strokeWidth={stroke} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="11"
          fontWeight={700}
          fill={color}
        >
          {level}/5
        </text>
      </svg>
      <span className="text-center text-[10px] font-semibold leading-tight text-ink-700">
        <EditableText editable={editable} value={name} placeholder="Skill" onCommit={onNameCommit} />
      </span>
    </div>
  )
}

export default function InfographicTemplate({
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

  const ringSkills = data.skills.slice(0, MAX_RINGS)
  const extraSkills = data.skills.slice(MAX_RINGS)

  const iconStyle = { width: 12, height: 12 }

  const sidebarNodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    skills: (editable || ringSkills.length > 0) && (
      <section className="mb-7" key="skills">
        <SectionHeading color={theme.accent} font={fonts.heading}>
          Top Skills
        </SectionHeading>
        <div className="grid grid-cols-3 gap-x-2 gap-y-4">
          {ringSkills.map((s) => (
            <SkillRing
              key={s.id}
              name={s.name}
              level={s.level}
              color={theme.accent}
              editable={editable}
              onNameCommit={(v) => updateSkill(data.id, s.id, { name: v })}
            />
          ))}
        </div>
        {extraSkills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {extraSkills.map((s) => (
              <span
                key={s.id}
                className="rounded-full px-2.5 py-1 text-[10px] font-medium"
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
        )}
      </section>
    ),
    languages: (editable || data.languages.length > 0) && (
      <section className="mb-7" key="languages">
        <SectionHeading color={theme.accent} font={fonts.heading}>
          Languages
        </SectionHeading>
        <div>
          {data.languages.map((l) => (
            <div key={l.id} className="mb-2">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <EditableText
                  editable={editable}
                  value={l.name}
                  placeholder="Language"
                  onCommit={(v) => updateLanguage(data.id, l.id, { name: v })}
                />
                <EditableText
                  editable={editable}
                  value={l.level}
                  placeholder="Level"
                  onCommit={(v) => updateLanguage(data.id, l.id, { level: v })}
                />
              </div>
              <div className="h-1.5 w-full rounded-full" style={{ background: 'rgba(0,0,0,0.1)' }}>
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${(languageLevel(l.level) / 5) * 100}%`, background: theme.accent }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    certifications: (editable || data.certifications.length > 0) && (
      <section className="mb-7" key="certifications">
        <SectionHeading color={theme.accent} font={fonts.heading}>
          Certifications
        </SectionHeading>
        <div className="space-y-3">
          {data.certifications.map((c) => (
            <div key={c.id} className="text-[11px] leading-relaxed">
              <div className="font-semibold text-ink-900">
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
    ),
  }

  const mainNodes: Partial<Record<ReorderableSection, React.ReactNode>> = {
    summary: (editable || data.summary) && (
      <section className="mb-7" key="summary">
        <SectionHeading color={theme.accent} font={fonts.heading}>
          Summary
        </SectionHeading>
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
        <SectionHeading color={theme.accent} font={fonts.heading}>
          Experience
        </SectionHeading>
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
        <SectionHeading color={theme.accent} font={fonts.heading}>
          Education
        </SectionHeading>
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
                  {e.gpa ? ` · GPA ${e.gpa}` : ''}
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
      <section className="mb-7" key="projects">
        <SectionHeading color={theme.accent} font={fonts.heading}>
          Projects
        </SectionHeading>
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
      className="min-h-[1123px] bg-white text-ink-900"
    >
      <header className="flex items-center gap-6 px-10 py-9" style={{ background: theme.accentSoft }}>
        {contact.photo && (
          <img
            src={contact.photo}
            alt=""
            style={{ boxShadow: '0 0 0 4px #ffffff' }}
            className="h-24 w-24 flex-shrink-0 rounded-full object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <h1
            className="text-[27px] font-bold leading-tight tracking-tight"
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
        {(editable ||
          contact.email ||
          contact.phone ||
          contact.location ||
          contact.website ||
          contact.linkedin ||
          contact.github) && (
          <div className="grid flex-shrink-0 grid-cols-1 gap-1.5">
            <ContactLine
              icon={<FiMail style={iconStyle} />}
              text={contact.email}
              placeholder="Email"
              color={theme.accent}
              editable={editable}
              onCommit={(v) => updateContact(data.id, { email: v })}
            />
            <ContactLine
              icon={<FiPhone style={iconStyle} />}
              text={contact.phone}
              placeholder="Phone"
              color={theme.accent}
              editable={editable}
              onCommit={(v) => updateContact(data.id, { phone: v })}
            />
            <ContactLine
              icon={<FiMapPin style={iconStyle} />}
              text={contact.location}
              placeholder="Location"
              color={theme.accent}
              editable={editable}
              onCommit={(v) => updateContact(data.id, { location: v })}
            />
            <ContactLine
              icon={<FiGlobe style={iconStyle} />}
              text={contact.website}
              placeholder="Website"
              color={theme.accent}
              editable={editable}
              onCommit={(v) => updateContact(data.id, { website: v })}
            />
            <ContactLine
              icon={<FiLinkedin style={iconStyle} />}
              text={contact.linkedin}
              placeholder="LinkedIn"
              color={theme.accent}
              editable={editable}
              onCommit={(v) => updateContact(data.id, { linkedin: v })}
            />
            <ContactLine
              icon={<FiGithub style={iconStyle} />}
              text={contact.github}
              placeholder="GitHub"
              color={theme.accent}
              editable={editable}
              onCommit={(v) => updateContact(data.id, { github: v })}
            />
          </div>
        )}
      </header>

      <div className="flex gap-8 px-10 py-8">
        <aside className="w-[34%] flex-shrink-0">{sidebarOrder.map((key) => sidebarNodes[key])}</aside>

        <main className="min-w-0 flex-1">{mainOrder.map((key) => mainNodes[key])}</main>
      </div>
    </div>
  )
}
