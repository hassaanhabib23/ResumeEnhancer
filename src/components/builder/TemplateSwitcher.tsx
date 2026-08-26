import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ResumeData, ColorTheme, FontVariant, SkillStyle } from '../../lib/types'
import { SKILL_STYLES, SKILL_STYLE_LABELS } from '../../lib/types'
import { useResumeStore } from '../../lib/store'
import { THEME_SWATCHES, THEME_LABELS, THEME_COLORS } from '../../lib/theme'
import { LAYOUTS } from '../../lib/templateRegistry'

// Tiny inline glyph previewing what each skill-level style looks like, so
// the picker shows the shape of each option rather than just naming it.
function SkillStyleGlyph({ style, color }: { style: SkillStyle; color: string }) {
  if (style === 'dots') {
    return (
      <span className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={i < 3 ? { background: color } : { border: `1px solid ${color}`, opacity: 0.4 }}
          />
        ))}
      </span>
    )
  }
  if (style === 'blocks') {
    return (
      <span className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-1.5 w-2 rounded-[1px]"
            style={{ background: color, opacity: i < 3 ? 1 : 0.25 }}
          />
        ))}
      </span>
    )
  }
  if (style === 'label') {
    return (
      <span
        className="rounded-full px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wide"
        style={{ background: `${color}22`, color }}
      >
        Adv
      </span>
    )
  }
  return (
    <span className="h-1.5 w-10 overflow-hidden rounded-full" style={{ background: `${color}33` }}>
      <span className="block h-full w-3/5 rounded-full" style={{ background: color }} />
    </span>
  )
}

export default function TemplateSwitcher({ resume }: { resume: ResumeData }) {
  const navigate = useNavigate()
  const { setTemplate, setColorTheme, setFontVariant, setSkillStyle } = useResumeStore()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:border-brand-300"
      >
        <span
          className="h-3 w-3 rounded-full"
          style={{ background: THEME_SWATCHES[resume.colorTheme] }}
        />
        Design
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-ink-100 bg-white p-4 shadow-xl shadow-ink-900/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Layout</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {LAYOUTS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(resume.id, t.id)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium ${
                    resume.templateId === t.id
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-ink-200 text-ink-600 hover:border-brand-300'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Color theme
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(THEME_SWATCHES) as ColorTheme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setColorTheme(resume.id, theme)}
                  title={THEME_LABELS[theme]}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    resume.colorTheme === theme ? 'border-ink-900' : 'border-transparent'
                  }`}
                >
                  <span
                    className="h-6 w-6 rounded-full"
                    style={{ background: THEME_SWATCHES[theme] }}
                  />
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">Font</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['sans', 'serif'] as FontVariant[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFontVariant(resume.id, f)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium capitalize ${
                    resume.fontVariant === f
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-ink-200 text-ink-600 hover:border-brand-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Skill level style
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {SKILL_STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSkillStyle(resume.id, s)}
                  className={`flex items-center justify-between rounded-lg border px-2.5 py-2 text-xs font-medium ${
                    (resume.skillStyle ?? 'bar') === s
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-ink-200 text-ink-600 hover:border-brand-300'
                  }`}
                >
                  {SKILL_STYLE_LABELS[s]}
                  <SkillStyleGlyph style={s} color={THEME_COLORS[resume.colorTheme].accent} />
                </button>
              ))}
            </div>

            <button
              onClick={() => navigate(`/templates?resumeId=${resume.id}`)}
              className="mt-4 w-full rounded-lg border border-dashed border-ink-300 py-2 text-xs font-medium text-ink-500 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
            >
              Browse all {LAYOUTS.length} templates →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
