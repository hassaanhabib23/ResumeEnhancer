import { Link, useNavigate } from 'react-router-dom'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import ScrollLink from '../ui/ScrollLink'

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-600 md:flex">
          <Link to="/templates" className="hover:text-ink-900">
            Templates
          </Link>
          <ScrollLink targetId="how-it-works" className="hover:text-ink-900">
            How it works
          </ScrollLink>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            My resumes
          </Button>
          <Button size="sm" onClick={() => navigate('/builder')}>
            Build my resume
          </Button>
        </div>
      </div>
    </header>
  )
}
