import { databases, storage, config } from './appwrite'
import { ID, Query } from 'appwrite'
import type { Job, Application, UserProfile, Placement, AdminRole, ApplicationWithUserData, AcademicRecord } from './appwrite'

export class DatabaseService {
  // Helper function to convert departments array to string for storage
  private static departmentsToString(departments: string[]): string {
    return departments.join(',')
  }

  // Helper function to convert departments string to array for display
  private static departmentsToArray(departments: string): string[] {
    return departments ? departments.split(',').map(d => d.trim()) : []
  }

  // Job Management
  static async createJob(jobData: Omit<Job, '$id' | 'createdAt' | 'updatedAt'>) {
    try {
      const now = new Date().toISOString()
      const job = await databases.createDocument(
        config.databaseId,
        config.collections.jobs,
        ID.unique(),
        {
          ...jobData,
          departments: this.departmentsToString(jobData.departments),
          createdAt: now,
          updatedAt: now,
        }
      )
      const result = job as unknown as any
      // Convert departments back to array for the returned object
      return {
        ...result,
        departments: this.departmentsToArray(result.departments)
      } as Job
    } catch (error) {
      console.error('Error creating job:', error)
      throw error
    }
  }

  static async getJobs() {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.collections.jobs,
        [
          Query.limit(100)
        ]
      )
      const jobs = response.documents as unknown as any[]
      // Convert departments strings back to arrays
      return jobs.map(job => ({
        ...job,
        departments: this.departmentsToArray(job.departments || '')
      })) as Job[]
    } catch (error) {
      console.error('Error fetching jobs:', error)
      throw error
    }
  }

  static async getJob(jobId: string) {
    try {
      const job = await databases.getDocument(
        config.databaseId,
        config.collections.jobs,
        jobId
      )
      const result = job as unknown as any
      // Convert departments string back to array
      return {
        ...result,
        departments: this.departmentsToArray(result.departments || '')
      } as Job
    } catch (error) {
      console.error('Error fetching job:', error)
      throw error
    }
  }

  // Alias for getJob (for consistency)
  static async getJobById(jobId: string) {
    return this.getJob(jobId)
  }

  static async updateJob(jobId: string, updates: Omit<Partial<Job>, '$id' | 'createdAt'>) {
    try {
      // Convert departments array to string if present
      const updateData: any = { ...updates }
      if (updates.departments && Array.isArray(updates.departments)) {
        updateData.departments = this.departmentsToString(updates.departments)
      }
      
      const job = await databases.updateDocument(
        config.databaseId,
        config.collections.jobs,
        jobId,
        {
          ...updateData,
          updatedAt: new Date().toISOString(),
        }
      )
      const result = job as unknown as any
      // Convert departments back to array for the returned object
      return {
        ...result,
        departments: this.departmentsToArray(result.departments || '')
      } as Job
    } catch (error) {
      console.error('Error updating job:', error)
      throw error
    }
  }

  static async deleteJob(jobId: string) {
    try {
      await databases.deleteDocument(
        config.databaseId,
        config.collections.jobs,
        jobId
      )
      return { success: true }
    } catch (error) {
      console.error('Error deleting job:', error)
      throw error
    }
  }

  // Application Management
  static async createApplication(applicationData: Omit<Application, '$id' | 'createdAt' | 'updatedAt'>) {
    try {
      const now = new Date().toISOString()
      const application = await databases.createDocument(
        config.databaseId,
        config.collections.applications,
        ID.unique(),
        {
          ...applicationData,
          createdAt: now,
          updatedAt: now,
        }
      )
      return application as unknown as Application
    } catch (error) {
      console.error('Error creating application:', error)
      throw error
    }
  }

  static async getUserApplications(userId: string) {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.collections.applications,
        [
          Query.equal('userId', userId)
        ]
      )
      return response.documents as unknown as Application[]
    } catch (error) {
      console.error('Error fetching user applications:', error)
      throw error
    }
  }

  static async getJobApplications(jobId: string) {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.collections.applications,
        [
          Query.equal('jobId', jobId)
        ]
      )
      return response.documents as unknown as Application[]
    } catch (error) {
      console.error('Error fetching job applications:', error)
      throw error
    }
  }

  // Get applications with user profile data for admin dashboard
  static async getJobApplicationsWithUserData(jobId: string): Promise<ApplicationWithUserData[]> {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.collections.applications,
        [
          Query.equal('jobId', jobId)
        ]
      )
      
      const applicationsWithUserData = await Promise.all(
        response.documents.map(async (app: any) => {
          try {
            const userProfile = await this.getUserProfile(app.userId)
            return {
              ...app,
              // Basic user identification
              userId: userProfile.userId || app.userId || "N/A",
              userName: userProfile.fullName || "N/A",
              userRollNumber: userProfile.rollNo || "N/A", 
              userDepartment: userProfile.department || "N/A",
              userBatch: userProfile.batch || "N/A",
              
              // Contact information
              userPersonalEmail: userProfile.personalEmail || "N/A",
              userCollegeEmail: userProfile.collegeEmail || "N/A",
              userPhone: userProfile.phoneNo || "N/A",
              userParentsName: userProfile.parentsName || "N/A",
              userParentsPhone: userProfile.parentsNo || "N/A",
              userCurrentAddress: userProfile.currentAddress || "N/A",
              userPermanentAddress: userProfile.permanentAddress || "N/A",
              userCity: userProfile.city || "N/A",
              userCountry: userProfile.country || "N/A",
              userAadharNo: userProfile.aadharNo || "N/A",
              userPancardNo: userProfile.pancardNo || "N/A",
              
              // Personal details
              userGender: userProfile.gender || "N/A",
              userDateOfBirth: userProfile.dateOfBirth || "N/A",
              
              // Academic information
              userCGPA: userProfile.currentCgpa || "N/A",
              userTenthMarks: userProfile.tenthMarkPercent || "N/A",
              userTwelthMarks: userProfile.twelthMarkPercent || "N/A",
              userDiplomaMarks: userProfile.diplomaMarkPercent || "N/A",
              userActiveBacklog: userProfile.activeBacklog || "N/A",
              userHistoryOfArrear: userProfile.historyOfArrear || "N/A",
              userNoOfBacklogs: userProfile.noOfBacklogs || "N/A",
              
              // Semester-wise CGPA
              userSem1Cgpa: userProfile.sem1Cgpa || "N/A",
              userSem2Cgpa: userProfile.sem2Cgpa || "N/A",
              userSem3Cgpa: userProfile.sem3Cgpa || "N/A",
              userSem4Cgpa: userProfile.sem4Cgpa || "N/A",
              userSem5Cgpa: userProfile.sem5Cgpa || "N/A",
              userSem6Cgpa: userProfile.sem6Cgpa || "N/A",
              userSem7Cgpa: userProfile.sem7Cgpa || "N/A",
              userSem8Cgpa: userProfile.sem8Cgpa || "N/A",
              
              // Files and profiles
              userResume: userProfile.resume || "N/A",
              userGithubProfile: userProfile.githubProfile || "N/A",
              userLinkedInProfile: userProfile.linkedInProfile || "N/A"
            }
          } catch (error) {
            console.error(`Error fetching user profile for ${app.userId}:`, error)
            return {
              ...app,
              // Basic user identification
              userId: app.userId || "N/A",
              userName: "N/A",
              userRollNumber: "N/A", 
              userDepartment: "N/A",
              userBatch: "N/A",
              
              // Contact information
              userPersonalEmail: "N/A",
              userCollegeEmail: "N/A",
              userPhone: "N/A",
              userParentsName: "N/A",
              userParentsPhone: "N/A",
              userCurrentAddress: "N/A",
              userPermanentAddress: "N/A",
              userCity: "N/A",
              userCountry: "N/A",
              userAadharNo: "N/A",
              userPancardNo: "N/A",
              
              // Personal details
              userGender: "N/A",
              userDateOfBirth: "N/A",
              
              // Academic information
              userCGPA: "N/A",
              userTenthMarks: "N/A",
              userTwelthMarks: "N/A",
              userDiplomaMarks: "N/A",
              userActiveBacklog: "N/A",
              userHistoryOfArrear: "N/A",
              userNoOfBacklogs: "N/A",
              
              // Semester-wise CGPA
              userSem1Cgpa: "N/A",
              userSem2Cgpa: "N/A",
              userSem3Cgpa: "N/A",
              userSem4Cgpa: "N/A",
              userSem5Cgpa: "N/A",
              userSem6Cgpa: "N/A",
              userSem7Cgpa: "N/A",
              userSem8Cgpa: "N/A",
              
              // Files and profiles
              userResume: "N/A",
              userGithubProfile: "N/A",
              userLinkedInProfile: "N/A"
            }
          }
        })
      )
      
      return applicationsWithUserData
    } catch (error) {
      console.error('Error fetching job applications with user data:', error)
      throw error
    }
  }

  static async getAllApplicationsWithUserData(): Promise<ApplicationWithUserData[]> {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.collections.applications,
        [
          Query.limit(1000)
        ]
      )
      
      const applicationsWithUserData = await Promise.all(
        response.documents.map(async (app: any) => {
          try {
            const userProfile = await this.getUserProfile(app.userId)
            return {
              ...app,
              // Basic user identification
              userId: userProfile.userId || app.userId || "N/A",
              userName: userProfile.fullName || "N/A",
              userRollNumber: userProfile.rollNo || "N/A", 
              userDepartment: userProfile.department || "N/A",
              userBatch: userProfile.batch || "N/A",
              
              // Contact information
              userPersonalEmail: userProfile.personalEmail || "N/A",
              userCollegeEmail: userProfile.collegeEmail || "N/A",
              userPhone: userProfile.phoneNo || "N/A",
              userParentsName: userProfile.parentsName || "N/A",
              userParentsPhone: userProfile.parentsNo || "N/A",
              userCurrentAddress: userProfile.currentAddress || "N/A",
              userPermanentAddress: userProfile.permanentAddress || "N/A",
              userCity: userProfile.city || "N/A",
              userCountry: userProfile.country || "N/A",
              userAadharNo: userProfile.aadharNo || "N/A",
              userPancardNo: userProfile.pancardNo || "N/A",
              
              // Personal details
              userGender: userProfile.gender || "N/A",
              userDateOfBirth: userProfile.dateOfBirth || "N/A",
              
              // Academic information
              userCGPA: userProfile.currentCgpa || "N/A",
              userTenthMarks: userProfile.tenthMarkPercent || "N/A",
              userTwelthMarks: userProfile.twelthMarkPercent || "N/A",
              userDiplomaMarks: userProfile.diplomaMarkPercent || "N/A",
              userActiveBacklog: userProfile.activeBacklog || "N/A",
              userHistoryOfArrear: userProfile.historyOfArrear || "N/A",
              userNoOfBacklogs: userProfile.noOfBacklogs || "N/A",
              
              // Semester-wise CGPA
              userSem1Cgpa: userProfile.sem1Cgpa || "N/A",
              userSem2Cgpa: userProfile.sem2Cgpa || "N/A",
              userSem3Cgpa: userProfile.sem3Cgpa || "N/A",
              userSem4Cgpa: userProfile.sem4Cgpa || "N/A",
              userSem5Cgpa: userProfile.sem5Cgpa || "N/A",
              userSem6Cgpa: userProfile.sem6Cgpa || "N/A",
              userSem7Cgpa: userProfile.sem7Cgpa || "N/A",
              userSem8Cgpa: userProfile.sem8Cgpa || "N/A",
              
              // Files and profiles
              userResume: userProfile.resume || "N/A",
              userGithubProfile: userProfile.githubProfile || "N/A",
              userLinkedInProfile: userProfile.linkedInProfile || "N/A"
            }
          } catch (error) {
            console.error(`Error fetching user profile for ${app.userId}:`, error)
            return {
              ...app,
              // Basic user identification
              userId: app.userId || "N/A",
              userName: "N/A",
              userRollNumber: "N/A", 
              userDepartment: "N/A",
              userBatch: "N/A",
              
              // Contact information
              userPersonalEmail: "N/A",
              userCollegeEmail: "N/A",
              userPhone: "N/A",
              userParentsName: "N/A",
              userParentsPhone: "N/A",
              userCurrentAddress: "N/A",
              userPermanentAddress: "N/A",
              userCity: "N/A",
              userCountry: "N/A",
              userAadharNo: "N/A",
              userPancardNo: "N/A",
              
              // Personal details
              userGender: "N/A",
              userDateOfBirth: "N/A",
              
              // Academic information
              userCGPA: "N/A",
              userTenthMarks: "N/A",
              userTwelthMarks: "N/A",
              userDiplomaMarks: "N/A",
              userActiveBacklog: "N/A",
              userHistoryOfArrear: "N/A",
              userNoOfBacklogs: "N/A",
              
              // Semester-wise CGPA
              userSem1Cgpa: "N/A",
              userSem2Cgpa: "N/A",
              userSem3Cgpa: "N/A",
              userSem4Cgpa: "N/A",
              userSem5Cgpa: "N/A",
              userSem6Cgpa: "N/A",
              userSem7Cgpa: "N/A",
              userSem8Cgpa: "N/A",
              
              // Files and profiles
              userResume: "N/A",
              userGithubProfile: "N/A",
              userLinkedInProfile: "N/A"
            }
          }
        })
      )
      
      return applicationsWithUserData
    } catch (error) {
      console.error('Error fetching all applications with user data:', error)
      throw error
    }
  }

  static async updateApplicationStatus(applicationId: string, status: string) {
    try {
      const application = await databases.updateDocument(
        config.databaseId,
        config.collections.applications,
        applicationId,
        {
          status,
          updatedAt: new Date().toISOString(),
        }
      )
      return application as unknown as Application
    } catch (error) {
      console.error('Error updating application status:', error)
      throw error
    }
  }

  static async bulkUpdateApplicationStatus(applicationIds: string[], status: string) {
    try {
      const updatePromises = applicationIds.map(id => 
        this.updateApplicationStatus(id, status)
      )
      const results = await Promise.all(updatePromises)
      return results
    } catch (error) {
      console.error('Error bulk updating application status:', error)
      throw error
    }
  }

  // User Profile Management
  static async updateUserProfile(userId: string, profileData: Omit<Partial<UserProfile>, '$id' | 'createdAt'>) {
    try {
      const profile = await databases.updateDocument(
        config.databaseId,
        config.collections.users,
        userId,
        {
          ...profileData,
          updatedAt: new Date().toISOString(),
        }
      )
      return profile as unknown as UserProfile
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  static async getUserProfile(userId: string) {
    try {
      const profile = await databases.getDocument(
        config.databaseId,
        config.collections.users,
        userId
      )
      return profile as unknown as UserProfile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }

  static async getAllUsers() {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.collections.users,
        [
          Query.limit(1000)
        ]
      )
      return response.documents as unknown as UserProfile[]
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  // File Management
  static async uploadFile(file: File, bucketId: string = config.storageId) {
    try {
      const fileId = ID.unique()
      const uploadedFile = await storage.createFile(bucketId, fileId, file)
      return uploadedFile
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  static async getFilePreview(fileId: string, bucketId: string = config.storageId) {
    try {
      const result = storage.getFilePreview(bucketId, fileId)
      return result
    } catch (error) {
      console.error('Error getting file preview:', error)
      throw error
    }
  }

  static async getFileDownload(fileId: string, bucketId: string = config.storageId) {
    try {
      const result = storage.getFileDownload(bucketId, fileId)
      return result
    } catch (error) {
      console.error('Error getting file download:', error)
      throw error
    }
  }

  static async deleteFile(fileId: string, bucketId: string = config.storageId) {
    try {
      await storage.deleteFile(bucketId, fileId)
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  // Placement Management
  static async createPlacement(placementData: Omit<Placement, '$id' | 'createdAt' | 'updatedAt'>) {
    try {
      const now = new Date().toISOString()
      const placement = await databases.createDocument(
        config.databaseId,
        config.collections.placements,
        ID.unique(),
        {
          ...placementData,
          createdAt: now,
          updatedAt: now,
        }
      )
      return placement as unknown as Placement
    } catch (error) {
      console.error('Error creating placement:', error)
      throw error
    }
  }

  static async getPlacements() {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.collections.placements,
        [
          Query.limit(1000),
          Query.orderDesc('placedAt')
        ]
      )
      
      // Enrich placements with user profile data if userId exists and no manual data
      const enrichedPlacements = await Promise.all(
        response.documents.map(async (placement: any) => {
          try {
            // If manual student data is provided, use it
            if (placement.studentName) {
              return placement as Placement
            }
            
            // Otherwise, try to fetch from user profile
            if (placement.userId && placement.userId !== `manual_${Date.now()}`) {
              try {
                const userProfile = await this.getUserProfile(placement.userId)
                return {
                  ...placement,
                  studentName: userProfile.fullName || 'N/A',
                  studentId: userProfile.rollNo || 'N/A',
                  studentEmail: userProfile.collegeEmail || userProfile.personalEmail || 'N/A',
                  department: userProfile.department || 'N/A',
                  batch: userProfile.batch || 'N/A'
                } as Placement
              } catch (profileError) {
                console.warn(`Could not fetch profile for user ${placement.userId}:`, profileError)
                return placement as Placement
              }
            }
            
            return placement as Placement
          } catch (error) {
            console.error('Error enriching placement:', error)
            return placement as Placement
          }
        })
      )
      
      return enrichedPlacements
    } catch (error) {
      console.error('Error fetching placements:', error)
      throw error
    }
  }

  static async getPlacement(placementId: string) {
    try {
      const placement = await databases.getDocument(
        config.databaseId,
        config.collections.placements,
        placementId
      )
      
      const placementData = placement as unknown as any
      
      // Enrich with user profile data if available and no manual data
      try {
        if (!placementData.studentName && placementData.userId && placementData.userId !== `manual_${Date.now()}`) {
          const userProfile = await this.getUserProfile(placementData.userId)
          return {
            ...placementData,
            studentName: userProfile.fullName || 'N/A',
            studentId: userProfile.rollNo || 'N/A',
            studentEmail: userProfile.collegeEmail || userProfile.personalEmail || 'N/A',
            department: userProfile.department || 'N/A',
            batch: userProfile.batch || 'N/A'
          } as Placement
        }
      } catch (profileError) {
        console.warn(`Could not fetch profile for user ${placementData.userId}:`, profileError)
      }
      
      return placementData as Placement
    } catch (error) {
      console.error('Error fetching placement:', error)
      throw error
    }
  }

  static async updatePlacement(placementId: string, updates: Omit<Partial<Placement>, '$id' | 'createdAt'>) {
    try {
      const placement = await databases.updateDocument(
        config.databaseId,
        config.collections.placements,
        placementId,
        {
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      )
      return placement as unknown as Placement
    } catch (error) {
      console.error('Error updating placement:', error)
      throw error
    }
  }

  static async deletePlacement(placementId: string) {
    try {
      const result = await databases.deleteDocument(
        config.databaseId,
        config.collections.placements,
        placementId
      )
      return { success: true, placement: result }
    } catch (error: any) {
      console.error('Error deleting placement:', error)
      throw new Error(error.message || 'Failed to delete placement')
    }
  }

  // Admin role management methods
  static async getAdminRole(email: string) {
    try {
      const result = await databases.listDocuments(
        config.databaseId,
        config.collections.adminRoles,
        [
          Query.equal('email', email),
          Query.equal('isActive', true)
        ]
      )
      return result.documents.length > 0 ? result.documents[0] as unknown as AdminRole : null
    } catch (error: any) {
      console.error('Error fetching admin role:', error)
      return null
    }
  }

  static async createAdminRole(adminData: Omit<AdminRole, '$id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await databases.createDocument(
        config.databaseId,
        config.collections.adminRoles,
        ID.unique(),
        {
          ...adminData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      )
      return { success: true, adminRole: result }
    } catch (error: any) {
      console.error('Error creating admin role:', error)
      throw new Error(error.message || 'Failed to create admin role')
    }
  }

  static async updateAdminRole(adminId: string, updates: Omit<Partial<AdminRole>, '$id' | 'createdAt'>) {
    try {
      const result = await databases.updateDocument(
        config.databaseId,
        config.collections.adminRoles,
        adminId,
        {
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      )
      return { success: true, adminRole: result }
    } catch (error: any) {
      console.error('Error updating admin role:', error)
      throw new Error(error.message || 'Failed to update admin role')
    }
  }

  static async getAllAdminRoles() {
    try {
      const result = await databases.listDocuments(
        config.databaseId,
        config.collections.adminRoles,
        [
          Query.equal('isActive', true),
          Query.orderDesc('createdAt')
        ]
      )
      return result.documents.map(doc => doc as unknown as AdminRole)
    } catch (error: any) {
      console.error('Error fetching admin roles:', error)
      throw new Error(error.message || 'Failed to fetch admin roles')
    }
  }

  static async deleteAdminRole(adminId: string) {
    try {
      const result = await databases.deleteDocument(
        config.databaseId,
        config.collections.adminRoles,
        adminId
      )
      return { success: true, adminRole: result }
    } catch (error: any) {
      console.error('Error deleting admin role:', error)
      throw new Error(error.message || 'Failed to delete admin role')
    }
  }

  // Academic Records Management
  static async upsertAcademicRecord(userId: string, record: any) {
    try {
      const collectionId = config.collections.academicRecords
      
      // Try to find existing record for user
      const list = await databases.listDocuments(
        config.databaseId,
        collectionId,
        [Query.equal('userId', userId), Query.limit(1)]
      )
      
      const timestamp = new Date().toISOString()
      
      if (list.documents && list.documents.length > 0) {
        const existing = list.documents[0]
        const updated = await databases.updateDocument(
          config.databaseId,
          collectionId,
          existing.$id,
          { ...record, updatedAt: timestamp }
        )
        return { success: true, data: updated }
      } else {
        const created = await databases.createDocument(
          config.databaseId,
          collectionId,
          ID.unique(),
          { userId, ...record, createdAt: timestamp, updatedAt: timestamp }
        )
        return { success: true, data: created }
      }
    } catch (error: any) {
      console.error('upsertAcademicRecord error:', error)
      return { success: false, error: error.message }
    }
  }

  static async getAcademicRecord(userId: string) {
    try {
      const collectionId = config.collections.academicRecords
      const list = await databases.listDocuments(
        config.databaseId,
        collectionId,
        [Query.equal('userId', userId), Query.limit(1)]
      )
      
      if (list.documents && list.documents.length > 0) {
        return { success: true, data: list.documents[0] }
      }
      return { success: false, error: 'No academic record found' }
    } catch (error: any) {
      console.error('getAcademicRecord error:', error)
      return { success: false, error: error.message }
    }
  }

  // File upload helper
  static async uploadFile(file: File, bucketId?: string) {
    try {
      const bucket = bucketId || config.storageId
      const result = await storage.createFile(
        bucket,
        ID.unique(),
        file
      )
      return result
    } catch (error: any) {
      console.error('Error uploading file:', error)
      throw new Error(error.message || 'Failed to upload file')
    }
  }
} 
