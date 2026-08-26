// Renders a resume to a real, selectable-text PDF that matches the exact
// chosen template — the same trick professional resume builders use:
// load the already-rendered HTML/CSS in a headless browser and let the
// browser's own print engine produce the PDF (real text + real CSS layout,
// not a screenshot, and not hand-drawn text like the plain-text export).
import express from 'express'
import cors from 'cors'
import puppeteer from 'puppeteer'

const app = express()
app.use(cors())
app.use(express.json({ limit: '15mb' }))

let browserPromise = null
function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  }
  return browserPromise
}

app.get('/health', (_req, res) => res.json({ ok: true }))

app.post('/render-pdf', async (req, res) => {
  const { html, width = 794 } = req.body || {}
  if (!html || typeof html !== 'string') {
    res.status(400).json({ error: 'Missing "html" string in request body.' })
    return
  }

  let page
  try {
    const browser = await getBrowser()
    page = await browser.newPage()
    await page.setViewport({ width: Math.round(width), height: 1123 })
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 20000 })
    const pdf = await page.pdf({ format: 'A4', printBackground: true })
    res.setHeader('Content-Type', 'application/pdf')
    res.send(Buffer.from(pdf))
  } catch (err) {
    console.error('PDF render failed:', err)
    res.status(500).json({ error: 'Failed to render PDF.' })
  } finally {
    if (page) await page.close().catch(() => {})
  }
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`PDF render server listening on :${port}`))
