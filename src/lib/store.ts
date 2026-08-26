import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ResumeData,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  LanguageItem,
  TemplateId,
  ColorTheme,
  FontVariant,
  ReorderableSection,
  SkillStyle,
} from './types'
import { blankResume, makeId, sampleResume } from './sampleData'

interface ResumeStore {
  resumes: ResumeData[]
  activeId: string | null

  createResume: (name?: string) => string
  createSampleResume: () => string
  duplicateResume: (id: string) => string
  deleteResume: (id: string) => void
  setActive: (id: string) => void
  renameResume: (id: string, name: string) => void

  updateContact: (id: string, patch: Partial<ResumeData['contact']>) => void
  updateSummary: (id: string, summary: string) => void
  setTemplate: (id: string, templateId: TemplateId) => void
  setColorTheme: (id: string, colorTheme: ColorTheme) => void
  setFontVariant: (id: string, fontVariant: FontVariant) => void
  setSkillStyle: (id: string, skillStyle: SkillStyle) => void
  applyTemplateCombo: (
    id: string,
    combo: { templateId: TemplateId; colorTheme: ColorTheme; fontVariant: FontVariant },
  ) => void
  importResume: (patch: Partial<ResumeData>, name?: string) => string
  reorderSections: (id: string, order: ReorderableSection[] | undefined) => void
  toggleSectionVisibility: (id: string, section: ReorderableSection) => void

  addExperience: (id: string) => void
  updateExperience: (id: string, expId: string, patch: Partial<ExperienceItem>) => void
  removeExperience: (id: string, expId: string) => void
  reorderExperience: (id: string, from: number, to: number) => void

  addEducation: (id: string) => void
  updateEducation: (id: string, eduId: string, patch: Partial<EducationItem>) => void
  removeEducation: (id: string, eduId: string) => void

  addSkill: (id: string) => void
  updateSkill: (id: string, skillId: string, patch: Partial<SkillItem>) => void
  removeSkill: (id: string, skillId: string) => void

  addProject: (id: string) => void
  updateProject: (id: string, projId: string, patch: Partial<ProjectItem>) => void
  removeProject: (id: string, projId: string) => void

  addCertification: (id: string) => void
  updateCertification: (id: string, certId: string, patch: Partial<CertificationItem>) => void
  removeCertification: (id: string, certId: string) => void

  addLanguage: (id: string) => void
  updateLanguage: (id: string, langId: string, patch: Partial<LanguageItem>) => void
  removeLanguage: (id: string, langId: string) => void
}

function touch(r: ResumeData): ResumeData {
  return { ...r, updatedAt: new Date().toISOString() }
}

