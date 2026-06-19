import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PNG and JPG files are allowed' },
        { status: 400 }
      )
    }

    // Convert File to ArrayBuffer then Buffer for Vercel Blob
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to public Blob storage with random suffix to avoid conflicts
    const blob = await put(file.name, buffer, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Upload failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
