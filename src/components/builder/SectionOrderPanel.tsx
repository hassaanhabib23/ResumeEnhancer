import { useRef, useState } from 'react'
import { DEFAULT_SECTION_ORDER_BY_TEMPLATE, SECTION_LABELS } from '../../lib/types'
import type { ReorderableSection, ResumeData } from '../../lib/types'
import { useResumeStore } from '../../lib/store'
import Button from '../ui/Button'

const SECTION_ICONS: Record<ReorderableSection, string> = {
  summary: '✍️',
  experience: '💼',
  education: '🎓',
  skills: '🛠️',
  projects: '🧩',
  certifications: '📜',
  languages: '🌐',
}

export default function SectionOrderPanel({
  resume,
  onClose,
}: {
  resume: ResumeData
  onClose: () => void
}) {
  const { reorderSections, toggleSectionVisibility } = useResumeStore()
  const templateDefault = DEFAULT_SECTION_ORDER_BY_TEMPLATE[resume.templateId]
  const [order, setOrder] = useState<ReorderableSection[]>(
    () => resume.sectionOrder ?? [...templateDefault],
  )
  const hidden = resume.hiddenSections ?? []
  const dragIndex = useRef<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  function commit(next: ReorderableSection[]) {
    setOrder(next)
    reorderSections(resume.id, next)
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= order.length) return
    const next = [...order]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    commit(next)
  }

  function handleDrop(index: number) {
    if (dragIndex.current === null) return
    move(dragIndex.current, index)
    dragIndex.current = null
    setOverIndex(null)
  }

  function resetToDefault() {
    // Clearing sectionOrder makes every template fall back to its own
    // hand-tuned default order again (see shared.tsx `orderedSections`).
    setOrder([...templateDefault])
    reorderSections(resume.id, undefined)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink-950/40" />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="text-base font-semibold text-ink-900">Reorder sections</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            ✕
          </button>
        </div>

        <div className="px-5 pt-4">
          <p className="text-xs leading-relaxed text-ink-500">
            Drag a section (or use the arrows) to change where it appears on your resume. On
            templates with a colored sidebar, this reorders sections within their own column —
            sidebar sections stay in the sidebar, main-column sections stay in the main column.
            Toggle the eye off to leave a section out of your resume entirely — your content for
            it stays saved, so turning it back on brings it right back.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="space-y-2">
            {order.map((key, i) => {
              const isHidden = hidden.includes(key)
              return (
                <li
                  key={key}
                  draggable
                  onDragStart={() => {
                    dragIndex.current = i
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setOverIndex(i)
                  }}
                  onDragLeave={() => setOverIndex((cur) => (cur === i ? null : cur))}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleDrop(i)
                  }}
                  onDragEnd={() => {
                    dragIndex.current = null
                    setOverIndex(null)
                  }}
                  className={`flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 shadow-sm transition-colors ${
                    overIndex === i ? 'border-brand-400 bg-brand-50' : 'border-ink-100'
                  } ${isHidden ? 'opacity-50' : ''}`}
                >
                  <span className="cursor-grab select-none text-ink-300" aria-hidden>
                    ⠿
                  </span>
                  <span className="text-base">{SECTION_ICONS[key]}</span>
                  <span className="flex-1 text-sm font-medium text-ink-800">
                    {SECTION_LABELS[key]}
                    {isHidden && <span className="ml-2 text-xs font-normal text-ink-400">Hidden</span>}
                  </span>
                  <button
                    aria-label={isHidden ? `Show ${SECTION_LABELS[key]}` : `Hide ${SECTION_LABELS[key]}`}
                    onClick={() => toggleSectionVisibility(resume.id, key)}
                    className="rounded px-1.5 py-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                  >
                    {isHidden ? '🙈' : '👁️'}
                  </button>
                  <div className="flex flex-col">
                    <button
                      aria-label={`Move ${SECTION_LABELS[key]} up`}
                      disabled={i === 0}
                      onClick={() => move(i, i - 1)}
                      className="rounded px-1.5 py-0.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      ↑
                    </button>
                    <button
                      aria-label={`Move ${SECTION_LABELS[key]} down`}
                      disabled={i === order.length - 1}
                      onClick={() => move(i, i + 1)}
                      className="rounded px-1.5 py-0.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      ↓
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <button
            onClick={resetToDefault}
            className="mt-4 text-xs font-medium text-brand-700 hover:underline"
          >
            Reset to this template's default order
          </button>
        </div>

        <div className="border-t border-ink-100 px-5 py-4">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
