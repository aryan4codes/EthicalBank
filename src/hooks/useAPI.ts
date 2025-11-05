/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { apiClient } from '@/lib/api-client'
import { DashboardData } from '@/types'

// Authentication hook - now uses Clerk
export function useAuth() {
  const { user, isLoaded } = useUser()
  
  return {
    user: user || null,
    isLoading: !isLoaded,
    isAuthenticated: !!user,
    login: async () => {
      return { success: false, error: 'Use Clerk SignIn component' }
    },
    logout: async () => {
      // Clerk handles logout via UserButton
    },
    register: async () => {
      return { success: false, error: 'Use Clerk SignUp component' }
    },
    refetch: () => {
      // Clerk automatically refetches
    }
  }
}

// Accounts hook
export function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getAccounts()
      if (response.success) {
        setAccounts(response.data.accounts || [])
      } else {
        setError(response.error?.message || 'Failed to fetch accounts')
        setAccounts([])
      }
    } catch (err) {
      console.error('Accounts fetch error:', err)
      setError('Network error - please check your connection')
      setAccounts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAccounts()
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [fetchAccounts])

  const createAccount = async (accountData: any) => {
    try {
      const response = await apiClient.createAccount(accountData)
      if (response.success) {
        await fetchAccounts() // Refresh the list
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.error?.message || 'Failed to create account' }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const updateAccount = async (accountId: string, updates: any) => {
    try {
      const response = await apiClient.updateAccount(accountId, updates)
      if (response.success) {
        await fetchAccounts() // Refresh the list
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.error?.message || 'Failed to update account' }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  return {
    accounts,
    isLoading,
    error,
    createAccount,
    updateAccount,
    refetch: fetchAccounts
  }
}

// Transactions hook
export function useTransactions(params: any = {}) {
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getTransactions(params)
      if (response.success) {
        setTransactions(response.data.transactions || [])
        setPagination(response.data.pagination || null)
      } else {
        setError(response.error?.message || 'Failed to fetch transactions')
        setTransactions([])
      }
    } catch (err) {
      console.error('Transaction fetch error:', err)
      setError('Network error - please check your connection')
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [JSON.stringify(params)]) // Use JSON.stringify to prevent unnecessary re-renders

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTransactions()
    }, 100) // Small delay to prevent rapid API calls
    
    return () => clearTimeout(timeoutId)
  }, [fetchTransactions])

  const createTransaction = async (transactionData: any) => {
    try {
      const response = await apiClient.createTransaction(transactionData)
      if (response.success) {
        await fetchTransactions() // Refresh the list
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.error?.message || 'Failed to create transaction' }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  return {
    transactions,
    pagination,
    isLoading,
    error,
    createTransaction,
    refetch: fetchTransactions
  }
}

// Dashboard hook
export function useDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getDashboardSummary()
      if (response.success) {
        setDashboardData(response.data)
      } else {
        setError(response.error?.message || 'Failed to fetch dashboard data')
        setDashboardData(null)
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Network error - please check your connection')
      setDashboardData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDashboard()
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [fetchDashboard])

  return {
    dashboardData,
    isLoading,
    error,
    refetch: fetchDashboard
  }
}

// AI Decisions hook
export function useAIDecisions(params: any = {}) {
  const [decisions, setDecisions] = useState([])
  const [pagination, setPagination] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDecisions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getAIDecisions(params)
      if (response.success) {
        setDecisions(response.data.decisions || [])
        setPagination(response.data.pagination || null)
      } else {
        setError(response.error?.message || 'Failed to fetch AI decisions')
        setDecisions([])
      }
    } catch (err) {
      console.error('AI decisions fetch error:', err)
      setError('Network error - please check your connection')
      setDecisions([])
    } finally {
      setIsLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDecisions()
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [fetchDecisions])

  const updateFeedback = async (decisionId: string, feedback: any) => {
    try {
      const response = await apiClient.updateAIDecisionFeedback(decisionId, feedback)
      if (response.success) {
        await fetchDecisions() // Refresh the list
        return { success: true }
      } else {
        return { success: false, error: response.error?.message || 'Failed to update feedback' }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  return {
    decisions,
    pagination,
    isLoading,
    error,
    updateFeedback,
    refetch: fetchDecisions
  }
}

// Consent Records hook
export function useConsentRecords(params: any = {}) {
  const [consents, setConsents] = useState([])
  const [pagination, setPagination] = useState(null)
  const [activeConsentsSummary, setActiveConsentsSummary] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConsents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getConsentRecords(params)
      if (response.success) {
        setConsents(response.data.consents || [])
        setPagination(response.data.pagination || null)
        setActiveConsentsSummary(response.data.activeConsentsSummary || [])
      } else {
        setError(response.error?.message || 'Failed to fetch consent records')
        setConsents([])
        setActiveConsentsSummary([])
      }
    } catch (err) {
      console.error('Consent records fetch error:', err)
      setError('Network error - please check your connection')
      setConsents([])
      setActiveConsentsSummary([])
    } finally {
      setIsLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchConsents()
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [fetchConsents])

  const createConsent = async (consentData: any) => {
    try {
      const response = await apiClient.createConsentRecord(consentData)
      if (response.success) {
        await fetchConsents() // Refresh the list
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.error?.message || 'Failed to create consent' }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const revokeConsent = async (consentId: string, reason?: string) => {
    try {
      const response = await apiClient.revokeConsent(consentId, reason)
      if (response.success) {
        await fetchConsents() // Refresh the list
        return { success: true }
      } else {
        return { success: false, error: response.error?.message || 'Failed to revoke consent' }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  return {
    consents,
    pagination,
    activeConsentsSummary,
    isLoading,
    error,
    createConsent,
    revokeConsent,
    refetch: fetchConsents
  }
}

// Real-time updates hook (using polling for now, can be upgraded to WebSockets)
export function useRealTimeUpdates(intervalMs: number = 30000) {
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs])

  return lastUpdate
}
