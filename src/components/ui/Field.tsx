import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldWrapProps {
  label?: string
  hint?: string
  className?: string
  children: React.ReactNode
}

export function FieldWrap({ label, hint, className = '', children }: FieldWrapProps) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {label && <span className="text-sm font-medium text-ink-800">{label}</span>}
      {children}
      {hint && <span className="text-xs text-ink-400">{hint}</span>}
    </label>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

export function Input({ label, hint, className = '', ...rest }: InputProps) {
  return (
    <FieldWrap label={label} hint={hint}>
      <input
        className={`w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition-shadow focus:border-brand-400 focus:ring-4 focus:ring-brand-100 ${className}`}
        {...rest}
      />
    </FieldWrap>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
}

export function Select({ label, hint, className = '', children, ...rest }: SelectProps) {
  return (
    <FieldWrap label={label} hint={hint}>
      <select
        className={`w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-400 focus:ring-4 focus:ring-brand-100 ${className}`}
        {...rest}
      >
        {children}
      </select>
    </FieldWrap>
  )
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
}

export function TextArea({ label, hint, className = '', ...rest }: TextAreaProps) {
  return (
    <FieldWrap label={label} hint={hint}>
      <textarea
        className={`w-full resize-y rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition-shadow focus:border-brand-400 focus:ring-4 focus:ring-brand-100 ${className}`}
        {...rest}
      />
    </FieldWrap>
  )
}
