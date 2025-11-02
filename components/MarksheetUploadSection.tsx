'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Upload, FileText, CheckCircle, XCircle, Save, Eye, Edit } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DatabaseService } from '@/lib/database'

interface MarksheetData {
  studentName: string
  registerNumber: string
  department: string
  batch: string
  dateOfBirth: string
  academicYear: string
  semester: string
  computedCgpa: string
  totalCreditsEarned: string
  totalCreditsRegistered: string
  institution: string
  historyOfArrearsCount: number
  currentArrearsCount: number
}

interface MarksheetUploadSectionProps {
  userId: string
  currentRollNo?: string // Add current user's roll number for validation
  onDataExtracted: (data: MarksheetData, rawData: any) => void
  disabled?: boolean
}

export default function MarksheetUploadSection({ userId, currentRollNo, onDataExtracted, disabled }: MarksheetUploadSectionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [marksheetData, setMarksheetData] = useState<MarksheetData | null>(null)
  const [fileId, setFileId] = useState<string | null>(null)
  const [showFullData, setShowFullData] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [authenticityChecks, setAuthenticityChecks] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(selectedFile.type)) {
      setMessage({
        type: 'error',
        text: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      })
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'File size exceeds 10MB. Please upload a smaller file.'
      })
      return
    }

    setFile(selectedFile)
    setMessage(null)
  }

  const calculateArrears = (courses: any[]): { historyCount: number, currentCount: number } => {
    let historyCount = 0
    let currentCount = 0

    // Group courses by course code to track re-attempts
    const courseMap = new Map<string, any[]>()
    
    courses.forEach(course => {
      const code = course.course_code
      if (!courseMap.has(code)) {
        courseMap.set(code, [])
      }
      courseMap.get(code)!.push(course)
    })

    // Check each course group
    courseMap.forEach((attempts, courseCode) => {
      // Sort by semester to get chronological order
      attempts.sort((a, b) => parseInt(a.sem) - parseInt(b.sem))
      
      let hadArrear = false
      let isCleared = false

      attempts.forEach(attempt => {
        const result = (attempt.result || '').toLowerCase()
        const grade = (attempt.letter_grade || '').toUpperCase()
        
        // Check if it's a fail/arrear
        if (result.includes('fail') || result === 'ra' || grade === 'RA' || grade === 'F' || grade === 'U' || grade === 'W' || grade === 'AB') {
          hadArrear = true
        } else if (hadArrear && (result.includes('pass') || grade === 'P' || (grade !== 'RA' && grade !== 'F' && grade !== 'U' && grade !== 'W' && grade !== 'AB'))) {
          // If had arrear before and now passed
          isCleared = true
        }
      })

      if (hadArrear) {
        historyCount++ // Increment history for any course that ever had an arrear
        if (!isCleared) {
          currentCount++ // Only count as current if not cleared yet
        }
      }
    })

    return { historyCount, currentCount }
  }

  const handleExtract = async () => {
    if (!file) {
      setMessage({
        type: 'error',
        text: 'Please select a marksheet file first'
      })
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(10)
      setMessage({ type: 'info', text: 'Uploading marksheet...' })

      // Step 1: Upload file to Appwrite storage using DatabaseService
      const uploadResult = await DatabaseService.uploadFile(file)
      const uploadedFileId = uploadResult.$id
      setFileId(uploadedFileId)
      
      setUploadProgress(30)
      setMessage({ type: 'info', text: 'Marksheet uploaded. Extracting data with AI...' })

      // Step 2: Extract data from marksheet
      const extractResp = await fetch('/api/extract-marksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: uploadedFileId
        })
      })

      setUploadProgress(80)

      const result = await extractResp.json()

      if (!result.success) {
        // Check if it's a fraud detection error
        if (result.fraud_detected) {
          setMessage({
            type: 'error',
            text: `🚨 FRAUD ALERT: ${result.message}\n\nFailed checks:\n${result.failed_checks.join('\n')}\n\nFraud Score: ${result.fraud_score.toFixed(1)}%`
          })
          setUploadProgress(0)
          setFile(null)
          const fileInput = document.getElementById('marksheet-input') as HTMLInputElement
          if (fileInput) fileInput.value = ''
          setIsUploading(false)
          return
        }
        throw new Error(result.error || 'Failed to extract marksheet data')
      }

      setUploadProgress(100)
      
      const extracted = result.data.extractedData
      setExtractedData(extracted)

      // Check for authenticity warnings
      const authenticityData = result.authenticity_checks
      setAuthenticityChecks(authenticityData)
      if (authenticityData && authenticityData.warnings) {
        console.warn('⚠️ Authenticity warnings:', authenticityData)
      }

      // Calculate arrears from courses
      const courses = extracted.courses || []
      const arrears = calculateArrears(courses)

      // Prepare marksheet data
      const data: MarksheetData = {
        studentName: result.data.studentName || extracted.student_details?.name || '',
        registerNumber: result.data.registerNumber || extracted.student_details?.register_no || '',
        department: result.data.department || extracted.student_details?.programme_branch || '',
        batch: result.data.batch || extracted.student_details?.regulations || '',
        dateOfBirth: result.data.dateOfBirth || extracted.student_details?.date_of_birth || '',
        academicYear: result.data.academicYear || extracted.student_details?.month_year_of_examinations || '',
        semester: result.data.semester || '',
        computedCgpa: result.data.computedCgpa || '',
        totalCreditsEarned: result.data.totalCreditsEarned || extracted.summary?.credits_earned?.toString() || '0',
        totalCreditsRegistered: result.data.totalCreditsRegistered || extracted.summary?.credits_registered?.toString() || '0',
        institution: result.data.institution || extracted.institution || '',
        historyOfArrearsCount: arrears.historyCount,
        currentArrearsCount: arrears.currentCount
      }

      // Validate critical fields
      if (!data.registerNumber) {
        throw new Error('Could not extract register number from marksheet. Please ensure the image is clear and try again.');
      }

      if (!data.semester || parseInt(data.semester) < 1 || parseInt(data.semester) > 8) {
        throw new Error(`Invalid semester number detected: ${data.semester}. Expected a value between 1 and 8.`);
      }

      setMarksheetData(data)

      setMessage({
        type: 'success',
        text: `Data extracted successfully! Student: ${data.studentName} (${data.registerNumber}), Semester ${data.semester}. Review the information below.`
      })
      
      // Reset file input
      setFile(null)
      const fileInput = document.getElementById('marksheet-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
    } catch (error: any) {
      console.error('Extract error:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Failed to extract marksheet data'
      })
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUseData = () => {
    if (marksheetData && extractedData) {
      setIsEditing(false)
      onDataExtracted(marksheetData, extractedData)
      setMessage({
        type: 'success',
        text: 'Marksheet data ready to save. Click "Save Changes" to update your profile.'
      })
    }
  }

  const handleEditField = (field: keyof MarksheetData, value: string | number) => {
    if (marksheetData) {
      setMarksheetData({
        ...marksheetData,
        [field]: value
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Marksheet for Auto-Fill
          </CardTitle>
          <CardDescription>
            Upload your semester marksheet to automatically extract and fill academic details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="marksheet-input">Select Marksheet Image</Label>
            <Input
              id="marksheet-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isUploading || disabled}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, WebP (Max 10MB)
            </p>
          </div>

          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-center text-muted-foreground">
                {uploadProgress}% - Processing...
              </p>
            </div>
          )}

          {message && (
            <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
              {message.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : message.type === 'error' ? <XCircle className="h-4 w-4 text-red-600" /> : <FileText className="h-4 w-4 text-blue-600" />}
              <AlertDescription className={message.type === 'success' ? 'text-green-700' : message.type === 'error' ? 'text-red-700' : 'text-blue-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleExtract}
            disabled={!file || isUploading || disabled}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting Data...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Extract Marksheet Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Extracted Data Preview */}
      {marksheetData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <CardTitle>Extracted Academic Information</CardTitle>
                </div>
                <CardDescription>
                  Review the extracted data before using it to fill your profile
                </CardDescription>
                {/* Authenticity Badge */}
                {authenticityChecks && (
                  <div className="mt-3 flex items-center gap-2">
                    {authenticityChecks.failed_checks && authenticityChecks.failed_checks.length > 0 ? (
                      <Badge variant="outline" className="border-yellow-600 text-yellow-700 bg-yellow-50">
                        ⚠️ Partial Verification ({authenticityChecks.passed_checks}/{authenticityChecks.total_checks} checks passed)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-green-600 text-green-700 bg-green-50">
                        ✓ Verified GCT Marksheet ({authenticityChecks.passed_checks}/{authenticityChecks.total_checks} checks passed)
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Fraud Score: {authenticityChecks.fraud_score?.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Validation Warning */}
            {currentRollNo && marksheetData.registerNumber && 
             currentRollNo.trim().toUpperCase() !== marksheetData.registerNumber.trim().toUpperCase() && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>Warning:</strong> This marksheet appears to belong to {marksheetData.registerNumber}, 
                  but your profile shows {currentRollNo}. Please ensure you're uploading your own marksheet.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Student Name</Label>
                {isEditing ? (
                  <Input
                    value={marksheetData.studentName}
                    onChange={(e) => handleEditField('studentName', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{marksheetData.studentName}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Register Number</Label>
                {isEditing ? (
                  <Input
                    value={marksheetData.registerNumber}
                    onChange={(e) => handleEditField('registerNumber', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{marksheetData.registerNumber}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Department</Label>
                {isEditing ? (
                  <Input
                    value={marksheetData.department}
                    onChange={(e) => handleEditField('department', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{marksheetData.department}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Batch/Regulation</Label>
                {isEditing ? (
                  <Input
                    value={marksheetData.batch}
                    onChange={(e) => handleEditField('batch', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{marksheetData.batch}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Date of Birth</Label>
                {isEditing ? (
                  <Input
                    value={marksheetData.dateOfBirth}
                    onChange={(e) => handleEditField('dateOfBirth', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{marksheetData.dateOfBirth}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Semester</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={marksheetData.semester}
                    onChange={(e) => handleEditField('semester', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{marksheetData.semester}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">CGPA (Up to Sem {marksheetData.semester})</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={marksheetData.computedCgpa}
                    onChange={(e) => handleEditField('computedCgpa', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <Badge variant="secondary" className="text-lg">
                    {marksheetData.computedCgpa}
                  </Badge>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Credits Earned / Registered</Label>
                {isEditing ? (
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      value={marksheetData.totalCreditsEarned}
                      onChange={(e) => handleEditField('totalCreditsEarned', e.target.value)}
                      placeholder="Earned"
                    />
                    <span className="self-center">/</span>
                    <Input
                      type="number"
                      value={marksheetData.totalCreditsRegistered}
                      onChange={(e) => handleEditField('totalCreditsRegistered', e.target.value)}
                      placeholder="Registered"
                    />
                  </div>
                ) : (
                  <p className="font-medium">
                    {marksheetData.totalCreditsEarned} / {marksheetData.totalCreditsRegistered}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">History of Arrears</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    value={marksheetData.historyOfArrearsCount}
                    onChange={(e) => handleEditField('historyOfArrearsCount', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                ) : (
                  <Badge variant={marksheetData.historyOfArrearsCount > 0 ? "destructive" : "outline"}>
                    {marksheetData.historyOfArrearsCount} arrear(s)
                  </Badge>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Current Arrears</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    value={marksheetData.currentArrearsCount}
                    onChange={(e) => handleEditField('currentArrearsCount', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                ) : (
                  <Badge variant={marksheetData.currentArrearsCount > 0 ? "destructive" : "default"}>
                    {marksheetData.currentArrearsCount} active
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {isEditing ? (
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleUseData} className="flex-1" size="lg">
                  <Save className="mr-2 h-4 w-4" />
                  Save & Use Data
                </Button>
              </div>
            ) : (
              <Button onClick={handleUseData} className="w-full" size="lg">
                <Save className="mr-2 h-4 w-4" />
                Use This Data to Fill Profile
              </Button>
            )}

            {extractedData && (
              <div className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFullData(!showFullData)}
                  className="w-full"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showFullData ? 'Hide' : 'Show'} Full Extracted Data
                </Button>
                
                {showFullData && (
                  <ScrollArea className="h-96 w-full rounded-md border p-4 mt-2">
                    <pre className="text-xs">{JSON.stringify(extractedData, null, 2)}</pre>
                  </ScrollArea>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
