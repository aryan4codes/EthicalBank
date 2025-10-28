'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { 
  CreditCard, 
  PiggyBank, 
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAccounts, useRealTimeUpdates } from '@/hooks/useAPI'
import { useAuthContext } from '@/contexts/AuthContext'

export default function Accounts() {
  const [showBalances, setShowBalances] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const { accounts, isLoading, error, refetch } = useAccounts()
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Please sign in to view your accounts
            </h1>
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
          <h2 className="text-2xl font-bold text-red-600">Error Loading Accounts</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </AppLayout>
    )
  }

  const accountsList = (accounts as any[]) || []

  const displayBalance = (balance: number) => {
    return showBalances ? formatCurrency(Math.abs(balance)) : '****'
  }

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
      case 'credit':
        return CreditCard
      case 'savings':
      case 'investment':
        return PiggyBank
      default:
        return DollarSign
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success'
      case 'frozen':
        return 'warning'
      case 'closed':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Calculate totals
  const totalAssets = accountsList
    .filter((account: any) => account.balance > 0)
    .reduce((sum: number, account: any) => sum + account.balance, 0)
  
  const totalLiabilities = accountsList
    .filter((account: any) => account.balance < 0)
    .reduce((sum: number, account: any) => sum + Math.abs(account.balance), 0)
  
  const netWorth = totalAssets - totalLiabilities

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              My Accounts
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage and monitor all your banking accounts
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center"
            >
              {showBalances ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showBalances ? 'Hide Balances' : 'Show Balances'}
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Open New Account
            </Button>
          </div>
        </div>

        {/* Account Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showBalances ? formatCurrency(totalAssets) : '****'}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                <ArrowUpRight className="inline h-3 w-3" />
                {accountsList.filter((a: any) => a.balance > 0).length} accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showBalances ? formatCurrency(totalLiabilities) : '****'}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400">
                <ArrowDownRight className="inline h-3 w-3" />
                {accountsList.filter((a: any) => a.balance < 0).length} credit accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {showBalances ? formatCurrency(netWorth) : '****'}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                {netWorth >= 0 ? 'Positive' : 'Negative'} financial position
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Cards */}
        {accountsList.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {accountsList.map((account: any) => {
              const Icon = getAccountIcon(account.accountType)
              const isCredit = account.accountType === 'credit'
              
              return (
                <Card key={account._id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg capitalize">
                            {account.accountType} Account
                          </CardTitle>
                          <CardDescription>
                            Account • ...{account.accountNumber.slice(-4)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={getStatusColor('active') as any}>
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Balance */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {isCredit ? 'Current Balance' : 'Available Balance'}
                          </span>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              account.balance < 0 ? 'text-red-600' : 'text-neutral-900 dark:text-neutral-100'
                            }`}>
                              {account.balance < 0 ? '-' : ''}
                              {displayBalance(account.balance)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Account Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-neutral-600 dark:text-neutral-400">Account Type</span>
                          <div className="font-medium capitalize">{account.accountType}</div>
                        </div>
                        <div>
                          <span className="text-neutral-600 dark:text-neutral-400">Created</span>
                          <div className="font-medium">
                            {new Date(account.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Account Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Transfer
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Accounts Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You don't have any accounts yet. Get started by opening your first account.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Open Your First Account
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>
              Additional services and account options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/accounts/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-20 flex-col">
                <Plus className="h-6 w-6 mb-2" />
                Open New Account
              </a>
              <Button variant="outline" className="h-20 flex-col">
                <CreditCard className="h-6 w-6 mb-2" />
                Apply for Credit Card
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <PiggyBank className="h-6 w-6 mb-2" />
                Start Savings Goal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights for Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              AI Account Insights
            </CardTitle>
            <CardDescription>
              Personalized recommendations for your accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accountsList.length > 0 ? (
                <>
                  <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-900 dark:text-green-100">Account Performance</h4>
                      <Badge variant="success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Good
                      </Badge>
                    </div>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                      Your accounts are performing well. Total balance across all accounts: {formatCurrency(totalAssets)}.
                    </p>
                    <Button size="sm" variant="outline">View Detailed Analysis</Button>
                  </div>

                  {accountsList.some((account: any) => account.accountType === 'savings') && (
                    <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Savings Opportunity</h4>
                        <Badge variant="secondary">Recommendation</Badge>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Consider setting up automatic transfers to grow your savings consistently.
                      </p>
                      <Button size="sm" variant="outline">Setup Auto-Transfer</Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Open an account to see personalized AI insights and recommendations.
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
