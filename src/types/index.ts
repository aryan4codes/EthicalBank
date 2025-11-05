import { Document, Types } from 'mongoose'

// User Types
export interface IUser extends Document {
  _id: Types.ObjectId
  clerkId?: string
  email: string
  password?: string
  firstName: string
  lastName: string
  phoneNumber?: string
  dateOfBirth?: Date
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
  kycStatus: 'pending' | 'verified' | 'rejected'
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Account Types
export interface IAccount extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  accountNumber: string
  accountType: 'checking' | 'savings' | 'credit' | 'loan' | 'investment'
  balance: number
  currency: string
  status: 'active' | 'inactive' | 'frozen' | 'closed'
  metadata: {
    creditLimit?: number
    interestRate?: number
    minimumBalance?: number
    overdraftLimit?: number
  }
  createdAt: Date
  updatedAt: Date
}

// Transaction Types
export interface ITransaction extends Document {
  _id: Types.ObjectId
  accountId: Types.ObjectId
  userId: Types.ObjectId
  type: 'debit' | 'credit'
  amount: number
  currency: string
  description: string
  category: string
  merchantName?: string
  merchantCategory?: string
  location?: {
    country: string
    city: string
    coordinates?: [number, number]
  }
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  metadata: {
    reference?: string
    externalId?: string
    fees?: number
    exchangeRate?: number
  }
  aiAnalysis: {
    fraudScore: number
    riskLevel: 'low' | 'medium' | 'high'
    categoryConfidence: number
    anomalyScore: number
    explanation?: string
  }
  createdAt: Date
  updatedAt: Date
}

// AI Decision Types
export interface IAIDecision extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  relatedEntityId?: Types.ObjectId // Transaction, Account, or Loan ID
  entityType: 'transaction' | 'account' | 'loan' | 'credit_application' | 'product_recommendation'
  decisionType: 'approval' | 'denial' | 'flag' | 'recommendation' | 'insight'
  status: 'approved' | 'denied' | 'flagged' | 'under_review'
  aiModel: {
    name: string
    version: string
    confidence: number
    biasCheck: boolean
  }
  explanation: {
    summary: string
    details: string
    factors: Array<{
      name: string
      value: any
      weight: number
      impact: 'positive' | 'negative' | 'neutral'
    }>
    recommendations?: string[]
  }
  humanReview?: {
    reviewedBy: string
    reviewedAt: Date
    decision: 'confirmed' | 'overridden'
    notes?: string
  }
  createdAt: Date
  updatedAt: Date
}

// Consent Record Types
export interface IConsentRecord extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  consentType: string
  status: 'granted' | 'revoked' | 'expired'
  purpose: string
  dataTypes: string[]
  expiresAt?: Date
  metadata: {
    ipAddress?: string
    userAgent?: string
    source: 'web' | 'mobile' | 'api'
  }
  version: string
  createdAt: Date
  updatedAt: Date
}

// Loan Application Types
export interface ILoanApplication extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  loanType: 'personal' | 'mortgage' | 'auto' | 'business' | 'student'
  requestedAmount: number
  purpose: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'denied' | 'cancelled'
  financialInfo: {
    annualIncome: number
    employmentStatus: 'employed' | 'self_employed' | 'unemployed' | 'retired'
    employmentHistory: Array<{
      employer: string
      position: string
      startDate: Date
      endDate?: Date
      salary: number
    }>
    monthlyExpenses: number
    existingDebts: Array<{
      type: string
      balance: number
      monthlyPayment: number
    }>
  }
  aiAssessment?: {
    creditScore: number
    riskLevel: 'low' | 'medium' | 'high'
    debtToIncomeRatio: number
    approvalProbability: number
    recommendedAmount?: number
    recommendedTerms?: {
      interestRate: number
      termMonths: number
      monthlyPayment: number
    }
  }
  documents: Array<{
    type: string
    filename: string
    uploadedAt: Date
    verified: boolean
  }>
  decisionHistory: Array<{
    action: string
    timestamp: Date
    userId?: Types.ObjectId
    reason?: string
    aiDecisionId?: Types.ObjectId
  }>
  createdAt: Date
  updatedAt: Date
}

// Financial Goal Types
export interface IFinancialGoal extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  title: string
  description?: string
  type: 'emergency_fund' | 'down_payment' | 'retirement' | 'vacation' | 'debt_payoff' | 'investment' | 'custom'
  targetAmount: number
  currentAmount: number
  targetDate: Date
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  autoContribution?: {
    enabled: boolean
    amount: number
    frequency: 'weekly' | 'monthly' | 'quarterly'
    sourceAccountId: Types.ObjectId
  }
  milestones: Array<{
    percentage: number
    amount: number
    achievedAt?: Date
    reward?: string
  }>
  aiInsights: {
    feasibilityScore: number
    recommendedMonthlyContribution: number
    projectedCompletionDate: Date
    tips: string[]
  }
  createdAt: Date
  updatedAt: Date
}

// Alert/Notification Types
export interface IAlert extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  type: 'security' | 'transaction' | 'ai_decision' | 'privacy' | 'account' | 'goal' | 'promotional'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  data?: any
  status: 'unread' | 'read' | 'dismissed' | 'archived'
  channels: Array<'in_app' | 'email' | 'sms' | 'push'>
  sentAt?: Date
  readAt?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
  agreeToTerms: boolean
}

export interface AuthResponse {
  user: Omit<IUser, 'password'>
  token: string
  refreshToken: string
  expiresIn: number
}

// Dashboard Types
export interface DashboardData {
  user?: Omit<IUser, 'password'>
  accounts?: {
    list: IAccount[]
    summary?: {
      totalBalance: number
      totalAccounts: number
    }
  }
  transactions?: {
    recent: ITransaction[]
    summary?: {
      totalTransactions: number
      thisMonth: number
    }
  }
  aiDecisions?: {
    recent: IAIDecision[]
    summary?: {
      totalAIDecisions: number
      thisMonth: number
    }
  }
  consents?: {
    active: IConsentRecord[]
    summary?: {
      activeConsents: number
      total: number
    }
  }
  summary?: {
    totalBalance: number
    totalAccounts: number
    totalTransactions: number
    totalAIDecisions: number
    activeConsents: number
  }
  alerts?: IAlert[]
  financialHealth?: {
    score: number
    factors: Array<{
      name: string
      score: number
      status: 'excellent' | 'good' | 'fair' | 'poor'
    }>
  }
  insights?: Array<{
    type: 'spending' | 'saving' | 'credit' | 'investment'
    title: string
    description: string
    action?: string
    priority: 'high' | 'medium' | 'low'
  }>
}
