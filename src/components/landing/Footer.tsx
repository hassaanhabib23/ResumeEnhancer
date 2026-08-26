import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'
import ScrollLink from '../ui/ScrollLink'

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-ink-500">
              A guided resume builder that helps you write, format, and export a resume that gets
              read.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <h4 className="font-semibold text-ink-900">Product</h4>
              <ul className="mt-3 space-y-2 text-ink-500">
                <li>
                  <Link to="/templates" className="hover:text-ink-800">
                    Templates
                  </Link>
                </li>
                <li>
                  <ScrollLink targetId="how-it-works" className="hover:text-ink-800">
                    How it works
                  </ScrollLink>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-ink-900">Privacy</h4>
              <ul className="mt-3 space-y-2 text-ink-500">
                <li>Runs entirely in your browser</li>
                <li>Nothing is uploaded to a server</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-ink-100 pt-6 text-xs text-ink-400">
          © {new Date().getFullYear()} Resumly. All data stays in your browser.
        </div>
      </div>
    </footer>
  )
}
