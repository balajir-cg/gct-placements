/**
 * Arrears Service
 * 
 * Manages individual arrear paper tracking with proper clearance detection
 */

import { databases } from './appwrite'
import { ID, Query } from 'appwrite'

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
const ARREARS_COLLECTION_ID = 'arrears'

export interface ArrearRecord {
  $id?: string
  userId: string
  studentName: string
  registerNumber: string
  courseCode: string
  courseName: string
  credits?: string
  failedSemester: number
  failedAcademicYear?: string
  failedGrade?: string
  isCleared: boolean
  clearedSemester?: number
  clearedAcademicYear?: string
  clearedGrade?: string
  createdAt: string
  updatedAt: string
}

export interface CourseResult {
  course_code: string
  course_name: string
  credits?: string
  result?: string
  letter_grade?: string
  grade?: string
}

/**
 * Check if a course result indicates failure/arrear
 */
export function isCourseFailure(course: CourseResult): boolean {
  const result = (course.result || '').toLowerCase()
  const grade = (course.letter_grade || course.grade || '').toUpperCase()
  
  // Check for explicit failure indicators
  return (
    result.includes('fail') ||
    result === 'ra' ||
    grade === 'RA' ||
    grade === 'F' ||
    grade === 'U' ||
    grade === 'W' ||
    grade === 'AB'
  )
}

/**
 * Check if a course result indicates passing
 */
export function isCoursePass(course: CourseResult): boolean {
  const result = (course.result || '').toLowerCase()
  const grade = (course.letter_grade || course.grade || '').toUpperCase()
  
  // Passing if explicitly marked pass, or has a valid passing grade
  const passingGrades = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'S']
  
  return (
    result.includes('pass') ||
    result === 'p' ||
    passingGrades.includes(grade)
  )
}

/**
 * Get all arrear records for a user
 */
export async function getUserArrears(userId: string): Promise<ArrearRecord[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      ARREARS_COLLECTION_ID,
      [Query.equal('userId', userId), Query.orderDesc('failedSemester')]
    )
    return response.documents as unknown as ArrearRecord[]
  } catch (error) {
    console.error('Error fetching user arrears:', error)
    return []
  }
}

/**
 * Get active (uncleared) arrears for a user
 */
export async function getActiveArrears(userId: string): Promise<ArrearRecord[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      ARREARS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('isCleared', false),
        Query.orderDesc('failedSemester')
      ]
    )
    return response.documents as unknown as ArrearRecord[]
  } catch (error) {
    console.error('Error fetching active arrears:', error)
    return []
  }
}

/**
 * Sanitize credits value to be a valid string (max 10 chars)
 */
function sanitizeCredits(credits: any): string {
  if (!credits) return '0'
  
  // Convert to string and trim
  let creditsStr = String(credits).trim()
  
  // If it's too long, truncate to 10 chars
  if (creditsStr.length > 10) {
    creditsStr = creditsStr.substring(0, 10)
  }
  
  return creditsStr || '0'
}

/**
 * Sanitize grade value to be a valid string (max 10 chars)
 */
function sanitizeGrade(grade: any): string {
  if (!grade) return 'F'
  
  // Convert to string and trim
  let gradeStr = String(grade).trim().toUpperCase()
  
  // If it's too long, truncate to 10 chars
  if (gradeStr.length > 10) {
    gradeStr = gradeStr.substring(0, 10)
  }
  
  return gradeStr || 'F'
}

/**
 * Normalize course code for consistent matching
 * Removes spaces, special characters, converts to uppercase
 * Example: "CS 101" -> "CS101", "cs-101" -> "CS101"
 */
function normalizeCourseCode(courseCode: string): string {
  if (!courseCode) return ''
  
  return courseCode
    .trim()
    .toUpperCase()
    .replace(/[\s\-_\.]/g, '') // Remove spaces, hyphens, underscores, dots
    .replace(/[^A-Z0-9]/g, '') // Remove any other special characters
}

/**
 * Normalize register number for consistent matching
 * Removes spaces, special characters, converts to uppercase
 * Example: "21CS 001" -> "21CS001", "21-cs-001" -> "21CS001"
 */
function normalizeRegisterNumber(registerNumber: string): string {
  if (!registerNumber) return ''
  
  return registerNumber
    .trim()
    .toUpperCase()
    .replace(/[\s\-_\.]/g, '') // Remove spaces, hyphens, underscores, dots
    .replace(/[^A-Z0-9]/g, '') // Remove any other special characters
}

/**
 * Create a new arrear record
 */
