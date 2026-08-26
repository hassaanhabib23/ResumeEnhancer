import type { ResumeData, SectionKey } from '../../lib/types'

const STEPS: { key: SectionKey; label: string; icon: string; optional?: boolean }[] = [
  { key: 'contact', label: 'Contact', icon: '👤' },
  { key: 'summary', label: 'Summary', icon: '✍️' },
  { key: 'experience', label: 'Experience', icon: '💼' },
  { key: 'education', label: 'Education', icon: '🎓' },
  { key: 'skills', label: 'Skills', icon: '🛠️' },
  { key: 'projects', label: 'Projects', icon: '🧩', optional: true },
  { key: 'certifications', label: 'Certifications', icon: '📜', optional: true },
  { key: 'languages', label: 'Languages', icon: '🌐', optional: true },
]

function countOf(resume: ResumeData, key: SectionKey): number {
  switch (key) {
    case 'experience':
      return resume.experience.length
    case 'education':
      return resume.education.length
    case 'skills':
      return resume.skills.length
    case 'projects':
      return resume.projects.length
    case 'certifications':
      return resume.certifications.length
    case 'languages':
      return resume.languages.length
    case 'summary':
      return resume.summary.trim() ? 1 : 0
    case 'contact':
      return resume.contact.fullName.trim() ? 1 : 0
  }
}

export default function StepNav({
  resume,
  active,
  onSelect,
}: {
  resume: ResumeData
  active: SectionKey
  onSelect: (key: SectionKey) => void
}) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {STEPS.map((step) => {
        const count = countOf(resume, step.key)
        const isActive = step.key === active
        return (
          <button
            key={step.key}
            onClick={() => onSelect(step.key)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
            }`}
          >
            <span className="text-base">{step.icon}</span>
            <span className="flex-1">{step.label}</span>
            {count > 0 && (
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-semibold ${
                  isActive ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
