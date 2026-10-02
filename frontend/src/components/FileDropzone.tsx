import clsx from 'clsx'
import { FileText, Upload, X } from 'lucide-react'
import { useId, useState, type DragEvent } from 'react'

import { ACCEPTED_TYPES, validateFile } from '../lib/files'
import { formatFileSize } from '../lib/format'

export function FileDropzone({
  label,
  hint,
  file,
  onChange,
}: {
  label: string
  hint: string
  file: File | null
  onChange: (file: File | null) => void
}) {
  const inputId = useId()
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function choose(next: File | undefined) {
    if (!next) return
    const problem = validateFile(next)
    setError(problem)
    onChange(problem ? null : next)
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    choose(event.dataTransfer.files[0])
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
        <FileText aria-hidden className="size-8 shrink-0 text-brand-500" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatFileSize(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
          aria-label={`Remove ${file.name}`}
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={clsx(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
          dragging
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
            : 'border-zinc-300 hover:border-brand-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50',
        )}
      >
        <Upload aria-hidden className="size-6 text-zinc-400" />
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>
        <input
          id={inputId}
          type="file"
          accept={ACCEPTED_TYPES}
          className="sr-only"
          onChange={(e) => {
            choose(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  )
}
