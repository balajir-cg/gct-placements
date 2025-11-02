import { NextRequest, NextResponse } from 'next/server'
import { Client, Databases, ID, Query } from 'node-appwrite'

// Create server-side Appwrite client with API key
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '')

const databases = new Databases(client)

const config = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
  collections: {
    academicRecords: process.env.NEXT_PUBLIC_APPWRITE_ACADEMIC_RECORDS_COLLECTION_ID || 'academic_records',
    users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || 'users',
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, fileId, extractedData, academicInfo } = await request.json()
    
    if (!userId || !fileId || !extractedData || !academicInfo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const timestamp = new Date().toISOString()

    // Step 1: Save to academic_records collection
    const academicRecord = {
      fileId,
      extractedData: JSON.stringify(extractedData, null, 2),
      institution: academicInfo.institution || null,
      registerNumber: academicInfo.registerNumber || null,
      studentName: academicInfo.studentName || null,
      dateOfBirth: academicInfo.dateOfBirth || null,
      department: academicInfo.department || null,
      batch: academicInfo.batch || null,
      academicYear: academicInfo.academicYear || null,
      semester: academicInfo.semester || null,
      computedCgpa: academicInfo.computedCgpa || null,
      totalCreditsEarned: academicInfo.totalCreditsEarned?.toString() || null,
      totalCreditsRegistered: academicInfo.totalCreditsRegistered?.toString() || null
    }

    console.log('Saving academic record:', academicRecord)

    let savedRecord: any
    try {
      const list = await databases.listDocuments(
        config.databaseId,
        config.collections.academicRecords,
        [Query.equal('userId', userId), Query.limit(1)]
      )
      
      if (list.documents && list.documents.length > 0) {
        const existing = list.documents[0]
        savedRecord = await databases.updateDocument(
          config.databaseId,
          config.collections.academicRecords,
          existing.$id,
          { ...academicRecord, updatedAt: timestamp }
        )
        console.log('Updated existing record:', savedRecord.$id)
      } else {
        savedRecord = await databases.createDocument(
          config.databaseId,
          config.collections.academicRecords,
          ID.unique(),
          { userId, ...academicRecord, createdAt: timestamp, updatedAt: timestamp }
        )
        console.log('Created new record:', savedRecord.$id)
      }
    } catch (dbError: any) {
      console.error('Database operation error:', dbError)
      throw new Error('Failed to save academic record: ' + dbError.message)
    }

    // Step 2: Update user profile with academic details
    try {
      const userList = await databases.listDocuments(
        config.databaseId,
        config.collections.users,
        [Query.equal('userId', userId), Query.limit(1)]
      )

      if (userList.documents && userList.documents.length > 0) {
        const userProfile = userList.documents[0]
        
        // Update profile with academic data from marksheet (excluding batch and department)
        await databases.updateDocument(
          config.databaseId,
          config.collections.users,
          userProfile.$id,
          {
            rollNo: academicInfo.registerNumber || userProfile.rollNo,
            // batch and department should be set manually by user, not from marksheet
            currentCgpa: academicInfo.computedCgpa || userProfile.currentCgpa,
            dateOfBirth: academicInfo.dateOfBirth || userProfile.dateOfBirth,
            updatedAt: timestamp
          }
        )
        console.log('Updated user profile with academic data (batch and department unchanged)')
      }
    } catch (profileError: any) {
      console.error('Failed to update user profile:', profileError)
      // Don't fail the entire operation if profile update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Academic data saved successfully and profile updated',
      data: {
        recordId: savedRecord.$id
      }
    })
  } catch (error: any) {
    console.error('save-academic-data error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save academic data' },
      { status: 500 }
    )
  }
}
