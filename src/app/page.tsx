'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { AppLayout } from '@/components/app-layout'
import { useUser } from '@clerk/nextjs'
import { 
  useAccounts, 
  useTransactions, 
  useSavings, 
  useAIInsights,
  useDataAccessControl 
} from '@/hooks/useBackend'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  TrendingDown,
  Shield, 
  Brain,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  DollarSign,
  Users,
  Zap,
  Target,
  PieChart,
  BarChart3,
  FileText,
  Sparkles,
  Loader2,
  RefreshCw,
  Info,
  AlertTriangle,
  Lightbulb,
  Lock,
  Database
} from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const { accounts, summary: accountsSummary, fetchAll: fetchAccounts, isLoading: accountsLoading } = useAccounts()
  const { transactions, stats: transactionStats, recommendations: transactionRecommendations, fetchAll: fetchTransactions } = useTransactions()
  const { summary: savingsSummary, fetchAll: fetchSavings } = useSavings()
  const { insights, fetchInsights } = useAIInsights()
  const { privacyScore, fetchPrivacyScore } = useDataAccessControl()

  const [refreshing, setRefreshing] = useState(false)

  const fetchAll = useCallback(async (force: boolean = false) => {
    // Skip if data already loaded and not forcing
    if (!force && accounts.length > 0 && accountsSummary) {
      return
    }
    
    setRefreshing(true)
    try {
      await Promise.all([
        fetchAccounts(),
        fetchTransactions(),
        fetchSavings(),
        fetchInsights(),
        fetchPrivacyScore(),
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setRefreshing(false)
    }
  }, [accounts.length, accountsSummary, fetchAccounts, fetchTransactions, fetchSavings, fetchInsights, fetchPrivacyScore])

  useEffect(() => {
    // Only fetch if user is loaded and we don't have data yet
    if (isLoaded && user && accounts.length === 0 && !accountsSummary) {
      fetchAll()
    }
  }, [isLoaded, user]) // Removed fetchAll from deps

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              Welcome to EthicalBank
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Experience transparent AI-powered banking with full control over your data and decisions.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  const totalBalance = accountsSummary?.totalAssets || 0
  const totalSavings = savingsSummary?.totalSavings || 0
  const netWorth = accountsSummary?.netWorth || 0
  const healthScore = insights?.healthScore?.overall || 0
  const privacyScoreValue = privacyScore?.score || 0

  const recentTransactions = transactions.slice(0, 5)
  const topRecommendations = transactionRecommendations?.slice(0, 3) || []

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Welcome back, {user.firstName || 'User'}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Your complete financial overview with AI-powered insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchAll} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Data
            </Badge>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(netWorth)}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Total assets - liabilities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(totalBalance)}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Across {accounts.length} accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <PiggyBank className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalSavings)}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {savingsSummary?.activeGoals || 0} active goals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{healthScore}/100</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Fair'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Health & Privacy Score */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Financial Health Score
              </CardTitle>
              <CardDescription>
                AI assessment of your financial wellbeing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights?.healthScore ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className="text-2xl font-bold">{insights.healthScore.overall}/100</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Savings Rate</span>
                      <span className="font-medium">{insights.healthScore.savingsRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Credit Score</span>
                      <span className="font-medium">{insights.healthScore.creditScore}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Emergency Fund</span>
                      <span className="font-medium">{insights.healthScore.emergencyFund} months</span>
                    </div>
                  </div>
                  <Link href="/ai-insights">
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Detailed Insights
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4 text-neutral-500">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading health score...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Privacy Score
              </CardTitle>
              <CardDescription>
                Your data privacy protection level
              </CardDescription>
            </CardHeader>
            <CardContent>
              {privacyScore ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Privacy Score</span>
                    <span className="text-2xl font-bold">{privacyScore.score}%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Attributes Allowed</span>
                      <span className="font-medium">{privacyScore.allowedAttributes || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Attributes Restricted</span>
                      <span className="font-medium">{privacyScore.deniedAttributes || 0}</span>
                    </div>
                  </div>
                  <Link href="/privacy-control">
                    <Button variant="outline" className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Manage Privacy Settings
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4 text-neutral-500">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading privacy score...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        {topRecommendations.length > 0 && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                AI Spending Recommendations
              </CardTitle>
              <CardDescription>
                Personalized suggestions to optimize your finances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topRecommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="p-3 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          <h4 className="font-medium">{rec.insight}</h4>
                          <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'warning' : 'secondary'} className="text-xs">
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          {rec.recommendation}
                        </p>
                        {rec.potentialSavings && (
                          <p className="text-xs font-medium text-green-600">
                            Potential savings: {formatCurrency(rec.potentialSavings)}/year
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accounts & Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accounts Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Accounts</CardTitle>
                  <CardDescription>Account balances and details</CardDescription>
                </div>
                <Link href="/accounts">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : accounts.length > 0 ? (
                <div className="space-y-3">
                  {accounts.slice(0, 5).map((account: any) => (
                    <div key={account.id} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-black">{account.name || `${account.accountType} Account`}</p>
                          <p className="text-xs text-neutral-500">
                            {account.accountNumber?.slice(-4) || '****'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-neutral-900 dark:text-neutral-100 text-black">{formatCurrency(account.balance)}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {account.accountType}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    No accounts yet
                  </p>
                  <Link href="/accounts">
                    <Button variant="outline" size="sm" className="mt-2">
                      Open Account
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest account activity</CardDescription>
                </div>
                <Link href="/transactions">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction: any) => {
                    const aiAnalysis = transaction.aiAnalysis || {}
                    const isFlagged = aiAnalysis.riskLevel === 'medium' || aiAnalysis.riskLevel === 'high'
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'credit' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                          }`}>
                            {transaction.type === 'credit' ? (
                              <ArrowUpRight className="h-5 w-5 text-green-600" />
                            ) : (
                              <ArrowDownRight className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{transaction.description}</p>
                              {isFlagged && (
                                <Badge variant="warning" className="text-xs">AI Flagged</Badge>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500">
                              {formatDateTime(new Date(transaction.createdAt))}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          {aiAnalysis.fraudScore !== undefined && (
                            <p className="text-xs text-neutral-500">
                              Risk: {Math.round(aiAnalysis.fraudScore * 100)}%
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    No recent transactions
                  </p>
                  <Link href="/transactions">
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Transaction
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Financial Insights Summary */}
        {insights && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Summary */}
            {insights.spendingAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    Spending Summary
                  </CardTitle>
                  <CardDescription>
                    Last 30 days overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-900 dark:text-neutral-100">Total Spent</span>
                      <span className="font-bold">{formatCurrency(insights.spendingAnalysis.totalSpending)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monthly Average</span>
                      <span className="font-medium">{formatCurrency(insights.spendingAnalysis.monthlyAverage)}</span>
                    </div>
                    {insights.spendingAnalysis.wasteAnalysis && insights.spendingAnalysis.wasteAnalysis.length > 0 && (
                      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {insights.spendingAnalysis.wasteAnalysis.length} areas with potential waste
                        </p>
                      </div>
                    )}
                    <Link href="/ai-insights">
                      <Button variant="outline" className="w-full mt-2">
                        View Full Analysis
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Financial Plans Summary */}
            {insights.financialPlanning && insights.financialPlanning.plans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Financial Plans
                  </CardTitle>
                  <CardDescription>
                    Personalized recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.financialPlanning.plans.slice(0, 2).map((plan: any, idx: number) => (
                      <div key={idx} className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{plan.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {plan.timeframe}
                          </Badge>
                          <Badge variant={plan.priority === 'high' ? 'destructive' : plan.priority === 'medium' ? 'warning' : 'secondary'} className="text-xs">
                            {plan.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                          {plan.description}
                        </p>
                      </div>
                    ))}
                    <Link href="/ai-insights">
                      <Button variant="outline" className="w-full mt-2">
                        View All Plans
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and account management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Link href="/accounts">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <CreditCard className="h-6 w-6 mb-2" />
                  Accounts
                </Button>
              </Link>
              <Link href="/transactions">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Transactions
                </Button>
              </Link>
              <Link href="/savings">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <PiggyBank className="h-6 w-6 mb-2" />
                  Savings
                </Button>
              </Link>
              <Link href="/ai-chat">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <Brain className="h-6 w-6 mb-2" />
                  AI Chat
                </Button>
              </Link>
              <Link href="/ai-insights">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Insights
                </Button>
              </Link>
              <Link href="/privacy-control">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <Shield className="h-6 w-6 mb-2" />
                  Privacy
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Transparency Section */}
        {insights?.attributes_used && insights.attributes_used.length > 0 && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Complete Transparency
              </CardTitle>
              <CardDescription>
                Data attributes used to generate these insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  // Group attributes by category
                  const grouped: Record<string, string[]> = {}
                  insights.attributes_used.forEach((attr: string) => {
                    const category = attr.split('.')[0]
                    if (!grouped[category]) {
                      grouped[category] = []
                    }
                    grouped[category].push(attr)
                  })

                  const categoryNames: Record<string, string> = {
                    'user': 'Personal Information',
                    'accounts': 'Account Information',
                    'transactions': 'Transaction Data',
                    'savings_accounts': 'Savings Accounts',
                    'savings_goals': 'Savings Goals'
                  }

                  return Object.entries(grouped).slice(0, 3).map(([category, attrs]) => (
                    <div key={category} className="flex items-center justify-between p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{categoryNames[category] || category}</p>
                        <p className="text-xs text-neutral-500">{attrs.length} attributes</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {attrs.slice(0, 2).map((attr: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs font-mono">
                            {attr}
                          </Badge>
                        ))}
                        {attrs.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{attrs.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                })()}
                <Link href="/ai-insights">
                  <Button variant="ghost" className="w-full">
                    View All Attributes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Clock className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactionStats?.totalTransactions || 0}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Transactions
              </p>
              {transactionStats && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-red-600">Spent: {formatCurrency(transactionStats.totalSpent || 0)}</span>
                  <span className="text-green-600">Received: {formatCurrency(transactionStats.totalReceived || 0)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Flagged</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactionStats?.flaggedCount || 0}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Transactions needing attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Goals</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savingsSummary?.activeGoals || 0}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Active savings goals
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
