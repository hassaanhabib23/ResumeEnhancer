const STEPS = [
  {
    n: '01',
    title: 'Pick a template',
    body: 'Start from a blank slate or load our sample resume to see how a finished one looks.',
  },
  {
    n: '02',
    title: 'Fill guided sections',
    body: 'Add your experience, education, and skills with prompts that tell you what to include.',
  },
  {
    n: '03',
    title: 'Download your PDF',
    body: 'Export a polished, print-ready resume in seconds — reuse it or tailor a new version anytime.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
          From blank page to finished resume in three steps
        </h2>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="relative rounded-2xl border border-ink-100 bg-white p-7">
            <span className="text-4xl font-bold text-brand-300">{s.n}</span>
            <h3 className="mt-3 text-lg font-semibold text-ink-900">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