export async function createArrearRecord(arrear: Omit<ArrearRecord, '$id' | 'createdAt' | 'updatedAt'>): Promise<ArrearRecord | null> {
  try {
    const now = new Date().toISOString()
    
    // Sanitize and normalize the data before creating document
    const sanitizedArrear = {
      ...arrear,
      courseCode: normalizeCourseCode(arrear.courseCode),
      registerNumber: normalizeRegisterNumber(arrear.registerNumber),
      credits: sanitizeCredits(arrear.credits),
      failedGrade: sanitizeGrade(arrear.failedGrade),
      createdAt: now,
      updatedAt: now
    }
    
    console.log(`  🔄 Normalized: ${arrear.courseCode} -> ${sanitizedArrear.courseCode}`)
    console.log(`  🔄 Normalized: ${arrear.registerNumber} -> ${sanitizedArrear.registerNumber}`)
    
    const response = await databases.createDocument(
      DATABASE_ID,
      ARREARS_COLLECTION_ID,
      ID.unique(),
      sanitizedArrear
    )
    return response as unknown as ArrearRecord
  } catch (error) {
    console.error('Error creating arrear record:', error)
    return null
  }
}

/**
 * Mark an arrear as cleared
 */
export async function markArrearCleared(
  arrearId: string,
  clearedSemester: number,
  clearedGrade: string,
  clearedAcademicYear?: string
): Promise<boolean> {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      ARREARS_COLLECTION_ID,
      arrearId,
      {
        isCleared: true,
        clearedSemester,
        clearedGrade: sanitizeGrade(clearedGrade),
        clearedAcademicYear,
        updatedAt: new Date().toISOString()
      }
    )
    return true
  } catch (error) {
    console.error('Error marking arrear as cleared:', error)
    return false
  }
}

/**
 * Find an existing arrear record by course code
 * Uses normalized course code for consistent matching
 */
export async function findArrearByCourse(
  userId: string,
  courseCode: string
): Promise<ArrearRecord | null> {
  try {
    const normalizedCode = normalizeCourseCode(courseCode)
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      ARREARS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('courseCode', normalizedCode),
        Query.limit(1)
      ]
    )
    return response.documents.length > 0 
      ? (response.documents[0] as unknown as ArrearRecord)
      : null
  } catch (error) {
    console.error('Error finding arrear by course:', error)
    return null
  }
}

/**
 * Process marksheet courses and update arrear records
 * Returns { historyCount, currentCount }
 */
export async function processMarksheetArrears(
  userId: string,
  studentName: string,
  registerNumber: string,
  semester: number,
  academicYear: string,
  courses: CourseResult[]
): Promise<{ historyCount: number; currentCount: number }> {
  try {
    console.log(`Processing arrears for user ${userId}, semester ${semester}`)
    console.log(`Register Number: ${registerNumber} -> ${normalizeRegisterNumber(registerNumber)}`)
    console.log(`Number of courses to process: ${courses.length}`)
    
    // Track processed courses to avoid duplicates in the same marksheet
    const processedCourses = new Set<string>()
    
    // Process each course in the marksheet
    for (const course of courses) {
      const courseCode = course.course_code
      const courseName = course.course_name || course.course_code || 'Unknown Course'
      
      // Skip if no course code
      if (!courseCode) {
        console.warn('Skipping course with no course code:', course)
        continue
      }
      
      // Normalize the course code
      const normalizedCourseCode = normalizeCourseCode(courseCode)
      
      // Skip if we've already processed this course in this marksheet
      if (processedCourses.has(normalizedCourseCode)) {
        console.log(`  ⚠️  Duplicate course in same marksheet (skipping): ${courseCode} -> ${normalizedCourseCode}`)
        continue
      }
      
      // Mark this course as processed
      processedCourses.add(normalizedCourseCode)
      
      console.log(`Processing course: ${courseCode} -> ${normalizedCourseCode} - ${courseName}`)
      
      // Check if this course has an existing arrear record (uses normalized code)
      const existingArrear = await findArrearByCourse(userId, courseCode)
      
      if (isCourseFailure(course)) {
        console.log(`  ❌ Course FAILED: ${courseCode}`)
        // Student failed this course
        if (!existingArrear) {
          console.log(`  📝 Creating new arrear record`)
          
          // Prepare and validate data
          const creditsValue = sanitizeCredits(course.credits)
          const gradeValue = sanitizeGrade(course.letter_grade || course.grade)
          
          console.log(`  Credits: ${creditsValue}, Grade: ${gradeValue}`)
          
          // New arrear - create record
          const created = await createArrearRecord({
            userId,
            studentName,
            registerNumber,
            courseCode,
            courseName,
            credits: creditsValue,
            failedSemester: semester,
            failedAcademicYear: academicYear,
            failedGrade: gradeValue,
            isCleared: false
          })
          
          if (!created) {
            console.error(`  ❌ Failed to create arrear record for ${courseCode}`)
          }
        } else {
          console.log(`  ℹ️  Arrear record already exists`)
        }
        // If arrear already exists and is not cleared, no action needed
        
      } else if (isCoursePass(course) && existingArrear && !existingArrear.isCleared) {
        console.log(`  ✅ Course PASSED (previously failed): ${courseCode}`)
        console.log(`  🔄 Marking arrear as cleared`)
        // Student passed a course they previously failed - mark arrear as cleared
        await markArrearCleared(
          existingArrear.$id!,
          semester,
          course.letter_grade || course.grade || 'P',
          academicYear
        )
      } else if (isCoursePass(course)) {
        console.log(`  ✅ Course PASSED: ${courseCode}`)
      }
    }
    
    // Get updated arrear counts
    console.log('Fetching updated arrear counts...')
    const allArrears = await getUserArrears(userId)
    const activeArrears = await getActiveArrears(userId)
    
    console.log(`Total arrears (history): ${allArrears.length}`)
    console.log(`Active arrears (current): ${activeArrears.length}`)
    
    return {
      historyCount: allArrears.length,
      currentCount: activeArrears.length
    }
    
  } catch (error: any) {
    console.error('Error processing marksheet arrears:', error)
    console.error('Error details:', error.message)
    // Return 0 counts on error to prevent app from crashing
    return {
      historyCount: 0,
      currentCount: 0
    }
  }
}

