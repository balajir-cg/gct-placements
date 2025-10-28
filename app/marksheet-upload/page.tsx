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
      setMessage({
        type: 'error',
        text: error.message || 'Failed to upload and extract marksheet data'
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
              Extracted Information
            </CardTitle>
            <CardDescription>
              AI-extracted data from your marksheet
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
                  <div>
                    <p className="text-sm text-muted-foreground">Batch/Regulation</p>
                    <p className="font-medium">{academicRecord.batch || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{academicRecord.dateOfBirth || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Academic Year</p>
                    <p className="font-medium">{academicRecord.academicYear || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Semester</p>
                    <p className="font-medium">{academicRecord.semester || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Institution</p>
                    <p className="font-medium text-sm">{academicRecord.institution || 'N/A'}</p>
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

      {/* Full Extracted Data Section */}
      {extractedData && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Full Extracted Data
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullData(!showFullData)}
              >
                {showFullData ? 'Hide' : 'Show'} Details
              </Button>
            </div>
            <CardDescription>
              Complete structured data extracted from the marksheet
            </CardDescription>
          </CardHeader>
          {showFullData && (
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <pre className="text-xs">
                  {JSON.stringify(extractedData, null, 2)}
                </pre>
              </ScrollArea>

              {extractedData.courses && Array.isArray(extractedData.courses) && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Course Summary</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Total Courses: {extractedData.courses.length}
                  </p>
                  <ScrollArea className="h-[300px] w-full">
                    <div className="space-y-2">
                      {extractedData.courses.map((course: any, index: number) => (
                        <Card key={index} className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{course.course_title}</p>
                              <p className="text-xs text-muted-foreground">
                                {course.course_code} • Sem {course.sem}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={course.result === 'PASS' ? 'default' : 'destructive'}>
                                {course.letter_grade}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {course.credits} credits • GP: {course.grade_point}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          )}
        </Card>
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
