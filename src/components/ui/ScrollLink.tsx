import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// Scrolls to an element id on the landing page. Deliberately NOT a real
// `<a href="#id">` — this app uses HashRouter (so a shareable link keeps
// working when opened as a plain static file with no server), which means
// the URL hash is already owned by the router for page routing. A literal
// `href="#id"` would be read as a route change instead of an in-page
// scroll. This button-based link works from any page: it navigates home
// first if needed, then scrolls once the landing page has mounted.
export default function ScrollLink({
  targetId,
  children,
  className,
}: {
  targetId: string
  children: ReactNode
  className?: string
}) {
  const navigate = useNavigate()
  const location = useLocation()

  function handleClick() {
    const scroll = () => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
    if (location.pathname === '/') {
      scroll()
    } else {
      navigate('/')
      window.setTimeout(scroll, 80)
    }
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
