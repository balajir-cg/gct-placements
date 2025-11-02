import { NextRequest, NextResponse } from 'next/server'
import { Client, Storage } from 'node-appwrite'

// Create server-side Appwrite client with API key
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
    const { fileId } = await request.json()
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      )
    }

    // Build publicly accessible URL for the marksheet image
    const endpoint = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '').replace(/\/$/, '')
    
    // Download the file from Appwrite storage using server-side client
    console.log('Extracting marksheet data:', { fileId })
    
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

    // Prompt for structured extraction
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

    console.log('OpenRouter response received')

    // Parse the extracted JSON
    let extractedData: any = {}
    try {
      let cleanContent = assistantContent.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      extractedData = JSON.parse(cleanContent)
    } catch (e) {
      const jsonMatch = assistantContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not extract valid JSON from model response')
      }
    }

    // 🔒 FRAUD DETECTION: Validate marksheet authenticity
    const fraudChecks: { check: string; passed: boolean; reason?: string }[] = []
    
    // 1. Check for GCT institution name
    const institutionCheck = extractedData.institution?.toLowerCase().includes('government college of technology') ||
                            extractedData.institution?.toLowerCase().includes('gct')
    fraudChecks.push({
      check: 'Institution Name',
      passed: institutionCheck,
      reason: institutionCheck ? undefined : `Invalid institution: "${extractedData.institution}". Expected "Government College of Technology"`
    })
    
    // 2. Check for Coimbatore location
    const locationCheck = extractedData.location?.toLowerCase().includes('coimbatore') ||
                         extractedData.location?.toLowerCase().includes('641')
    fraudChecks.push({
      check: 'Location',
      passed: locationCheck,
      reason: locationCheck ? undefined : `Invalid location: "${extractedData.location}". Expected Coimbatore location`
    })
    
    // 3. Check for "Statement of Grades" document type
    const documentTypeCheck = extractedData.statement_type?.toLowerCase().includes('statement of grades') ||
                             extractedData.statement_type?.toLowerCase().includes('grade')
    fraudChecks.push({
      check: 'Document Type',
      passed: documentTypeCheck,
      reason: documentTypeCheck ? undefined : `Invalid document type: "${extractedData.statement_type}". Expected "Statement of Grades"`
    })
    
    // 4. Validate register number format (should be numeric, typically 12 digits for GCT)
    const registerNo = extractedData.student_details?.register_no || ''
    const registerNumberCheck = /^\d{10,15}$/.test(registerNo.replace(/\s/g, ''))
    fraudChecks.push({
      check: 'Register Number Format',
      passed: registerNumberCheck,
      reason: registerNumberCheck ? undefined : `Invalid register number format: "${registerNo}". Expected 10-15 digit numeric format`
    })
    
    // 5. Check for required footer elements (seal, controller signature)
    const footerCheck = extractedData.footer && (
      extractedData.footer.seal_and_date || 
      extractedData.footer.controller_of_examinations
    )
    fraudChecks.push({
      check: 'Official Footer Elements',
      passed: !!footerCheck,
      reason: footerCheck ? undefined : 'Missing official seal/date or Controller of Examinations signature'
    })
    
    // 6. Validate course structure (must have courses with proper format)
    const coursesCheck = Array.isArray(extractedData.courses) && 
                        extractedData.courses.length > 0 &&
                        extractedData.courses.every((c: any) => 
                          c.course_code && c.course_title && c.letter_grade
                        )
    fraudChecks.push({
      check: 'Course Data Structure',
      passed: coursesCheck,
      reason: coursesCheck ? undefined : 'Invalid or missing course data structure'
    })
    
    // 7. Check for summary/CGPA calculation section
    const summaryCheck = extractedData.summary && (
      extractedData.summary.cumulative_grade_point_average !== undefined ||
      (extractedData.summary.credits_registered && extractedData.summary.weighted_grade_points_earned)
    )
    fraudChecks.push({
      check: 'CGPA Summary Section',
      passed: !!summaryCheck,
      reason: summaryCheck ? undefined : 'Missing CGPA/summary calculation section'
    })

    // Count failed checks
    const failedChecks = fraudChecks.filter(c => !c.passed)
    const fraudScore = (failedChecks.length / fraudChecks.length) * 100
    
    // If more than 40% checks fail, reject as potential fraud
    const isSuspiciousFraud = fraudScore > 40
    
    if (isSuspiciousFraud) {
      console.warn('⚠️ POTENTIAL FRAUD DETECTED:', {
        fraudScore: `${fraudScore.toFixed(1)}%`,
        failedChecks: failedChecks.map(c => ({ check: c.check, reason: c.reason }))
      })
      
      return NextResponse.json({
        success: false,
        fraud_detected: true,
        fraud_score: fraudScore,
        message: '⚠️ This document appears suspicious and does not match the official GCT marksheet format.',
        failed_checks: failedChecks.map(c => c.reason),
        all_checks: fraudChecks,
        suggestion: 'Please upload an official Government College of Technology marksheet.'
      }, { status: 400 })
    }
    
    // Log warning if some checks failed but not critical
    if (failedChecks.length > 0) {
      console.warn('⚠️ Some authenticity checks failed:', failedChecks.map(c => c.check))
    }
    
    console.log('✅ Authenticity checks passed:', {
      passedChecks: fraudChecks.filter(c => c.passed).length,
      totalChecks: fraudChecks.length,
      fraudScore: `${fraudScore.toFixed(1)}%`
    })

    // Calculate CGPA
    let computedCgpa = '0.00'
    
    if (extractedData.summary) {
      const { weighted_grade_points_earned, credits_registered, cumulative_grade_point_average } = extractedData.summary
      
      if (cumulative_grade_point_average && typeof cumulative_grade_point_average === 'number') {
        computedCgpa = cumulative_grade_point_average.toFixed(2)
      } else if (weighted_grade_points_earned && credits_registered && credits_registered > 0) {
        const cgpa = weighted_grade_points_earned / credits_registered
        computedCgpa = cgpa.toFixed(2)
      }
    }
    
    if (computedCgpa === '0.00' && extractedData.courses && Array.isArray(extractedData.courses)) {
      const courses = extractedData.courses
      let totalWeightedPoints = 0
      let totalCredits = 0
      
      courses.forEach((course: any) => {
        const credits = typeof course.credits === 'number' ? course.credits : parseFloat(course.credits) || 0
        const gradePoint = typeof course.grade_point === 'number' ? course.grade_point : parseFloat(course.grade_point) || 0
        
        if (credits > 0) {
          totalCredits += credits
          if (gradePoint > 0) {
            totalWeightedPoints += credits * gradePoint
          }
        }
      })
      
      if (totalCredits > 0) {
        computedCgpa = (totalWeightedPoints / totalCredits).toFixed(2)
      }
    }

    // Helper function to convert Roman numerals to numbers
    const romanToNumber = (roman: string): number => {
      const romanMap: { [key: string]: number } = {
        'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
        'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10
      }
      const upperRoman = roman.trim().toUpperCase()
      return romanMap[upperRoman] || 0
    }

    // Extract semester info
    let maxSemester = '1'
    if (extractedData.courses && Array.isArray(extractedData.courses)) {
      const semesters = extractedData.courses
        .map((c: any) => {
          const sem = c.sem?.toString().trim()
          if (!sem) return 0
          
          // Try parsing as number first
          const numSem = parseInt(sem)
          if (!isNaN(numSem) && numSem > 0) return numSem
          
          // Try parsing as Roman numeral
          return romanToNumber(sem)
        })
        .filter((s: number) => s > 0)
      
      if (semesters.length > 0) {
        maxSemester = Math.max(...semesters).toString()
      }
    }

    console.log('Extracted semester:', maxSemester, 'from courses with semesters:', 
      extractedData.courses?.map((c: any) => c.sem).filter(Boolean))

    return NextResponse.json({
      success: true,
      message: 'Marksheet extracted successfully',
      authenticity_checks: {
        fraud_score: fraudScore,
        passed_checks: fraudChecks.filter(c => c.passed).length,
        total_checks: fraudChecks.length,
        failed_checks: failedChecks.length > 0 ? failedChecks.map(c => c.check) : [],
        warnings: failedChecks.length > 0 ? 'Some authenticity checks failed. Please verify the marksheet.' : undefined
      },
      data: {
        fileId,
        extractedData,
        computedCgpa,
        institution: extractedData.institution,
        studentName: extractedData.student_details?.name,
        registerNumber: extractedData.student_details?.register_no,
        dateOfBirth: extractedData.student_details?.date_of_birth,
        department: extractedData.student_details?.programme_branch,
        batch: extractedData.student_details?.regulations?.toString() || extractedData.student_details?.month_year_of_examinations,
        academicYear: extractedData.student_details?.month_year_of_examinations || extractedData.student_details?.regulations?.toString(),
        semester: maxSemester,
        totalCreditsEarned: extractedData.summary?.credits_earned,
        totalCreditsRegistered: extractedData.summary?.credits_registered,
      }
    })
  } catch (error: any) {
    console.error('extract-marksheet error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to extract marksheet data' },
      { status: 500 }
    )
  }
}
