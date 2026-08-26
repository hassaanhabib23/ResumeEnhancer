import { useResumeStore } from '../../../lib/store'
import type { ResumeData } from '../../../lib/types'
import { Input } from '../../ui/Field'
import AddButton from '../../ui/AddButton'

const LEVELS = ['Basic', 'Conversational', 'Fluent', 'Native']

export default function LanguagesForm({ resume }: { resume: ResumeData }) {
  const { addLanguage, updateLanguage, removeLanguage } = useResumeStore()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Languages</h2>
        <p className="mt-1 text-sm text-ink-500">Optional — helpful for international or multilingual roles.</p>
      </div>

      <div className="space-y-3">
        {resume.languages.map((l) => (
          <div key={l.id} className="flex items-center gap-3">
            <Input
              className="flex-1"
              placeholder="Portuguese"
              value={l.name}
              onChange={(e) => updateLanguage(resume.id, l.id, { name: e.target.value })}
            />
            <select
              value={l.level}
              onChange={(e) => updateLanguage(resume.id, l.id, { level: e.target.value })}
              className="rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-800 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            >
              {LEVELS.map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeLanguage(resume.id, l.id)}
              className="rounded-md px-2 py-1 text-xs text-ink-400 hover:bg-red-50 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <AddButton label="Add language" onClick={() => addLanguage(resume.id)} />
    </div>
  )
}
