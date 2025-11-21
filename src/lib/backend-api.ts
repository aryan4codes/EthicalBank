/**
 * Backend API Client - Connects to Python FastAPI backend
 */

import { API_CONFIG } from './config'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export interface BackendResponse<T> {
  response?: T
  attributes_used?: string[]
  query_type?: string
  confidence?: number
  queryLogId?: string
  decision?: string
  explanation?: string
  factors?: Array<{
    name: string
    value: any
    weight: number
    impact: string
    reason: string
  }>
  profile_summary?: string
  ai_insights?: Record<string, any>
  recommendations?: string[]
  attributes_analyzed?: string[]
}

class BackendAPIClient {
  private baseURL: string
  private healthyCache: { status: boolean; ts: number } | null = null
  private pendingRequests: Map<string, Promise<any>> = new Map()

  constructor(baseURL: string = BACKEND_URL) {
    this.baseURL = baseURL
    // Log the backend URL in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('🔗 Backend API URL:', this.baseURL)
    }
  }

  /** Quick health check with short timeout and 10s cache */
  async isHealthy(force: boolean = false): Promise<boolean> {
    const now = Date.now()
    if (!force && this.healthyCache && now - this.healthyCache.ts < 10_000) {
      return this.healthyCache.status
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    try {
      const resp = await fetch(`${this.baseURL}/health`, { signal: controller.signal })
      clearTimeout(timeoutId)
      const ok = resp.ok
      this.healthyCache = { status: ok, ts: now }
      return ok
    } catch {
      clearTimeout(timeoutId)
      this.healthyCache = { status: false, ts: now }
      return false
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Get Clerk user ID from client-side
    if (typeof window !== 'undefined') {
      // We'll need to pass this from components using useUser hook
      // For now, return empty - will be set by components
    }
    
    return headers
  }

  async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: any
      clerkUserId?: string
      timeout?: number
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, clerkUserId, timeout } = options
    
    // Determine timeout based on endpoint (slow endpoints get more time)
    let requestTimeout = timeout
    if (!requestTimeout) {
      if (endpoint.includes('/summary/stats') || endpoint.includes('/summary') || 
          endpoint.includes('/recommendations') || endpoint.includes('/comprehensive')) {
        requestTimeout = 45000 // 45 seconds for aggregation/AI endpoints
      } else {
        requestTimeout = API_CONFIG.timeout || 15000
      }
    }
    
    // Create request key for deduplication (only for GET requests)
    const requestKey = method === 'GET' ? `${method}:${endpoint}:${clerkUserId || ''}` : null
    
    // Check if same request is already pending
    if (requestKey && this.pendingRequests.has(requestKey)) {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log(`♻️ Deduplicating request: ${endpoint}`)
      }
      return this.pendingRequests.get(requestKey) as Promise<T>
    }
    
    const headers = await this.getHeaders()
    if (clerkUserId) {
      headers['x-clerk-user-id'] = clerkUserId
    }

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    // Create the request promise
    const requestPromise = (async () => {
      try {
        const url = `${this.baseURL}${endpoint}`
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log(`🌐 ${method} ${url}`, { body: body ? JSON.stringify(body).substring(0, 200) : null, headers })
        }
        
        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), requestTimeout)
        
        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => response.statusText)
          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { message: errorText || response.statusText }
          }
          console.error(`❌ ${method} ${url} failed:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          })
          throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log(`✅ ${method} ${url} success`)
        }
        return data
      } catch (error: any) {
        if (error.name === 'AbortError') {
          const timeoutSeconds = Math.round(requestTimeout / 1000)
          console.error(`❌ Request timeout after ${timeoutSeconds}s: ${this.baseURL}${endpoint}`)
          
          // Provide more helpful error messages based on endpoint
          if (endpoint.includes('/comprehensive')) {
            throw new Error(`AI insights are taking longer than expected (${timeoutSeconds}s). The system is still processing your request. Please wait a moment and refresh.`)
          } else if (endpoint.includes('/ai') || endpoint.includes('/recommendations')) {
            throw new Error(`AI processing timeout (${timeoutSeconds}s). Please try again in a moment.`)
          } else {
            throw new Error(`Request timeout: The server took too long to respond (${timeoutSeconds}s). Please try again.`)
          }
        }
        console.error(`❌ Backend API error [${method} ${this.baseURL}${endpoint}]:`, error)
        throw error
      } finally {
        // Clean up pending request
        if (requestKey) {
          this.pendingRequests.delete(requestKey)
        }
      }
    })()
    
    // Store pending request for deduplication
    if (requestKey) {
      this.pendingRequests.set(requestKey, requestPromise)
    }
    
    return requestPromise
  }

  // Profile endpoints
  async getProfile(clerkUserId: string) {
    return this.request('/api/profile/me', { clerkUserId })
  }

  async updateProfile(clerkUserId: string, data: any) {
    return this.request('/api/profile/update', {
      method: 'PUT',
      body: data,
      clerkUserId,
    })
  }

  async checkProfileCompletion(clerkUserId: string) {
    return this.request('/api/profile/check-completion', { 
      clerkUserId,
      timeout: 5000 // 5 second timeout for profile check
    })
  }

  async markProfileComplete(clerkUserId: string) {
    return this.request('/api/profile/complete', {
      method: 'POST',
      clerkUserId,
    })
  }

  // AI Chat endpoints
  async chatQuery(clerkUserId: string, query: string, context?: Record<string, any>) {
    return this.request<BackendResponse<any>>('/api/ai/chat/query', {
      method: 'POST',
      body: { query, context },
      clerkUserId,
      timeout: 120000, // 2 minutes for AI responses
    })
  }

  // Loan eligibility
  async checkLoanEligibility(
    clerkUserId: string,
    loanAmount: number,
    loanType: string = 'personal',
    purpose?: string
  ) {
    return this.request<BackendResponse<any>>('/api/ai/loan-eligibility', {
      method: 'POST',
      body: { loanAmount, loanType, purpose },
      clerkUserId,
    })
  }

  // Profile explanation
  async explainProfile(clerkUserId: string, aspects?: string[]) {
    return this.request<BackendResponse<any>>('/api/ai/explain-profile', {
      method: 'POST',
      body: { aspects },
      clerkUserId,
    })
  }

  // Get query log
  async getQueryLog(clerkUserId: string, logId: string) {
    return this.request(`/api/ai/query-logs/${logId}`, { clerkUserId })
  }

  // List all query logs
  async listQueryLogs(clerkUserId: string, limit: number = 50, skip: number = 0) {
    return this.request(`/api/ai/query-logs?limit=${limit}&skip=${skip}`, { clerkUserId })
  }

  // Savings Accounts endpoints
  async getSavingsAccounts(clerkUserId: string) {
    return this.request('/api/savings/accounts', { clerkUserId })
  }

  async createSavingsAccount(clerkUserId: string, data: any) {
    return this.request('/api/savings/accounts', {
      method: 'POST',
      body: data,
      clerkUserId,
    })
  }

  async updateSavingsAccount(clerkUserId: string, accountId: string, data: any) {
    return this.request(`/api/savings/accounts/${accountId}`, {
      method: 'PUT',
      body: data,
      clerkUserId,
    })
  }

  async deleteSavingsAccount(clerkUserId: string, accountId: string) {
    return this.request(`/api/savings/accounts/${accountId}`, {
      method: 'DELETE',
      clerkUserId,
    })
  }

  async depositToSavingsAccount(clerkUserId: string, accountId: string, amount: number) {
    return this.request(`/api/savings/accounts/${accountId}/deposit`, {
      method: 'POST',
      body: { amount },
      clerkUserId,
    })
  }

  async withdrawFromSavingsAccount(clerkUserId: string, accountId: string, amount: number) {
    return this.request(`/api/savings/accounts/${accountId}/withdraw`, {
      method: 'POST',
      body: { amount },
      clerkUserId,
    })
  }

  // Savings Goals endpoints
  async getSavingsGoals(clerkUserId: string) {
    return this.request('/api/savings/goals', { clerkUserId })
  }

  async createSavingsGoal(clerkUserId: string, data: any) {
    return this.request('/api/savings/goals', {
      method: 'POST',
      body: data,
      clerkUserId,
    })
  }

  async updateSavingsGoal(clerkUserId: string, goalId: string, data: any) {
    return this.request(`/api/savings/goals/${goalId}`, {
      method: 'PUT',
      body: data,
      clerkUserId,
    })
  }

  async deleteSavingsGoal(clerkUserId: string, goalId: string) {
    return this.request(`/api/savings/goals/${goalId}`, {
      method: 'DELETE',
      clerkUserId,
    })
  }

  async contributeToGoal(clerkUserId: string, goalId: string, amount: number) {
    return this.request(`/api/savings/goals/${goalId}/contribute`, {
      method: 'POST',
      body: { amount },
      clerkUserId,
    })
  }

  async getSavingsSummary(clerkUserId: string) {
    return this.request('/api/savings/summary', { clerkUserId })
  }

  // Accounts endpoints
  async getAccounts(clerkUserId: string) {
    return this.request('/api/accounts', { clerkUserId })
  }

  async getAccount(clerkUserId: string, accountId: string) {
    return this.request(`/api/accounts/${accountId}`, { clerkUserId })
  }

  async createAccount(clerkUserId: string, data: any) {
    return this.request('/api/accounts', {
      method: 'POST',
      body: data,
      clerkUserId,
    })
  }

  async updateAccount(clerkUserId: string, accountId: string, data: any) {
    return this.request(`/api/accounts/${accountId}`, {
      method: 'PUT',
      body: data,
      clerkUserId,
    })
  }

  async deleteAccount(clerkUserId: string, accountId: string) {
    return this.request(`/api/accounts/${accountId}`, {
      method: 'DELETE',
      clerkUserId,
    })
  }

  async getAccountsSummary(clerkUserId: string) {
    return this.request('/api/accounts/summary', { clerkUserId })
  }

  // Transactions endpoints
  async getTransactions(clerkUserId: string, params?: {
    accountId?: string
    type?: string
    category?: string
    limit?: number
    skip?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params?.accountId) queryParams.append('accountId', params.accountId)
    if (params?.type) queryParams.append('type', params.type)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    
    const query = queryParams.toString()
    return this.request(`/api/transactions${query ? `?${query}` : ''}`, { clerkUserId })
  }

  async getTransaction(clerkUserId: string, transactionId: string) {
    return this.request(`/api/transactions/${transactionId}`, { clerkUserId })
  }

  async createTransaction(clerkUserId: string, data: any, skipAI: boolean = true) {
    const queryParams = skipAI ? '?skip_ai=true' : ''
    return this.request(`/api/transactions${queryParams}`, {
      method: 'POST',
      body: data,
      clerkUserId,
    })
  }

  async deleteTransaction(clerkUserId: string, transactionId: string) {
    return this.request(`/api/transactions/${transactionId}`, {
      method: 'DELETE',
      clerkUserId,
    })
  }

  async getTransactionStats(clerkUserId: string) {
    return this.request('/api/transactions/summary/stats', { clerkUserId })
  }

  async getTransactionRecommendations(clerkUserId: string) {
    return this.request('/api/transactions/recommendations/insights', { clerkUserId })
  }

  // Savings recommendations
  async getSavingsAccountRecommendations(clerkUserId: string) {
    return this.request('/api/savings/recommendations/account', { clerkUserId })
  }

  // AI Insights endpoints
  async getComprehensiveInsights(clerkUserId: string) {
    return this.request('/api/ai-insights/comprehensive', { 
      clerkUserId,
      timeout: 60000 // 60 second timeout for AI insights
    })
  }

  // Privacy & Data Control endpoints
  async getDataAttributes(clerkUserId: string) {
    return this.request('/api/privacy/data-attributes', { clerkUserId })
  }

  async getDataAccessPermissions(clerkUserId: string) {
    return this.request('/api/privacy/permissions', { clerkUserId })
  }

  async updateDataAccessPermissions(clerkUserId: string, permissions: any[]) {
    return this.request('/api/privacy/permissions', {
      method: 'PUT',
      body: { permissions },
      clerkUserId,
    })
  }

  async getConsentHistory(clerkUserId: string, limit?: number) {
    const query = limit ? `?limit=${limit}` : ''
    return this.request(`/api/privacy/consent-history${query}`, { clerkUserId })
  }

  async getPrivacyScore(clerkUserId: string) {
    return this.request('/api/privacy/privacy-score', { clerkUserId })
  }

  // AI Perception endpoints
  async getAIPerception(clerkUserId: string) {
    return this.request('/api/ai-perception', { clerkUserId })
  }

  async disputeAIPerception(clerkUserId: string, dispute: {
    category: string
    label: string
    reason: string
    correction?: string
  }) {
    return this.request('/api/ai-perception/dispute', {
      method: 'POST',
      body: dispute,
      clerkUserId,
    })
  }
}

export const backendAPI = new BackendAPIClient()

