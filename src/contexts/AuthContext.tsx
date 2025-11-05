'use client'

import React, { createContext, useContext } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'

interface AuthContextType {
  user: any | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (userData: any) => Promise<{ success: boolean; error?: string }>
  refetch: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const { signOut } = useAuth()
  
  const contextValue: AuthContextType = {
    user: user || null,
    isLoading: !isLoaded,
    isAuthenticated: !!user,
    login: async () => {
      // Clerk handles login via SignIn component
      return { success: false, error: 'Use Clerk SignIn component' }
    },
    logout: async () => {
      await signOut()
    },
    register: async () => {
      // Clerk handles registration via SignUp component
      return { success: false, error: 'Use Clerk SignUp component' }
    },
    refetch: () => {
      // Clerk automatically refetches user data
    }
  }
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// HOC for protected routes - Clerk middleware handles this now
export function withAuth<T extends {}>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { isAuthenticated, isLoading } = useAuthContext()
    
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    }
    
    if (!isAuthenticated) {
      // Redirect to login - Clerk middleware handles this
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return null
    }
    
    return <Component {...props} />
  }
}
