import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onUploadComplete: (url: string) => void
  value?: string
}

export function ImageUpload({ onUploadComplete, value }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(value)

  async function uploadFile(file: File) {
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Only PNG and JPG files are allowed')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Upload failed with status ${response.status}`)
      }

      const { url } = data
      if (!url) {
        throw new Error('No URL returned from upload')
      }

      setPreviewUrl(url)
      onUploadComplete(url)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      uploadFile(file)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  if (previewUrl && !error) {
    return (
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Uploaded background"
            className="h-32 w-full object-cover"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setPreviewUrl(undefined)
            onUploadComplete('')
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }}
        >
          <X className="size-4" aria-hidden="true" />
          Remove image
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        disabled={uploading}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-sm text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50',
          isDragging && 'border-primary bg-primary/5',
          uploading && 'pointer-events-none opacity-50'
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="size-6 animate-spin" aria-hidden="true" />
            Uploading…
          </>
        ) : (
          <>
            <ImagePlus className="size-6" aria-hidden="true" />
            Drop image here or click to browse
            <span className="text-xs">PNG or JPG, max 5MB</span>
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleChange}
        className="hidden"
        aria-label="Upload background image"
      />

      {error ? (
        <p
          role="alert"
          aria-live="polite"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
