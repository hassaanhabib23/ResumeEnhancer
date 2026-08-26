export default function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 py-3 text-sm font-medium text-ink-500 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
    >
      <span className="text-lg leading-none">+</span> {label}
    </button>
  )
}
