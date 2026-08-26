import { useResumeStore } from '../../../lib/store'
import type { ResumeData } from '../../../lib/types'
import { Input } from '../../ui/Field'
import RichTextField from '../../ui/RichTextField'
import ItemCard from '../../ui/ItemCard'
import AddButton from '../../ui/AddButton'

export default function ProjectsForm({ resume }: { resume: ResumeData }) {
  const { addProject, updateProject, removeProject } = useResumeStore()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Projects</h2>
        <p className="mt-1 text-sm text-ink-500">
          Optional — useful for showcasing side projects, open source, or portfolio pieces.
        </p>
      </div>

      <div className="space-y-4">
        {resume.projects.map((p, idx) => (
          <ItemCard
            key={p.id}
            title={p.name || `Project ${idx + 1}`}
            onRemove={() => removeProject(resume.id, p.id)}
          >
            <Input
              label="Project name"
              placeholder="Insight — internal analytics toolkit"
              value={p.name}
              onChange={(e) => updateProject(resume.id, p.id, { name: e.target.value })}
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink-800">Description</span>
              <RichTextField
                rows={2}
                placeholder="What did you build, and what was the impact?"
                value={p.description}
                onChange={(html) => updateProject(resume.id, p.id, { description: html })}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Link (optional)"
                placeholder="github.com/you/project"
                value={p.link}
                onChange={(e) => updateProject(resume.id, p.id, { link: e.target.value })}
              />
              <Input
                label="Tech used (optional)"
                placeholder="React, Node.js"
                value={p.tech}
                onChange={(e) => updateProject(resume.id, p.id, { tech: e.target.value })}
              />
            </div>
          </ItemCard>
        ))}
      </div>

      <AddButton label="Add project" onClick={() => addProject(resume.id)} />
    </div>
  )
}
