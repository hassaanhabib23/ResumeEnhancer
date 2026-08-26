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

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  })
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
  pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`)
}
