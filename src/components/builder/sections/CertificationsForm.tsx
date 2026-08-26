import { useResumeStore } from '../../../lib/store'
import type { ResumeData } from '../../../lib/types'
import { Input } from '../../ui/Field'
import ItemCard from '../../ui/ItemCard'
import AddButton from '../../ui/AddButton'

export default function CertificationsForm({ resume }: { resume: ResumeData }) {
  const { addCertification, updateCertification, removeCertification } = useResumeStore()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Certifications</h2>
        <p className="mt-1 text-sm text-ink-500">Optional — licenses, courses, or credentials.</p>
      </div>

      <div className="space-y-4">
        {resume.certifications.map((c, idx) => (
          <ItemCard
            key={c.id}
            title={c.name || `Certification ${idx + 1}`}
            onRemove={() => removeCertification(resume.id, c.id)}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input
                label="Name"
                placeholder="Certified Usability Analyst"
                value={c.name}
                onChange={(e) => updateCertification(resume.id, c.id, { name: e.target.value })}
              />
              <Input
                label="Issuer"
                placeholder="HFI"
                value={c.issuer}
                onChange={(e) => updateCertification(resume.id, c.id, { issuer: e.target.value })}
              />
              <Input
                label="Date"
                placeholder="2021"
                value={c.date}
                onChange={(e) => updateCertification(resume.id, c.id, { date: e.target.value })}
              />
            </div>
          </ItemCard>
        ))}
      </div>

      <AddButton label="Add certification" onClick={() => addCertification(resume.id)} />
    </div>
  )
}
