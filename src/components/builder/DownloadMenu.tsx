import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'

export default function DownloadMenu({
  onDownloadPdf,
  onDownloadDocx,
  busy = false,
  label = 'Download',
}: {
  onDownloadPdf: () => void
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

  return (
    <div ref={ref} className="relative">
      <Button size="sm" disabled={busy} onClick={() => setOpen((v) => !v)}>
        {busy ? 'Preparing…' : label}
        <span aria-hidden className="text-xs">▾</span>
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-ink-100 bg-white py-1.5 shadow-xl shadow-ink-900/10">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onDownloadPdf()
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink-700 hover:bg-brand-50"
          >
            <span aria-hidden>📄</span> Download as PDF
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onDownloadDocx()
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink-700 hover:bg-brand-50"
          >
            <span aria-hidden>📝</span> Download as Word (.docx)
          </button>
        </div>
      )}
    </div>
  )
}
