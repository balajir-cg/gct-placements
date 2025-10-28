import { NextRequest, NextResponse } from 'next/server'
import { Client, Storage, ID } from 'node-appwrite'
import { Readable } from 'stream'

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '')

const storage = new Storage(client)

const config = {
  storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || '',
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a readable stream from the buffer
    const stream = Readable.from(buffer)

    // Upload to Appwrite storage using stream
    const uploadedFile = await storage.createFile(
      config.storageId,
      ID.unique(),
      stream as any,
      [
        // Permissions (adjust as needed)
        'read("any")',
      ]
    )

    return NextResponse.json({
      success: true,
      fileId: uploadedFile.$id,
      fileName: file.name
    })

  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}
