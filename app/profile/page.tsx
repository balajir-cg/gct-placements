"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  FileText, 
  Upload, 
  Edit, 
  Save, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Building2, 
  ArrowLeft,
  Download,
  Eye,
  Trash2,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Github,
  Linkedin
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { DatabaseService } from "@/lib/database"
import { StudentRoute } from "@/components/ProtectedRoute"
import { UserRole } from "@/lib/appwrite"
import MarksheetUploadSection from "@/components/MarksheetUploadSection"

function ProfilePageContent() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const router = useRouter()

  const [profileData, setProfileData] = useState({
    fullName: "",
    collegeEmail: "",
    personalEmail: "",
    role: UserRole.STUDENT,
    isPlacementRep: false,
    // Personal Details
    dateOfBirth: "",
    gender: "",
    phoneNo: "",
    parentsName: "",
    parentsNo: "",
    currentAddress: "",
    permanentAddress: "",
    city: "",
    country: "India",
    aadharNo: "",
    pancardNo: "",
    bio: "",
    // Academic Information
    rollNo: "",
    batch: "",
    department: "",
    currentCgpa: "",
    tenthMarkPercent: "",
    twelthMarkPercent: "",
    diplomaMarkPercent: "",
    sem1Cgpa: "",
    sem2Cgpa: "",
    sem3Cgpa: "",
    sem4Cgpa: "",
    sem5Cgpa: "",
    sem6Cgpa: "",
    sem7Cgpa: "",
    sem8Cgpa: "",
    historyOfArrear: "No",
    activeBacklog: "No",
    noOfBacklogs: "0",
    historyOfArrearsCount: "0",
    currentArrearsCount: "0",
    // Files and Profiles
    profilePicture: "",
    resume: "",
    githubProfile: "",
    linkedInProfile: "",
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

  const batches = ["2021-2025", "2022-2026", "2023-2027", "2024-2028", "2025-2029"]
  const genders = ["Male", "Female", "Other"]
  const semesterLabels = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"]

  useEffect(() => {
    if (user?.profile) {
      setProfileData({
        fullName: user.profile.fullName || "",
        collegeEmail: user.profile.collegeEmail || "",
        personalEmail: user.profile.personalEmail || "",
        role: user.profile.role || UserRole.STUDENT,
        isPlacementRep: user.profile.isPlacementRep || false,
        // Personal Details
        dateOfBirth: user.profile.dateOfBirth || "",
        gender: user.profile.gender || "",
        phoneNo: user.profile.phoneNo || "",
        parentsName: user.profile.parentsName || "",
        parentsNo: user.profile.parentsNo || "",
        currentAddress: user.profile.currentAddress || "",
        permanentAddress: user.profile.permanentAddress || "",
        city: user.profile.city || "",
        country: user.profile.country || "India",
        aadharNo: user.profile.aadharNo || "",
        pancardNo: user.profile.pancardNo || "",
        bio: user.profile.bio || "",
        // Academic Information
        rollNo: user.profile.rollNo || "",
        batch: user.profile.batch || "",
        department: user.profile.department || "",
        currentCgpa: user.profile.currentCgpa || "",
        tenthMarkPercent: user.profile.tenthMarkPercent || "",
        twelthMarkPercent: user.profile.twelthMarkPercent || "",
        diplomaMarkPercent: user.profile.diplomaMarkPercent || "",
        sem1Cgpa: user.profile.sem1Cgpa || "",
        sem2Cgpa: user.profile.sem2Cgpa || "",
        sem3Cgpa: user.profile.sem3Cgpa || "",
        sem4Cgpa: user.profile.sem4Cgpa || "",
        sem5Cgpa: user.profile.sem5Cgpa || "",
        sem6Cgpa: user.profile.sem6Cgpa || "",
        sem7Cgpa: user.profile.sem7Cgpa || "",
        sem8Cgpa: user.profile.sem8Cgpa || "",
        historyOfArrear: user.profile.historyOfArrear || "No",
        activeBacklog: user.profile.activeBacklog || "No",
        noOfBacklogs: user.profile.noOfBacklogs || "0",
        historyOfArrearsCount: user.profile.historyOfArrearsCount || "0",
        currentArrearsCount: user.profile.currentArrearsCount || "0",
        // Files and Profiles
        profilePicture: user.profile.profilePicture || "",
        resume: user.profile.resume || "",
        githubProfile: user.profile.githubProfile || "",
        linkedInProfile: user.profile.linkedInProfile || "",
      })
    }
  }, [user])

  const handleMarksheetDataExtracted = (marksheetData: any, rawData: any) => {
    // Validate that marksheet belongs to the current student
    const extractedRegNo = marksheetData.registerNumber?.trim().toUpperCase()
    const currentRegNo = profileData.rollNo?.trim().toUpperCase()

    // Check if register numbers match (if rollNo is already set)
    if (currentRegNo && extractedRegNo && extractedRegNo !== currentRegNo) {
      setMessage({
        type: 'error',
        text: `Marksheet mismatch! This marksheet belongs to ${extractedRegNo}, but you are ${currentRegNo}. Please upload your own marksheet.`
      })
      return
    }

    // Validate semester number
    const semesterNum = parseInt(marksheetData.semester)
    if (!semesterNum || semesterNum < 1 || semesterNum > 8) {
      setMessage({
        type: 'error',
        text: `Invalid semester number: ${marksheetData.semester}. Expected a value between 1 and 8.`
      })
      return
    }

    // Update profile data with extracted marksheet information
    setProfileData(prev => {
      // Find the highest semester with CGPA data to determine currentCgpa
      const semesterCgpas = [
        { sem: 1, cgpa: prev.sem1Cgpa },
        { sem: 2, cgpa: prev.sem2Cgpa },
        { sem: 3, cgpa: prev.sem3Cgpa },
        { sem: 4, cgpa: prev.sem4Cgpa },
        { sem: 5, cgpa: prev.sem5Cgpa },
        { sem: 6, cgpa: prev.sem6Cgpa },
        { sem: 7, cgpa: prev.sem7Cgpa },
        { sem: 8, cgpa: prev.sem8Cgpa },
      ]

      // Add the new semester CGPA to the list
      const semesterKey = `sem${semesterNum}Cgpa` as keyof typeof prev
      semesterCgpas[semesterNum - 1].cgpa = marksheetData.computedCgpa || (prev[semesterKey] as string)

      // Find the highest semester with non-empty CGPA
      const highestSemester = semesterCgpas
        .filter(s => s.cgpa && s.cgpa !== '' && s.cgpa !== '0' && s.cgpa !== '0.00')
        .sort((a, b) => b.sem - a.sem)[0]

      // Use the CGPA from the highest semester as currentCgpa
      const newCurrentCgpa = highestSemester?.cgpa || marksheetData.computedCgpa || prev.currentCgpa

      const updates: any = {
        ...prev,
        // Only update rollNo if it's empty or matches
        rollNo: extractedRegNo || prev.rollNo,
        // batch and department should NOT be updated from marksheet - user sets these manually
        dateOfBirth: marksheetData.dateOfBirth || prev.dateOfBirth,
        
        // Update current CGPA to the highest semester's CGPA
        currentCgpa: newCurrentCgpa,
        
        // Update arrear counts (these should reflect the latest uploaded marksheet)
        historyOfArrearsCount: marksheetData.historyOfArrearsCount?.toString() || "0",
        currentArrearsCount: marksheetData.currentArrearsCount?.toString() || "0",
        historyOfArrear: marksheetData.historyOfArrearsCount > 0 ? "Yes" : "No",
        activeBacklog: marksheetData.currentArrearsCount > 0 ? "Yes" : "No",
        noOfBacklogs: marksheetData.currentArrearsCount?.toString() || "0",
      }

      // Update the specific semester CGPA based on semester number
      updates[semesterKey] = marksheetData.computedCgpa || (prev[semesterKey] as string)

      return updates
    })

    setMessage({
      type: 'success',
      text: `✅ Marksheet validated! Semester ${semesterNum} CGPA: ${marksheetData.computedCgpa}. Student: ${marksheetData.studentName} (${extractedRegNo}). Review and click "Save Changes" to update your profile.`
    })

    // Enable editing mode if not already
    if (!isEditing) {
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    setIsSaving(true)
    setMessage({ type: "", text: "" })
    
    try {
      const result = await DatabaseService.updateUserProfile(user.$id, {
        ...profileData,
        role: profileData.role as UserRole,
        gender: profileData.gender as "Male" | "Female" | "Other" | undefined,
        historyOfArrear: profileData.historyOfArrear as "Yes" | "No",
        activeBacklog: profileData.activeBacklog as "Yes" | "No"
      })
      
      setMessage({ 
        type: "success", 
        text: "Profile updated successfully!" 
      })
      setIsEditing(false)
    } catch (error: any) {
      setMessage({ 
        type: "error", 
        text: error.message || "Failed to update profile. Please try again." 
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (type: 'resume' | 'profilePicture') => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = type === "resume" ? ".pdf,.doc,.docx" : "image/*"
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Validate file size (5MB for resume, 2MB for profile picture)
      const maxSize = type === "resume" ? 5 * 1024 * 1024 : 2 * 1024 * 1024
      if (file.size > maxSize) {
        setMessage({ 
          type: "error", 
          text: `File size too large. Maximum ${type === "resume" ? "5MB" : "2MB"} allowed.` 
        })
        return
      }

      setIsUploading(true)
      setMessage({ type: "", text: "" })

      try {
        // Upload file to Appwrite storage
        const uploadedFile = await DatabaseService.uploadFile(file)
        
        // Update profile data
        const updatedData = { ...profileData, [type]: uploadedFile.$id }
        setProfileData(updatedData)
        
        // Update in database if user exists
        if (user) {
          await DatabaseService.updateUserProfile(user.$id, { [type]: uploadedFile.$id })
        }
        
        setMessage({ 
          type: "success", 
          text: `${type === "resume" ? "Resume" : "Profile picture"} uploaded successfully!` 
        })
      } catch (error: any) {
        setMessage({ 
          type: "error", 
          text: error.message || `Failed to upload ${type}. Please try again.` 
        })
      } finally {
        setIsUploading(false)
      }
    }
    
    input.click()
  }

  const handleFileDelete = async (type: 'resume' | 'profilePicture') => {
    if (!user) return
    
    try {
      const fileId = profileData[type]
      if (fileId) {
        await DatabaseService.deleteFile(fileId)
      }
      
      const updatedData = { ...profileData, [type]: "" }
      setProfileData(updatedData)
      await DatabaseService.updateUserProfile(user.$id, { [type]: "" })
      
      setMessage({ 
        type: "success", 
        text: `${type === "resume" ? "Resume" : "Profile picture"} deleted successfully!` 
      })
    } catch (error: any) {
      setMessage({ 
        type: "error", 
        text: error.message || `Failed to delete ${type}. Please try again.` 
      })
    }
  }

  const getFilePreviewUrl = (fileId: string) => {
    if (!fileId) return "/placeholder-user.jpg"
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${fileId}/preview?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
  }

  const getFileViewUrl = (fileId: string) => {
    if (!fileId) return ""
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
  }

  const downloadFile = async (fileId: string, filename: string) => {
    if (!fileId) return
    
    try {
      const downloadUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${fileId}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "Failed to download file. Please try again." 
      })
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back  
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Profile</h1>
                  <p className="text-sm text-gray-600">Update your information</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setMessage({ type: "", text: "" })
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Messages */}
        {message.text && (
          <Alert className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
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

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Profile Image Section */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileData.profilePicture ? getFilePreviewUrl(profileData.profilePicture) : undefined} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                      {getInitials(profileData.fullName || "User")}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleFileUpload("profilePicture")}
                        disabled={isUploading}
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                      {profileData.profilePicture && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleFileDelete("profilePicture")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Profile Info Section */}
              <div className="flex-1 text-center lg:text-left space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {profileData.fullName || "User"}
                  </h2>
                  {profileData.isPlacementRep && (
                    <Badge variant="secondary" className="mx-auto lg:mx-0 w-fit">
                      Placement Rep
                    </Badge>
                  )}
                </div>
                
                {/* Academic Badges */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                  <Badge variant="outline">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {profileData.batch || "N/A"}
                  </Badge>
                  <Badge variant="outline">
                    <Building2 className="w-3 h-3 mr-1" />
                    {profileData.department || "N/A"}
                  </Badge>
                  <Badge variant="outline">CGPA: {profileData.currentCgpa || "N/A"}</Badge>
                </div>
                
                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 text-sm text-gray-600">
                  {profileData.collegeEmail && (
                    <div className="flex items-center justify-center lg:justify-start gap-1">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{profileData.collegeEmail}</span>
                    </div>
                  )}
                  {profileData.phoneNo && (
                    <div className="flex items-center justify-center lg:justify-start gap-1">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{profileData.phoneNo}</span>
                    </div>
                  )}
                  {profileData.city && (
                    <div className="flex items-center justify-center lg:justify-start gap-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{profileData.city}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="basic" className="text-xs sm:text-sm py-2 px-2 sm:px-4">
              <span className="hidden sm:inline">Basic Info</span>
              <span className="sm:hidden">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="personal" className="text-xs sm:text-sm py-2 px-2 sm:px-4">
              <span className="hidden sm:inline">Personal Details</span>
              <span className="sm:hidden">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="academic" className="text-xs sm:text-sm py-2 px-2 sm:px-4">
              <span className="hidden sm:inline">Academic Info</span>
              <span className="sm:hidden">Academic</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="text-xs sm:text-sm py-2 px-2 sm:px-4">
              <span className="hidden sm:inline">Files & Links</span>
              <span className="sm:hidden">Files</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Your basic profile information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="collegeEmail">College Email *</Label>
                    <Input
                      id="collegeEmail"
                      type="email"
                      value={profileData.collegeEmail}
                      onChange={(e) => setProfileData({ ...profileData, collegeEmail: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personalEmail">Personal Email</Label>
                    <Input
                      id="personalEmail"
                      type="email"
                      value={profileData.personalEmail}
                      onChange={(e) => setProfileData({ ...profileData, personalEmail: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNo">Phone Number</Label>
                    <Input
                      id="phoneNo"
                      value={profileData.phoneNo}
                      onChange={(e) => setProfileData({ ...profileData, phoneNo: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Details */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>
                  Additional personal information and family details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profileData.gender}
                    onValueChange={(value) => setProfileData({ ...profileData, gender: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="parentsName">Parent's/Guardian's Name</Label>
                    <Input
                      id="parentsName"
                      value={profileData.parentsName}
                      onChange={(e) => setProfileData({ ...profileData, parentsName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentsNo">Parent's/Guardian's Phone</Label>
                    <Input
                      id="parentsNo"
                      value={profileData.parentsNo}
                      onChange={(e) => setProfileData({ ...profileData, parentsNo: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentAddress">Current Address</Label>
                    <Textarea
                      id="currentAddress"
                      value={profileData.currentAddress}
                      onChange={(e) => setProfileData({ ...profileData, currentAddress: e.target.value })}
                      disabled={!isEditing}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="permanentAddress">Permanent Address</Label>
                    <Textarea
                      id="permanentAddress"
                      value={profileData.permanentAddress}
                      onChange={(e) => setProfileData({ ...profileData, permanentAddress: e.target.value })}
                      disabled={!isEditing}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profileData.country}
                      onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="aadharNo">Aadhar Number</Label>
                    <Input
                      id="aadharNo"
                      value={profileData.aadharNo}
                      onChange={(e) => setProfileData({ ...profileData, aadharNo: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pancardNo">PAN Card Number</Label>
                    <Input
                      id="pancardNo"
                      value={profileData.pancardNo}
                      onChange={(e) => setProfileData({ ...profileData, pancardNo: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Information */}
          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>
                  Your educational background and academic performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rollNo">Roll Number *</Label>
                    <Input
                      id="rollNo"
                      value={profileData.rollNo}
                      onChange={(e) => setProfileData({ ...profileData, rollNo: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batch">Batch *</Label>
                    <Select
                      value={profileData.batch}
                      onValueChange={(value) => setProfileData({ ...profileData, batch: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch) => (
                          <SelectItem key={batch} value={batch}>
                            {batch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={profileData.department}
                      onValueChange={(value) => setProfileData({ ...profileData, department: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentCgpa">Current CGPA</Label>
                    <Input
                      id="currentCgpa"
                      value={profileData.currentCgpa}
                      onChange={(e) => setProfileData({ ...profileData, currentCgpa: e.target.value })}
                      disabled={!isEditing}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenthMarkPercent">10th Percentage</Label>
                    <Input
                      id="tenthMarkPercent"
                      value={profileData.tenthMarkPercent}
                      onChange={(e) => setProfileData({ ...profileData, tenthMarkPercent: e.target.value })}
                      disabled={!isEditing}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twelthMarkPercent">12th Percentage</Label>
                    <Input
                      id="twelthMarkPercent"
                      value={profileData.twelthMarkPercent}
                      onChange={(e) => setProfileData({ ...profileData, twelthMarkPercent: e.target.value })}
                      disabled={!isEditing}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diplomaMarkPercent" className="text-sm">Diploma % (if applicable)</Label>
                    <Input
                      id="diplomaMarkPercent"
                      value={profileData.diplomaMarkPercent}
                      onChange={(e) => setProfileData({ ...profileData, diplomaMarkPercent: e.target.value })}
                      disabled={!isEditing}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Semester-wise CGPA */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Semester-wise CGPA</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {semesterLabels.map((sem, index) => {
                      const semKey = `sem${index + 1}Cgpa` as keyof typeof profileData
                      return (
                        <div key={semKey} className="space-y-2">
                          <Label htmlFor={semKey} className="text-sm">{sem}</Label>
                          <Input
                            id={semKey}
                            value={profileData[semKey] as string}
                            onChange={(e) => setProfileData({ ...profileData, [semKey]: e.target.value })}
                            disabled={!isEditing}
                            placeholder="0.00"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="historyOfArrear">History of Arrear</Label>
                    <Select
                      value={profileData.historyOfArrear}
                      onValueChange={(value) => setProfileData({ ...profileData, historyOfArrear: value as "Yes" | "No" })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activeBacklog">Active Backlog</Label>
                    <Select
                      value={profileData.activeBacklog}
                      onValueChange={(value) => setProfileData({ ...profileData, activeBacklog: value as "Yes" | "No" })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noOfBacklogs">Number of Backlogs</Label>
                    <Input
                      id="noOfBacklogs"
                      value={profileData.noOfBacklogs}
                      onChange={(e) => setProfileData({ ...profileData, noOfBacklogs: e.target.value })}
                      disabled={!isEditing}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* College Academic Details (from Marksheet) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-medium">College Academic Details</Label>
                    <Badge variant="outline" className="text-xs">From Marksheet</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="historyOfArrearsCount">Total Arrears Ever Had</Label>
                      <Input
                        id="historyOfArrearsCount"
                        value={profileData.historyOfArrearsCount}
                        onChange={(e) => setProfileData({ ...profileData, historyOfArrearsCount: e.target.value })}
                        disabled={!isEditing}
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground">
                        Total number of arrears you've had throughout your academic journey (never decreases)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentArrearsCount">Current Active Arrears</Label>
                      <Input
                        id="currentArrearsCount"
                        value={profileData.currentArrearsCount}
                        onChange={(e) => setProfileData({ ...profileData, currentArrearsCount: e.target.value })}
                        disabled={!isEditing}
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground">
                        Number of arrears you currently have (decreases when cleared)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files & Links */}
          <TabsContent value="files">
            <div className="space-y-6">
              {/* Marksheet Upload Section */}
              {user && (
                <MarksheetUploadSection
                  userId={user.$id}
                  currentRollNo={profileData.rollNo}
                  onDataExtracted={handleMarksheetDataExtracted}
                  disabled={isSaving || isUploading}
                />
              )}

              <Card>
              <CardHeader>
                <CardTitle>Files & Social Profiles</CardTitle>
                <CardDescription>
                  Upload your documents and add links to your professional profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Resume Upload */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Resume</Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleFileUpload("resume")}
                      disabled={isUploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploading ? "Uploading..." : "Upload Resume"}
                    </Button>
                    {profileData.resume && (
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Preview</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>Resume Preview</DialogTitle>
                              <DialogDescription>
                                Preview of your uploaded resume - {profileData.fullName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 min-h-[500px]">
                              <iframe
                                src={getFileViewUrl(profileData.resume)}
                                className="w-full h-[500px] border rounded"
                                title="Resume Preview"
                              />
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={() => downloadFile(profileData.resume, `${profileData.fullName.replace(/\s+/g, '-')}-resume.pdf`)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => window.open(getFileViewUrl(profileData.resume), '_blank')}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Open in New Tab
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFileDelete("resume")}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                </div>

                {/* Social Profiles */}
                <div className="space-y-6">
                  <h3 className="text-sm font-medium">Professional Profiles</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="githubProfile">GitHub Profile</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 bg-gray-50 border border-r-0 rounded-l-md">
                          <Github className="w-4 h-4 text-gray-500" />
                        </div>
                        <Input
                          id="githubProfile"
                          value={profileData.githubProfile}
                          onChange={(e) => setProfileData({ ...profileData, githubProfile: e.target.value })}
                          disabled={!isEditing}
                          placeholder="https://github.com/username"
                          className="rounded-l-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedInProfile">LinkedIn Profile</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 bg-gray-50 border border-r-0 rounded-l-md">
                          <Linkedin className="w-4 h-4 text-gray-500" />
                        </div>
                        <Input
                          id="linkedInProfile"
                          value={profileData.linkedInProfile}
                          onChange={(e) => setProfileData({ ...profileData, linkedInProfile: e.target.value })}
                          disabled={!isEditing}
                          placeholder="https://linkedin.com/in/username"
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <StudentRoute>
      <ProfilePageContent />
    </StudentRoute>
  )
}
