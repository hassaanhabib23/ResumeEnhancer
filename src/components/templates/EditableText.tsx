import { useEffect, useRef } from 'react'
import type { CSSProperties, ElementType } from 'react'

// A click-to-edit text node used directly inside the resume preview — the
// "edit on the canvas" pattern real resume builders (Enhancv, Zety, etc.)
// use, as an alternative to only editing through the left-hand form.
//
// Implementation notes:
// - This is an *uncontrolled* contentEditable: we sync `value` into the DOM
//   via a ref/effect instead of React's normal render cycle, and only while
//   the element is NOT focused. A normal controlled re-render on every
//   keystroke would fight the browser's own cursor position and make text
//   jump to the start after each character — the classic React +
//   contentEditable bug.
// - Changes are committed to the store on blur (not on every keystroke),
//   which keeps this simple and avoids re-render churn on the whole preview
//   while someone is actively typing.
// - When `editable` is false (template gallery thumbnails, the landing page
//   showcase), it renders as plain static text — the exact same markup the
//   templates used before this component existed.
export default function EditableText({
  value,
  onCommit,
  placeholder = '',
  multiline = false,
  editable = true,
  as = 'span',
  className,
  style,
}: {
  value: string
  onCommit: (next: string) => void
  placeholder?: string
  multiline?: boolean
  editable?: boolean
  as?: ElementType
  className?: string
  style?: CSSProperties
}) {
  const ref = useRef<HTMLElement | null>(null)
  const focused = useRef(false)
  const Tag = as as ElementType

  useEffect(() => {
    const node = ref.current
    if (!node || focused.current) return
    const shown = value || placeholder
    if (node.textContent !== shown) node.textContent = shown
  }, [value, placeholder])

  if (!editable) {
    return (
      <Tag className={className} style={style}>
        {value || placeholder}
      </Tag>
    )
  }

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={`editable-field${className ? ` ${className}` : ''}`}
      style={{ outline: 'none', cursor: 'text', ...style }}
      onFocus={(e: React.FocusEvent<HTMLElement>) => {
        focused.current = true
        if (!value && placeholder && e.currentTarget.textContent === placeholder) {
          e.currentTarget.textContent = ''
        }
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        focused.current = false
        const text = (multiline ? e.currentTarget.innerText : e.currentTarget.textContent) || ''
        const next = multiline ? text.replace(/\n+$/, '') : text.trim()
        if (next !== value) onCommit(next)
        if (!next && placeholder) e.currentTarget.textContent = placeholder
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (!multiline && e.key === 'Enter') {
          e.preventDefault()
          e.currentTarget.blur()
        }
        if (e.key === 'Escape') {
          e.currentTarget.blur()
        }
      }}
    >
      {value || placeholder}
    </Tag>
  )
}
