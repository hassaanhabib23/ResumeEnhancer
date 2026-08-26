import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import LayoutThumb from '../components/templates/LayoutThumb'
import { useResumeStore } from '../lib/store'
import { sampleResume } from '../lib/sampleData'
import { LAYOUTS, TEMPLATE_CATEGORIES, COLOR_THEMES, type LayoutDef } from '../lib/templateRegistry'
import { THEME_SWATCHES, THEME_LABELS } from '../lib/theme'
import type { ColorTheme, FontVariant } from '../lib/types'

const PAGE_SIZE = 24

export default function TemplatesPage() {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const resumeId = search.get('resumeId')
  const { createResume, applyTemplateCombo } = useResumeStore()

  const previewData = useMemo(() => sampleResume(), [])

  const [category, setCategory] = useState<string>('All')
  // These only change how thumbnails PREVIEW here — a layout is one template
  // regardless of color/font. Color and font are picked separately, in the
  // builder's "Design" panel, and can be changed any time without switching
  // templates.
  const [previewColor, setPreviewColor] = useState<ColorTheme>('brand')
  const [previewFont, setPreviewFont] = useState<FontVariant>('sans')
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    return LAYOUTS.filter((l) => {
      if (category !== 'All' && l.category !== category) return false
      if (query && !l.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [category, query])

  function choose(layout: LayoutDef) {
    const combo = {
      templateId: layout.id,
      colorTheme: previewColor,
      fontVariant: previewFont,
    }
    if (resumeId) {
      applyTemplateCombo(resumeId, combo)
      navigate(`/builder/${resumeId}`)
      return
    }
    const id = createResume()
    applyTemplateCombo(id, combo)
    navigate(`/builder/${id}`)
  }

  return (
    <div className="min-h-screen bg-ink-50/40">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink-950">
              {resumeId ? 'Choose a template for this resume' : 'Browse all templates'}
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {LAYOUTS.length} distinct layouts — each with its own structure, not just a
              recolor of another. Pick any color palette and font pairing once you're in the
              builder, at no cost to which template you're on. Showing{' '}
              {Math.min(visible, filtered.length)} of {filtered.length}.
            </p>
          </div>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setVisible(PAGE_SIZE)
            }}
            placeholder="Search templates…"
            className="w-64 rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {['All', ...TEMPLATE_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c)
                setVisible(PAGE_SIZE)
              }}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                category === c
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-ink-400">Preview color:</span>
            {COLOR_THEMES.map((c) => (
              <button
                key={c}
                title={THEME_LABELS[c]}
                onClick={() => setPreviewColor(c)}
                className={`h-6 w-6 rounded-full border-2 ${
                  previewColor === c ? 'border-ink-900' : 'border-transparent'
                }`}
                style={{ background: THEME_SWATCHES[c] }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-ink-400">Preview font:</span>
            {(['sans', 'serif'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setPreviewFont(f)}
                className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                  previewFont === f
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-ink-200 bg-white text-ink-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-ink-400">No templates match those filters.</p>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.slice(0, visible).map((layout) => (
                <button key={layout.id} onClick={() => choose(layout)} className="group text-left">
                  <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-ink-100 transition-shadow group-hover:shadow-lg group-hover:ring-brand-200">
                    <LayoutThumb
                      layoutId={layout.id}
                      colorTheme={previewColor}
                      fontVariant={previewFont}
                      baseData={previewData}
                    />
                  </div>
                  <p className="mt-2 truncate text-xs font-medium text-ink-700">{layout.name}</p>
                  <p className="truncate text-[11px] text-ink-400">{layout.blurb}</p>
                </button>
              ))}
            </div>

            {visible < filtered.length && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="rounded-lg border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 hover:border-brand-300"
                >
                  Show more ({filtered.length - visible} left)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
