import type { ResumeData } from '../../lib/types'
import ModernTemplate from './ModernTemplate'
import ClassicTemplate from './ClassicTemplate'
import MinimalTemplate from './MinimalTemplate'
import SidebarRightTemplate from './SidebarRightTemplate'
import TimelineTemplate from './TimelineTemplate'
import BannerTemplate from './BannerTemplate'
import CompactTemplate from './CompactTemplate'
import ExecutiveTemplate from './ExecutiveTemplate'
import CreativeBlocksTemplate from './CreativeBlocksTemplate'
import AcademicTemplate from './AcademicTemplate'
import AtsPlainTemplate from './AtsPlainTemplate'
import FunctionalTemplate from './FunctionalTemplate'
import ElegantTemplate from './ElegantTemplate'
import DiagonalTemplate from './DiagonalTemplate'
import DarkPremiumTemplate from './DarkPremiumTemplate'
import EditorialTemplate from './EditorialTemplate'
import HeaderBandTemplate from './HeaderBandTemplate'
import InfographicTemplate from './InfographicTemplate'
import PanelsTemplate from './PanelsTemplate'
import PortfolioGridTemplate from './PortfolioGridTemplate'
import FramedTemplate from './FramedTemplate'
import TechGridTemplate from './TechGridTemplate'

// `editable` turns the preview into a click-to-edit canvas (like Enhancv's
// builder): text fields render as contentEditable spans wired straight to
// the store instead of plain text. Defaults to false so template gallery
// thumbnails and the landing page showcase keep rendering static previews.
export default function TemplateRenderer({
  data,
  editable = false,
}: {
  data: ResumeData
  editable?: boolean
}) {
  switch (data.templateId) {
    case 'ats-plain':
      return <AtsPlainTemplate data={data} editable={editable} />
    case 'functional':
      return <FunctionalTemplate data={data} editable={editable} />
    case 'elegant':
      return <ElegantTemplate data={data} editable={editable} />
    case 'diagonal':
      return <DiagonalTemplate data={data} editable={editable} />
    case 'dark-premium':
      return <DarkPremiumTemplate data={data} editable={editable} />
    case 'editorial':
      return <EditorialTemplate data={data} editable={editable} />
    case 'header-band':
      return <HeaderBandTemplate data={data} editable={editable} />
    case 'infographic':
      return <InfographicTemplate data={data} editable={editable} />
    case 'classic':
      return <ClassicTemplate data={data} editable={editable} />
    case 'minimal':
      return <MinimalTemplate data={data} editable={editable} />
    case 'sidebar-right':
      return <SidebarRightTemplate data={data} editable={editable} />
    case 'timeline':
      return <TimelineTemplate data={data} editable={editable} />
    case 'banner':
      return <BannerTemplate data={data} editable={editable} />
    case 'compact':
      return <CompactTemplate data={data} editable={editable} />
    case 'executive':
      return <ExecutiveTemplate data={data} editable={editable} />
    case 'creative-blocks':
      return <CreativeBlocksTemplate data={data} editable={editable} />
    case 'academic':
      return <AcademicTemplate data={data} editable={editable} />
    case 'panels':
      return <PanelsTemplate data={data} editable={editable} />
    case 'portfolio-grid':
      return <PortfolioGridTemplate data={data} editable={editable} />
    case 'framed':
      return <FramedTemplate data={data} editable={editable} />
    case 'tech-grid':
      return <TechGridTemplate data={data} editable={editable} />
    case 'modern':
    default:
      return <ModernTemplate data={data} editable={editable} />
  }
}
