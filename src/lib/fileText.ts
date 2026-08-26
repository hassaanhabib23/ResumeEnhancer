// Extracts raw text from an uploaded resume file (PDF, DOCX, or plain
// text/markdown) entirely client-side — nothing is uploaded anywhere.

export type SupportedKind = 'pdf' | 'docx' | 'text'

export function detectKind(file: File): SupportedKind | null {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return 'pdf'
  if (
    name.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'docx'
  }
  if (name.endsWith('.txt') || name.endsWith('.md') || file.type.startsWith('text/')) {
    return 'text'
  }
  return null
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const buffer = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: buffer }).promise

  const pages: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    // Group text items into lines using their y-position so multi-column
    // PDFs don't get scrambled into one run-on line.
    let lastY: number | null = null
    let line: string[] = []
    const lines: string[] = []
    for (const item of content.items) {
      if (!('str' in item)) continue
      const y = item.transform[5]
      if (lastY !== null && Math.abs(y - lastY) > 3) {
        lines.push(line.join(' '))
        line = []
      }
      line.push(item.str)
      lastY = y
    }
    if (line.length) lines.push(line.join(' '))
    pages.push(lines.join('\n'))
  }
  return pages.join('\n\n')
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value
}

async function extractPlainText(file: File): Promise<string> {
  return file.text()
}

export async function extractResumeText(file: File): Promise<{ kind: SupportedKind; text: string }> {
  const kind = detectKind(file)
  if (!kind) {
    throw new Error('Unsupported file type. Please upload a PDF, DOCX, or plain text file.')
  }
  const text =
    kind === 'pdf'
      ? await extractPdfText(file)
      : kind === 'docx'
        ? await extractDocxText(file)
        : await extractPlainText(file)

  if (!text || !text.trim()) {
    throw new Error("We couldn't find any readable text in that file.")
  }
  return { kind, text }
}
