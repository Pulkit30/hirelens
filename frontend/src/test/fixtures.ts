import type { ScanResult } from '../api/types'

/** A finished scan shaped exactly like the API's response (synthetic data). */
export function completedScan(overrides: Partial<ScanResult> = {}): ScanResult {
  return {
    id: 'a'.repeat(32),
    status: 'completed',
    stage: 'done',
    progress: 100,
    error: null,
    error_code: null,
    created_at: '2026-10-02T10:00:00Z',
    completed_at: '2026-10-02T10:00:20Z',
    resume_file: { filename: 'jane_resume.pdf', kind: 'pdf', size_bytes: 120_000 },
    jd_file: null,
    timings_ms: { parsing: 90, extracting: 6000, scoring: 800, suggesting: 9000 },
    format_report: {
      format_score: 92,
      parseable: true,
      issues: [
        {
          code: 'multi_column',
          severity: 'warning',
          message: 'Multi-column layout detected.',
          suggestion: 'Use a single-column layout.',
        },
      ],
    },
    ats: {
      total: 78,
      band: 'strong',
      scoring_version: '2026.10-v1',
      components: [
        { name: 'keywords', score: 85, weight: 36.8, summary: '2 of 3 must-have skills' },
        { name: 'semantic', score: 70, weight: 26.3, summary: '2 of 3 responsibilities well covered' },
        { name: 'experience', score: 100, weight: 15.8, summary: '4.0 years of experience; 3+ required' },
        { name: 'title', score: 64, weight: 10.5, summary: "Closest title 'Software Engineer'" },
        { name: 'education', score: null, weight: 0, summary: 'The job description states no education requirement' },
        { name: 'format', score: 92, weight: 10.5, summary: '1 formatting issue(s)' },
      ],
      skills: [
        { requirement: 'Python', required: true, matched: true, matched_with: 'Python', source: 'skills' },
        { requirement: 'FastAPI or Django', required: true, matched: true, matched_with: 'FastAPI', source: 'skills' },
        { requirement: 'Go', required: true, matched: false, matched_with: null, source: null },
        { requirement: 'Kubernetes', required: false, matched: true, matched_with: 'Kubernetes', source: 'text' },
      ],
      responsibilities: [
        { responsibility: 'Build REST APIs', score: 88, best_evidence: 'Built REST APIs in FastAPI for 1M users' },
        { responsibility: 'Run on-call rotations', score: 12, best_evidence: null },
      ],
    },
    suggestions: {
      overview: 'Strong backend fit; Go is the main gap.',
      suggestions: [
        {
          category: 'skills',
          priority: 'high',
          title: 'Show Go if you have used it',
          detail: 'Go is a must-have and is missing.',
          example: null,
        },
        {
          category: 'impact',
          priority: 'medium',
          title: 'Quantify the API work',
          detail: 'Lead with the scale you already mention.',
          example: 'Built REST APIs in FastAPI serving 1M users',
        },
      ],
    },
    profile: {
      current_title: 'Software Engineer',
      roles: [{ title: 'Software Engineer', company: 'Acme', start: '2022-01', end: 'present', is_internship: false }],
      experience_years: 4,
      internship_months: 0,
      skills: ['Python', 'FastAPI'],
      unrecognized_skills: [],
      soft_skills: [],
      education: [],
      highest_education: 'bachelor',
      certifications: [],
    },
    requirements: {
      title: 'Backend Engineer',
      seniority: 'mid',
      min_years_experience: 3,
      must_have_skills: [{ any_of: ['Python'] }, { any_of: ['FastAPI', 'Django'] }, { any_of: ['Go'] }],
      nice_to_have_skills: [{ any_of: ['Kubernetes'] }],
      soft_skills: [],
      education_level: null,
      education_fields: [],
      responsibilities: ['Build REST APIs', 'Run on-call rotations'],
    },
    ...overrides,
  }
}