/**
 * Get arrear summary for a user
 */
export async function getArrearSummary(userId: string): Promise<{
  totalArrears: number
  activeArrears: number
  clearedArrears: number
  arrearsList: ArrearRecord[]
}> {
  try {
    const allArrears = await getUserArrears(userId)
    const activeArrears = allArrears.filter(a => !a.isCleared)
    const clearedArrears = allArrears.filter(a => a.isCleared)
    
    return {
      totalArrears: allArrears.length,
      activeArrears: activeArrears.length,
      clearedArrears: clearedArrears.length,
      arrearsList: allArrears
    }
  } catch (error) {
    console.error('Error getting arrear summary:', error)
    return {
      totalArrears: 0,
      activeArrears: 0,
      clearedArrears: 0,
      arrearsList: []
    }
  }
}

/**
 * Clean up duplicate arrear records for a user
 * Merges records with the same normalized course code
 * Keeps the oldest record and deletes duplicates
 */
export async function cleanupDuplicateArrears(userId: string): Promise<{
  duplicatesFound: number
  duplicatesRemoved: number
}> {
  try {
    console.log(`🧹 Cleaning up duplicate arrears for user ${userId}`)
    
    const allArrears = await getUserArrears(userId)
    
    // Group arrears by normalized course code
    const arrearsMap = new Map<string, ArrearRecord[]>()
    
    for (const arrear of allArrears) {
      const normalizedCode = normalizeCourseCode(arrear.courseCode)
      if (!arrearsMap.has(normalizedCode)) {
        arrearsMap.set(normalizedCode, [])
      }
      arrearsMap.get(normalizedCode)!.push(arrear)
    }
    
    let duplicatesFound = 0
    let duplicatesRemoved = 0
    
    // Check each course group for duplicates
    for (const [normalizedCode, records] of arrearsMap.entries()) {
      if (records.length > 1) {
        duplicatesFound += records.length - 1
        
        console.log(`  Found ${records.length} records for course: ${normalizedCode}`)
        
        // Sort by creation date (keep oldest)
        records.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        
        const keepRecord = records[0]
        const duplicates = records.slice(1)
        
        console.log(`  Keeping: ${keepRecord.$id} (created: ${keepRecord.createdAt})`)
        
        // Delete duplicates
        for (const duplicate of duplicates) {
          try {
            await databases.deleteDocument(
              DATABASE_ID,
              ARREARS_COLLECTION_ID,
              duplicate.$id!
            )
            console.log(`  ❌ Deleted duplicate: ${duplicate.$id}`)
            duplicatesRemoved++
          } catch (error) {
            console.error(`  Failed to delete duplicate ${duplicate.$id}:`, error)
          }
        }
      }
    }
    
    console.log(`✅ Cleanup complete: ${duplicatesRemoved}/${duplicatesFound} duplicates removed`)
    
    return {
      duplicatesFound,
      duplicatesRemoved
    }
  } catch (error) {
    console.error('Error cleaning up duplicates:', error)
    return {
      duplicatesFound: 0,
      duplicatesRemoved: 0
    }
  }
}
