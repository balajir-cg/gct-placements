import { account, databases, config, UserRole, ID, Query } from './appwrite'
import { AppwriteException } from 'appwrite'
import { DatabaseService } from './database'
import type { AdminRole } from './appwrite'

export class AuthService {
  // Validate email domain
  static validateEmailDomain(email: string): boolean {
    const domain = email.split('@')[1]
    return domain === config.allowedEmailDomain
  }

  // Send OTP to email
  static async sendOTP(email: string): Promise<{ success: boolean; message: string; token?: string }> {
    try {
      if (!this.validateEmailDomain(email)) {
        return {
          success: false,
          message: `Please use your official ${config.allowedEmailDomain} email address`
        }
      }

      const token = await account.createEmailToken(ID.unique(), email)
      
      return {
        success: true,
        message: 'OTP sent to your email address',
        token: token.userId
      }
    } catch (error: any) {
      console.error('Send OTP error:', error)
      return {
        success: false,
        message: error.message || 'Failed to send OTP'
      }
    }
  }

  // Verify OTP and login
  static async verifyOTP(userId: string, otp: string): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const session = await account.createSession(userId, otp)
      const user = await account.get()
      
      // Get user profile from database
      let userProfile = null
      try {
        userProfile = await databases.getDocument(
          config.databaseId,
          config.collections.users,
          user.$id
        )
      } catch (profileError) {
        // User profile doesn't exist yet, will be created during signup
        console.log('User profile not found, probably first time login')
      }

      return {
        success: true,
        message: 'Login successful',
        user: { ...user, profile: userProfile }
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error)
      return {
        success: false,
        message: error.message || 'Invalid OTP'
      }
    }
  }

  // Create user account and profile
  static async createUser(data: {
    email: string
    fullName: string
    rollNo?: string
    department?: string
    batch?: string
    role: UserRole
    isPlacementRep?: boolean
  }): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      if (!this.validateEmailDomain(data.email)) {
        return {
          success: false,
          message: `Please use your official ${config.allowedEmailDomain} email address`
        }
      }

      // First, send OTP for email verification
      const otpResult = await this.sendOTP(data.email)
      if (!otpResult.success) {
        return otpResult
      }

      // The user will need to verify OTP, then we'll create their profile
      // For now, return the token for OTP verification
      return {
        success: true,
        message: 'Verification email sent. Please check your email and verify with OTP.',
        user: { token: otpResult.token, signupData: data }
      }
    } catch (error: any) {
      console.error('Create user error:', error)
      return {
        success: false,
        message: error.message || 'Failed to create user'
      }
    }
  }

  // Complete user registration after OTP verification
  static async completeRegistration(userData: any): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const user = await account.get()
      
      // Create user profile in database
      const userProfile = await databases.createDocument(
        config.databaseId,
        config.collections.users,
        user.$id,
        {
          userId: user.$id,
          collegeEmail: userData.email,
          fullName: userData.fullName,
          rollNo: userData.rollNo || '',
          department: userData.department || '',
          batch: userData.batch || '',
          role: userData.role,
          isPlacementRep: userData.isPlacementRep || false,
          country: 'India',
          historyOfArrear: 'No',
          activeBacklog: 'No',
          noOfBacklogs: '0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      )

      return {
        success: true,
        message: 'Registration completed successfully',
        user: { ...user, profile: userProfile }
      }
    } catch (error: any) {
      console.error('Complete registration error:', error)
      return {
        success: false,
        message: error.message || 'Failed to complete registration'
      }
    }
  }

  // Get current user with profile and admin role
  static async getCurrentUser(): Promise<any> {
    try {
      const user = await account.get()
      
      // Get user profile
      let userProfile = null
      try {
        const profileResult = await databases.listDocuments(
          config.databaseId,
          config.collections.users,
          [Query.equal('collegeEmail', user.email)]
        )
        
        if (profileResult.documents.length > 0) {
          userProfile = profileResult.documents[0]
        }
      } catch (error) {
        console.log('User profile not found')
      }

      // Check for admin role
      const adminRole = await DatabaseService.getAdminRole(user.email)

      return { 
        ...user, 
        profile: userProfile,
        adminRole,
        name: user.name || (userProfile ? userProfile.fullName : 'User')
      }
    } catch (error) {
      return null
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await account.deleteSession('current')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Check if user has specific role (from profile or admin role)
  static hasRole(user: any, role: UserRole): boolean {
    if (!user) return false
    
    // Check admin role first
    if (user.adminRole && user.adminRole.role === role && user.adminRole.isActive) {
      return true
    }
    
    // Check profile role for students
    if (user.profile && user.profile.role === role) {
      return true
    }
    
    return false
  }

  // Check if user is admin (has any admin role)
  static isAdmin(user: any): boolean {
    if (!user || !user.adminRole) return false
    
    const adminRoles = [UserRole.PLACEMENT_REP, UserRole.PLACEMENT_COORDINATOR]
    return adminRoles.includes(user.adminRole.role) && user.adminRole.isActive
  }

  // Check if user is placement rep (can have both admin and student access)
  static isPlacementRep(user: any): boolean {
    if (!user) return false
    
    // Check admin role
    if (user.adminRole && user.adminRole.role === UserRole.PLACEMENT_REP && user.adminRole.isActive) {
      return true
    }
    
    // Check profile flag for students who are placement reps
    if (user.profile && user.profile.isPlacementRep === true) {
      return true
    }
    
    return false
  }

  // Check if user is placement coordinator  
  static isPlacementCoordinator(user: any): boolean {
    return this.hasRole(user, UserRole.PLACEMENT_COORDINATOR)
  }

  // Check if user should have student access (students and placement reps)
  static hasStudentAccess(user: any): boolean {
    if (!user) return false
    
    // Students always have student access
    if (user.profile && user.profile.role === UserRole.STUDENT) {
      return true
    }
    
    // Placement reps have both admin and student access
    if (this.isPlacementRep(user)) {
      return true
    }
    
    return false
  }

  // Check if user should have admin-only access (coordinators only)
  static hasAdminOnlyAccess(user: any): boolean {
    if (!user || !user.adminRole || !user.adminRole.isActive) return false
    
    return user.adminRole.role === UserRole.PLACEMENT_COORDINATOR
  }
} 