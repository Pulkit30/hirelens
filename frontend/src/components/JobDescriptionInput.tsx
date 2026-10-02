import clsx from 'clsx'
import { useId } from 'react'

import { wordCount } from '../lib/format'
import { FileDropzone } from './FileDropzone'

export const MIN_JD_WORDS = 20
export const MAX_JD_CHARS = 30_000

export type JdMode = 'paste' | 'upload'

export function JobDescriptionInput({
  mode,
  onModeChange,
  text,
  onTextChange,
  file,
  onFileChange,
}: {
  mode: JdMode
  onModeChange: (mode: JdMode) => void
  text: string
  onTextChange: (text: string) => void
  file: File | null
  onFileChange: (file: File | null) => void
}) {
  const textareaId = useId()
  const words = wordCount(text)
  const tooShort = text.trim() !== '' && words < MIN_JD_WORDS

  return (
    <div>
      <div role="tablist" aria-label="Job description input" className="mb-3 inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {(['paste', 'upload'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => onModeChange(value)}
            className={clsx(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              mode === value
                ? 'bg-white shadow-sm dark:bg-zinc-700'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
            )}
          >
            {value === 'paste' ? 'Paste text' : 'Upload file'}
          </button>
        ))}
      </div>

      {mode === 'paste' ? (
        <div>
          <label htmlFor={textareaId} className="sr-only">
            Job description
          </label>
          <textarea
            id={textareaId}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            maxLength={MAX_JD_CHARS}
            rows={10}
            placeholder="Paste the full job posting: title, responsibilities, requirements…"
            className="w-full resize-y rounded-xl border border-zinc-300 bg-white p-3 text-sm placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
          <p
            className={clsx(
              'mt-1 text-xs',
              tooShort ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400',
            )}
          >
            {words} words{tooShort && ` — paste the full posting (at least ${MIN_JD_WORDS} words)`}
          </p>
        </div>
      ) : (
        <FileDropzone
          label="Drop the job description here, or click to choose"
          hint="PDF, DOCX or plain-text TXT · up to 5 MB"
          file={file}
          onChange={onFileChange}
        />
      )}
    </div>
  )
}