function mapResume(
  state: { resumes: ResumeData[] },
  id: string,
  fn: (r: ResumeData) => ResumeData,
) {
  return {
    resumes: state.resumes.map((r) => (r.id === id ? touch(fn(r)) : r)),
  }
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      resumes: [],
      activeId: null,

      createResume: (name) => {
        const r = blankResume(name)
        set((s) => ({ resumes: [...s.resumes, r], activeId: r.id }))
        return r.id
      },
      createSampleResume: () => {
        const r = sampleResume()
        set((s) => ({ resumes: [...s.resumes, r], activeId: r.id }))
        return r.id
      },
      duplicateResume: (id) => {
        const src = get().resumes.find((r) => r.id === id)
        if (!src) return id
        const copy: ResumeData = {
          ...src,
          id: makeId(),
          name: src.name + ' (copy)',
          updatedAt: new Date().toISOString(),
        }
        set((s) => ({ resumes: [...s.resumes, copy] }))
        return copy.id
      },
      deleteResume: (id) => {
        set((s) => ({
          resumes: s.resumes.filter((r) => r.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        }))
      },
      setActive: (id) => set({ activeId: id }),
      renameResume: (id, name) =>
        set((s) => mapResume(s, id, (r) => ({ ...r, name }))),
      importResume: (patch, name) => {
        const base = blankResume(name ?? patch.name ?? 'Imported Resume')
        const merged: ResumeData = {
          ...base,
          ...patch,
          id: base.id,
          updatedAt: new Date().toISOString(),
          contact: { ...base.contact, ...(patch.contact ?? {}) },
        }
        set((s) => ({ resumes: [...s.resumes, merged] }))
        return merged.id
      },

      updateContact: (id, patch) =>
        set((s) => mapResume(s, id, (r) => ({ ...r, contact: { ...r.contact, ...patch } }))),
      updateSummary: (id, summary) =>
        set((s) => mapResume(s, id, (r) => ({ ...r, summary }))),
      setTemplate: (id, templateId) =>
        set((s) => mapResume(s, id, (r) => ({ ...r, templateId }))),
      setColorTheme: (id, colorTheme) =>
        set((s) => mapResume(s, id, (r) => ({ ...r, colorTheme }))),
      setFontVariant: (id, fontVariant) =>
        set((s) => mapResume(s, id, (r) => ({ ...r, fontVariant }))),
      setSkillStyle: (id, skillStyle) =>
        set((s) => mapResume(s, id, (r) => ({ ...r, skillStyle }))),
      applyTemplateCombo: (id, combo) =>
        set((s) => mapResume(s, id, (r) => ({ ...r, ...combo }))),
      reorderSections: (id, order) =>
        set((s) => mapResume(s, id, (r) => ({ ...r, sectionOrder: order }))),
      toggleSectionVisibility: (id, section) =>
        set((s) =>
          mapResume(s, id, (r) => {
            const hidden = r.hiddenSections ?? []
            const next = hidden.includes(section)
              ? hidden.filter((s2) => s2 !== section)
              : [...hidden, section]
            return { ...r, hiddenSections: next }
          }),
        ),

      addExperience: (id) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            experience: [
              ...r.experience,
              {
                id: makeId(),
                company: '',
                role: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                bullets: [''],
              },
            ],
          })),
        ),
      updateExperience: (id, expId, patch) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            experience: r.experience.map((e) => (e.id === expId ? { ...e, ...patch } : e)),
          })),
        ),
      removeExperience: (id, expId) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            experience: r.experience.filter((e) => e.id !== expId),
          })),
        ),
      reorderExperience: (id, from, to) =>
        set((s) =>
          mapResume(s, id, (r) => {
            const arr = [...r.experience]
            const [item] = arr.splice(from, 1)
            arr.splice(to, 0, item)
            return { ...r, experience: arr }
          }),
        ),

      addEducation: (id) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            education: [
              ...r.education,
              {
                id: makeId(),
                school: '',
                degree: '',
                field: '',
                location: '',
                startDate: '',
                endDate: '',
                gpa: '',
              },
            ],
          })),
        ),
      updateEducation: (id, eduId, patch) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            education: r.education.map((e) => (e.id === eduId ? { ...e, ...patch } : e)),
          })),
        ),
      removeEducation: (id, eduId) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            education: r.education.filter((e) => e.id !== eduId),
          })),
        ),

      addSkill: (id) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            skills: [...r.skills, { id: makeId(), name: '', level: 3 }],
          })),
        ),
      updateSkill: (id, skillId, patch) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            skills: r.skills.map((sk) => (sk.id === skillId ? { ...sk, ...patch } : sk)),
          })),
        ),
      removeSkill: (id, skillId) =>
        set((s) =>
          mapResume(s, id, (r) => ({ ...r, skills: r.skills.filter((sk) => sk.id !== skillId) })),
        ),

      addProject: (id) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            projects: [
              ...r.projects,
              { id: makeId(), name: '', description: '', link: '', tech: '' },
            ],
          })),
        ),
      updateProject: (id, projId, patch) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            projects: r.projects.map((p) => (p.id === projId ? { ...p, ...patch } : p)),
          })),
        ),
      removeProject: (id, projId) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            projects: r.projects.filter((p) => p.id !== projId),
          })),
        ),

      addCertification: (id) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            certifications: [
              ...r.certifications,
              { id: makeId(), name: '', issuer: '', date: '' },
            ],
          })),
        ),
      updateCertification: (id, certId, patch) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            certifications: r.certifications.map((c) =>
              c.id === certId ? { ...c, ...patch } : c,
            ),
          })),
        ),
      removeCertification: (id, certId) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            certifications: r.certifications.filter((c) => c.id !== certId),
          })),
        ),

      addLanguage: (id) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            languages: [...r.languages, { id: makeId(), name: '', level: 'Conversational' }],
          })),
        ),
      updateLanguage: (id, langId, patch) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            languages: r.languages.map((l) => (l.id === langId ? { ...l, ...patch } : l)),
          })),
        ),
      removeLanguage: (id, langId) =>
        set((s) =>
          mapResume(s, id, (r) => ({
            ...r,
            languages: r.languages.filter((l) => l.id !== langId),
          })),
        ),
    }),
    { name: 'cvbuilder-resumes' },
  ),
)
