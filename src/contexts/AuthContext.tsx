'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAPI'

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
  const auth = useAuth()
  
  return (
    <AuthContext.Provider value={auth}>
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

// HOC for protected routes
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
      // Redirect to login - this would be handled by Next.js routing
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return null
    }
    
    return <Component {...props} />
  }
}
