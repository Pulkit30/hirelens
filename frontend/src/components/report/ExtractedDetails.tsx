import type { ReactNode } from 'react'

import type { JobRequirements, ResumeProfile } from '../../api/types'
import { Card } from '../ui'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3 py-2 text-sm">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

const dash = <span className="text-zinc-400">—</span>

export function ExtractedDetails({
  profile,
  requirements,
}: {
  profile: ResumeProfile
  requirements: JobRequirements
}) {
  return (
    <Card title="What we read" description="Check these: wrong data here means a wrong score.">
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-brand-700 select-none dark:text-brand-400">
          Show extracted details
        </summary>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-1 text-sm font-semibold">From your resume</h3>
            <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <Row label="Current title">{profile.current_title ?? dash}</Row>
              <Row label="Experience">
                {profile.experience_years !== null ? `${profile.experience_years} years` : dash}
                {profile.internship_months > 0 && ` + ${profile.internship_months} months of internships`}
              </Row>
              <Row label="Education">{profile.highest_education ?? dash}</Row>
              <Row label="Roles">
                {profile.roles.length
                  ? profile.roles.map((r, i) => (
                      <div key={i}>
                        {r.title}
                        {r.company && ` · ${r.company}`}{' '}
                        <span className="text-zinc-500 dark:text-zinc-400">
                          ({r.start ?? '?'} – {r.end ?? '?'})
                        </span>
                      </div>
                    ))
                  : dash}
              </Row>
              <Row label="Skills">{profile.skills.join(', ') || dash}</Row>
            </dl>
          </div>
          <div>
            <h3 className="mb-1 text-sm font-semibold">From the job description</h3>
            <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <Row label="Title">{requirements.title ?? dash}</Row>
              <Row label="Seniority">{requirements.seniority}</Row>
              <Row label="Min. experience">
                {requirements.min_years_experience !== null ? `${requirements.min_years_experience}+ years` : dash}
              </Row>
              <Row label="Education">{requirements.education_level ?? dash}</Row>
              <Row label="Responsibilities">
                {requirements.responsibilities.length ? (
                  <ul className="list-disc pl-4">
                    {requirements.responsibilities.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  dash
                )}
              </Row>
            </dl>
          </div>
        </div>
      </details>
    </Card>
  )
}
