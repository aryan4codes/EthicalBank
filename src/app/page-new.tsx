'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  Shield, 
  Brain,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  DollarSign,
  Users,
  Zap
} from 'lucide-react'
import { AppLayout } from '@/components/app-layout'
import { useDashboard, useRealTimeUpdates } from '@/hooks/useAPI'
import { useAuthContext } from '@/contexts/AuthContext'

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const { dashboardData, isLoading, error, refetch } = useDashboard()
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
              Welcome to EthicalBank
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience transparent AI-powered banking with full control over your data and decisions.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <a href="/login">Sign In</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/register">Get Started</a>
              </Button>
            </div>
          </div>

          {/* Feature highlights for non-authenticated users */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  AI Transparency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Understand every AI decision with detailed explanations and confidence scores.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Data Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Full control over your data with granular consent management.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Smart Banking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Advanced features powered by ethical AI for better financial decisions.
                </p>
              </CardContent>
            </Card>
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
          <h2 className="text-2xl font-bold text-red-600">Error Loading Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </AppLayout>
    )
  }

  // Show dashboard for authenticated users
  const accounts = dashboardData?.accounts
  const transactions = dashboardData?.transactions
  const summary = dashboardData?.summary
  const aiDecisions = dashboardData?.aiDecisions
  const consents = dashboardData?.consents

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Welcome back, {dashboardData?.user?.firstName || 'User'}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Here's what's happening with your accounts today.
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Data
          </Badge>
        </div>

        {/* Account Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary?.totalBalance || 0)}</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Across {summary?.totalAccounts || 0} accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalTransactions || 0}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Total transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Decisions</CardTitle>
              <Brain className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalAIDecisions || 0}</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                AI decisions made
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Privacy Controls</CardTitle>
              <Shield className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.activeConsents || 0}</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Active consents
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Transparency Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-blue-600" />
                Recent AI Decisions
              </CardTitle>
              <CardDescription>
                AI decisions made on your account in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiDecisions?.recent?.slice(0, 3).map((decision: any) => (
                <div key={decision._id} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {decision.status === 'approved' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium capitalize">{decision.decisionType}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {decision.explanation?.summary || decision.explanation}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Explain
                  </Button>
                </div>
              )) || (
                <p className="text-neutral-600 dark:text-neutral-400 text-center py-4">
                  No recent AI decisions
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest account activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {transactions?.recent?.slice(0, 4).map((transaction: any) => (
                <div key={transaction._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {formatDate(new Date(transaction.createdAt))}
                      </p>
                    </div>
                  </div>
                  <span className={`font-medium ${
                    transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              )) || (
                <p className="text-neutral-600 dark:text-neutral-400 text-center py-4">
                  No recent transactions
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Overview */}
        {accounts?.list && accounts.list.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Accounts</CardTitle>
              <CardDescription>Account balances and details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.list.map((account: any) => (
                  <div key={account._id} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{account.accountType} Account</h4>
                      <CreditCard className="h-4 w-4 text-neutral-500" />
                    </div>
                    <div className="text-2xl font-bold mb-1">{formatCurrency(account.balance)}</div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      ...{account.accountNumber.slice(-4)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and account management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/transfers">
                  <ArrowUpRight className="h-6 w-6 mb-2" />
                  Transfer Money
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/scheduled-payments">
                  <CreditCard className="h-6 w-6 mb-2" />
                  Pay Bills
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/ai-transparency">
                  <Eye className="h-6 w-6 mb-2" />
                  AI Explanations
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <a href="/privacy-control">
                  <Shield className="h-6 w-6 mb-2" />
                  Privacy Settings
                </a>
              </Button>
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
