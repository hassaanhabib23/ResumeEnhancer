import type { ReactNode } from 'react'

export default function ItemCard({
  title,
  onRemove,
  children,
}: {
  title: string
  onRemove: () => void
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          {title}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md px-2 py-1 text-xs font-medium text-ink-400 hover:bg-red-50 hover:text-red-500"
        >
          Remove
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
