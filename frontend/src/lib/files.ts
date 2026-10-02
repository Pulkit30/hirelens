export const ACCEPTED_TYPES = '.pdf,.docx,.txt'
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'txt']

/** Quick client-side check; the server inspects the file's real content anyway. */
export function validateFile(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return extension === 'doc'
      ? 'Old .doc files are not supported. Save it as DOCX or PDF.'
      : 'Upload a PDF, DOCX or TXT file.'
  }
  if (file.size > MAX_UPLOAD_BYTES) return 'The file is larger than 5 MB.'
  if (file.size === 0) return 'The file is empty.'
  return null
}
