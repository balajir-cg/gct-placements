'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, FileText, CheckCircle, XCircle, Eye, Save } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function MarksheetUploadPage() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [academicRecord, setAcademicRecord] = useState<any>(null)
  const [showFullData, setShowFullData] = useState(false)
  const [fileId, setFileId] = useState<string | null>(null)
  const [isReviewMode, setIsReviewMode] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(selectedFile.type)) {
        setMessage({
          type: 'error',
          text: 'Please upload a valid image file (JPEG, PNG, or WebP)'
        })
        return
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: 'File size must be less than 5MB'
        })
        return
      }
      
      setFile(selectedFile)
      setMessage(null)
      setExtractedData(null)
      setAcademicRecord(null)
    }
  }

  const handleUpload = async () => {
    if (!file || !user) {
      setMessage({
        type: 'error',
        text: 'Please select a file and ensure you are logged in'
      })
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(10)
      setMessage({ type: 'info', text: 'Uploading marksheet...' })

      // Step 1: Upload file to Appwrite storage
      const uploadResult = await DatabaseService.uploadFile(file)
      const uploadedFileId = uploadResult.$id
      setFileId(uploadedFileId)
      
      setUploadProgress(30)
      setMessage({ type: 'info', text: 'Marksheet uploaded. Extracting data with AI...' })

      // Step 2: Extract data from marksheet (no save yet)
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
        throw new Error(result.error || 'Failed to extract marksheet data')
      }

      setUploadProgress(100)
      setExtractedData(result.data.extractedData)
      setAcademicRecord({
        computedCgpa: result.data.computedCgpa,
        institution: result.data.institution,
        studentName: result.data.studentName,
        registerNumber: result.data.registerNumber,
        dateOfBirth: result.data.dateOfBirth,
        department: result.data.department,
        batch: result.data.batch,
        academicYear: result.data.academicYear,
        semester: result.data.semester,
        totalCreditsEarned: result.data.totalCreditsEarned,
        totalCreditsRegistered: result.data.totalCreditsRegistered,
      })

      setIsReviewMode(true)
      setMessage({
        type: 'success',
        text: 'Data extracted successfully! Please review and click "Save to Profile" to confirm.'
      })
      
      // Reset file input
      setFile(null)
      const fileInput = document.getElementById('marksheet-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
    } catch (error: any) {
      console.error('Upload error:', error)
      
      // Provide helpful error messages
      let errorMessage = error.message || 'Failed to upload and extract marksheet data'
      
      // Check for common AI service errors
      if (errorMessage.includes('service is currently unavailable') || 
          errorMessage.includes('No instances available') ||
          errorMessage.includes('503')) {
        errorMessage = '⚠️ The AI vision service is temporarily overloaded. Please wait 1-2 minutes and try again. This happens with free AI models during peak hours.'
      } else if (errorMessage.includes('Failed to extract marksheet')) {
        errorMessage = errorMessage + ' The free AI service may be experiencing high traffic. Please try again in a few minutes.'
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      })
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveToProfile = async () => {
    if (!user || !fileId || !extractedData || !academicRecord) {
      setMessage({
        type: 'error',
        text: 'Missing required data. Please upload a marksheet first.'
      })
      return
    }

    try {
      setIsSaving(true)
      setMessage({ type: 'info', text: 'Saving to database and updating profile...' })

      const saveResp = await fetch('/api/save-academic-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.$id,
          fileId,
          extractedData,
          academicInfo: academicRecord
        })
      })

      const result = await saveResp.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to save academic data')
      }

      setMessage({
        type: 'success',
        text: 'Academic data saved successfully! Your profile has been updated.'
      })
      setIsReviewMode(false)
      
    } catch (error: any) {
      console.error('Save error:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Failed to save academic data'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadExistingRecord = async () => {
    if (!user) return

    try {
      setMessage({ type: 'info', text: 'Loading your academic record...' })
      const result = await DatabaseService.getAcademicRecord(user.$id)

      if (result.success && result.data) {
        const record = result.data as any
        setAcademicRecord({
          computedCgpa: record.computedCgpa,
          institution: record.institution,
          studentName: record.studentName,
          registerNumber: record.registerNumber,
          dateOfBirth: record.dateOfBirth,
          department: record.department,
          batch: record.batch,
          academicYear: record.academicYear,
          semester: record.semester,
          totalCreditsEarned: record.totalCreditsEarned,
          totalCreditsRegistered: record.totalCreditsRegistered,
          recordId: record.$id
        })
        
        try {
          const parsed = JSON.parse(record.extractedData)
          setExtractedData(parsed)
        } catch (e) {
          console.error('Failed to parse extracted data:', e)
        }

        setIsReviewMode(false) // Existing record, no review needed
        setMessage({
          type: 'success',
          text: 'Academic record loaded successfully'
        })
      } else {
        setMessage({
          type: 'info',
          text: 'No academic record found. Please upload your marksheet.'
        })
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to load academic record'
      })
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marksheet Upload & Processing</h1>
        <p className="text-muted-foreground">
          Upload your academic marksheet to automatically extract data and calculate CGPA
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Marksheet
            </CardTitle>
            <CardDescription>
              Upload a clear image of your academic marksheet (JPEG, PNG, or WebP)
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
                disabled={isUploading}
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {uploadProgress}% - Processing...
                </p>
              </div>
            )}

            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
                {message.type === 'error' && <XCircle className="h-4 w-4" />}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Process
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleLoadExistingRecord}
                disabled={isUploading}
              >
                <FileText className="mr-2 h-4 w-4" />
                Load Existing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Extracted Summary
            </CardTitle>
            <CardDescription>
              Quick overview of extracted data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {academicRecord ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Computed CGPA</p>
                    <p className="text-2xl font-bold text-primary">
                      {academicRecord.computedCgpa}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credits</p>
                    <p className="text-lg font-semibold">
                      {academicRecord.totalCreditsEarned} / {academicRecord.totalCreditsRegistered}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Student Name</p>
                    <p className="font-medium">{academicRecord.studentName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Register Number</p>
                    <p className="font-medium">{academicRecord.registerNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{academicRecord.department || 'N/A'}</p>
                  </div>
                </div>

                {isReviewMode && (
                  <>
                    <Separator />
                    <Button 
                      onClick={handleSaveToProfile} 
                      disabled={isSaving}
                      className="w-full"
                      size="lg"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving to Profile...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save to Profile
                        </>
                      )}
                    </Button>
                  </>
                )}

                {academicRecord.recordId && !isReviewMode && (
                  <>
                    <Separator />
                    <div>
                      <Badge variant="outline" className="text-xs">
                        Record ID: {academicRecord.recordId}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No data extracted yet</p>
                <p className="text-sm">Upload a marksheet to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Review Section */}
      {extractedData && isReviewMode && (
        <div className="mt-6 space-y-6">
          {/* Institution Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Institution Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Institution</p>
                  <p className="font-medium">{extractedData.institution || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Affiliation</p>
                  <p className="font-medium">{extractedData.affiliation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{extractedData.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statement Type</p>
                  <p className="font-medium">{extractedData.statement_type || 'N/A'}</p>
                </div>
                {extractedData.si_no && (
                  <div>
                    <p className="text-sm text-muted-foreground">SI No.</p>
                    <p className="font-medium">{extractedData.si_no}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Student Details */}
          {extractedData.student_details && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{extractedData.student_details.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Register Number</p>
                    <p className="font-medium">{extractedData.student_details.register_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{extractedData.student_details.date_of_birth || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{extractedData.student_details.gender || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Programme & Branch</p>
                    <p className="font-medium">{extractedData.student_details.programme_branch || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Month/Year of Examinations</p>
                    <p className="font-medium">{extractedData.student_details.month_year_of_examinations || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Regulations</p>
                    <p className="font-medium">{extractedData.student_details.regulations || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Academic Summary */}
          {extractedData.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Academic Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">CGPA</p>
                    <p className="text-3xl font-bold text-primary">
                      {extractedData.summary.cumulative_grade_point_average?.toFixed(2) || academicRecord?.computedCgpa || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Credits Earned</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {extractedData.summary.credits_earned || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Credits Registered</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {extractedData.summary.credits_registered || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Grade Points</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {extractedData.summary.weighted_grade_points_earned?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                </div>
                {extractedData.summary.cumulative_credits_earned && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Cumulative Credits</p>
                    <p className="font-medium">{extractedData.summary.cumulative_credits_earned}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Courses Table */}
          {extractedData.courses && Array.isArray(extractedData.courses) && extractedData.courses.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Course Details
                    </CardTitle>
                    <CardDescription>
                      Total Courses: {extractedData.courses.length}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {extractedData.courses.filter((c: any) => c.result === 'PASS' || c.result === 'P').length} Passed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full">
                  <div className="space-y-3">
                    {extractedData.courses.map((course: any, index: number) => (
                      <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-base">{course.course_title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {course.course_code}
                                </p>
                              </div>
                              <Badge variant={course.result === 'PASS' || course.result === 'P' ? 'default' : 'destructive'}>
                                {course.letter_grade}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Semester:</span>{' '}
                                <span className="font-medium">{course.sem || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Credits:</span>{' '}
                                <span className="font-medium">{course.credits || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Grade Point:</span>{' '}
                                <span className="font-medium">{course.grade_point || 'N/A'}</span>
                              </div>
                              {course.attendance_grade && (
                                <div>
                                  <span className="text-muted-foreground">Attendance:</span>{' '}
                                  <span className="font-medium">{course.attendance_grade}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Result:</span>{' '}
                                <span className={`font-medium ${course.result === 'PASS' || course.result === 'P' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {course.result || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Footer Information */}
          {extractedData.footer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Official Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extractedData.footer.medium_of_instruction && (
                    <div>
                      <p className="text-sm text-muted-foreground">Medium of Instruction</p>
                      <p className="font-medium">{extractedData.footer.medium_of_instruction}</p>
                    </div>
                  )}
                  {extractedData.footer.seal_and_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Seal & Date</p>
                      <p className="font-medium">{extractedData.footer.seal_and_date}</p>
                    </div>
                  )}
                  {extractedData.footer.controller_of_examinations && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Controller of Examinations</p>
                      <p className="font-medium">{extractedData.footer.controller_of_examinations}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw JSON Data (Collapsible) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Raw Extracted Data (JSON)
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFullData(!showFullData)}
                >
                  {showFullData ? 'Hide' : 'Show'} JSON
                </Button>
              </div>
              <CardDescription>
                Complete structured data for developers
              </CardDescription>
            </CardHeader>
            {showFullData && (
              <CardContent>
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <pre className="text-xs">
                    {JSON.stringify(extractedData, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Detailed View for Existing Records (Not in Review Mode) */}
      {extractedData && !isReviewMode && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Saved Academic Record</h2>
            <Badge variant="outline" className="text-sm">
              Verified & Saved
            </Badge>
          </div>

          {/* Institution Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Institution Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Institution</p>
                  <p className="font-medium">{extractedData.institution || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Affiliation</p>
                  <p className="font-medium">{extractedData.affiliation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{extractedData.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statement Type</p>
                  <p className="font-medium">{extractedData.statement_type || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Details */}
          {extractedData.student_details && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{extractedData.student_details.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Register Number</p>
                    <p className="font-medium">{extractedData.student_details.register_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{extractedData.student_details.date_of_birth || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{extractedData.student_details.gender || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Programme & Branch</p>
                    <p className="font-medium">{extractedData.student_details.programme_branch || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Regulations</p>
                    <p className="font-medium">{extractedData.student_details.regulations || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Exam Month/Year</p>
                    <p className="font-medium">{extractedData.student_details.month_year_of_examinations || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Academic Summary */}
          {extractedData.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Academic Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">CGPA</p>
                    <p className="text-3xl font-bold text-primary">
                      {extractedData.summary.cumulative_grade_point_average?.toFixed(2) || academicRecord?.computedCgpa || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Credits Earned</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {extractedData.summary.credits_earned || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Credits Registered</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {extractedData.summary.credits_registered || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Grade Points</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {extractedData.summary.weighted_grade_points_earned?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                </div>
                {extractedData.summary.cumulative_credits_earned && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Cumulative Credits</p>
                    <p className="font-medium">{extractedData.summary.cumulative_credits_earned}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Courses Table */}
          {extractedData.courses && Array.isArray(extractedData.courses) && extractedData.courses.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Course Details
                    </CardTitle>
                    <CardDescription>
                      Total Courses: {extractedData.courses.length}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {extractedData.courses.filter((c: any) => c.result === 'PASS' || c.result === 'P').length} Passed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full">
                  <div className="space-y-3">
                    {extractedData.courses.map((course: any, index: number) => (
                      <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-base">{course.course_title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {course.course_code}
                                </p>
                              </div>
                              <Badge variant={course.result === 'PASS' || course.result === 'P' ? 'default' : 'destructive'}>
                                {course.letter_grade}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Semester:</span>{' '}
                                <span className="font-medium">{course.sem || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Credits:</span>{' '}
                                <span className="font-medium">{course.credits || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Grade Point:</span>{' '}
                                <span className="font-medium">{course.grade_point || 'N/A'}</span>
                              </div>
                              {course.attendance_grade && (
                                <div>
                                  <span className="text-muted-foreground">Attendance:</span>{' '}
                                  <span className="font-medium">{course.attendance_grade}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Result:</span>{' '}
                                <span className={`font-medium ${course.result === 'PASS' || course.result === 'P' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {course.result || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Footer Information */}
          {extractedData.footer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Official Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extractedData.footer.medium_of_instruction && (
                    <div>
                      <p className="text-sm text-muted-foreground">Medium of Instruction</p>
                      <p className="font-medium">{extractedData.footer.medium_of_instruction}</p>
                    </div>
                  )}
                  {extractedData.footer.seal_and_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Seal & Date</p>
                      <p className="font-medium">{extractedData.footer.seal_and_date}</p>
                    </div>
                  )}
                  {extractedData.footer.controller_of_examinations && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Controller of Examinations</p>
                      <p className="font-medium">{extractedData.footer.controller_of_examinations}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw JSON Data (Collapsible) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Raw Extracted Data (JSON)
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFullData(!showFullData)}
                >
                  {showFullData ? 'Hide' : 'Show'} JSON
                </Button>
              </div>
              <CardDescription>
                Complete structured data for developers
              </CardDescription>
            </CardHeader>
            {showFullData && (
              <CardContent>
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <pre className="text-xs">
                    {JSON.stringify(extractedData, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Take a clear, well-lit photo of your complete academic marksheet</li>
            <li>Ensure all text is readable and not blurred</li>
            <li>Upload the image using the form above (max 5MB)</li>
            <li>The AI will extract all course details, credits, and grades</li>
            <li>CGPA is calculated using: Σ(credits × grade_point) / Σ(total credits registered)</li>
            <li>Failed courses are included in total credits but contribute 0 to weighted points</li>
            <li>Your data is securely stored and can be accessed anytime</li>
            <li>Use "Load Existing" button to view previously uploaded records</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
