import { useResumeStore } from '../../../lib/store'
import type { ResumeData } from '../../../lib/types'
import { TextArea } from '../../ui/Field'

export default function SummaryForm({ resume }: { resume: ResumeData }) {
  const updateSummary = useResumeStore((s) => s.updateSummary)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Professional summary</h2>
        <p className="mt-1 text-sm text-ink-500">
          2–4 sentences that highlight your experience level, specialty, and a standout
          achievement. Lead with strengths relevant to the role you want.
        </p>
      </div>
      <TextArea
        rows={6}
        placeholder="Product designer with 7+ years crafting end-to-end experiences for B2B SaaS platforms..."
        value={resume.summary}
        onChange={(e) => updateSummary(resume.id, e.target.value)}
      />
      <p className="text-xs text-ink-400">{resume.summary.length} characters</p>
    </div>
  )
}
