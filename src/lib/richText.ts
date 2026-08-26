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
