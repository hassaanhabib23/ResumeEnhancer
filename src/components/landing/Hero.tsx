import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 h-96 opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(60% 60% at 30% 40%, rgba(102,54,204,0.25), transparent), radial-gradient(50% 50% at 80% 20%, rgba(217,164,65,0.25), transparent)',
        }}
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
            ✦ Built for job seekers, not recruiters
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-ink-950 sm:text-5xl lg:text-[3.4rem]">
            Build a resume that gets you the interview.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-600">
            Pick a recruiter-friendly template, fill in guided sections, and watch your resume
            update live. Export a polished PDF in minutes — no design skills required.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={() => navigate('/builder')}>
              Create my resume — it's free
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/builder?demo=1')}>
              See a live example
            </Button>
          </div>
          <button
            onClick={() => navigate('/import')}
            className="mt-4 text-sm font-medium text-ink-500 underline decoration-ink-300 underline-offset-4 hover:text-brand-700"
          >
            Already have a resume? Upload it and pick a new template →
          </button>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand-200/60 to-gold-400/30 blur-2xl" />
          <div className="relative rotate-1 rounded-2xl border border-ink-100 bg-white p-6 shadow-2xl shadow-ink-900/10">
            <div className="mb-4 flex items-center justify-between border-b border-ink-100 pb-4">
              <div>
                <div className="h-3 w-32 rounded bg-ink-800" />
                <div className="mt-2 h-2 w-20 rounded bg-brand-400" />
              </div>
              <div className="h-12 w-12 rounded-full bg-ink-100" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full rounded bg-ink-100" />
              <div className="h-2 w-5/6 rounded bg-ink-100" />
              <div className="h-2 w-4/6 rounded bg-ink-100" />
            </div>
            <div className="mt-5 h-2.5 w-24 rounded bg-brand-500" />
            <div className="mt-3 space-y-2">
              <div className="h-2 w-full rounded bg-ink-100" />
              <div className="h-2 w-3/4 rounded bg-ink-100" />
            </div>
            <div className="mt-5 h-2.5 w-24 rounded bg-brand-500" />
            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 w-16 rounded-full bg-brand-50 border border-brand-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
