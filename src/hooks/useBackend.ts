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

export function useSavings() {
  const { user } = useUser()
  const [accounts, setAccounts] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      setError(null)
      const data = await backendAPI.getSavingsAccounts(user.id)
      setAccounts(data || [])
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to fetch savings accounts')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const fetchGoals = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      setError(null)
      const data = await backendAPI.getSavingsGoals(user.id)
      setGoals(data || [])
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to fetch savings goals')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const fetchSummary = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      setError(null)
      const data = await backendAPI.getSavingsSummary(user.id)
      setSummary(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to fetch savings summary')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const fetchAll = useCallback(async () => {
    await Promise.all([
      fetchAccounts(),
      fetchGoals(),
      fetchSummary(),
    ])
  }, [fetchAccounts, fetchGoals, fetchSummary])

  const createAccount = useCallback(async (data: any) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      const newAccount = await backendAPI.createSavingsAccount(user.id, data)
      setAccounts(prev => [newAccount, ...prev])
      await fetchSummary()
      return newAccount
    } catch (err: any) {
      setError(err.message || 'Failed to create savings account')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, fetchSummary])

  const updateAccount = useCallback(async (accountId: string, data: any) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      const updated = await backendAPI.updateSavingsAccount(user.id, accountId, data)
      setAccounts(prev => prev.map(acc => acc.id === accountId ? updated : acc))
      await fetchSummary()
      return updated
    } catch (err: any) {
      setError(err.message || 'Failed to update savings account')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, fetchSummary])

  const deleteAccount = useCallback(async (accountId: string) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      await backendAPI.deleteSavingsAccount(user.id, accountId)
      setAccounts(prev => prev.filter(acc => acc.id !== accountId))
      await fetchSummary()
    } catch (err: any) {
      setError(err.message || 'Failed to delete savings account')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, fetchSummary])

  const depositToAccount = useCallback(async (accountId: string, amount: number) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      const result = await backendAPI.depositToSavingsAccount(user.id, accountId, amount)
      await fetchAccounts()
      await fetchSummary()
      return result
    } catch (err: any) {
      setError(err.message || 'Failed to deposit')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, fetchAccounts, fetchSummary])

  const withdrawFromAccount = useCallback(async (accountId: string, amount: number) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      const result = await backendAPI.withdrawFromSavingsAccount(user.id, accountId, amount)
      await fetchAccounts()
      await fetchSummary()
      return result
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, fetchAccounts, fetchSummary])

  const createGoal = useCallback(async (data: any) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      const newGoal = await backendAPI.createSavingsGoal(user.id, data)
      setGoals(prev => [newGoal, ...prev])
      await fetchSummary()
      return newGoal
    } catch (err: any) {
      setError(err.message || 'Failed to create savings goal')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, fetchSummary])

  const updateGoal = useCallback(async (goalId: string, data: any) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      const updated = await backendAPI.updateSavingsGoal(user.id, goalId, data)
      setGoals(prev => prev.map(goal => goal.id === goalId ? updated : goal))
      await fetchSummary()
      return updated
    } catch (err: any) {
      setError(err.message || 'Failed to update savings goal')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, fetchSummary])

  const deleteGoal = useCallback(async (goalId: string) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      await backendAPI.deleteSavingsGoal(user.id, goalId)
      setGoals(prev => prev.filter(goal => goal.id !== goalId))
      await fetchSummary()
    } catch (err: any) {
      setError(err.message || 'Failed to delete savings goal')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, fetchSummary])

  const contributeToGoal = useCallback(async (goalId: string, amount: number) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      const result = await backendAPI.contributeToGoal(user.id, goalId, amount)
      await fetchGoals()
      await fetchSummary()
      return result
    } catch (err: any) {
      setError(err.message || 'Failed to contribute')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, fetchGoals, fetchSummary])

  return {
    accounts,
    goals,
    summary,
    isLoading,
    error,
    fetchAccounts,
    fetchGoals,
    fetchSummary,
    fetchAll,
    createAccount,
    updateAccount,
    deleteAccount,
    depositToAccount,
    withdrawFromAccount,
    createGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
  }
}

export function useAccounts() {
  const { user } = useUser()
  const [accounts, setAccounts] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      setError(null)
      const data = await backendAPI.getAccounts(user.id)
      setAccounts(data || [])
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to fetch accounts')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const fetchSummary = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      setError(null)
      const data = await backendAPI.getAccountsSummary(user.id)
      setSummary(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to fetch accounts summary')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const fetchAll = useCallback(async () => {
    await Promise.all([
      fetchAccounts(),
      fetchSummary(),
    ])
  }, [fetchAccounts, fetchSummary])

  const createAccount = useCallback(async (data: any) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      const newAccount = await backendAPI.createAccount(user.id, data)
      setAccounts(prev => [newAccount, ...prev])
      await fetchSummary()
      return newAccount
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, fetchSummary])

  const updateAccount = useCallback(async (accountId: string, data: any) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      const updated = await backendAPI.updateAccount(user.id, accountId, data)
      setAccounts(prev => prev.map(acc => acc.id === accountId ? updated : acc))
      await fetchSummary()
      return updated
    } catch (err: any) {
      setError(err.message || 'Failed to update account')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, fetchSummary])

  const deleteAccount = useCallback(async (accountId: string) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      setIsLoading(true)
      setError(null)
      await backendAPI.deleteAccount(user.id, accountId)
      setAccounts(prev => prev.filter(acc => acc.id !== accountId))
      await fetchSummary()
    } catch (err: any) {
      setError(err.message || 'Failed to delete account')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, fetchSummary])

  const getAccount = useCallback(async (accountId: string) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      return await backendAPI.getAccount(user.id, accountId)
    } catch (err: any) {
      throw err
    }
  }, [user?.id])

  return {
    accounts,
    summary,
    isLoading,
    error,
    fetchAccounts,
    fetchSummary,
    fetchAll,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccount,
  }
}

