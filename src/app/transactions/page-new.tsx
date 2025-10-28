'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { 
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Store,
  Car,
  Home,
  Coffee,
  ShoppingBag,
  Smartphone,
  Brain,
  Plus,
  DollarSign
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTransactions, useRealTimeUpdates } from '@/hooks/useAPI'
import { useAuthContext } from '@/contexts/AuthContext'

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const { transactions, isLoading, error, refetch } = useTransactions()
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
              Please sign in to view your transactions
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
          <h2 className="text-2xl font-bold text-red-600">Error Loading Transactions</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </AppLayout>
    )
  }

  const transactionsList = (transactions as any[]) || []

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'food':
      case 'groceries':
        return Coffee
      case 'shopping':
        return ShoppingBag
      case 'transport':
      case 'gas':
        return Car
      case 'housing':
      case 'utilities':
        return Home
      case 'entertainment':
        return Smartphone
      default:
        return Store
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'success'
      case 'pending':
        return 'warning'
      case 'failed':
      case 'declined':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Filter transactions based on search and filter
  const filteredTransactions = transactionsList.filter((transaction: any) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'credit' && transaction.type === 'credit') ||
      (selectedFilter === 'debit' && transaction.type === 'debit')
    return matchesSearch && matchesFilter
  })

  // Calculate summary stats
  const totalTransactions = transactionsList.length
  const creditTotal = transactionsList
    .filter((t: any) => t.type === 'credit')
    .reduce((sum: number, t: any) => sum + t.amount, 0)
  const debitTotal = transactionsList
    .filter((t: any) => t.type === 'debit')
    .reduce((sum: number, t: any) => sum + t.amount, 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Transactions
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              View and manage your transaction history
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(creditTotal)}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Money received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(Math.abs(debitTotal))}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400">
                Money spent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (creditTotal + debitTotal) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(creditTotal + debitTotal)}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Net movement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="all">All Types</option>
                  <option value="credit">Credits</option>
                  <option value="debit">Debits</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              {filteredTransactions.length} of {totalTransactions} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length > 0 ? (
              <div className="space-y-4">
                {filteredTransactions.map((transaction: any) => {
                  const Icon = getCategoryIcon(transaction.category)
                  return (
                    <div key={transaction._id} className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.type === 'credit' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                        }`}>
                          {transaction.type === 'credit' ? (
                            <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowDownRight className="h-6 w-6 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                              {transaction.description}
                            </h4>
                            <Badge variant={getStatusColor('completed') as any}>
                              Completed
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                            <span>Category: {transaction.category || 'General'}</span>
                            <span>•</span>
                            <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : transactionsList.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Transactions Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You don't have any transactions yet. Start by making a transfer or payment.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Make Your First Transaction
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">
                  No transactions match your search criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Transaction Insights */}
        {transactionsList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-blue-600" />
                AI Transaction Insights
              </CardTitle>
              <CardDescription>
                AI-powered analysis of your spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Spending Analysis</h4>
                    <Badge variant="secondary">AI Insight</Badge>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    You have {totalTransactions} transactions totaling {formatCurrency(Math.abs(debitTotal))} in spending.
                  </p>
                  <Button size="sm" variant="outline">View Detailed Analysis</Button>
                </div>

                {creditTotal > 0 && (
                  <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-900 dark:text-green-100">Income Tracking</h4>
                      <Badge variant="success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Positive
                      </Badge>
                    </div>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                      Total income: {formatCurrency(creditTotal)}. Your financial flow is positive.
                    </p>
                    <Button size="sm" variant="outline">Set Savings Goals</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last Update Indicator */}
        <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </AppLayout>
  )
}
