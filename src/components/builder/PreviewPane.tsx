import { useEffect, useRef, useState } from 'react'
import type { ResumeData } from '../../lib/types'
import TemplateRenderer from '../templates/TemplateRenderer'
import { PAGE_WIDTH } from '../templates/shared'

export default function PreviewPane({ data }: { data: ResumeData }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [pageHeight, setPageHeight] = useState(1123)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth - 32
      setScale(Math.min(1, w / PAGE_WIDTH))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const measure = () => {
      if (innerRef.current) {
        setPageHeight(innerRef.current.getBoundingClientRect().height / (scale || 1))
      }
    }
    measure()
    const t = setTimeout(measure, 50)
    return () => clearTimeout(t)
  }, [data, scale])

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full justify-center overflow-auto bg-ink-100/60 p-6"
    >
      <div
        style={{ width: PAGE_WIDTH * scale, height: pageHeight * scale }}
        className="shrink-0"
      >
        <div
          ref={innerRef}
          style={{
            width: PAGE_WIDTH,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          className="rounded-sm shadow-2xl shadow-ink-900/20"
        >
          <TemplateRenderer data={data} editable />
        </div>
      </div>
    </div>
  )
}
