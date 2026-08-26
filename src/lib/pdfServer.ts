// The "styled" PDF export — matches the exact chosen template with real,
// selectable text, the same way professional resume builders do it: send
// the already-rendered HTML/CSS to a small backend service (see /server)
// that loads it in a headless browser and uses the browser's own print
// engine to produce the PDF. This is NOT a screenshot (unlike a canvas-based
// approach) and NOT hand-drawn text (unlike the plain-text export) — it's
// the real DOM, printed.
const RENDER_SERVER_URL = import.meta.env.VITE_PDF_SERVER_URL || 'http://localhost:8081'

export async function exportResumeToServerPdf(fileName: string) {
  const el = document.getElementById('resume-page')
  if (!el) throw new Error('Resume element not found')

  const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((l) => `<link rel="stylesheet" href="${(l as HTMLLinkElement).href}">`)
    .join('\n')
  const inlineStyles = Array.from(document.querySelectorAll('style'))
    .map((s) => s.outerHTML)
    .join('\n')

  // offsetWidth (not getBoundingClientRect, which reflects the preview
  // pane's shrink-to-fit CSS transform) — the resume's real, unscaled page
  // width, same as what the ancestor's transform:scale is shrinking FROM.
  const width = el.offsetWidth || 794
  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
${styleLinks}
${inlineStyles}
<style>html,body{margin:0;padding:0;background:#fff;}</style>
</head>
<body>${el.outerHTML}</body>
</html>`

  const res = await fetch(`${RENDER_SERVER_URL}/render-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, width }),
  })
  if (!res.ok) throw new Error(`PDF render failed (${res.status})`)

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
