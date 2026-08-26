import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportResumeToPdf(elementId: string, fileName: string) {
  const el = document.getElementById(elementId)
  if (!el) throw new Error('Resume element not found')

  // If the user was mid-edit on a click-to-edit field inside the preview,
  // blur it first so html2canvas doesn't capture a focus outline/caret.
  const active = document.activeElement
  if (active instanceof HTMLElement && el.contains(active)) {
    active.blur()
    await new Promise((r) => setTimeout(r, 0))
  }

  const scale = 2
  const canvas = await html2canvas(el, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff',
  })

  // The canvas is rendered at 2x resolution for crispness, so first undo
  // that to get the element's real CSS-pixel size, then convert to PDF
  // points ourselves (72pt = 96px = 1in) and construct jsPDF with an
  // explicit 'pt' page size — jsPDF's own 'px' unit does not reliably mean
  // "1 unit = 1 CSS pixel" across versions, which is what caused the page
  // to come out oversized ("zoomed in") even after accounting for scale.
  const pxToPt = 72 / 96
  const pageWidth = (canvas.width / scale) * pxToPt
  const pageHeight = (canvas.height / scale) * pxToPt

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [pageWidth, pageHeight],
  })
  pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight)
  pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`)
}
