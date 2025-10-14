"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Briefcase,
  Search,
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  Filter,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { DatabaseService } from "@/lib/database"
import { Job } from "@/lib/appwrite"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function JobsPage() {
  const { user, isAuthenticated } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterLocation, setFilterLocation] = useState("all")
  const [filterMinCGPA, setFilterMinCGPA] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

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

  const locations = ["All Locations", "Bangalore", "Chennai", "Hyderabad", "Mumbai", "Pune", "Delhi NCR", "Remote"]
  const cgpaRanges = ["All", "6.0+", "7.0+", "8.0+", "9.0+"]

  useEffect(() => {
    if (isAuthenticated) {
      fetchJobs()
      fetchUserApplications()
    }
  }, [isAuthenticated])

  const fetchJobs = async () => {
    try {
      const response = await DatabaseService.getJobs()
      setJobs(response)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserApplications = async () => {
    try {
      if (user) {
        const response = await DatabaseService.getUserApplications(user.$id)
        setApplications(response)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const isEligibleForJob = (job: Job) => {
    if (!user || !user.profile) return { eligible: false, reason: "User profile not found" }
    
    const userCGPA = parseFloat(user.profile.currentCgpa || "0")
    const minCGPA = parseFloat(job.minCGPA)
    
    if (userCGPA < minCGPA) {
      return { eligible: false, reason: `Minimum CGPA required: ${minCGPA}, your CGPA: ${userCGPA}` }
    }
    
    // Check backlogs - convert string to boolean/number if needed
    const userBacklogs = user.profile.backlogs
    const hasBacklogs = userBacklogs && userBacklogs !== "0" && userBacklogs.toLowerCase() !== "no"
    
    if (job.noBacklogs && hasBacklogs) {
      return { eligible: false, reason: "No backlogs allowed" }
    }
    
    const userDept = user.profile.department
    const allowedDepts = job.departments
    if (!userDept || !allowedDepts.includes(userDept)) {
      return { eligible: false, reason: "Department not eligible" }
    }
    
    const deadline = new Date(job.applicationDeadline)
    if (deadline < new Date()) {
      return { eligible: false, reason: "Application deadline passed" }
    }
    
    return { eligible: true, reason: "" }
  }

  const getApplicationStatus = (jobId: string) => {
    const application = applications.find(app => app.jobId === jobId)
    return application ? application.status : null
  }

  const getApplicationCount = (jobId: string) => {
    // This would normally come from the backend
    return Math.floor(Math.random() * 50) + 10
  }

  // Filter jobs based on search term, filters, and tab
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = filterDepartment === "all" || 
      job.departments.includes(filterDepartment)
    
    const matchesLocation =
      filterLocation === "all" || filterLocation === "All Locations" || job.location === filterLocation

    const minCGPAValue = filterMinCGPA === "all" ? 0 : Number.parseFloat(filterMinCGPA.replace("+", ""))
    const matchesCGPA = filterMinCGPA === "all" || parseFloat(job.minCGPA) <= minCGPAValue

    // Tab filtering
    let matchesTab = true
    if (activeTab === "tech") {
      matchesTab = job.title.toLowerCase().includes("software") || 
                   job.title.toLowerCase().includes("developer") || 
                   job.title.toLowerCase().includes("engineer")
    } else if (activeTab === "engineering") {
      matchesTab = job.title.toLowerCase().includes("mechanical") || 
                   job.title.toLowerCase().includes("civil") || 
                   job.title.toLowerCase().includes("electrical")
    } else if (activeTab === "management") {
      matchesTab = job.title.toLowerCase().includes("manager") || 
                   job.title.toLowerCase().includes("lead")
    }

    return matchesSearch && matchesDepartment && matchesLocation && matchesCGPA && matchesTab
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading jobs...</div>
      </div>
    )
  }

  return (
    <ProtectedRoute requireAuth>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Placement Portal</h1>
                  <p className="text-sm text-gray-600">Job Openings</p>
                </div>
              </div>
            </div>
            <Link href="/forum">
              <Button variant="outline" size="sm">
                💬 Forum
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Job Openings</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore exciting career opportunities from top companies recruiting at GCT
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <div className="flex justify-center">
              <TabsList>
                <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
                <TabsTrigger value="tech">Tech</TabsTrigger>
                <TabsTrigger value="engineering">Engineering</TabsTrigger>
                <TabsTrigger value="management">Management</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-6">
              {/* Search and Filters */}
              <div className="mb-8 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search jobs by title, company, or keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterLocation} onValueChange={setFilterLocation}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterMinCGPA} onValueChange={setFilterMinCGPA}>
                      <SelectTrigger className="w-full sm:w-[100px]">
                        <SelectValue placeholder="Min CGPA" />
                      </SelectTrigger>
                      <SelectContent>
                        {cgpaRanges.map((range) => (
                          <SelectItem key={range} value={range === "All" ? "all" : range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Jobs List */}
              <div className="space-y-6 max-w-5xl mx-auto">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No job openings match your search criteria.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm("")
                        setFilterDepartment("all")
                        setFilterLocation("all")
                        setFilterMinCGPA("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  filteredJobs.map((job) => {
                    const eligibility = isEligibleForJob(job)
                    const applicationStatus = getApplicationStatus(job.$id)
                    const applicationCount = getApplicationCount(job.$id)
                    
                    return (
                      <Card key={job.$id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Company Logo */}
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center overflow-hidden">
                                {job.logo ? (
                                  <img
                                    src={job.logo}
                                    alt={`${job.company} logo`}
                                    className="max-w-full max-h-full"
                                  />
                                ) : (
                                  <Building2 className="w-8 h-8 text-gray-400" />
                                )}
                              </div>
                            </div>

                            {/* Job Details */}
                            <div className="flex-grow">
                              <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                                    <Building2 className="w-4 h-4" />
                                    <span>{job.company}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-2 md:mt-0">
                                  <Badge variant={job.status === 'active' ? "default" : "secondary"}>
                                    {job.status}
                                  </Badge>
                                  {applicationStatus && (
                                    <Badge variant="secondary">Applied</Badge>
                                  )}
                                  {!eligibility.eligible && (
                                    <Badge variant="destructive">Not Eligible</Badge>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  <span>Job Type: {job.jobType}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()} at {new Date(job.applicationDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <TrendingUp className="w-4 h-4" />
                                  <span>Min CGPA: {job.minCGPA}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                                  <span>{job.package}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Users className="w-4 h-4" />
                                  <span>{applicationCount} applications</span>
                                </div>
                              </div>

                              <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                              {!eligibility.eligible && (
                                <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                                  <p className="text-sm text-red-600">{eligibility.reason}</p>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2 mb-4">
                                {job.departments.map((dept, index) => (
                                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                                    {dept.split(" ")[0]}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex flex-col sm:flex-row gap-3">
                                <Link href={`/jobs/${job.$id}`} className="flex-1">
                                  <Button variant="outline" className="w-full">
                                    View Details
                                  </Button>
                                </Link>
                                {eligibility.eligible && !applicationStatus && job.status === 'active' && (
                                  <Link href={`/jobs/${job.$id}/apply`} className="flex-1">
                                    <Button className="w-full">
                                      Apply Now
                                    </Button>
                                  </Link>
                                )}
                                {applicationStatus && (
                                  <Button variant="secondary" className="flex-1" disabled>
                                    Applied - {applicationStatus.replace('_', ' ').toUpperCase()}
                                  </Button>
                                )}
                                {!eligibility.eligible && (
                                  <Button variant="outline" className="flex-1" disabled>
                                    Not Eligible
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
