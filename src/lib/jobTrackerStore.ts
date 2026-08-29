import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ApplicationStatus, JobApplication } from './types'
import { makeId } from './sampleData'

interface JobTrackerStore {
  applications: JobApplication[]
  addApplication: (patch?: Partial<JobApplication>) => string
  updateApplication: (id: string, patch: Partial<JobApplication>) => void
  removeApplication: (id: string) => void
  setStatus: (id: string, status: ApplicationStatus) => void
}

function blankApplication(): JobApplication {
  return {
    id: makeId(),
    company: '',
    role: '',
    status: 'saved',
    link: '',
    appliedDate: '',
    notes: '',
    resumeId: undefined,
    updatedAt: new Date().toISOString(),
  }
}

export const useJobTrackerStore = create<JobTrackerStore>()(
  persist(
    (set) => ({
      applications: [],
      addApplication: (patch) => {
        // id/updatedAt are always freshly assigned here, never taken from
        // `patch` — the form component reuses a placeholder JobApplication
        // (with an empty id/updatedAt) as its initial state for "add" mode,
        // and spreads that whole object back on save.
        const app: JobApplication = {
          ...blankApplication(),
          ...patch,
          id: makeId(),
          updatedAt: new Date().toISOString(),
        }
        set((s) => ({ applications: [...s.applications, app] }))
        return app.id
      },
      updateApplication: (id, patch) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a,
          ),
        })),
      removeApplication: (id) =>
        set((s) => ({ applications: s.applications.filter((a) => a.id !== id) })),
      setStatus: (id, status) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a,
          ),
        })),
    }),
    { name: 'cvbuilder-tracker' },
  ),
)
