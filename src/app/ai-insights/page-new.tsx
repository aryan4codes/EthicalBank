'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle,
  DollarSign,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Shield,
  Eye,
  Info
} from 'lucide-react'
import { useAIDecisions, useRealTimeUpdates } from '@/hooks/useAPI'
import { useAuthContext } from '@/contexts/AuthContext'

export default function AIInsights() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const { decisions: aiDecisions, isLoading, error, refetch } = useAIDecisions()
  const lastUpdate = useRealTimeUpdates(30000) // Update every 30 seconds

  // Refetch data when real-time update triggers
  useEffect(() => {
    if (isAuthenticated) {
      refetch()
    }
  }, [lastUpdate, isAuthenticated, refetch])

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    )
  }

  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              AI Insights & Transparency
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Please sign in to view your AI insights and decision explanations.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/login" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8">
                Sign In
              </a>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Show error state
  if (error) {
    return (
      <AppLayout>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-600">Error Loading AI Insights</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </AppLayout>
    )
  }

  // Get AI decisions data
  const decisionsData = aiDecisions as any
  const decisionsList = decisionsData?.list || []

  // Filter decisions based on selected filter
  const filteredDecisions = decisionsList.filter((decision: any) => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'approved') return decision.status === 'approved'
    if (selectedFilter === 'rejected') return decision.status === 'rejected'
    if (selectedFilter === 'pending') return decision.status === 'pending'
    return true
  })

  // Calculate summary statistics
  const totalDecisions = decisionsList.length
  const approvedCount = decisionsList.filter((d: any) => d.status === 'approved').length
  const rejectedCount = decisionsList.filter((d: any) => d.status === 'rejected').length
  const pendingCount = decisionsList.filter((d: any) => d.status === 'pending').length
  const averageConfidence = decisionsList.length > 0 ? 
    decisionsList.reduce((sum: number, d: any) => sum + (d.aiModel?.confidence || 0), 0) / decisionsList.length : 0

  const getDecisionIcon = (decisionType: string) => {
    switch (decisionType?.toLowerCase()) {
      case 'fraud_detection':
        return <Shield className="h-4 w-4" />
      case 'credit_approval':
        return <CheckCircle className="h-4 w-4" />
      case 'transaction_approval':
        return <CreditCard className="h-4 w-4" />
      case 'risk_assessment':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <Badge variant="success" className="text-xs">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>
      case 'pending':
        return <Badge variant="warning" className="text-xs">Pending</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400'
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              AI Insights & Transparency
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Understand how AI makes decisions about your financial data
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Ethical AI
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
              <Brain className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDecisions}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                AI decisions made
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-green-600">
                {totalDecisions > 0 ? Math.round((approvedCount / totalDecisions) * 100) : 0}% approval rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(averageConfidence * 100)}%</div>
              <p className="text-xs text-blue-600">
                Average AI confidence
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-yellow-600">
                Awaiting human review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Transparency Principles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Our AI Transparency Principles
            </CardTitle>
            <CardDescription>
              How we ensure ethical and explainable AI decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <Eye className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Explainable Decisions</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Every AI decision comes with a clear explanation of the reasoning and factors considered.
                </p>
              </div>
              <div className="text-center p-4">
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Bias Prevention</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Our models are regularly audited for bias and trained on diverse, representative data.
                </p>
              </div>
              <div className="text-center p-4">
                <Target className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Human Oversight</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Critical decisions always include human review and can be appealed or overridden.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Decision History</CardTitle>
            <CardDescription>Filter and explore AI decisions made on your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedFilter === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                All ({totalDecisions})
              </button>
              <button
                onClick={() => setSelectedFilter('approved')}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedFilter === 'approved' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setSelectedFilter('rejected')}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedFilter === 'rejected' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Rejected ({rejectedCount})
              </button>
              <button
                onClick={() => setSelectedFilter('pending')}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedFilter === 'pending' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Pending ({pendingCount})
              </button>
            </div>

            <div className="space-y-4">
              {filteredDecisions.length > 0 ? (
                filteredDecisions.map((decision: any) => (
                  <div key={decision._id} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          {getDecisionIcon(decision.decisionType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium capitalize">{decision.decisionType?.replace('_', ' ')}</h3>
                            {getStatusBadge(decision.status)}
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {formatDateTime(decision.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getConfidenceColor(decision.aiModel?.confidence || 0)}`}>
                          {Math.round((decision.aiModel?.confidence || 0) * 100)}% confidence
                        </div>
                        <div className="text-xs text-neutral-500">
                          Model: {decision.aiModel?.name || 'Unknown'}
                        </div>
                      </div>
                    </div>

                    {decision.explanation && (
                      <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-md mb-3">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          AI Explanation
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {typeof decision.explanation === 'string' 
                            ? decision.explanation 
                            : decision.explanation.summary || 'No explanation available'}
                        </p>
                        {decision.explanation.factors && (
                          <div className="mt-2">
                            <p className="text-xs text-neutral-500 mb-1">Key factors considered:</p>
                            <div className="flex flex-wrap gap-1">
                              {decision.explanation.factors.map((factor: string, index: number) => (
                                <span key={index} className="text-xs bg-neutral-200 dark:bg-neutral-700 px-2 py-1 rounded">
                                  {factor}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-neutral-500">
                        Entity: {decision.entityType} • ID: {decision.entityId?.slice(-8)}
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    No AI decisions found
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {selectedFilter !== 'all' 
                      ? `No ${selectedFilter} decisions to display.`
                      : 'AI decisions will appear here as they are made.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Last Update Indicator */}
        <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </AppLayout>
  )
}
