import type { ColorTheme, FontVariant, LayoutId, ResumeData } from '../../lib/types'
import TemplateRenderer from './TemplateRenderer'
import { PAGE_WIDTH } from './shared'

const THUMB_WIDTH = 200
const THUMB_HEIGHT = 260
const SCALE = THUMB_WIDTH / PAGE_WIDTH

export default function LayoutThumb({
  layoutId,
  colorTheme,
  fontVariant,
  baseData,
}: {
  layoutId: LayoutId
  colorTheme: ColorTheme
  fontVariant: FontVariant
  baseData: ResumeData
}) {
  const previewData: ResumeData = {
    ...baseData,
    templateId: layoutId,
    colorTheme,
    fontVariant,
  }

  return (
    <div
      style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
      className="shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-white"
    >
      <div
        style={{ width: PAGE_WIDTH, transform: `scale(${SCALE})`, transformOrigin: 'top left' }}
      >
        <TemplateRenderer data={previewData} />
      </div>
    </div>
  )
}
