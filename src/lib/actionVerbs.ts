// Small reference library used by the Resume Score panel: phrases that read
// as weak/passive on a resume, and a categorized list of stronger action
// verbs to swap them for. This is a static curated list, not an AI
// suggestion — it's meant as a quick reference, not an auto-rewrite.

export const WEAK_PHRASES = [
  'responsible for',
  'worked on',
  'helped with',
  'duties included',
  'in charge of',
  'involved in',
  'assisted with',
  'tasked with',
  'was responsible',
  'my job was',
  'participated in',
  'took part in',
]

const WEAK_PHRASE_PATTERN = WEAK_PHRASES.map((p) => p.replace(/ /g, '\\s+')).join('|')
export const WEAK_PHRASE_RE = new RegExp(`^\\s*(${WEAK_PHRASE_PATTERN})\\b`, 'i')

export function startsWithWeakPhrase(bullet: string): boolean {
  return WEAK_PHRASE_RE.test(bullet)
}

export const ACTION_VERBS: Record<string, string[]> = {
  Leadership: ['Led', 'Directed', 'Orchestrated', 'Championed', 'Mentored', 'Spearheaded', 'Coordinated'],
  Achievement: ['Achieved', 'Delivered', 'Exceeded', 'Boosted', 'Increased', 'Reduced', 'Accelerated'],
  Technical: ['Built', 'Engineered', 'Architected', 'Automated', 'Optimized', 'Deployed', 'Integrated'],
  Ownership: ['Owned', 'Launched', 'Drove', 'Established', 'Implemented', 'Streamlined'],
  Analysis: ['Analyzed', 'Identified', 'Diagnosed', 'Evaluated', 'Forecasted', 'Modeled'],
  Communication: ['Presented', 'Negotiated', 'Facilitated', 'Authored', 'Advised', 'Trained'],
}
