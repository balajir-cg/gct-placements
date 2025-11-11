"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Building2,
  ArrowLeft,
  Search,
  Edit,
  Trash2,
  Eye,
  Plus,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { DatabaseService } from "@/lib/database"
import { Job } from "@/lib/appwrite"
import { AdminRoute } from "@/components/ProtectedRoute"
import { Alert, AlertDescription } from "@/components/ui/alert"

function ManageJobsContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [searchTerm, jobs])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const jobsData = await DatabaseService.getAllJobs()
      setJobs(jobsData)
      
      // Fetch application counts for each job
      const counts: Record<string, number> = {}
      await Promise.all(
        jobsData.map(async (job) => {
          try {
            const applications = await DatabaseService.getJobApplications(job.$id)
            counts[job.$id] = applications.length
          } catch (error) {
            counts[job.$id] = 0
          }
        })
      )
      setApplicationCounts(counts)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setMessage({ type: "error", text: "Failed to fetch jobs" })
    } finally {
      setLoading(false)
    }
  }

  const filterJobs = () => {
    if (!searchTerm.trim()) {
      setFilteredJobs(jobs)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term) ||
        job.jobType.toLowerCase().includes(term)
    )
    setFilteredJobs(filtered)
  }

  const handleDeleteJob = async () => {
    if (!deleteJobId) return

    try {
      await DatabaseService.deleteJob(deleteJobId)
      setMessage({ type: "success", text: "Job deleted successfully!" })
      setJobs(jobs.filter((job) => job.$id !== deleteJobId))
      setDeleteJobId(null)
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to delete job" })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      active: { color: "bg-green-100 text-green-700", label: "Active" },
      closed: { color: "bg-red-100 text-red-700", label: "Closed" },
      draft: { color: "bg-gray-100 text-gray-700", label: "Draft" },
    }
    const variant = variants[status] || variants.active
    return (
      <Badge className={variant.color} variant="secondary">
        {variant.label}
      </Badge>
    )
  }

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Placement Portal</h1>
                <p className="text-sm text-gray-600">Manage Jobs</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Manage Jobs</h1>
              <p className="text-gray-600">View, edit, and manage all job postings</p>
            </div>
            <Link href="/admin/add-job">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Job
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title, company, location, or job type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Messages */}
        {message.text && (
          <Alert
            className={`mb-6 ${
              message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
            }`}
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

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "No jobs match your search criteria" : "Get started by creating your first job posting"}
              </p>
              {!searchTerm && (
                <Link href="/admin/add-job">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job Posting
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.$id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Job Logo */}
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>

                    {/* Job Details */}
                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-lg text-indigo-600 font-semibold">{job.company}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(job.status)}
                          {isDeadlinePassed(job.applicationDeadline) && job.status === "active" && (
                            <Badge className="bg-orange-100 text-orange-700" variant="secondary">
                              Deadline Passed
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Job Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>{job.jobType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>{job.package}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{applicationCounts[job.$id] || 0} Applications</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Deadline: {new Date(job.applicationDeadline).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Departments */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Eligible Departments:</p>
                        <div className="flex flex-wrap gap-2">
                          {job.departments.slice(0, 3).map((dept, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {dept}
                            </Badge>
                          ))}
                          {job.departments.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.departments.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/jobs/${job.$id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/admin/jobs/edit/${job.$id}`}>
                          <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteJobId(job.$id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting and all associated
              applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function ManageJobsPage() {
  return (
    <AdminRoute>
      <ManageJobsContent />
    </AdminRoute>
  )
}
