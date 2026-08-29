import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Button from '../components/ui/Button'
import { Input, Select, TextArea } from '../components/ui/Field'
import { useJobTrackerStore } from '../lib/jobTrackerStore'
import { useResumeStore } from '../lib/store'
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
  type JobApplication,
} from '../lib/types'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

const STATUS_DOT: Record<ApplicationStatus, string> = {
  saved: 'bg-ink-300',
  applied: 'bg-brand-500',
  interviewing: 'bg-amber-500',
  offer: 'bg-emerald-500',
  rejected: 'bg-red-400',
}

function ApplicationForm({
  initial,
  onSave,
  onClose,
}: {
  initial: JobApplication
  onSave: (patch: Partial<JobApplication>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const resumes = useResumeStore((s) => s.resumes)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-base font-semibold text-ink-900">
          {initial.company || initial.role ? 'Edit application' : 'Add application'}
        </h2>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <Input
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {APPLICATION_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
            <Input
              label="Applied date"
              type="date"
              value={form.appliedDate}
              onChange={(e) => setForm({ ...form, appliedDate: e.target.value })}
            />
          </div>
          <Input
            label="Job posting link"
            placeholder="https://…"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
          <Select
            label="Resume used"
            value={form.resumeId ?? ''}
            onChange={(e) => setForm({ ...form, resumeId: e.target.value || undefined })}
          >
            <option value="">None</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
          <TextArea
            label="Notes"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(form)
              onClose()
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function TrackerPage() {
  const navigate = useNavigate()
  const { applications, addApplication, updateApplication, removeApplication, setStatus } =
    useJobTrackerStore()
  const resumes = useResumeStore((s) => s.resumes)
  const [editing, setEditing] = useState<JobApplication | null>(null)
  const [adding, setAdding] = useState(false)

  const resumeName = (id?: string) => resumes.find((r) => r.id === id)?.name

  return (
    <div className="min-h-screen bg-ink-50/40">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink-950">Job applications</h1>
            <p className="mt-1 text-sm text-ink-500">
              Track where every application stands, from saved to offer.
            </p>
          </div>
          <Button onClick={() => setAdding(true)}>+ Add application</Button>
        </div>

        {applications.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center">
            <p className="text-ink-500">No applications tracked yet.</p>
            <Button className="mt-4" onClick={() => setAdding(true)}>
              + Add your first application
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {APPLICATION_STATUSES.map((status) => {
              const items = applications.filter((a) => a.status === status)
              return (
                <div key={status} className="min-w-0">
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
                    <h2 className="text-sm font-semibold text-ink-800">
                      {APPLICATION_STATUS_LABELS[status]}
                    </h2>
                    <span className="text-xs text-ink-400">{items.length}</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-xl border border-ink-100 bg-white p-3.5 shadow-sm"
                      >
                        <p className="truncate text-sm font-medium text-ink-900">
                          {a.role || 'Untitled role'}
                        </p>
                        <p className="truncate text-xs text-ink-500">{a.company || 'Unknown company'}</p>
                        {a.resumeId && (
                          <button
                            onClick={() => navigate(`/builder/${a.resumeId}`)}
                            className="mt-1.5 truncate text-xs text-brand-600 hover:underline"
                          >
                            {resumeName(a.resumeId) ?? 'Resume'}
                          </button>
                        )}
                        <p className="mt-1.5 text-[11px] text-ink-400">Updated {timeAgo(a.updatedAt)}</p>
                        <div className="mt-3 flex items-center gap-1.5">
                          <select
                            value={a.status}
                            onChange={(e) => setStatus(a.id, e.target.value as ApplicationStatus)}
                            className="flex-1 rounded-md border border-ink-200 bg-white px-1.5 py-1 text-[11px] text-ink-700 outline-none"
                          >
                            {APPLICATION_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {APPLICATION_STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setEditing(a)}
                            className="rounded-md px-1.5 py-1 text-[11px] text-ink-500 hover:bg-ink-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this application?')) removeApplication(a.id)
                            }}
                            className="rounded-md px-1.5 py-1 text-[11px] text-red-500 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {adding && (
        <ApplicationForm
          initial={{
            id: '',
            company: '',
            role: '',
            status: 'saved',
            link: '',
            appliedDate: '',
            notes: '',
            resumeId: undefined,
            updatedAt: '',
          }}
          onSave={(patch) => addApplication(patch)}
          onClose={() => setAdding(false)}
        />
      )}
      {editing && (
        <ApplicationForm
          initial={editing}
          onSave={(patch) => updateApplication(editing.id, patch)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
