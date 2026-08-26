import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useResumeStore } from '../lib/store'
import type { SectionKey, TemplateId } from '../lib/types'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'
import StepNav from '../components/builder/StepNav'
import TemplateSwitcher from '../components/builder/TemplateSwitcher'
import PreviewPane from '../components/builder/PreviewPane'
import ResumeScorePanel from '../components/builder/ResumeScorePanel'
import SectionOrderPanel from '../components/builder/SectionOrderPanel'
import DownloadMenu from '../components/builder/DownloadMenu'
import { exportResumeToServerPdf } from '../lib/pdfServer'
import { exportResumeToDocx } from '../lib/docx'
import { computeResumeScore } from '../lib/resumeScore'

import ContactForm from '../components/builder/sections/ContactForm'
import SummaryForm from '../components/builder/sections/SummaryForm'
import ExperienceForm from '../components/builder/sections/ExperienceForm'
import EducationForm from '../components/builder/sections/EducationForm'
import SkillsForm from '../components/builder/sections/SkillsForm'
import ProjectsForm from '../components/builder/sections/ProjectsForm'
import CertificationsForm from '../components/builder/sections/CertificationsForm'
import LanguagesForm from '../components/builder/sections/LanguagesForm'

const STEP_ORDER: SectionKey[] = [
  'contact',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
]

export default function BuilderPage() {
  const navigate = useNavigate()
  const params = useParams()
  const [search] = useSearchParams()
  const { resumes, createResume, createSampleResume, renameResume, setTemplate } =
    useResumeStore()

  const [resumeId, setResumeId] = useState<string | null>(params.resumeId ?? null)
  const [step, setStep] = useState<SectionKey>('contact')
  const [exporting, setExporting] = useState(false)
  const [nameEditing, setNameEditing] = useState(false)
  const [importWarnings, setImportWarnings] = useState<string[] | null>(null)
  const [scoreOpen, setScoreOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)

  useEffect(() => {
    if (search.get('imported') !== '1' || !params.resumeId) return
    try {
      const raw = sessionStorage.getItem(`import-warnings-${params.resumeId}`)
      setImportWarnings(raw ? JSON.parse(raw) : [])
      sessionStorage.removeItem(`import-warnings-${params.resumeId}`)
    } catch {
      setImportWarnings([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (params.resumeId) {
      setResumeId(params.resumeId)
      return
    }
    if (resumeId) return
    const isDemo = search.get('demo') === '1'
    const id = isDemo ? createSampleResume() : createResume()
    const template = search.get('template') as TemplateId | null
    if (template) setTemplate(id, template)
    setResumeId(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resume = useMemo(() => resumes.find((r) => r.id === resumeId), [resumes, resumeId])
  const score = useMemo(() => (resume ? computeResumeScore(resume).score : null), [resume])

  if (!resume) {
    return (
      <div className="grid h-screen place-items-center text-ink-400">Loading your resume…</div>
    )
  }

  async function handleExportPdf() {
    setExporting(true)
    try {
      await exportResumeToServerPdf(`${resume!.contact.fullName || resume!.name}`)
    } catch (err) {
      console.error(err)
      alert('Something went wrong exporting your PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  async function handleExportDocx() {
    setExporting(true)
    try {
      await exportResumeToDocx(resume!, `${resume!.contact.fullName || resume!.name}`)
    } catch (err) {
      console.error(err)
      alert('Something went wrong exporting your Word document. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const stepIndex = STEP_ORDER.indexOf(step)

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="shrink-0">
            <Logo />
          </button>
          <div className="hidden h-6 w-px bg-ink-100 sm:block" />
          {nameEditing ? (
            <input
              autoFocus
              defaultValue={resume.name}
              onBlur={(e) => {
                renameResume(resume.id, e.target.value || 'Untitled Resume')
                setNameEditing(false)
              }}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              className="hidden rounded-md border border-ink-200 px-2 py-1 text-sm sm:block"
            />
          ) : (
            <button
              onClick={() => setNameEditing(true)}
              className="hidden text-sm font-medium text-ink-500 hover:text-ink-800 sm:block"
            >
              {resume.name} ✎
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScoreOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-brand-400 hover:bg-brand-50"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                score === null ? 'bg-ink-300' : score >= 85 ? 'bg-emerald-500' : score >= 65 ? 'bg-brand-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'
              }`}
            />
            Score {score ?? '—'}
          </button>
          <button
            onClick={() => setOrderOpen(true)}
            className="hidden items-center gap-2 rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-brand-400 hover:bg-brand-50 sm:flex"
          >
            <span aria-hidden>⠿</span>
            Reorder
          </button>
          <TemplateSwitcher resume={resume} />
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            Save &amp; exit
          </Button>
          <DownloadMenu
            onDownloadPdf={handleExportPdf}
            onDownloadDocx={handleExportDocx}
            busy={exporting}
          />
        </div>
      </header>

      {scoreOpen && <ResumeScorePanel resume={resume} onClose={() => setScoreOpen(false)} />}
      {orderOpen && (
        <SectionOrderPanel key={resume.id} resume={resume} onClose={() => setOrderOpen(false)} />
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_1fr_1fr]">
        <aside className="hidden overflow-y-auto border-r border-ink-100 lg:block">
          <StepNav resume={resume} active={step} onSelect={setStep} />
        </aside>

        <main className="overflow-y-auto px-6 py-8 sm:px-10">
          <div className="mx-auto max-w-xl">
            {importWarnings !== null && (
              <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-brand-800">
                    We pulled this in from your uploaded file — please review each section before
                    exporting.
                  </p>
                  <button
                    onClick={() => setImportWarnings(null)}
                    className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-800"
                  >
                    Dismiss
                  </button>
                </div>
                {importWarnings.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-brand-700">
                    {importWarnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {step === 'contact' && <ContactForm resume={resume} />}
            {step === 'summary' && <SummaryForm resume={resume} />}
            {step === 'experience' && <ExperienceForm resume={resume} />}
            {step === 'education' && <EducationForm resume={resume} />}
            {step === 'skills' && <SkillsForm resume={resume} />}
            {step === 'projects' && <ProjectsForm resume={resume} />}
            {step === 'certifications' && <CertificationsForm resume={resume} />}
            {step === 'languages' && <LanguagesForm resume={resume} />}

            <div className="mt-8 flex items-center justify-between border-t border-ink-100 pt-6">
              <Button
                variant="ghost"
                disabled={stepIndex === 0}
                onClick={() => setStep(STEP_ORDER[Math.max(0, stepIndex - 1)])}
              >
                ← Back
              </Button>
              {stepIndex < STEP_ORDER.length - 1 ? (
                <Button onClick={() => setStep(STEP_ORDER[stepIndex + 1])}>Next →</Button>
              ) : (
                <DownloadMenu
                  onDownloadPdf={handleExportPdf}
                        onDownloadDocx={handleExportDocx}
                  busy={exporting}
                  label="Finish & download"
                />
              )}
            </div>
          </div>
        </main>

        <section className="hidden min-h-0 overflow-hidden border-l border-ink-100 lg:block">
          <PreviewPane data={resume} />
        </section>
      </div>

      {/* mobile preview toggle */}
      <div className="border-t border-ink-100 p-3 lg:hidden">
        <details>
          <summary className="cursor-pointer text-sm font-medium text-ink-600">
            Show live preview
          </summary>
          <div className="mt-3 h-[70vh]">
            <PreviewPane data={resume} />
          </div>
        </details>
      </div>
    </div>
  )
}
