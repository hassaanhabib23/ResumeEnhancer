import { useEffect, useRef } from 'react'
import { sanitizeRichText } from '../../lib/richText'

// A plain-text alternative for a handful of long-form fields (summary,
// experience bullets, project descriptions) — bold/italic/underline via a
// small toolbar, applied with document.execCommand against the current
// selection. Uncontrolled like EditableText: we sync `value` into the DOM
// only while unfocused, and commit on blur, so typing never fights the
// browser's own cursor position.
export default function RichTextField({
  value,
  onChange,
  placeholder = '',
  rows = 2,
  className = '',
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  rows?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const focused = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node || focused.current) return
    const shown = value || placeholder
    if (node.innerHTML !== shown) node.innerHTML = shown
  }, [value, placeholder])

  function format(cmd: 'bold' | 'italic' | 'underline') {
    const node = ref.current
    if (!node) return
    node.focus()
    document.execCommand(cmd)
    onChange(sanitizeRichText(node.innerHTML))
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-ink-200 bg-white transition-shadow focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100 ${className}`}>
      <div className="flex items-center gap-1 border-b border-ink-100 bg-ink-50/60 px-2 py-1">
        {(
          [
            ['bold', 'B', 'font-bold'],
            ['italic', 'I', 'italic'],
            ['underline', 'U', 'underline'],
          ] as const
        ).map(([cmd, label, style]) => (
          <button
            key={cmd}
            type="button"
            aria-label={cmd}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => format(cmd)}
            className={`grid h-6 w-6 place-items-center rounded text-xs text-ink-600 hover:bg-ink-200 ${style}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        style={{ minHeight: `${rows * 1.5}em` }}
        className="px-3.5 py-2.5 text-sm text-ink-900 outline-none [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline"
        onFocus={(e) => {
          focused.current = true
          if (!value && placeholder && e.currentTarget.textContent === placeholder) {
            e.currentTarget.textContent = ''
          }
        }}
        onBlur={(e) => {
          focused.current = false
          const html = sanitizeRichText(e.currentTarget.innerHTML)
          const isBlank = !e.currentTarget.textContent?.trim()
          const next = isBlank ? '' : html
          if (next !== value) onChange(next)
          if (!next && placeholder) e.currentTarget.textContent = placeholder
        }}
        onPaste={(e) => {
          e.preventDefault()
          document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
        }}
      />
    </div>
  )
}
