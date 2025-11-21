/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Transaction History
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Please sign in to view your transaction history.
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
          <h2 className="text-2xl font-bold text-red-600">Error Loading Transactions</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </AppLayout>
    )
  }

  // Get transaction data
  const transactionList = Array.isArray(transactions) ? transactions : []
  
  // Calculate stats from transactions array
  const totalTransactions = transactionList.length
  const totalSpent = transactionList
    .filter((t: any) => t.type === 'debit')
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
  const totalReceived = transactionList
    .filter((t: any) => t.type === 'credit')
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
  const flaggedCount = transactionList.filter((t: any) => t.isAiFlagged).length

  // Filter transactions based on search and filter
  const filteredTransactions = transactionList.filter((transaction: any) => {
    const matchesSearch = !searchTerm || 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || 
      selectedFilter === 'credit' && transaction.type === 'credit' ||
      selectedFilter === 'debit' && transaction.type === 'debit' ||
      selectedFilter === 'flagged' && transaction.isAiFlagged
    
    return matchesSearch && matchesFilter
  })

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'food':
      case 'dining':
        return <Coffee className="h-4 w-4" />
      case 'shopping':
        return <ShoppingBag className="h-4 w-4" />
      case 'transport':
      case 'transportation':
        return <Car className="h-4 w-4" />
      case 'utilities':
        return <Home className="h-4 w-4" />
      case 'technology':
        return <Smartphone className="h-4 w-4" />
      case 'retail':
        return <Store className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getStatusBadge = (transaction: any) => {
    if (transaction.isAiFlagged) {
      return <Badge variant="warning" className="text-xs">AI Flagged</Badge>
    }
    if (transaction.type === 'credit') {
      return <Badge variant="success" className="text-xs">Credit</Badge>
    }
    return <Badge variant="secondary" className="text-xs">Debit</Badge>
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Transaction History
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              View and analyze your transaction history with AI insights
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
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
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{totalTransactions}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">Total Spent</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {formatCurrency(totalSpent)}
              </div>
              <p className="text-xs text-red-600">
                Outgoing transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {formatCurrency(totalReceived)}
              </div>
              <p className="text-xs text-green-600">
                Incoming transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Flagged</CardTitle>
              <Brain className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{flaggedCount}</div>
              <p className="text-xs text-yellow-600">
                Needs attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select 
                  value={selectedFilter} 
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800"
                >
                  <option value="all">All Transactions</option>
                  <option value="credit">Credits Only</option>
                  <option value="debit">Debits Only</option>
                  <option value="flagged">AI Flagged</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              {filteredTransactions.length} of {transactionList.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction: any) => (
                  <div key={transaction._id} className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                      }`}>
                        {getCategoryIcon(transaction.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{transaction.description}</p>
                          {getStatusBadge(transaction)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                          <span>{transaction.merchant || 'Unknown'}</span>
                          <span>•</span>
                          <span className="capitalize">{transaction.category || 'Other'}</span>
                          <span>•</span>
                          <span>{formatDateTime(transaction.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                        {transaction.aiFraudScore !== undefined && (
                          <div className="text-xs text-neutral-500">
                            Risk: {Math.round(transaction.aiFraudScore * 100)}%
                          </div>
                        )}
                      </div>
                      {transaction.isAiFlagged && (
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View AI Analysis
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    No transactions found
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {searchTerm || selectedFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'You have no transactions yet.'}
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
