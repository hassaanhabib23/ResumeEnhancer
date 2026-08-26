import type { ResumeData } from './types'

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function blankResume(name = 'Untitled Resume'): ResumeData {
  return {
    id: makeId(),
    name,
    updatedAt: new Date().toISOString(),
    templateId: 'modern',
    colorTheme: 'brand',
    fontVariant: 'sans',
    contact: {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      photo: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
  }
}

export function sampleResume(): ResumeData {
  return {
    id: makeId(),
    name: 'Product Designer — Sample',
    updatedAt: new Date().toISOString(),
    templateId: 'modern',
    colorTheme: 'brand',
    fontVariant: 'sans',
    contact: {
      fullName: 'Amara Whitfield',
      title: 'Senior Product Designer',
      email: 'amara.whitfield@email.com',
      phone: '+1 (415) 555-0182',
      location: 'San Francisco, CA',
      website: 'amarawhitfield.design',
      linkedin: 'linkedin.com/in/amarawhitfield',
      github: 'github.com/amarawhitfield',
      photo: '',
    },
    summary:
      'Product designer with 7+ years crafting end-to-end experiences for B2B SaaS platforms. Led design for a flagship analytics product that grew active usage 3x. Skilled at translating ambiguous problems into shipped, measurable outcomes and mentoring design teams.',
    experience: [
      {
        id: makeId(),
        company: 'Northwind Analytics',
        role: 'Senior Product Designer',
        location: 'San Francisco, CA',
        startDate: '2022-03',
        endDate: '',
        current: true,
        bullets: [
          'Led redesign of the core dashboard used by 40,000+ weekly active users, increasing task completion by 28%.',
          'Built and maintain the company design system, cutting new-feature design time by roughly 35%.',
          'Partnered with PM and engineering leads to run quarterly discovery sprints, shipping 6 major features in 18 months.',
        ],
      },
      {
        id: makeId(),
        company: 'Fieldstone Labs',
        role: 'Product Designer',
        location: 'Austin, TX',
        startDate: '2019-06',
        endDate: '2022-02',
        current: false,
        bullets: [
          'Owned onboarding flow redesign, reducing drop-off in the first session from 47% to 22%.',
          'Ran 50+ moderated usability sessions to validate concepts before engineering handoff.',
          'Mentored 2 junior designers through their first 12 months.',
        ],
      },
    ],
    education: [
      {
        id: makeId(),
        school: 'University of Texas at Austin',
        degree: 'B.F.A.',
        field: 'Design',
        location: 'Austin, TX',
        startDate: '2015-08',
        endDate: '2019-05',
        gpa: '',
      },
    ],
    skills: [
      { id: makeId(), name: 'Product Strategy', level: 5 },
      { id: makeId(), name: 'Figma', level: 5 },
      { id: makeId(), name: 'Design Systems', level: 4 },
      { id: makeId(), name: 'User Research', level: 4 },
      { id: makeId(), name: 'Prototyping', level: 4 },
      { id: makeId(), name: 'HTML/CSS', level: 3 },
    ],
    projects: [
      {
        id: makeId(),
        name: 'Insight — internal analytics toolkit',
        description:
          'Designed a self-serve reporting tool that let non-technical teams build dashboards without engineering support.',
        link: '',
        tech: 'Figma, React',
      },
    ],
    certifications: [
      { id: makeId(), name: 'Certified Usability Analyst', issuer: 'HFI', date: '2021' },
    ],
    languages: [
      { id: makeId(), name: 'English', level: 'Native' },
      { id: makeId(), name: 'Portuguese', level: 'Conversational' },
    ],
  }
}
