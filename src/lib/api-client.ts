import { APIResponse } from '@/types'

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  requireAuth?: boolean
}

class APIClient {
  private baseURL: string

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL
  }

  async getToken(): Promise<string | null> {
    // For server-side requests, Clerk handles auth via middleware
    // For client-side requests, we'll use Clerk's client-side token
    if (typeof window !== 'undefined') {
      // Client-side: Clerk handles tokens automatically via cookies
      // We'll rely on Clerk middleware to handle auth
      return null
    }
    // Server-side: Clerk middleware handles this
    return null
  }

  setToken(token: string | null) {
    // Clerk handles token management
    // This method is kept for compatibility but does nothing
  }

  private async request<T = any>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<APIResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      requireAuth = true
    } = config

    const url = `${this.baseURL}${endpoint}`

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    }

    // Clerk handles authentication via cookies automatically
    // No need to manually add Authorization header for client-side requests
    // Server-side middleware will extract the token from Clerk's session

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include' // Include cookies for Clerk session
    }

    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, requestConfig)
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error response
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = {
            success: false,
            error: {
              code: 'HTTP_ERROR',
              message: `HTTP ${response.status}: ${response.statusText}`
            }
          }
        }
        return errorData
      }
      
      const data = await response.json()

      // Handle authentication errors
      if (response.status === 401) {
        // Redirect to login if on client side
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }

      return data
    } catch (error) {
      console.error('API Request failed:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Failed to connect to server: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
    }
  }

  // Authentication methods - Clerk handles these
  async login(email: string, password: string) {
    // Clerk handles login via SignIn component
    return {
      success: false,
      error: {
        code: 'METHOD_NOT_SUPPORTED',
        message: 'Use Clerk SignIn component for authentication'
      }
    }
  }

  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber?: string
  }) {
    // Clerk handles registration via SignUp component
    return {
      success: false,
      error: {
        code: 'METHOD_NOT_SUPPORTED',
        message: 'Use Clerk SignUp component for registration'
      }
    }
  }

  async logout() {
    // Clerk handles logout via UserButton component
    return {
      success: false,
      error: {
        code: 'METHOD_NOT_SUPPORTED',
        message: 'Use Clerk UserButton component for logout'
      }
    }
  }

  async getProfile() {
    return this.request('/auth/me-simple')
  }

  async updateProfile(updates: {
    firstName?: string
    lastName?: string
    phoneNumber?: string
    preferences?: any
  }) {
    return this.request('/auth/me', {
      method: 'PUT',
      body: updates
    })
  }

  // Account methods
  async getAccounts() {
    return this.request('/accounts')
  }

  async getAccount(accountId: string) {
    return this.request(`/accounts/${accountId}`)
  }

  async createAccount(accountData: {
    accountType: string
    name: string
    currency?: string
  }) {
    return this.request('/accounts', {
      method: 'POST',
      body: accountData
    })
  }

  async updateAccount(accountId: string, updates: {
    name?: string
    status?: string
  }) {
    return this.request(`/accounts/${accountId}`, {
      method: 'PUT',
      body: updates
    })
  }

  async closeAccount(accountId: string) {
    return this.request(`/accounts/${accountId}`, {
      method: 'DELETE'
    })
  }

  // Transaction methods
  async getTransactions(params: {
    accountId?: string
    page?: number
    limit?: number
    type?: string
    startDate?: string
    endDate?: string
  } = {}) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    
    const queryString = searchParams.toString()
    return this.request(`/transactions${queryString ? `?${queryString}` : ''}`)
  }

  async createTransaction(transactionData: {
    accountId: string
    type: 'credit' | 'debit' | 'transfer'
    amount: number
    description?: string
    category?: string
    toAccountId?: string
  }) {
    return this.request('/transactions', {
      method: 'POST',
      body: transactionData
    })
  }

  // AI Decisions methods
  async getAIDecisions(params: {
    page?: number
    limit?: number
    type?: string
    outcome?: string
    startDate?: string
    endDate?: string
  } = {}) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    
    const queryString = searchParams.toString()
    return this.request(`/ai-decisions${queryString ? `?${queryString}` : ''}`)
  }

  async getAIDecision(decisionId: string) {
    return this.request(`/ai-decisions/${decisionId}`)
  }

  async updateAIDecisionFeedback(decisionId: string, feedback: {
    userFeedback?: 'helpful' | 'unhelpful'
    correctOutcome?: string
    feedbackNote?: string
  }) {
    return this.request(`/ai-decisions/${decisionId}`, {
      method: 'PUT',
      body: feedback
    })
  }

  // Consent Records methods
  async getConsentRecords(params: {
    page?: number
    limit?: number
    type?: string
    status?: string
    includeRevoked?: boolean
  } = {}) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    
    const queryString = searchParams.toString()
    return this.request(`/consent-records${queryString ? `?${queryString}` : ''}`)
  }

  async getConsentRecord(consentId: string) {
    return this.request(`/consent-records/${consentId}`)
  }

  async createConsentRecord(consentData: {
    consentType: string
    purpose: string
    dataTypes: string[]
    version: string
    retentionPeriod?: number
    source?: string
  }) {
    return this.request('/consent-records', {
      method: 'POST',
      body: {
        ...consentData,
        ipAddress: typeof window !== 'undefined' ? 
          (window as any).clientInformation?.userAgent || 'unknown' : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      }
    })
  }

  async revokeConsent(consentId: string, reason?: string) {
    return this.request(`/consent-records/${consentId}`, {
      method: 'PUT',
      body: {
        action: 'revoke',
        reason,
        ipAddress: typeof window !== 'undefined' ? 
          (window as any).clientInformation?.userAgent || 'unknown' : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      }
    })
  }

  // Dashboard methods
  async getDashboardSummary() {
    return this.request('/dashboard/summary')
  }

  // Utility methods
  async healthCheck() {
    return this.request('/simple-test', { requireAuth: false })
  }
}

// Create singleton instance
export const apiClient = new APIClient()

// Export the class for custom instances if needed
export default APIClient
