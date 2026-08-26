// Minimal rich-text support: a handful of fields (summary, experience
// bullets, project descriptions) store a small sanitized HTML fragment
// (e.g. "Led a <b>team</b> of 5") instead of plain text, so the user can
// bold/italicize/underline part of what they write. Every tag other than
// the ones below — and every attribute — gets stripped, so pasted content
// (or an imported resume) can't inject arbitrary markup.
const ALLOWED_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR'])
const BLOCK_TAGS = new Set(['DIV', 'P'])

function sanitizeNode(node: Node) {
  const children = Array.from(node.childNodes)
  for (const child of children) {
    if (child.nodeType !== Node.ELEMENT_NODE) continue
    const el = child as HTMLElement
    sanitizeNode(el)
    if (ALLOWED_TAGS.has(el.tagName)) {
      for (const attr of Array.from(el.attributes)) el.removeAttribute(attr.name)
    } else {
      // A browser turns a plain Enter press inside contentEditable into a
      // new <div>/<p> — turn that into a line break instead of just losing
      // it when the wrapping element gets unwrapped below.
      if (BLOCK_TAGS.has(el.tagName) && el.previousSibling) {
        node.insertBefore(document.createElement('br'), el)
      }
      while (el.firstChild) node.insertBefore(el.firstChild, el)
      node.removeChild(el)
    }
  }
}

export function sanitizeRichText(html: string): string {
  const template = document.createElement('template')
  template.innerHTML = html
  sanitizeNode(template.content)
  return template.innerHTML
}

// Strips all formatting down to plain text — for anywhere a rich-text field
// gets treated as ordinary text (word/keyword counts, weak-phrase checks,
// exporting to a plain-text format).
export function plainTextOf(html: string): string {
  const template = document.createElement('template')
  template.innerHTML = html
  return (template.content.textContent || '').trim()
}

export interface RichRun {
  text: string
  bold: boolean
  italic: boolean
  underline: boolean
}

// Walks a sanitized rich-text fragment into a flat list of styled runs —
// the generic representation both the DOCX and real-text-PDF exporters
// build on, so this HTML-walking logic (and its handling of <br> as a line
// break, encoded as a run whose text is exactly "\n") lives in one place.
export function parseRichRuns(html: string): RichRun[] {
  const template = document.createElement('template')
  template.innerHTML = html
  const runs: RichRun[] = []

  function walk(node: Node, bold: boolean, italic: boolean, underline: boolean) {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        if (child.textContent) runs.push({ text: child.textContent, bold, italic, underline })
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        if (el.tagName === 'BR') {
          runs.push({ text: '\n', bold, italic, underline })
          continue
        }
        walk(
          el,
          bold || el.tagName === 'B' || el.tagName === 'STRONG',
          italic || el.tagName === 'I' || el.tagName === 'EM',
          underline || el.tagName === 'U',
        )
      }
    }
  }

  walk(template.content, false, false, false)
  return runs
}
