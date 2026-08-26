const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function formatMonthYear(value: string): string {
  if (!value) return ''
  const [y, m] = value.split('-')
  if (!m) return y
  const idx = Number(m) - 1
  if (idx < 0 || idx > 11) return value
  return `${MONTHS[idx]} ${y}`
}

export function dateRange(start: string, end: string, current: boolean): string {
  const s = formatMonthYear(start)
  const e = current ? 'Present' : formatMonthYear(end)
  if (!s && !e) return ''
  if (!e) return s
  return `${s} — ${e}`
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}
