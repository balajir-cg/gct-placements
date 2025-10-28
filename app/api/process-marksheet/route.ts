import { NextRequest, NextResponse } from 'next/server'
import { Client, Databases, Storage, ID, Query } from 'node-appwrite'

// Create server-side Appwrite client with API key
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '') // Server-side API key

const databases = new Databases(client)
const storage = new Storage(client)

const config = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
  storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || '',
  collections: {
    academicRecords: process.env.NEXT_PUBLIC_APPWRITE_ACADEMIC_RECORDS_COLLECTION_ID || 'academic_records',
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fileId, userId } = await request.json()
    
    if (!fileId || !userId) {
      return NextResponse.json(
        { error: 'fileId and userId are required' },
        { status: 400 }
      )
    }

    // Build publicly accessible URL for the marksheet image
    const endpoint = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '').replace(/\/$/, '')
    
    // First, try to get the file and convert to base64 for direct image sending
    console.log('Processing marksheet:', { fileId, userId })
    
    // Download the file from Appwrite storage using server-side client
    const fileUrl = `${endpoint}/storage/buckets/${config.storageId}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
    const fileResp = await fetch(fileUrl, {
      headers: {
        'X-Appwrite-Project': process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY || ''
      }
    })
    
    if (!fileResp.ok) {
      const errorText = await fileResp.text()
      console.error('Failed to download file:', errorText)
      throw new Error('Failed to download file from Appwrite storage')
    }
    
    const arrayBuffer = await fileResp.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = fileResp.headers.get('content-type') || 'image/jpeg'
    const base64DataUrl = `data:${mimeType};base64,${base64Image}`

    console.log('Image loaded, size:', arrayBuffer.byteLength, 'bytes')

    // Prompt for structured extraction matching the sample format
    const promptText = `Extract all information from this academic marksheet image and return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just pure JSON):
{
  "institution": "institution name",
  "affiliation": "university affiliation",
  "location": "location",
  "statement_type": "statement type",
  "si_no": "serial number",
  "student_details": {
    "register_no": "registration number",
    "name": "student name",
    "date_of_birth": "DD/MM/YYYY",
    "gender": "gender",
    "programme_branch": "programme and branch",
    "month_year_of_examinations": "exam month/year",
    "regulations": "regulation year"
  },
  "courses": [
    {
      "sem": "semester number",
      "course_code": "code",
      "course_title": "title",
      "credits": credits_as_number,
      "letter_grade": "grade",
      "grade_point": grade_point_as_number,
      "attendance_grade": "attendance",
      "result": "result"
    }
  ],
  "summary": {
    "credits_registered": number,
    "credits_earned": number,
    "weighted_grade_points_earned": number,
    "grade_point_average": number,
    "cumulative_credits_earned": "earned / registered",
    "cumulative_grade_point_average": number
  },
  "footer": {
    "medium_of_instruction": "medium",
    "seal_and_date": "date",
    "controller_of_examinations": "name"
  }
}

