import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import LayoutThumb from '../templates/LayoutThumb'
import { LAYOUTS } from '../../lib/templateRegistry'
import { sampleResume } from '../../lib/sampleData'
import type { LayoutId, ColorTheme } from '../../lib/types'

// A representative color per pick, just so the showcase row doesn't read as
// monochrome — this is cosmetic preview styling, not a claim that color is
// a separate template (see /templates and its "N distinct layouts" copy).
const PREVIEW_COLORS: Partial<Record<LayoutId, ColorTheme>> = {
  modern: 'brand',
  classic: 'ink',
  minimal: 'forest',
  timeline: 'crimson',
  banner: 'gold',
  executive: 'ink',
  'creative-blocks': 'brand',
  academic: 'forest',
}

const PICK_IDS: LayoutId[] = [
  'modern',
  'classic',
  'minimal',
  'timeline',
  'banner',
  'executive',
  'creative-blocks',
  'academic',
]

export default function TemplatesShowcase() {
  const navigate = useNavigate()
  const previewData = useMemo(() => sampleResume(), [])
  const picks = PICK_IDS.map((id) => LAYOUTS.find((l) => l.id === id)).filter(Boolean)

  return (
    <section id="templates" className="bg-ink-50/60 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
            {LAYOUTS.length} templates. Every one a genuinely different layout.
          </h2>
          <p className="mt-4 text-lg text-ink-600">
            Not just recolors of the same design — each template has its own structure. Pick any
            color palette and font pairing once you're in the builder, and switch templates
            anytime — your content carries over automatically.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {picks.map((layout) => (
            <button
              key={layout!.id}
              onClick={() => navigate(`/builder?template=${layout!.id}&demo=1`)}
              className="group text-left"
            >
              <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-ink-900/10">
                <div className="flex justify-center bg-ink-50 py-4">
                  <LayoutThumb
                    layoutId={layout!.id}
                    colorTheme={PREVIEW_COLORS[layout!.id] ?? 'brand'}
                    fontVariant="sans"
                    baseData={previewData}
                  />
                </div>
                <div className="p-3">
                  <h3 className="truncate text-sm font-semibold text-ink-900">{layout!.name}</h3>
                  <span className="mt-1 inline-block text-xs font-medium text-brand-600 group-hover:underline">
                    Use this template →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate('/templates')}
            className="rounded-lg border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 hover:border-brand-300"
          >
            Browse all {LAYOUTS.length} templates →
          </button>
        </div>
      </div>
    </section>
  )
}
