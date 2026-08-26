# Resumly — CV/resume builder

A guided resume builder: pick a template, fill in guided sections, and export
a polished, ATS-friendly PDF.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router (landing / builder / dashboard / templates / import)
- Zustand (+ `persist` middleware) for resume state, saved to `localStorage`
- `html2canvas` + `jsPDF` for client-side PDF export
- `pdfjs-dist` + `mammoth` for client-side resume file parsing (PDF/DOCX text extraction)

## Features

- Marketing landing page (hero, features, template showcase, how-it-works,
  stats, footer)
- Guided multi-step resume builder: contact, summary, experience, education,
  skills, projects, certifications, languages
- Live preview that updates as you type
- **Drag-and-drop section reordering**: a "Reorder" button in the builder
  opens a panel listing the resume's 7 content sections (Summary, Experience,
  Education, Skills, Projects, Certifications, Languages) — drag one (or use
  the up/down arrows) to change where it appears, and the live preview and
  exported PDF update immediately. On templates with a colored sidebar
  column (Modern, Elegant, Diagonal, etc.), this reorders sections within
  their own column — a sidebar section never jumps into the main column —
  so the layout's structure stays intact while the content order becomes
  yours to choose. A "Reset to this template's default order" link clears
  the customization and falls back to that template's original hand-tuned
  order.
- **Click-to-edit directly on the preview** (like Enhancv's builder): every
  text field on the rendered resume — name, title, contact details, summary,
  bullet points, skill names, education, projects, certifications, languages —
  is directly editable in place. Click any text on the preview canvas, type,
  and click away to save; the left-hand step form stays available as an
  alternative way to edit the same data. Built with an uncontrolled
  `contentEditable` component that only re-syncs from state while a field is
  unfocused, so typing never jumps the cursor.
- **22 templates, each a genuinely distinct layout** — not color variants of
  each other. A "template" in this app is a real structural design: its own
  component with its own column arrangement, section placement, and visual
  treatment (Modern, Classic, Minimal, Sidebar Right, Timeline, Banner,
  Compact, Executive, Creative Blocks, Academic, ATS Plain, Skills-First,
  Elegant, Diagonal, Dark Premium, Editorial, Header Band, Infographic,
  Panels, Portfolio Grid, Framed, Tech Grid). Color palette (18 themes:
  Violet, Ink, Gold, Forest, Crimson, Navy, Teal, Slate, Rose, Amber, Steel,
  Olive, Plum, Charcoal, Rust, Emerald, Indigo, Mustard) and
  font pairing (sans/serif) are a separate customization applied on top of
  whichever template you pick, in the builder's "Design" panel or on the
  `/templates` gallery's preview controls — changing them never turns one
  template into a different one, and the gallery counts and browses by
  layout for exactly that reason. The Design panel also lets you swap how
  skill proficiency is drawn wherever a template shows one — a bar (the
  original look), dots, small blocks, or a plain level label (Beginner
  through Expert) — independently of layout and color. The 22 layouts span
  photo/colored-sidebar,
  plain black-and-white ATS/traditional, timeline, double-column, banner
  header, creative color blocks, skills-first (functional/career-change),
  whitespace-heavy "elegant" with a soft photo frame, dense compact, formal
  academic/CV, centered classic, a diagonal color-cut header, a dark
  editorial canvas, a magazine-style pull-quote layout, an overlapping-photo
  header band, an icon/progress-ring driven infographic style, a full-width
  alternating-panel stack with no columns at all, a bordered card-grid
  layout for experience/projects, a formal double-rule framed layout with a
  monogram badge, and a monospace tag-pill "spec sheet" style for technical
  roles — rather than literally reproducing any single competitor's
  copyrighted designs, icons, or branding.
- **Skill categories** (handy for IT/developer resumes): each skill in the
  Skills step can optionally be tagged with a category — "Languages",
  "Frameworks & Libraries", "Databases", "Cloud & DevOps", etc. (a few
  common ones are suggested, or type your own). Leave it blank and nothing
  changes. Set it, and on Modern, ATS Plain, Tech Grid, and Skills-First
  the skills render grouped under category headings instead of one flat
  list — the other layouts still show skills as a flat list either way.
- **GitHub** is a first-class contact field alongside email, phone,
  website, and LinkedIn — editable in the Contact step and shown (when
  filled in) on every one of the 22 templates. Uploading an existing
  resume also picks up a `github.com/...` link automatically.
- **Resume Score panel**: a "Score" button in the builder opens a checklist
  that scores the resume 0-100 against the same things ATS software and
  recruiters actually look for — contact completeness, summary length,
  bullet-point coverage per role, how many bullets are quantified with a
  number/%, weak-phrase detection ("responsible for", "worked on"...),
  skills count, and more — each with a plain-language fix. A second tab
  lets you paste a job description; it extracts the most frequent
  meaningful keywords/phrases and shows which already appear in your
  resume vs. which are worth adding. A third tab is a categorized action-verb
  reference to swap out weak bullet openers. All of this runs as local
  heuristics/word-frequency analysis in the browser — no AI call, no data
  leaves the browser — and is disclosed as best-effort, not a guarantee of
  how any specific ATS will score the resume.
- **Upload an existing resume** (`/import`): drag-and-drop a PDF, DOCX, or
  text/markdown file, and the app extracts the text client-side (no server
  upload) and runs a best-effort heuristic parser to pre-fill contact info,
  summary, experience, education, skills, projects, certifications, awards,
  and languages — each into its own matching section — then drops you into
  the builder with a review banner so you can double-check and correct
  anything it got wrong. The parser recognizes many section-header phrasings
  (e.g. "Professional Experience", "Key Skills", "Awards & Honors"), splits
  role/company and degree/school even when a resume puts them on separate
  lines or in a different order, and separates categorized skill lists
  ("Languages: Python, Go") and project tech stacks from prose. This is
  regex/heuristic parsing, not an AI service.
- One-click PDF export of the exact preview
- Dashboard: create / duplicate / delete / rename multiple resumes, or
  upload an existing resume to start from
- No accounts needed — everything is saved in your browser

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

## Architecture notes

- **No backend yet.** Resumes live entirely in the browser's `localStorage`.
  Clearing site data wipes everything — a real deployment would add server-side
  storage/sync so resumes survive a cleared browser or a new device.
- **PDF export** renders the on-screen template to a canvas (`html2canvas`)
  and drops it into a PDF (`jsPDF`) — works well today, but a future version
  would likely render PDFs server-side for pixel-perfect, selectable-text
  output.
- Tailwind v4's opacity-modifier utilities (e.g. `text-white/70`) compile to
  `color-mix(in oklab, …)`, which `html2canvas` can't parse. The resume
  templates avoid that pattern (using plain `rgba()`/hex inline styles
  instead) so PDF export stays reliable — keep that in mind if you add more
  template styling.
- **Resume import is best-effort, not AI.** The uploaded file's text is
  extracted entirely in the browser and matched against regex/heuristic
  rules (section headers, date patterns, email/phone/URL formats) to guess
  at structure. It works well on cleanly-formatted resumes and can miss or
  misplace content on unusual layouts — that's why the builder shows a
  review banner and warning list after import instead of trusting it
  silently.
- **Resume Score and job-keyword matching are heuristic, not AI.** The score
  is a fixed rubric (see `src/lib/resumeScore.ts`) and the keyword matcher
  is word/bigram frequency analysis (see `src/lib/keywordMatch.ts`) —
  useful signal, not a simulation of any real ATS vendor's actual parser or
  ranking algorithm, which none of the resume-builder competitors publish
  either.
