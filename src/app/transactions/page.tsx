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
  Brain
} from 'lucide-react'
import { useState } from 'react'

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const transactions = [
    {
      id: '1',
      timestamp: new Date('2024-10-27T14:30:00'),
      description: 'Grocery Store',
      merchant: 'Whole Foods Market',
      amount: -87.43,
      category: 'Groceries',
      accountId: 'checking-1234',
      status: 'Completed',
      type: 'Purchase',
      location: 'San Francisco, CA',
      aiFraudScore: 0.02,
      isAiFlagged: false,
      aiDecisionId: 'ai_001'
    },
    {
      id: '2',
      timestamp: new Date('2024-10-27T09:15:00'),
      description: 'Coffee Purchase',
      merchant: 'Blue Bottle Coffee',
      amount: -4.50,
      category: 'Dining',
      accountId: 'credit-9012',
      status: 'Completed',
      type: 'Purchase',
      location: 'San Francisco, CA',
      aiFraudScore: 0.01,
      isAiFlagged: false,
      aiDecisionId: 'ai_002'
    },
    {
      id: '3',
      timestamp: new Date('2024-10-26T16:45:00'),
      description: 'Online Purchase',
      merchant: 'Amazon',
      amount: -125.99,
      category: 'Shopping',
      accountId: 'credit-9012',
      status: 'Completed',
      type: 'Purchase',
      location: 'Online',
      aiFraudScore: 0.03,
      isAiFlagged: false,
      aiDecisionId: 'ai_003'
    },
    {
      id: '4',
      timestamp: new Date('2024-10-26T12:20:00'),
      description: 'Unusual Location Purchase',
      merchant: 'Unknown Gas Station',
      amount: -67.82,
      category: 'Gas',
      accountId: 'checking-1234',
      status: 'Under Review',
      type: 'Purchase',
      location: 'Las Vegas, NV',
      aiFraudScore: 0.78,
      isAiFlagged: true,
      aiDecisionId: 'ai_004'
    },
    {
      id: '5',
      timestamp: new Date('2024-10-25T15:00:00'),
      description: 'Salary Deposit',
      merchant: 'Tech Corp Payroll',
      amount: 3200.00,
      category: 'Income',
      accountId: 'checking-1234',
      status: 'Completed',
      type: 'Deposit',
      location: 'Direct Deposit',
      aiFraudScore: 0.0,
      isAiFlagged: false,
      aiDecisionId: null
    },
    {
      id: '6',
      timestamp: new Date('2024-10-24T18:30:00'),
      description: 'Electric Bill',
      merchant: 'PG&E',
      amount: -125.67,
      category: 'Utilities',
      accountId: 'checking-1234',
      status: 'Completed',
      type: 'Bill Payment',
      location: 'Online',
      aiFraudScore: 0.01,
      isAiFlagged: false,
      aiDecisionId: 'ai_005'
    },
    {
      id: '7',
      timestamp: new Date('2024-10-24T11:45:00'),
      description: 'Large Electronics Purchase',
      merchant: 'Best Buy',
      amount: -1299.99,
      category: 'Electronics',
      accountId: 'credit-9012',
      status: 'Completed',
      type: 'Purchase',
      location: 'San Francisco, CA',
      aiFraudScore: 0.25,
      isAiFlagged: false,
      aiDecisionId: 'ai_006'
    }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'groceries':
        return Store
      case 'dining':
        return Coffee
      case 'shopping':
        return ShoppingBag
      case 'gas':
        return Car
      case 'utilities':
        return Home
      case 'electronics':
        return Smartphone
      case 'income':
        return ArrowUpRight
      default:
        return CreditCard
    }
  }

  const getStatusIcon = (status: string, isAiFlagged: boolean) => {
    if (isAiFlagged || status === 'Under Review') {
      return AlertCircle
    }
    if (status === 'Completed') {
      return CheckCircle
    }
    return Clock
  }

  const getStatusColor = (status: string, isAiFlagged: boolean) => {
    if (isAiFlagged || status === 'Under Review') {
      return 'warning'
    }
    if (status === 'Completed') {
      return 'success'
    }
    return 'secondary'
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'flagged') return matchesSearch && transaction.isAiFlagged
    if (selectedFilter === 'deposits') return matchesSearch && transaction.amount > 0
    if (selectedFilter === 'purchases') return matchesSearch && transaction.amount < 0
    
    return matchesSearch
  })

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
              Monitor all your account activity with AI-powered insights
            </p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-md border border-neutral-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedFilter === 'flagged' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('flagged')}
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  AI Flagged
                </Button>
                <Button
                  variant={selectedFilter === 'deposits' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('deposits')}
                >
                  Deposits
                </Button>
                <Button
                  variant={selectedFilter === 'purchases' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('purchases')}
                >
                  Purchases
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <CreditCard className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(4567.89)}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Total spending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Protected</CardTitle>
              <Brain className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">99.8%</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Fraud detection rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Transactions</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">2</div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Under review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(156.73)}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Excluding deposits
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              All your account activity with AI fraud analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => {
                const CategoryIcon = getCategoryIcon(transaction.category)
                const StatusIcon = getStatusIcon(transaction.status, transaction.isAiFlagged)
                const isPositive = transaction.amount > 0

                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isPositive ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'
                      }`}>
                        <CategoryIcon className={`h-5 w-5 ${
                          isPositive ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {transaction.description}
                          </h3>
                          <Badge variant={getStatusColor(transaction.status, transaction.isAiFlagged) as any}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {transaction.isAiFlagged ? 'AI Flagged' : transaction.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                          <span>{transaction.merchant}</span>
                          <span>•</span>
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <span>{formatDateTime(transaction.timestamp)}</span>
                          {transaction.location && (
                            <>
                              <span>•</span>
                              <span>{transaction.location}</span>
                            </>
                          )}
                        </div>
                        
                        {/* AI Fraud Analysis */}
                        {transaction.aiFraudScore > 0 && (
                          <div className="mt-2 flex items-center space-x-2">
                            <Brain className="h-3 w-3 text-blue-500" />
                            <span className="text-xs text-blue-600 dark:text-blue-400">
                              AI Fraud Score: {(transaction.aiFraudScore * 100).toFixed(1)}%
                            </span>
                            {transaction.aiFraudScore > 0.5 && (
                              <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                (High risk - unusual pattern detected)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${
                          isPositive ? 'text-green-600' : 'text-neutral-900 dark:text-neutral-100'
                        }`}>
                          {isPositive ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          Account •••{transaction.accountId.slice(-4)}
                        </div>
                      </div>
                      
                      {transaction.aiDecisionId && (
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Explain
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-neutral-600 dark:text-neutral-400">No transactions found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-600" />
              AI Transaction Insights
            </CardTitle>
            <CardDescription>
              Smart analysis of your spending patterns and security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-900 dark:text-green-100">Spending Pattern Normal</h4>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Your spending this month is consistent with your typical patterns. No unusual activity detected.
                </p>
              </div>

              <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Unusual Location Alert</h4>
                </div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  We detected a transaction in Las Vegas, NV - an unusual location for your spending. 
                  This transaction has been flagged for your review.
                </p>
                <Button size="sm" variant="outline" className="mt-2">Review Transaction</Button>
              </div>

              <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Cashback Opportunity</h4>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  You could earn an extra {formatCurrency(23.40)} this month by using your rewards credit card 
                  for grocery purchases instead of your debit card.
                </p>
                <Button size="sm" variant="outline" className="mt-2">Learn More</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
