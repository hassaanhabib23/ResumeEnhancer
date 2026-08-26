import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'

export default function DownloadMenu({
  onDownloadPdf,
  onDownloadTextPdf,
  onDownloadDocx,
  busy = false,
  label = 'Download',
}: {
  onDownloadPdf: () => void
  onDownloadTextPdf: () => void
  onDownloadDocx: () => void
  busy?: boolean
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const items = [
    {
      icon: '📄',
      label: 'Download as PDF',
      hint: 'Matches your chosen template exactly, with real selectable text',
      onClick: onDownloadPdf,
    },
    {
      icon: '🔎',
      label: 'Download as PDF (ATS text)',
      hint: 'Selectable, ATS-friendly plain text — one universal layout',
      onClick: onDownloadTextPdf,
    },
    {
      icon: '📝',
      label: 'Download as Word (.docx)',
      hint: 'One universal layout, fully editable',
      onClick: onDownloadDocx,
    },
  ]

  return (
    <div ref={ref} className="relative">
      <Button size="sm" disabled={busy} onClick={() => setOpen((v) => !v)}>
        {busy ? 'Preparing…' : label}
        <span aria-hidden className="text-xs">▾</span>
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-xl border border-ink-100 bg-white py-1.5 shadow-xl shadow-ink-900/10">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
              className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-brand-50"
            >
              <span aria-hidden className="mt-0.5">{item.icon}</span>
              <span>
                <span className="block text-sm font-medium text-ink-800">{item.label}</span>
                <span className="block text-xs text-ink-400">{item.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
