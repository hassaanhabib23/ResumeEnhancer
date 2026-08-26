import { LAYOUTS, COLOR_THEMES } from '../../lib/templateRegistry'
import { ACTION_VERBS } from '../../lib/actionVerbs'

const actionVerbCount = Object.values(ACTION_VERBS).reduce((sum, verbs) => sum + verbs.length, 0)

const STATS = [
  { value: `${LAYOUTS.length}`, label: 'distinct templates' },
  { value: `${COLOR_THEMES.length}`, label: 'color themes' },
  { value: `${actionVerbCount}+`, label: 'action verbs to borrow' },
  { value: '$0', label: 'cost, no signup required' },
]

export default function Stats() {
  return (
    <section className="bg-ink-950 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Built to be actually useful
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-ink-300">
          No accounts required to try it, and everything below runs live in this build.
        </p>
        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <div className="text-3xl font-bold text-white sm:text-4xl">{s.value}</div>
              <div className="mt-2 text-sm text-ink-300">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
