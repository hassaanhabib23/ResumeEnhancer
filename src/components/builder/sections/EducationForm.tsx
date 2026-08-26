import { useResumeStore } from '../../../lib/store'
import type { ResumeData } from '../../../lib/types'
import { Input } from '../../ui/Field'
import ItemCard from '../../ui/ItemCard'
import AddButton from '../../ui/AddButton'

export default function EducationForm({ resume }: { resume: ResumeData }) {
  const { addEducation, updateEducation, removeEducation } = useResumeStore()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Education</h2>
        <p className="mt-1 text-sm text-ink-500">
          Most recent degree first. Include GPA only if it strengthens your application.
        </p>
      </div>

      <div className="space-y-4">
        {resume.education.map((edu, idx) => (
          <ItemCard
            key={edu.id}
            title={edu.school || `Education ${idx + 1}`}
            onRemove={() => removeEducation(resume.id, edu.id)}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="School"
                placeholder="University of Texas at Austin"
                value={edu.school}
                onChange={(e) => updateEducation(resume.id, edu.id, { school: e.target.value })}
              />
              <Input
                label="Degree"
                placeholder="B.F.A."
                value={edu.degree}
                onChange={(e) => updateEducation(resume.id, edu.id, { degree: e.target.value })}
              />
              <Input
                label="Field of study"
                placeholder="Design"
                value={edu.field}
                onChange={(e) => updateEducation(resume.id, edu.id, { field: e.target.value })}
              />
              <Input
                label="Location"
                placeholder="Austin, TX"
                value={edu.location}
                onChange={(e) => updateEducation(resume.id, edu.id, { location: e.target.value })}
              />
              <Input
                label="Start date"
                type="month"
                value={edu.startDate}
                onChange={(e) => updateEducation(resume.id, edu.id, { startDate: e.target.value })}
              />
              <Input
                label="End date"
                type="month"
                value={edu.endDate}
                onChange={(e) => updateEducation(resume.id, edu.id, { endDate: e.target.value })}
              />
              <Input
                label="GPA (optional)"
                placeholder="3.8"
                value={edu.gpa}
                onChange={(e) => updateEducation(resume.id, edu.id, { gpa: e.target.value })}
              />
            </div>
          </ItemCard>
        ))}
      </div>

      <AddButton label="Add education" onClick={() => addEducation(resume.id)} />
    </div>
  )
}
