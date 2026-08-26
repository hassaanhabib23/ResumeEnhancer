import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'

export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-50 via-white to-white px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-xl shadow-ink-900/5">
          <h1 className="text-xl font-semibold text-ink-950">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-ink-500">{footer}</p>
      </div>
    </div>
  )
}
