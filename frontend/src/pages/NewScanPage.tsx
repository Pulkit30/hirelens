import { useMutation } from '@tanstack/react-query'
import { Loader2, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'

import { ApiError, createScan } from '../api/client'
import { FileDropzone } from '../components/FileDropzone'
import { JobDescriptionInput, MIN_JD_WORDS, type JdMode } from '../components/JobDescriptionInput'
import { RecentScans } from '../components/RecentScans'
import { Alert, Button, Card } from '../components/ui'
import { wordCount } from '../lib/format'
import { addRecentScan } from '../lib/recentScans'

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'rate_limited') return `${error.message}. Each scan uses paid AI calls, so scans are limited per hour.`
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

export function NewScanPage() {
  const navigate = useNavigate()
  const [resume, setResume] = useState<File | null>(null)
  const [jdMode, setJdMode] = useState<JdMode>('paste')
  const [jdText, setJdText] = useState('')
  const [jdFile, setJdFile] = useState<File | null>(null)

  const jdReady = jdMode === 'paste' ? wordCount(jdText) >= MIN_JD_WORDS : jdFile !== null
  const canSubmit = resume !== null && jdReady

  const scan = useMutation({
    mutationFn: () =>
      createScan(resume!, jdMode === 'paste' ? { text: jdText } : { file: jdFile! }),
    onSuccess: (created) => {
      addRecentScan({ id: created.id, resumeName: resume?.name ?? null, createdAt: new Date().toISOString() })
      navigate(`/scans/${created.id}`)
    },
  })

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (canSubmit && !scan.isPending) scan.mutate()
  }

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">See your resume the way an ATS does</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Upload your resume and a job description. HireLens checks if the file is readable, matches your skills and
          experience to the job, and tells you exactly what to improve.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="1. Your resume" description="PDF or DOCX works best; use the file you send to employers.">
            <FileDropzone
              label="Drop your resume here, or click to choose"
              hint="PDF, DOCX or TXT · up to 5 MB"
              file={resume}
              onChange={setResume}
            />
          </Card>
          <Card title="2. The job description" description="Paste the full posting for the most accurate match.">
            <JobDescriptionInput
              mode={jdMode}
              onModeChange={setJdMode}
              text={jdText}
              onTextChange={setJdText}
              file={jdFile}
              onFileChange={setJdFile}
            />
          </Card>
        </div>

        {scan.isError && (
          <Alert tone="error" title="The scan could not start">
            {errorMessage(scan.error)}
          </Alert>
        )}

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <ShieldCheck aria-hidden className="size-4 shrink-0 text-emerald-600" />
            Your name and contact details are removed before AI analysis.
          </p>
          <Button type="submit" disabled={!canSubmit || scan.isPending} className="w-full sm:w-auto">
            {scan.isPending && <Loader2 aria-hidden className="size-4 animate-spin" />}
            {scan.isPending ? 'Uploading…' : 'Scan my resume'}
          </Button>
        </div>
      </form>

      <RecentScans />
    </div>
  )
}
