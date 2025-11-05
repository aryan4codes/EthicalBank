/**
 * Hooks for Backend API (Python FastAPI)
 */
import { useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { backendAPI, BackendResponse } from '@/lib/backend-api'

export function useBackendProfile() {
  const { user } = useUser()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      setError(null)
      const data = await backendAPI.getProfile(user.id)
      setProfile(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const updateProfile = useCallback(async (profileData: any) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      const data = await backendAPI.updateProfile(user.id, profileData)
      setProfile(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const checkCompletion = useCallback(async () => {
    if (!user?.id) return null
    
    try {
      return await backendAPI.checkProfileCompletion(user.id)
    } catch (err: any) {
      console.error('Failed to check profile completion:', err)
      return null
    }
  }, [user?.id])

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    checkCompletion,
  }
}

export function useAIChat() {
  const { user } = useUser()
  const [response, setResponse] = useState<BackendResponse<any> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendQuery = useCallback(async (query: string, context?: Record<string, any>) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      const data = await backendAPI.chatQuery(user.id, query, context)
      setResponse(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to send query')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  return {
    response,
    isLoading,
    error,
    sendQuery,
  }
}

export function useLoanEligibility() {
  const { user } = useUser()
  const [result, setResult] = useState<BackendResponse<any> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkEligibility = useCallback(async (
    loanAmount: number,
    loanType: string = 'personal',
    purpose?: string
  ) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      const data = await backendAPI.checkLoanEligibility(user.id, loanAmount, loanType, purpose)
      setResult(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to check loan eligibility')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  return {
    result,
    isLoading,
    error,
    checkEligibility,
  }
}

export function useProfileExplanation() {
  const { user } = useUser()
  const [explanation, setExplanation] = useState<BackendResponse<any> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const explain = useCallback(async (aspects?: string[]) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      const data = await backendAPI.explainProfile(user.id, aspects)
      setExplanation(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to explain profile')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  return {
    explanation,
    isLoading,
    error,
    explain,
  }
}

export function useQueryLogs() {
  const { user } = useUser()
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchLogs = useCallback(async (limit: number = 50, skip: number = 0) => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      setError(null)
      const data = await backendAPI.listQueryLogs(user.id, limit, skip)
      setLogs(data.logs || [])
      setTotal(data.total || 0)
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to fetch query logs')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const getLog = useCallback(async (logId: string) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      return await backendAPI.getQueryLog(user.id, logId)
    } catch (err: any) {
      throw err
    }
  }, [user?.id])

  return {
    logs,
    total,
    isLoading,
    error,
    fetchLogs,
    getLog,
  }
}