Important: 
- Return ONLY the JSON object, no additional text, no markdown, no code blocks
- Convert all numeric values to actual numbers (not strings)
- Use null for missing fields`

    // Call OpenRouter with vision model
    const openRouterResp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'GCT Placement Portal - Marksheet OCR'
      },
      body: JSON.stringify({
        model: process.env.VISION_MODEL || 'qwen/qwen2.5-vl-32b-instruct:free',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: promptText },
              { type: 'image_url', image_url: { url: base64DataUrl } }
            ]
          }
        ],
        max_tokens: 2500,
        temperature: 0.1
      })
    })

    if (!openRouterResp.ok) {
      const errText = await openRouterResp.text()
      console.error('OpenRouter API error:', errText)
      throw new Error('OpenRouter API error: ' + errText)
    }

    const orJson = await openRouterResp.json()
    const assistantContent = orJson?.choices?.[0]?.message?.content || ''

    console.log('OpenRouter response:', assistantContent.substring(0, 500))

    // Parse the extracted JSON
    let extractedData: any = {}
    try {
      // Remove markdown code blocks if present
      let cleanContent = assistantContent.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      // Try direct parse
      extractedData = JSON.parse(cleanContent)
    } catch (e) {
      console.error('Failed to parse JSON directly, trying to extract:', e)
      // Try to find JSON block in response
      const jsonMatch = assistantContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          extractedData = JSON.parse(jsonMatch[0])
        } catch (e2) {
          console.error('Failed to parse extracted JSON:', e2)
          throw new Error('Could not extract valid JSON from model response')
        }
      } else {
        throw new Error('Could not find JSON in model response')
      }
    }

    console.log('Extracted data structure:', Object.keys(extractedData))

    // Calculate CGPA using weighted grade points from summary
    let computedCgpa = '0.00'
    
    // Method 1: Use summary data if available (most accurate)
    if (extractedData.summary) {
      const { weighted_grade_points_earned, credits_registered, cumulative_grade_point_average } = extractedData.summary
      
      // Prefer using the summary's cumulative CGPA if available
      if (cumulative_grade_point_average && typeof cumulative_grade_point_average === 'number') {
        computedCgpa = cumulative_grade_point_average.toFixed(2)
        console.log('Using summary cumulative CGPA:', computedCgpa)
      }
      // Otherwise calculate from weighted points and credits_registered
      else if (weighted_grade_points_earned && credits_registered && credits_registered > 0) {
        const cgpa = weighted_grade_points_earned / credits_registered
        computedCgpa = cgpa.toFixed(2)
        console.log('Calculated CGPA from weighted points:', computedCgpa, { weighted_grade_points_earned, credits_registered })
      }
    }
    
    // Method 2: Calculate from individual courses if summary not available
    if (computedCgpa === '0.00' && extractedData.courses && Array.isArray(extractedData.courses)) {
      const courses = extractedData.courses
      let totalWeightedPoints = 0
      let totalCredits = 0
      
      courses.forEach((course: any) => {
        const credits = typeof course.credits === 'number' ? course.credits : parseFloat(course.credits) || 0
        const gradePoint = typeof course.grade_point === 'number' ? course.grade_point : parseFloat(course.grade_point) || 0
        
        // Include all courses with valid credits for total credits calculation
        if (credits > 0) {
          totalCredits += credits
          // Only add to weighted points if grade point is valid
          if (gradePoint > 0) {
            totalWeightedPoints += credits * gradePoint
          }
        }
      })
      
      if (totalCredits > 0) {
        computedCgpa = (totalWeightedPoints / totalCredits).toFixed(2)
        console.log('Calculated CGPA from courses:', computedCgpa, { totalWeightedPoints, totalCredits })
      }
    }

    // Extract maximum semester from courses
    let maxSemester = '1'
    if (extractedData.courses && Array.isArray(extractedData.courses)) {
      const semesters = extractedData.courses
        .map((c: any) => c.sem)
        .filter((s: any) => s && !isNaN(Number(s)))
        .map((s: any) => Number(s))
      if (semesters.length > 0) {
        maxSemester = Math.max(...semesters).toString()
      }
    }
    console.log('Extracted semester:', maxSemester)

    // Prepare record for database
    const academicRecord = {
      fileId,
      extractedData: JSON.stringify(extractedData, null, 2),
      institution: extractedData.institution || null,
      registerNumber: extractedData.student_details?.register_no || null, // Changed from registerNo to registerNumber
      studentName: extractedData.student_details?.name || null,
      dateOfBirth: extractedData.student_details?.date_of_birth || null,
      department: extractedData.student_details?.programme_branch || null,
      batch: extractedData.student_details?.regulations?.toString() || extractedData.student_details?.month_year_of_examinations || null,
      academicYear: extractedData.student_details?.month_year_of_examinations || extractedData.student_details?.regulations?.toString() || null,
      semester: maxSemester,
      computedCgpa,
      totalCreditsEarned: extractedData.summary?.credits_earned?.toString() || null,
      totalCreditsRegistered: extractedData.summary?.credits_registered?.toString() || null
    }

    console.log('Saving academic record:', academicRecord)

    // Save to database using server-side client
    const timestamp = new Date().toISOString()
    
    // Try to find existing record for user
    let savedRecord: any
    try {
      const list = await databases.listDocuments(
        config.databaseId,
        config.collections.academicRecords,
        [Query.equal('userId', userId), Query.limit(1)]
      )
      
      if (list.documents && list.documents.length > 0) {
        // Update existing record
        const existing = list.documents[0]
        savedRecord = await databases.updateDocument(
          config.databaseId,
          config.collections.academicRecords,
          existing.$id,
          { ...academicRecord, updatedAt: timestamp }
        )
        console.log('Updated existing record:', savedRecord.$id)
      } else {
        // Create new record
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

    return NextResponse.json({
      success: true,
      message: 'Marksheet processed successfully',
      data: {
        computedCgpa,
        institution: extractedData.institution,
        studentName: extractedData.student_details?.name,
        registerNumber: extractedData.student_details?.register_no,
        batch: extractedData.student_details?.regulations?.toString() || extractedData.student_details?.month_year_of_examinations,
        totalCreditsEarned: extractedData.summary?.credits_earned,
        totalCreditsRegistered: extractedData.summary?.credits_registered,
        extractedData,
        recordId: savedRecord.$id
      }
    })
  } catch (error: any) {
    console.error('process-marksheet error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process marksheet' },
      { status: 500 }
    )
  }
}
