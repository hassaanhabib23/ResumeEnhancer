export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-white text-sm font-bold shadow-sm">
        R
      </span>
      <span className="text-ink-900 text-lg">Resumly</span>
    </span>
  )
}
