"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Briefcase,
  FileText,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  GraduationCap,
  Settings,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { DatabaseService } from "@/lib/database"
import { Job } from "@/lib/appwrite"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { NotificationBell } from "@/components/NotificationBell"

export default function StudentDashboard() {
  const { user, logout, isAuthenticated, isPlacementRep, isAdmin, refreshUser } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const router = useRouter()

  // Get file preview URL for images
  const getFilePreviewUrl = (fileId: string) => {
    if (!fileId) return "/placeholder-user.jpg"
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${fileId}/preview?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
  }

  const calculateProfileCompletion = useCallback(() => {
    if (!user || !user.profile) {
      setProfileCompletion(0)
      return
    }
    
    const profile = user.profile
    
    // Essential fields for profile completion
    const essentialFields = [
      'fullName',
      'collegeEmail', 
      'personalEmail',
      'phoneNo',
      'rollNo',
      'batch',
      'department',
      'currentCgpa',
    ]
    
    // Additional important fields
    const additionalFields = [
      'dateOfBirth',
      'gender',
      'currentAddress',
      'city',
      'tenthMarkPercent',
      'twelthMarkPercent',
      'resume',
      'profilePicture'
    ]
    
    // All fields combined
    const allFields = [...essentialFields, ...additionalFields]
    let filledFields = 0
    
    allFields.forEach(field => {
      const value = profile[field]
      if (value && value.toString().trim() !== '' && value !== 'N/A') {
        filledFields++
      }
    })
    
    // Calculate completion percentage
    const completion = Math.round((filledFields / allFields.length) * 100)
    setProfileCompletion(completion)
  }, [user])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecentJobs()
      fetchApplications()
      calculateProfileCompletion()
    }
  }, [isAuthenticated, user, calculateProfileCompletion])

  // Additional useEffect to recalculate profile completion when user profile changes
  useEffect(() => {
    if (user?.profile) {
      calculateProfileCompletion()
    }
  }, [user?.profile, calculateProfileCompletion])

  // Recalculate profile completion when user returns to the page
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && user?.profile) {
        await refreshUser()
        calculateProfileCompletion()
      }
    }

    const handleFocus = async () => {
      if (user?.profile) {
        await refreshUser()
        calculateProfileCompletion()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user?.profile, refreshUser, calculateProfileCompletion])

  const fetchRecentJobs = async () => {
    try {
      // Fetch recent jobs from Appwrite
      const response = await DatabaseService.getJobs()
      setJobs(response.slice(0, 3)) // Get latest 3 jobs
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      if (user) {
        const response = await DatabaseService.getUserApplications(user.$id)
        setApplications(response.slice(0, 3)) // Get latest 3 applications
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const isEligibleForJob = (job: Job) => {
    if (!user || !user.profile) return { eligible: false, reason: "User profile not found" }
    
    const userCGPA = parseFloat(user.profile.currentCgpa || "0")
    const minCGPA = parseFloat(job.minCGPA)
    
    if (userCGPA < minCGPA) {
      return { eligible: false, reason: `Minimum CGPA required: ${minCGPA}, your CGPA: ${userCGPA}` }
    }
    
    // Check backlogs - use new activeBacklog field
    const hasActiveBacklogs = user.profile.activeBacklog === "Yes"
    
    if (job.noBacklogs && hasActiveBacklogs) {
      return { eligible: false, reason: "No active backlogs allowed" }
    }
    
    const userDept = user.profile.department
    const allowedDepts = job.departments
    if (!userDept || !allowedDepts.includes(userDept)) {
      return { eligible: false, reason: "Department not eligible" }
    }
    
    return { eligible: true, reason: "" }
  }

  const getApplicationStatus = (jobId: string) => {
    const application = applications.find(app => app.jobId === jobId)
    return application ? application.status : null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <ProtectedRoute requireAuth>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Placement Portal</h1>
                  <p className="text-sm text-gray-600">Student Dashboard</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isPlacementRep && (
                  <Link href="/admin/dashboard">
                    <Button variant="outline" size="sm">
                      <Building2 className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Admin Panel</span>
                      <span className="sm:hidden">Admin</span>
                    </Button>
                    
                  </Link>
                  
                )}
                
                <Link href="/forum">
                  <Button variant="outline" size="sm">
                    💬
                    <span className="ml-1 sm:ml-2">Forum</span>
                  </Button>
                </Link>
                
                <NotificationBell />
                
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.profilePicture ? getFilePreviewUrl(user.profilePicture) : undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                  {user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "ST"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
                <p className="text-gray-600">Ready to take the next step in your career?</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profileCompletion}%</div>
                <Progress value={profileCompletion} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {profileCompletion >= 80 ? 
                    "Excellent! Your profile is well-completed" :
                    profileCompletion >= 60 ?
                    "Good progress! Add more details to improve visibility" :
                    profileCompletion >= 40 ?
                    "Getting there! Complete more fields to attract recruiters" :
                    "Complete your profile to increase your chances"
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.length}</div>
                <p className="text-xs text-muted-foreground">Total applications submitted</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applications.filter(app => app.status === 'interview_scheduled').length}
                </div>
                <p className="text-xs text-muted-foreground">Interviews scheduled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current CGPA</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user?.profile?.currentCgpa || "N/A"}</div>
                <p className="text-xs text-muted-foreground">
                  {user?.profile?.currentCgpa && parseFloat(user.profile.currentCgpa) >= 8.0 ? "Excellent" : 
                   user?.profile?.currentCgpa && parseFloat(user.profile.currentCgpa) >= 7.0 ? "Good" : "Average"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Recent Job Openings */}
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Recent Job Openings
                  </CardTitle>
                  <CardDescription>Latest opportunities matching your profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {jobs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No job openings available at the moment.</p>
                    </div>
                  ) : (
                    jobs.map((job) => {
                      const eligibility = isEligibleForJob(job)
                      const applicationStatus = getApplicationStatus(job.$id)
                      
                      return (
                        <div key={job.$id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {job.company}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </span>
                              </div>
                            </div>
                            <Badge variant={applicationStatus ? "secondary" : eligibility.eligible ? "default" : "destructive"}>
                              {applicationStatus ? "Applied" : eligibility.eligible ? "Eligible" : "Not Eligible"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.package}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Deadline: {new Date(job.applicationDeadline).toLocaleDateString()} {new Date(job.applicationDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              Min CGPA: {job.minCGPA}
                            </span>
                          </div>

                          {!eligibility.eligible && (
                            <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                              <p className="text-sm text-red-600">{eligibility.reason}</p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Link href={`/jobs/${job.$id}`}>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </Link>
                            {eligibility.eligible && !applicationStatus && (
                              <Link href={`/jobs/${job.$id}/apply`}>
                                <Button size="sm">
                                  Apply Now
                                </Button>
                              </Link>
                            )}
                            {applicationStatus && (
                              <Button size="sm" disabled>
                                Applied
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}

                  <div className="text-center pt-4">
                    <Link href="/jobs">
                      <Button variant="outline">View All Jobs</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Application Status */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Application Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {applications.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">No applications yet</p>
                    </div>
                  ) : (
                    applications.map((app, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium">{app.jobTitle}</h4>
                        <p className="text-sm text-gray-600">{app.company}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge
                            variant={
                              app.status === "interview_scheduled"
                                ? "default"
                                : app.status === "under_review"
                                  ? "secondary"
                                  : app.status === "rejected"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {app.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                                                     <span className="text-xs text-gray-500">
                             {new Date(app.appliedAt).toLocaleDateString()}
                           </span>
                        </div>
                      </div>
                    ))
                  )}

                  
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/profile">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <User className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <FileText className="w-4 h-4 mr-2" />
                      Upload Resume
                    </Button>
                  </Link>
                  <Link href="/jobs">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Browse Jobs
                    </Button>
                  </Link>
                  <Link href="/placements">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      View Placements
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
