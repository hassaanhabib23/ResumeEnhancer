import { useNavigate } from 'react-router-dom'
import { useResumeStore } from '../lib/store'
import Navbar from '../components/landing/Navbar'
import Button from '../components/ui/Button'
import { THEME_SWATCHES } from '../lib/theme'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { resumes, createResume, duplicateResume, deleteResume } = useResumeStore()

  const sorted = [...resumes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )

  return (
    <div className="min-h-screen bg-ink-50/40">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink-950">Your resumes</h1>
            <p className="mt-1 text-sm text-ink-500">Everything is saved in this browser.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/import')}>
              Upload resume
            </Button>
            <Button onClick={() => navigate(`/builder/${createResume()}`)}>+ New resume</Button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center">
            <p className="text-ink-500">You haven't created a resume yet.</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" onClick={() => navigate('/import')}>
                Upload existing resume
              </Button>
              <Button onClick={() => navigate('/builder')}>Build from scratch</Button>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((r) => (
              <div
                key={r.id}
                className="group overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm transition-shadow hover:shadow-lg"
              >
                <button
                  onClick={() => navigate(`/builder/${r.id}`)}
                  className="block h-40 w-full p-5 text-left"
                  style={{
                    background: `linear-gradient(135deg, ${THEME_SWATCHES[r.colorTheme]}22, ${THEME_SWATCHES[r.colorTheme]}05)`,
                  }}
                >
                  <div className="h-full w-full rounded-lg bg-white p-3 shadow-sm">
                    <div className="h-2 w-2/3 rounded bg-ink-800/70" />
                    <div className="mt-1.5 h-1.5 w-1/3 rounded" style={{ background: THEME_SWATCHES[r.colorTheme] }} />
                    <div className="mt-3 space-y-1">
                      <div className="h-1 w-full rounded bg-ink-100" />
                      <div className="h-1 w-5/6 rounded bg-ink-100" />
                      <div className="h-1 w-4/6 rounded bg-ink-100" />
                    </div>
                  </div>
                </button>
                <div className="p-4">
                  <h3 className="truncate font-medium text-ink-900">{r.name}</h3>
                  <p className="mt-0.5 text-xs capitalize text-ink-400">
                    {r.templateId} template · updated {timeAgo(r.updatedAt)}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/builder/${r.id}`)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/builder/${duplicateResume(r.id)}`)}
                    >
                      Duplicate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto !text-red-500 hover:!bg-red-50"
                      onClick={() => {
                        if (confirm(`Delete "${r.name}"? This can't be undone.`)) {
                          deleteResume(r.id)
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
