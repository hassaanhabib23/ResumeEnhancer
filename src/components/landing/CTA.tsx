import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

export default function CTA() {
  const navigate = useNavigate()
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-8 py-16 text-center sm:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(40% 60% at 20% 20%, rgba(255,255,255,0.4), transparent), radial-gradient(30% 50% at 90% 80%, rgba(217,164,65,0.5), transparent)',
          }}
        />
        <h2 className="relative text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Your next job starts with your next resume.
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-brand-100">
          It's free to start, and you'll have a finished draft before your coffee gets cold.
        </p>
        <div className="relative mt-8">
          <Button
            size="lg"
            variant="secondary"
            className="!bg-white !text-brand-700 hover:!bg-brand-50"
            onClick={() => navigate('/builder')}
          >
            Build my resume now
          </Button>
        </div>
      </div>
    </section>
  )
}
