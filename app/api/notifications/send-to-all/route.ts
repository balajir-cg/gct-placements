import { NextRequest, NextResponse } from 'next/server'
import { Client, Databases, ID, Query } from 'node-appwrite'

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '')

const databases = new Databases(client)

const config = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
  usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '',
  notificationsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID || '',
}

export async function POST(request: NextRequest) {
  try {
    const { title, message, type, jobId } = await request.json()

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, message, type' },
        { status: 400 }
      )
    }

    console.log('📤 Sending notification to all students:', { title, type })

    // Get all student users
    let allStudents: any[] = []
    let offset = 0
    const limit = 100
    
    while (true) {
      const users = await databases.listDocuments(
        config.databaseId,
        config.usersCollectionId,
        [
          Query.limit(limit),
          Query.offset(offset)
        ]
      )
      
      const students = users.documents.filter((user: any) => 
        user.role === 'student' || !user.role
      )
      
      allStudents.push(...students)
      
      if (users.documents.length < limit) break
      offset += limit
    }

    console.log(`📊 Found ${allStudents.length} students`)

    // Create notifications for all users in batches
    const batchSize = 50
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < allStudents.length; i += batchSize) {
      const batch = allStudents.slice(i, i + batchSize)
      
      const notificationPromises = batch.map(user =>
        databases.createDocument(
          config.databaseId,
          config.notificationsCollectionId,
          ID.unique(),
          {
            userId: user.$id,
            title,
            message,
            type,
            jobId: jobId || null,
            read: false,
            createdAt: new Date().toISOString(),
          }
        ).then(() => {
          successCount++
        }).catch((error) => {
          errorCount++
          console.error(`Failed to create notification for user ${user.$id}:`, error.message)
        })
      )

      await Promise.all(notificationPromises)
      console.log(`✅ Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allStudents.length / batchSize)}`)
    }

    console.log(`✅ Notification sent: ${successCount} success, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${successCount} students`,
      stats: {
        total: allStudents.length,
        success: successCount,
        errors: errorCount
      }
    })
  } catch (error: any) {
    console.error('❌ Send notification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send notifications' },
      { status: 500 }
    )
  }
}
