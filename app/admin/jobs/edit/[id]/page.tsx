"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, ArrowLeft, Upload, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { DatabaseService } from "@/lib/database"
import { AdminRoute } from "@/components/ProtectedRoute"
import { DateTimePicker } from "@/components/ui/date-time-picker"

function EditJobPageContent() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [message, setMessage] = useState({ type: "", text: "" })

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "Full-time",
    package: "",
    description: "",
    minCGPA: "7.0",
    noBacklogs: true,
    departments: [] as string[],
    applicationDeadline: "",
    driveDate: "",
    logo: "",
    additionalDocuments: "",
    status: "active" as "active" | "closed" | "draft",
  })

  const departments = [
    "Computer Science and Engineering",
    "Information Technology",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Electronics and Instrumentation Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Production Engineering",
    "Industrial Biotechnology",
  ]

  const jobTypes = ["Full-time", "Internship", "Part-time", "Contract"]
  const statusOptions = ["active", "closed", "draft"]

  useEffect(() => {
    fetchJobData()
  }, [jobId])

  const fetchJobData = async () => {
    try {
      setIsFetching(true)
      const job = await DatabaseService.getJobById(jobId)
      setFormData({
        title: job.title,
        company: job.company,
        location: job.location,
        jobType: job.jobType,
        package: job.package,
        description: job.description,
        minCGPA: job.minCGPA,
        noBacklogs: job.noBacklogs,
        departments: job.departments,
        applicationDeadline: job.applicationDeadline,
        driveDate: job.driveDate,
        logo: job.logo || "",
        additionalDocuments: job.additionalDocuments || "",
        status: job.status,
      })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to fetch job data" })
    } finally {
      setIsFetching(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "additionalDocuments") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setIsUploading(true)
      setMessage({ type: "", text: "" })

      try {
        const uploadResult = await DatabaseService.uploadFile(file)
        
        setFormData({
          ...formData,
          [field]: uploadResult.$id,
        })
        setMessage({
          type: "success",
          text: `${field === "logo" ? "Logo" : "Document"} uploaded successfully!`,
        })
      } catch (error: any) {
        setMessage({ type: "error", text: error.message || "Failed to upload file" })
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleDepartmentChange = (department: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        departments: [...formData.departments, department],
      })
    } else {
      setFormData({
        ...formData,
        departments: formData.departments.filter((d) => d !== department),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      // Validate form
      if (formData.departments.length === 0) {
        throw new Error("Please select at least one eligible department")
      }

      // Update job data
      await DatabaseService.updateJob(jobId, {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        jobType: formData.jobType,
        package: formData.package,
        description: formData.description,
        minCGPA: formData.minCGPA,
        noBacklogs: formData.noBacklogs,
        departments: formData.departments,
        applicationDeadline: formData.applicationDeadline,
        driveDate: formData.driveDate,
        logo: formData.logo,
        additionalDocuments: formData.additionalDocuments,
        status: formData.status,
      })

      setMessage({
        type: "success",
        text: "Job posting updated successfully!",
      })

      // Redirect after successful submission
      setTimeout(() => {
        router.push("/admin/jobs")
      }, 2000)
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update job posting. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading job data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link href="/admin/jobs">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Placement Portal</h1>
                <p className="text-sm text-gray-600">Admin Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto">
          {/* Page Title */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Edit Job Posting</h1>
            <p className="text-gray-600">Update job details and requirements</p>
          </div>

          {message.text && (
            <Alert
              className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === "success" ? "text-green-700" : "text-red-700"}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>Update job details, requirements, and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Software Engineer"
                    required
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="company">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Microsoft"
                    required
                  />
                </div>

                {/* Location and Job Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Bangalore, India"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobType">
                      Job Type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.jobType} onValueChange={(value) => setFormData({ ...formData, jobType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Package */}
                <div className="space-y-2">
                  <Label htmlFor="package">
                    Package <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="package"
                    value={formData.package}
                    onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                    placeholder="e.g., ₹12 LPA or $100,000/year"
                    required
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Job Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed job description, responsibilities, and requirements"
                    className="min-h-[150px]"
                    required
                  />
                </div>

                {/* Eligibility Criteria */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Eligibility Criteria</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minCGPA">
                        Minimum CGPA <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="minCGPA"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={formData.minCGPA}
                        onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2 flex items-end">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="noBacklogs"
                          checked={formData.noBacklogs}
                          onCheckedChange={(checked) => setFormData({ ...formData, noBacklogs: checked as boolean })}
                        />
                        <Label htmlFor="noBacklogs" className="cursor-pointer">
                          No Active Backlogs Required
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Eligible Departments */}
                  <div className="space-y-2">
                    <Label>
                      Eligible Departments <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border rounded-lg">
                      {departments.map((dept) => (
                        <div key={dept} className="flex items-center space-x-2">
                          <Checkbox
                            id={dept}
                            checked={formData.departments.includes(dept)}
                            onCheckedChange={(checked) => handleDepartmentChange(dept, checked as boolean)}
                          />
                          <Label htmlFor={dept} className="text-sm cursor-pointer">
                            {dept}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Important Dates */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Important Dates</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="applicationDeadline">
                        Application Deadline <span className="text-red-500">*</span>
                      </Label>
                      <DateTimePicker
                        date={formData.applicationDeadline ? new Date(formData.applicationDeadline) : undefined}
                        setDate={(date) =>
                          setFormData({
                            ...formData,
                            applicationDeadline: date?.toISOString() || "",
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="driveDate">Drive Date</Label>
                      <DateTimePicker
                        date={formData.driveDate ? new Date(formData.driveDate) : undefined}
                        setDate={(date) =>
                          setFormData({
                            ...formData,
                            driveDate: date?.toISOString() || "",
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* File Uploads */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Attachments</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="logo">Company Logo</Label>
                      <div className="flex items-center gap-2">
                        <Input id="logo" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logo")} disabled={isUploading} />
                        {formData.logo && <span className="text-sm text-green-600">✓ Uploaded</span>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documents">Additional Documents</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="documents"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange(e, "additionalDocuments")}
                          disabled={isUploading}
                        />
                        {formData.additionalDocuments && <span className="text-sm text-green-600">✓ Uploaded</span>}
                      </div>
                      <p className="text-sm text-gray-500">Upload job description, eligibility criteria, or other relevant documents</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={isLoading || isUploading}>
                    {isLoading ? "Updating..." : "Update Job Posting"}
                  </Button>
                  <Link href="/admin/jobs" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function EditJobPage() {
  return (
    <AdminRoute>
      <EditJobPageContent />
    </AdminRoute>
  )
}
