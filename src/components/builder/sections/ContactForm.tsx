import { useRef } from 'react'
import { useResumeStore } from '../../../lib/store'
import type { ResumeData } from '../../../lib/types'
import { Input } from '../../ui/Field'
import Button from '../../ui/Button'

export default function ContactForm({ resume }: { resume: ResumeData }) {
  const updateContact = useResumeStore((s) => s.updateContact)
  const fileRef = useRef<HTMLInputElement>(null)

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updateContact(resume.id, { photo: String(reader.result) })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Contact information</h2>
        <p className="mt-1 text-sm text-ink-500">
          This appears at the top of your resume. Only include what you're comfortable sharing.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-ink-100 text-ink-400">
          {resume.contact.photo ? (
            <img src={resume.contact.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs">Photo</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            Upload photo
          </Button>
          {resume.contact.photo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateContact(resume.id, { photo: '' })}
            >
              Remove
            </Button>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Full name"
          placeholder="Amara Whitfield"
          value={resume.contact.fullName}
          onChange={(e) => updateContact(resume.id, { fullName: e.target.value })}
        />
        <Input
          label="Job title"
          placeholder="Senior Product Designer"
          value={resume.contact.title}
          onChange={(e) => updateContact(resume.id, { title: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@email.com"
          value={resume.contact.email}
          onChange={(e) => updateContact(resume.id, { email: e.target.value })}
        />
        <Input
          label="Phone"
          placeholder="+1 (415) 555-0182"
          value={resume.contact.phone}
          onChange={(e) => updateContact(resume.id, { phone: e.target.value })}
        />
        <Input
          label="Location"
          placeholder="San Francisco, CA"
          value={resume.contact.location}
          onChange={(e) => updateContact(resume.id, { location: e.target.value })}
        />
        <Input
          label="Website / portfolio"
          placeholder="yourname.com"
          value={resume.contact.website}
          onChange={(e) => updateContact(resume.id, { website: e.target.value })}
        />
        <Input
          label="LinkedIn"
          placeholder="linkedin.com/in/yourname"
          value={resume.contact.linkedin}
          onChange={(e) => updateContact(resume.id, { linkedin: e.target.value })}
        />
        <Input
          label="GitHub"
          placeholder="github.com/yourname"
          value={resume.contact.github}
          onChange={(e) => updateContact(resume.id, { github: e.target.value })}
        />
      </div>
    </div>
  )
}
