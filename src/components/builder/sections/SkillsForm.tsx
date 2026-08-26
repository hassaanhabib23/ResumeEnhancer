import { useResumeStore } from '../../../lib/store'
import type { ResumeData } from '../../../lib/types'
import { Input } from '../../ui/Field'
import AddButton from '../../ui/AddButton'

const CATEGORY_SUGGESTIONS = [
  'Languages',
  'Frameworks & Libraries',
  'Databases',
  'Cloud & DevOps',
  'Tools & Platforms',
  'Testing',
  'Soft Skills',
]

export default function SkillsForm({ resume }: { resume: ResumeData }) {
  const { addSkill, updateSkill, removeSkill } = useResumeStore()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Skills</h2>
        <p className="mt-1 text-sm text-ink-500">
          Add skills relevant to the job you're targeting. Set a proficiency level to show up as
          a bar in templates that display it. Optionally group skills under a category (e.g.
          "Languages", "Frameworks & Tools") — handy for IT/developer resumes; supporting
          templates will show them grouped with a heading instead of one flat list.
        </p>
      </div>

      <datalist id="skill-category-suggestions">
        {CATEGORY_SUGGESTIONS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="space-y-3">
        {resume.skills.map((skill) => (
          <div key={skill.id} className="flex flex-wrap items-center gap-3">
            <Input
              className="min-w-[140px] flex-1"
              placeholder="Figma"
              value={skill.name}
              onChange={(e) => updateSkill(resume.id, skill.id, { name: e.target.value })}
            />
            <Input
              className="min-w-[140px] flex-1"
              list="skill-category-suggestions"
              placeholder="Category (optional)"
              value={skill.category ?? ''}
              onChange={(e) => updateSkill(resume.id, skill.id, { category: e.target.value })}
            />
            <input
              type="range"
              min={1}
              max={5}
              value={skill.level}
              onChange={(e) =>
                updateSkill(resume.id, skill.id, { level: Number(e.target.value) })
              }
              className="w-28 accent-brand-600"
            />
            <button
              type="button"
              onClick={() => removeSkill(resume.id, skill.id)}
              className="rounded-md px-2 py-1 text-xs text-ink-400 hover:bg-red-50 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <AddButton label="Add skill" onClick={() => addSkill(resume.id)} />
    </div>
  )
}
