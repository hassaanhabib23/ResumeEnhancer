const FEATURES = [
  {
    title: 'Live preview as you type',
    body: 'Every field updates your resume instantly, so you always know exactly what you\'re sending.',
    icon: '⚡',
  },
  {
    title: 'Recruiter-tested templates',
    body: 'Clean, ATS-friendly layouts that keep the focus on your experience, not decoration.',
    icon: '📄',
  },
  {
    title: 'Section-by-section guidance',
    body: 'Helpful hints for summaries, bullet points, and skills so you never stare at a blank page.',
    icon: '🧭',
  },
  {
    title: 'One-click PDF export',
    body: 'Download a print-ready PDF that looks exactly like your live preview, every time.',
    icon: '⬇️',
  },
  {
    title: 'Unlimited versions',
    body: 'Tailor a copy of your resume for every application without starting from scratch.',
    icon: '🗂️',
  },
  {
    title: 'Color themes that stay professional',
    body: 'Pick an accent color that fits your industry — from bold creative to classic corporate.',
    icon: '🎨',
  },
]

export default function Features() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
          Everything you need, nothing you don't
        </h2>
        <p className="mt-4 text-lg text-ink-600">
          Resumly strips away the busywork of resume formatting so you can focus on telling your
          story well.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-ink-100 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-ink-900/5"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl">
              {f.icon}
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink-900">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
