import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Button from '../components/ui/Button'
import { useResumeStore } from '../lib/store'
import { extractResumeText } from '../lib/fileText'
import { parseResumeText } from '../lib/parseResume'

type Status = 'idle' | 'reading' | 'parsing' | 'error'

export default function ImportResumePage() {
  const navigate = useNavigate()
  const { importResume } = useResumeStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      setError('')
      setStatus('reading')
      try {
        const { text } = await extractResumeText(file)
        setStatus('parsing')
        const { patch, warnings } = parseResumeText(text)
        const id = importResume(patch)
        if (warnings.length) {
          try {
            sessionStorage.setItem(`import-warnings-${id}`, JSON.stringify(warnings))
          } catch {
            // sessionStorage can be unavailable (e.g. private browsing) — not fatal.
          }
        }
        navigate(`/builder/${id}?imported=1`)
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Something went wrong reading that file.')
      }
    },
    [importResume, navigate],
  )

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const busy = status === 'reading' || status === 'parsing'

  return (
    <div className="min-h-screen bg-ink-50/40">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-center text-2xl font-semibold text-ink-950">
          Upload your existing resume
        </h1>
        <p className="mt-2 text-center text-sm text-ink-500">
          We'll pull out your contact info, experience, education, skills, and more, then drop you
          into the builder with a template already applied — just review and adjust anything we
          got wrong.
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`mt-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-colors ${
            dragOver ? 'border-brand-400 bg-brand-50' : 'border-ink-200 bg-white'
          }`}
        >
          {busy ? (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
              <p className="mt-4 text-sm font-medium text-ink-700">
                {status === 'reading' ? 'Reading your file…' : 'Pulling out your details…'}
              </p>
            </>
          ) : (
            <>
              <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-2xl">
                📄
              </div>
              <p className="mt-4 text-sm font-medium text-ink-700">
                Drag and drop your resume here, or
              </p>
              <Button className="mt-4" onClick={() => inputRef.current?.click()}>
                Choose a file
              </Button>
              <p className="mt-3 text-xs text-ink-400">Supports PDF, DOCX, and plain text/markdown</p>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                  e.target.value = ''
                }}
              />
            </>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">{error}</p>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/builder')}
            className="text-sm font-medium text-ink-500 hover:text-ink-800"
          >
            Or start from a blank resume instead →
          </button>
        </div>

        <p className="mt-10 rounded-lg bg-ink-50 p-4 text-xs leading-relaxed text-ink-400">
          Parsing runs entirely in your browser — nothing is uploaded to a server. This is a
          best-effort text parser (not an AI service), so double-check dates, job titles, and
          bullet points after it lands you in the builder.
        </p>
      </div>
    </div>
  )
}
