'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { 
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()

  // Mock transaction data to prevent API failures
  const mockTransactions = [
    {
      _id: '1',
      description: 'Grocery Store Purchase',
      merchant: 'Fresh Market',
      category: 'food',
      amount: 45.67,
      type: 'debit',
      createdAt: new Date().toISOString(),
      isAiFlagged: false,
      aiFraudScore: 0.1
    },
    {
      _id: '2',
      description: 'Salary Deposit',
      merchant: 'Employer Inc',
      category: 'income',
      amount: 3500.00,
      type: 'credit',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isAiFlagged: false,
      aiFraudScore: 0.05
    },
    {
      _id: '3',
      description: 'Gas Station',
      merchant: 'Shell Station',
      category: 'transport',
      amount: 65.43,
      type: 'debit',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      isAiFlagged: true,
      aiFraudScore: 0.75
    }
  ]

  // Load transactions (use mock data for now to prevent API issues)
  const loadTransactions = async () => {
    if (!isAuthenticated) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // For now, use mock data to prevent API failures
      // TODO: Replace with actual API call when backend is stable
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
      setTransactions(mockTransactions)
    } catch (err) {
      console.error('Failed to load transactions:', err)
      setError('Failed to load transactions. Using demo data.')
      setTransactions(mockTransactions) // Fallback to mock data
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [isAuthenticated])

  // Show loading state
  if (authLoading) {
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
              <Button asChild>
                <a href="/login">Sign In</a>
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction: any) => {
    const matchesSearch = !searchTerm || 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || 
      selectedFilter === 'credit' && transaction.type === 'credit' ||
      selectedFilter === 'debit' && transaction.type === 'debit' ||
      selectedFilter === 'flagged' && transaction.isAiFlagged
    
    return matchesSearch && matchesFilter
  })

  const totalSpent = transactions.filter((t: any) => t.type === 'debit').reduce((sum: number, t: any) => sum + t.amount, 0)
  const totalReceived = transactions.filter((t: any) => t.type === 'credit').reduce((sum: number, t: any) => sum + t.amount, 0)
  const flaggedCount = transactions.filter((t: any) => t.isAiFlagged).length

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
            <Button variant="outline" size="sm" onClick={loadTransactions} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              <p className="text-xs text-red-600">Outgoing transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalReceived)}</div>
              <p className="text-xs text-green-600">Incoming transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Flagged</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{flaggedCount}</div>
              <p className="text-xs text-yellow-600">Needs attention</p>
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
              {filteredTransactions.length} of {transactions.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction: any) => (
                    <div key={transaction._id} className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'credit' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                        }`}>
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{transaction.description}</p>
                            {transaction.isAiFlagged && (
                              <Badge variant="warning" className="text-xs">AI Flagged</Badge>
                            )}
                            {transaction.type === 'credit' ? (
                              <Badge variant="success" className="text-xs">Credit</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Debit</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                            <span>{transaction.merchant || 'Unknown'}</span>
                            <span>•</span>
                            <span className="capitalize">{transaction.category || 'Other'}</span>
                            <span>•</span>
                            <span>{formatDateTime(new Date(transaction.createdAt))}</span>
                          </div>
                        </div>
                      </div>
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
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
