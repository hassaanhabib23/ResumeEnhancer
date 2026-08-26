import { useResumeStore } from '../../../lib/store'
import type { ResumeData } from '../../../lib/types'
import { Input } from '../../ui/Field'
import RichTextField from '../../ui/RichTextField'
import ItemCard from '../../ui/ItemCard'
import AddButton from '../../ui/AddButton'
import Button from '../../ui/Button'
import { startsWithWeakPhrase } from '../../../lib/actionVerbs'
import { plainTextOf } from '../../../lib/richText'

function bulletTip(bullet: string): string | null {
  const text = bullet.trim()
  if (!text) return null
  if (startsWithWeakPhrase(text)) {
    return 'Starts with a weak phrase — try a stronger action verb instead (see Resume Score → Action verbs).'
  }
  if (!/\d/.test(text)) {
    return 'Add a number if you can — %, $, time saved, team size — it makes the impact concrete.'
  }
  return null
}

export default function ExperienceForm({ resume }: { resume: ResumeData }) {
  const { addExperience, updateExperience, removeExperience } = useResumeStore()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Work experience</h2>
        <p className="mt-1 text-sm text-ink-500">
          List your most recent role first. Use bullet points that start with an action verb and
          include a measurable result where you can.
        </p>
      </div>

      <div className="space-y-4">
        {resume.experience.map((exp, idx) => (
          <ItemCard
            key={exp.id}
            title={exp.role || exp.company || `Experience ${idx + 1}`}
            onRemove={() => removeExperience(resume.id, exp.id)}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Job title"
                placeholder="Senior Product Designer"
                value={exp.role}
                onChange={(e) => updateExperience(resume.id, exp.id, { role: e.target.value })}
              />
              <Input
                label="Company"
                placeholder="Northwind Analytics"
                value={exp.company}
                onChange={(e) => updateExperience(resume.id, exp.id, { company: e.target.value })}
              />
              <Input
                label="Location"
                placeholder="San Francisco, CA"
                value={exp.location}
                onChange={(e) => updateExperience(resume.id, exp.id, { location: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start date"
                  type="month"
                  value={exp.startDate}
                  onChange={(e) =>
                    updateExperience(resume.id, exp.id, { startDate: e.target.value })
                  }
                />
                <Input
                  label="End date"
                  type="month"
                  disabled={exp.current}
                  value={exp.endDate}
                  onChange={(e) => updateExperience(resume.id, exp.id, { endDate: e.target.value })}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-600">
              <input
                type="checkbox"
                checked={exp.current}
                onChange={(e) =>
                  updateExperience(resume.id, exp.id, { current: e.target.checked })
                }
              />
              I currently work here
            </label>

            <div className="space-y-2">
              <span className="text-sm font-medium text-ink-800">Highlights</span>
              {exp.bullets.map((b, i) => {
                const tip = bulletTip(plainTextOf(b))
                const insertAt = (at: number) => {
                  const bullets = [...exp.bullets]
                  bullets.splice(at, 0, '')
                  updateExperience(resume.id, exp.id, { bullets })
                }
                return (
                  <div key={i}>
                    <button
                      type="button"
                      onClick={() => insertAt(i)}
                      className="group flex w-full items-center gap-2 py-0.5 text-ink-300 hover:text-brand-600"
                    >
                      <span className="h-px flex-1 bg-ink-100 group-hover:bg-brand-200" />
                      <span className="text-[11px] font-medium opacity-0 group-hover:opacity-100">
                        + Insert bullet
                      </span>
                      <span className="h-px flex-1 bg-ink-100 group-hover:bg-brand-200" />
                    </button>
                    <div className="flex items-start gap-2">
                      <RichTextField
                        rows={2}
                        className="flex-1"
                        placeholder="Led redesign of the core dashboard, increasing task completion by 28%."
                        value={b}
                        onChange={(html) => {
                          const bullets = [...exp.bullets]
                          bullets[i] = html
                          updateExperience(resume.id, exp.id, { bullets })
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const bullets = exp.bullets.filter((_, bi) => bi !== i)
                          updateExperience(resume.id, exp.id, { bullets })
                        }}
                        className="mt-2 rounded-md px-2 py-1 text-xs text-ink-400 hover:bg-red-50 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                    {tip && <p className="mt-1 text-xs text-amber-600">{tip}</p>}
                  </div>
                )
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateExperience(resume.id, exp.id, { bullets: [...exp.bullets, ''] })
                }
              >
                + Add bullet point
              </Button>
            </div>
          </ItemCard>
        ))}
      </div>

      <AddButton label="Add work experience" onClick={() => addExperience(resume.id)} />
    </div>
  )
}
