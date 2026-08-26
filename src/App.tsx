import { HashRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BuilderPage from './pages/BuilderPage'
import DashboardPage from './pages/DashboardPage'
import TemplatesPage from './pages/TemplatesPage'
import ImportResumePage from './pages/ImportResumePage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/builder/:resumeId" element={<BuilderPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/import" element={<ImportResumePage />} />
      </Routes>
    </HashRouter>
  )
}
