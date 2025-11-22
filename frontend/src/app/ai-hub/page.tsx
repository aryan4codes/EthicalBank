'use client'

import { useEffect } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQueryLogs, useAIInsights, useDataAccessControl } from '@/hooks/useBackend'
import { 
  Bot, 
  Sparkles, 
  Eye, 
  FileText, 
  ArrowRight,
  Activity,
  Loader2,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'

export default function AIHubPage() {
  const { logs, total, fetchLogs, isLoading: logsLoading } = useQueryLogs()
  const { insights, fetchInsights, isLoading: insightsLoading } = useAIInsights()
  const { privacyScore, fetchPrivacyScore } = useDataAccessControl()

  useEffect(() => {
    fetchLogs(10)
    fetchInsights()
    fetchPrivacyScore()
  }, [])

  const recentLogs = logs.slice(0, 5)
  
  // Calculate real metrics from logs
  const last30Days = logs.filter(log => {
    const logDate = new Date(log.timestamp)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return logDate >= thirtyDaysAgo
  })

  const avgResponseTime = logs.length > 0
    ? (logs.reduce((sum, log) => sum + (log.processingTimeMs || 0), 0) / logs.length / 1000).toFixed(2)
    : '0'

  const validatedCount = logs.filter(log => log.validationStatus === 'matched').length
  const transparencyPercentage = logs.length > 0 
    ? Math.round((validatedCount / logs.length) * 100) 
    : 0

  if (logsLoading || insightsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            AI Tools
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Explore AI-powered features that help you make better financial decisions
          </p>
        </div>

        {/* Activity Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Queries</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Avg Response</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{avgResponseTime}s</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Transparency</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{transparencyPercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Last 30 Days</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{last30Days.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* AI Assistant */}
          <Link href="/ai-chat">
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">AI Assistant</CardTitle>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        Get instant answers about your finances
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-neutral-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Ask questions in natural language and get clear, transparent explanations about 
                  your accounts, spending patterns, and financial decisions.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Financial Insights */}
          <Link href="/ai-insights">
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Financial Insights</CardTitle>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        Analyze your spending and savings
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-neutral-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Get personalized recommendations based on your transaction history and financial goals.
                  {insights?.healthScore && (
                    <span className="block mt-2 font-medium text-neutral-900 dark:text-neutral-100">
                      Current Health Score: {insights.healthScore.overall}/100
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* AI Perception */}
          <Link href="/ai-perception">
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                      <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">AI Perception</CardTitle>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        See how AI views your financial profile
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-neutral-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Understand the attributes and patterns AI has identified about your financial behavior,
                  with full transparency into confidence levels and data sources.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Audit Logs */}
          <Link href="/ai-logs">
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                      <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Audit Logs</CardTitle>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        Complete history of AI interactions
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-neutral-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Review every AI decision, data access event, and query made about your account.
                  Full transparency, always.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent AI Activity</CardTitle>
              <Link href="/ai-logs">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
                <p>No AI activity yet. Start by chatting with the AI Assistant or viewing your insights.</p>
                <div className="flex gap-3 justify-center mt-4">
                  <Link href="/ai-chat">
                    <Button variant="outline" size="sm">
                      <Bot className="h-4 w-4 mr-2" />
                      Try AI Chat
                    </Button>
                  </Link>
                  <Link href="/ai-insights">
                    <Button variant="outline" size="sm">
                      <Sparkles className="h-4 w-4 mr-2" />
                      View Insights
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-800">
                        {log.queryType === 'chat' && <Bot className="h-4 w-4 text-blue-600" />}
                        {log.queryType === 'loan_eligibility' && <TrendingUp className="h-4 w-4 text-green-600" />}
                        {log.queryType === 'profile_explanation' && <Eye className="h-4 w-4 text-purple-600" />}
                        {!['chat', 'loan_eligibility', 'profile_explanation'].includes(log.queryType) && (
                          <Sparkles className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {log.queryText}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          {formatDateTime(log.timestamp)} · {(log.processingTimeMs / 1000).toFixed(2)}s
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.validationStatus === 'matched' && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Shield className="h-3 w-3" />
                          Verified
                        </div>
                      )}
                      <ArrowRight className="h-4 w-4 text-neutral-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Your Data, Your Control
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Every AI interaction is logged and transparent. You can review what data is accessed, 
                  manage permissions, and understand exactly how AI makes decisions about your finances.
                </p>
                <Link href="/privacy-control">
                  <Button variant="link" className="px-0 mt-2">
                    Manage Privacy Settings
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
