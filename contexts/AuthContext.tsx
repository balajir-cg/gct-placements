'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthService } from '@/lib/auth'
import { UserRole } from '@/lib/appwrite'

interface AuthContextType {
  user: any | null
  loading: boolean
  login: (email: string) => Promise<{ success: boolean; message: string; token?: string }>
  verifyOTP: (userId: string, otp: string) => Promise<{ success: boolean; message: string }>
  signup: (data: {
    email: string
    fullName: string
    rollNo?: string
    department?: string
    batch?: string
    role: UserRole
    isPlacementRep?: boolean
  }) => Promise<{ success: boolean; message: string; user?: any }>
  completeRegistration: (userData: any) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isPlacementRep: boolean
  isPlacementOfficer: boolean
  isPlacementCoordinator: boolean
  hasStudentAccess: boolean
  hasAdminOnlyAccess: boolean
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string) => {
    const result = await AuthService.sendOTP(email)
    return result
  }

  const verifyOTP = async (userId: string, otp: string) => {
    const result = await AuthService.verifyOTP(userId, otp)
    if (result.success && result.user) {
      setUser(result.user)
    }
    return result
  }

  const signup = async (data: {
    email: string
    fullName: string
    rollNo?: string
    department?: string
    batch?: string
    role: UserRole
    isPlacementRep?: boolean
  }) => {
    const result = await AuthService.createUser(data)
    return result
  }

  const completeRegistration = async (userData: any) => {
    const result = await AuthService.completeRegistration(userData)
    if (result.success && result.user) {
      setUser(result.user)
    }
    return result
  }

  const logout = async () => {
    await AuthService.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const isAuthenticated = !!user
  const isAdmin = AuthService.isAdmin(user)
  const isPlacementRep = AuthService.isPlacementRep(user)

  const isPlacementCoordinator = AuthService.isPlacementCoordinator(user)
  const hasStudentAccess = AuthService.hasStudentAccess(user)
  const hasAdminOnlyAccess = AuthService.hasAdminOnlyAccess(user)
  const hasRole = (role: UserRole) => AuthService.hasRole(user, role)

  const value = {
    user,
    loading,
    login,
    verifyOTP,
    signup,
    completeRegistration,
    logout,
    refreshUser,
    isAuthenticated,
    isAdmin,
    isPlacementRep,
    
    isPlacementCoordinator,
    hasStudentAccess,
    hasAdminOnlyAccess,
    hasRole,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 