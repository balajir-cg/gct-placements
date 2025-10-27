'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { OCRService, type AcademicRecord, type SubjectGrade } from '@/lib/ocr-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Save, 
  Trash2,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function UploadMarksheetPage() {
  const router = useRouter();
  const { user } = useAuth();

  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<AcademicRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    const healthy = await OCRService.checkBackendHealth();
    setBackendHealthy(healthy);
    
    if (!healthy) {
      toast.error('Python backend is not running. Please start it first.');
    }
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file.type.match(/image\/(png|jpg|jpeg)|application\/pdf/)) {
      toast.error('Please upload an image (PNG, JPG) or PDF file');
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      toast.error('File size must be less than 16MB');
      return;
    }

    setSelectedFile(file);
    setExtractedData(null);

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    toast.success(`File selected: ${file.name}`);
  };

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Extract marksheet data
  const handleExtract = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    if (!backendHealthy) {
      toast.error('Python backend is not running');
      return;
    }

    setIsExtracting(true);

    try {
      const result = await OCRService.extractMarksheet(selectedFile);

      if (result.success && result.data) {
        setExtractedData(result.data);
        toast.success('Marksheet extracted successfully! Please review the data.');
      } else {
        toast.error(result.message || 'Failed to extract marksheet');
        if (result.errors.length > 0) {
          console.error('Extraction errors:', result.errors);
        }
      }
    } catch (error) {
      console.error('Extraction error:', error);
      toast.error('Failed to extract marksheet. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Update extracted data
  const handleDataChange = (field: keyof AcademicRecord, value: any) => {
    if (!extractedData) return;

    setExtractedData({
      ...extractedData,
      [field]: value,
    });
  };

  // Update subject data
  const handleSubjectChange = (index: number, field: keyof SubjectGrade, value: any) => {
    if (!extractedData) return;

    const updatedSubjects = [...extractedData.subjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [field]: value,
    };

    setExtractedData({
      ...extractedData,
      subjects: updatedSubjects,
    });
  };

  // Save to database
  const handleSave = async () => {
    if (!extractedData || !user) {
      toast.error('Missing data or user information');
      return;
    }

    setIsSaving(true);

    try {
      // Upload file to storage (optional)
      let fileId: string | undefined;
      if (selectedFile) {
        try {
          fileId = await OCRService.uploadMarksheetFile(selectedFile);
        } catch (error) {
          console.warn('File upload failed, continuing without it:', error);
        }
      }

      // Save academic record
      await OCRService.saveAcademicRecord(user.$id, extractedData, fileId);

      toast.success('Academic record saved successfully!');
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setExtractedData(null);

      // Redirect to profile or records page
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save academic record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to upload marksheets</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Upload Marksheet</h1>
          <p className="text-muted-foreground">Extract academic data using AI-powered OCR</p>
        </div>
      </div>

      {/* Backend Status Alert */}
      {backendHealthy === false && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Python backend is not running. Please start it with: <code className="font-mono">cd python-backend && python app.py</code>
            <Button variant="outline" size="sm" className="ml-4" onClick={checkBackendHealth}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {backendHealthy === true && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600 dark:text-green-400">
            Backend is running and ready to process marksheets
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Marksheet
            </CardTitle>
            <CardDescription>
              Upload your semester marksheet (PDF or Image)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-200
                ${dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
                ${selectedFile ? 'bg-green-50 dark:bg-green-950 border-green-500' : ''}
              `}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="image/png,image/jpeg,image/jpg,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 mx-auto text-green-600" />
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG or PDF (max 16MB)
                  </p>
                </div>
              )}
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Marksheet preview" 
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Extract Button */}
            <Button
              onClick={handleExtract}
              disabled={!selectedFile || isExtracting || !backendHealthy}
              className="w-full"
              size="lg"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Extracting Data...
                </>
              ) : (
                <>
                  <Eye className="h-5 w-5 mr-2" />
                  Extract Data
                </>
              )}
            </Button>

            {isExtracting && (
              <div className="space-y-2">
                <Progress value={66} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Processing with DeepSeek-OCR...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Review Extracted Data
            </CardTitle>
            <CardDescription>
              Verify and edit the extracted information before saving
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!extractedData ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No data extracted yet</p>
                <p className="text-sm">Upload and extract a marksheet to see the results</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {/* Confidence Score */}
                <Alert className={(extractedData.confidenceScore || 0) >= 90 ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'}>
                  <AlertCircle className={`h-4 w-4 ${(extractedData.confidenceScore || 0) >= 90 ? 'text-green-600' : 'text-yellow-600'}`} />
                  <AlertDescription className={(extractedData.confidenceScore || 0) >= 90 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
                    Confidence Score: {(extractedData.confidenceScore || 0).toFixed(1)}%
                    {(extractedData.confidenceScore || 0) < 90 && ' - Please review carefully'}
                  </AlertDescription>
                </Alert>

                {/* Student Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground">STUDENT INFORMATION</h3>
                  
                  <div>
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      value={extractedData.studentName}
                      onChange={(e) => handleDataChange('studentName', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="registerNumber">Register Number</Label>
                    <Input
                      id="registerNumber"
                      value={extractedData.registerNumber}
                      onChange={(e) => handleDataChange('registerNumber', e.target.value)}
                      maxLength={12}
                    />
                  </div>

                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={extractedData.department}
                      onChange={(e) => handleDataChange('department', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="batch">Batch</Label>
                      <Input
                        id="batch"
                        value={extractedData.batch}
                        onChange={(e) => handleDataChange('batch', e.target.value)}
                        placeholder="2021-2025"
                      />
                    </div>

                    <div>
                      <Label htmlFor="semester">Semester</Label>
                      <Input
                        id="semester"
                        type="number"
                        min={1}
                        max={8}
                        value={extractedData.semester}
                        onChange={(e) => handleDataChange('semester', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      value={extractedData.academicYear}
                      onChange={(e) => handleDataChange('academicYear', e.target.value)}
                      placeholder="2022-2023"
                    />
                  </div>
                </div>

                {/* Academic Performance */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground">ACADEMIC PERFORMANCE</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="creditsRegistered">Credits Registered</Label>
                      <Input
                        id="creditsRegistered"
                        type="number"
                        step="0.1"
                        value={extractedData.creditsRegistered}
                        onChange={(e) => handleDataChange('creditsRegistered', parseFloat(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="creditsEarned">Credits Earned</Label>
                      <Input
                        id="creditsEarned"
                        type="number"
                        step="0.1"
                        value={extractedData.creditsEarned}
                        onChange={(e) => handleDataChange('creditsEarned', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="weightedGradePoints">Weighted Grade Points</Label>
                    <Input
                      id="weightedGradePoints"
                      type="number"
                      step="0.1"
                      value={extractedData.weightedGradePoints}
                      onChange={(e) => handleDataChange('weightedGradePoints', parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="sgpa">SGPA</Label>
                      <Input
                        id="sgpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={extractedData.sgpa}
                        onChange={(e) => handleDataChange('sgpa', parseFloat(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cgpa">CGPA</Label>
                      <Input
                        id="cgpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={extractedData.cgpa}
                        onChange={(e) => handleDataChange('cgpa', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Subjects */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    SUBJECTS ({extractedData.subjects.length})
                  </h3>
                  
                  {extractedData.subjects.map((subject, index) => (
                    <Card key={index} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{subject.subjectCode}</Badge>
                          <Badge>{subject.grade}</Badge>
                        </div>
                        <p className="text-sm font-medium">{subject.subjectName}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div>Credits: {subject.credits}</div>
                          <div>Grade Points: {subject.gradePoints}</div>
                          <div>Total: {(subject.credits * subject.gradePoints).toFixed(1)}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Academic Record
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
