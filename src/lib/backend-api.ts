/**
 * Backend API Client - Connects to Python FastAPI backend
 */

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

  constructor(baseURL: string = BACKEND_URL) {
    this.baseURL = baseURL
    // Log the backend URL in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('🔗 Backend API URL:', this.baseURL)
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
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, clerkUserId } = options
    
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

    try {
      const url = `${this.baseURL}${endpoint}`
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log(`🌐 ${method} ${url}`, { body, headers })
      }
      
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        console.error(`❌ ${method} ${url} failed:`, error)
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log(`✅ ${method} ${url} success`)
      }
      return data
    } catch (error) {
      console.error(`❌ Backend API error [${method} ${this.baseURL}${endpoint}]:`, error)
      throw error
    }
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
    return this.request('/api/profile/check-completion', { clerkUserId })
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
}

export const backendAPI = new BackendAPIClient()

