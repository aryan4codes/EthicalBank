'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useTransactions } from '@/hooks/useBackend'
import { useAccounts } from '@/hooks/useBackend'
import { useUser } from '@clerk/nextjs'
import { 
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Plus,
  RefreshCw,
  AlertCircle,
  Loader2,
  X,
  Trash2,
  Brain,
  Eye,
  CheckCircle,
  Lightbulb
} from 'lucide-react'

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const { user, isLoaded } = useUser()
  const { accounts, fetchAll: fetchAccounts, isLoading: accountsLoading } = useAccounts()
  const {
    transactions,
    stats,
    recommendations,
    isLoading,
    error,
    fetchAll,
    createTransaction,
    deleteTransaction,
  } = useTransactions()

  const [transactionForm, setTransactionForm] = useState({
    accountId: '',
    type: 'debit',
    amount: '',
    description: '',
    category: 'other',
    merchantName: '',
    currency: 'INR',
  })

  useEffect(() => {
    if (isLoaded && user) {
      fetchAll()
      fetchAccounts()
    }
  }, [isLoaded, user, fetchAll, fetchAccounts])

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTransaction({
        accountId: transactionForm.accountId,
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount),
        description: transactionForm.description,
        category: transactionForm.category,
        merchantName: transactionForm.merchantName || undefined,
        currency: transactionForm.currency,
      })
      setShowTransactionForm(false)
      setTransactionForm({
        accountId: '',
        type: 'debit',
        amount: '',
        description: '',
        category: 'other',
        merchantName: '',
        currency: 'INR',
      })
      // Refresh accounts to show updated balances
      await fetchAccounts()
    } catch (err) {
      console.error('Failed to create transaction:', err)
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(transactionId)
      } catch (err) {
        console.error('Failed to delete transaction:', err)
      }
    }
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction: any) => {
    const matchesSearch = !searchTerm || 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.merchantName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const aiRiskLevel = transaction.aiAnalysis?.riskLevel || 'low'
    const matchesFilter = selectedFilter === 'all' || 
      selectedFilter === 'credit' && transaction.type === 'credit' ||
      selectedFilter === 'debit' && transaction.type === 'debit' ||
      selectedFilter === 'flagged' && (aiRiskLevel === 'medium' || aiRiskLevel === 'high')
    
    return matchesSearch && matchesFilter
  })

  const totalSpent = stats?.totalSpent || transactions
    .filter((t: any) => t.type === 'debit')
    .reduce((sum: number, t: any) => sum + t.amount, 0)
  
  const totalReceived = stats?.totalReceived || transactions
    .filter((t: any) => t.type === 'credit')
    .reduce((sum: number, t: any) => sum + t.amount, 0)
  
  const flaggedCount = stats?.flaggedCount || transactions
    .filter((t: any) => {
      const riskLevel = t.aiAnalysis?.riskLevel || 'low'
      return riskLevel === 'medium' || riskLevel === 'high'
    })
    .length

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
              Transaction History
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
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
            <Button variant="outline" size="sm" onClick={() => fetchAll()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowTransactionForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="text-sm text-red-600 dark:text-red-400">
                Error: {error}
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
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats?.totalTransactions || transactions.length}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">Total Spent</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{formatCurrency(totalSpent)}</div>
              <p className="text-xs text-red-600">Outgoing transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{formatCurrency(totalReceived)}</div>
              <p className="text-xs text-green-600">Incoming transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Flagged</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{flaggedCount}</div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI Spending Recommendations
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRecommendations(!showRecommendations)}
                >
                  {showRecommendations ? 'Hide' : 'Show'}
                </Button>
              </div>
              <CardDescription>
                Personalized recommendations based on your spending patterns
              </CardDescription>
            </CardHeader>
            {showRecommendations && (
              <CardContent className="space-y-4">
                {recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{rec.insight}</h4>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'warning' : 'secondary'}>
                          {rec.priority} priority
                        </Badge>
                      </div>
                      {rec.potentialSavings && (
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                          Save ₹{rec.potentialSavings.toFixed(2)}/year
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2 leading-relaxed">
                      {rec.recommendation}
                    </p>
                    <Badge variant="outline" className="text-xs border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300">
                      Category: {rec.category}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )}

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
            {isLoading && transactions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction: any) => {
                    const aiAnalysis = transaction.aiAnalysis || {}
                    const riskLevel = aiAnalysis.riskLevel || 'low'
                    const isFlagged = riskLevel === 'medium' || riskLevel === 'high'
                    const fraudScore = aiAnalysis.fraudScore !== undefined ? Math.round(aiAnalysis.fraudScore * 100) : null
                    
                    return (
                      <div 
                        key={transaction.id} 
                        className={`border rounded-lg overflow-hidden transition-all ${
                          isFlagged 
                            ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-950/30' 
                            : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900'
                        } hover:shadow-md`}
                      >
                        {/* Main Transaction Row */}
                        <div className="p-4 flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                              transaction.type === 'credit' 
                                ? 'bg-green-100 dark:bg-green-900/50' 
                                : 'bg-red-100 dark:bg-red-900/50'
                            }`}>
                              {transaction.type === 'credit' ? (
                                <ArrowUpRight className={`h-5 w-5 ${
                                  transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`} />
                              ) : (
                                <ArrowDownRight className={`h-5 w-5 ${
                                  transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`} />
                              )}
                            </div>
                            
                            {/* Transaction Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                  <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 truncate">
                                    {transaction.description}
                                  </h3>
                                  {isFlagged && (
                                    <Badge variant="destructive" className="text-xs font-medium flex-shrink-0">
                                      AI Flagged
                                    </Badge>
                                  )}
                                  <Badge 
                                    variant={transaction.type === 'credit' ? 'default' : 'secondary'} 
                                    className="text-xs font-medium flex-shrink-0"
                                  >
                                    {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                                  </Badge>
                                </div>
                                
                                {/* Amount */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <div className="text-right">
                                    <div className={`text-lg font-bold ${
                                      transaction.type === 'credit' 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                    </div>
                                    {fraudScore !== null && (
                                      <div className={`text-xs font-medium mt-0.5 ${
                                        fraudScore >= 70 
                                          ? 'text-red-600 dark:text-red-400' 
                                          : fraudScore >= 40 
                                          ? 'text-yellow-600 dark:text-yellow-400' 
                                          : 'text-neutral-600 dark:text-neutral-400'
                                      }`}>
                                        Risk: {fraudScore}%
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                    className="text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Metadata */}
                              <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
                                <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                                  {transaction.merchantName || 'Unknown Merchant'}
                                </span>
                                <span className="text-neutral-500 dark:text-neutral-400">•</span>
                                <Badge variant="outline" className="text-xs capitalize border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300">
                                  {transaction.category || 'Other'}
                                </Badge>
                                <span className="text-neutral-500 dark:text-neutral-400">•</span>
                                <span className="text-neutral-600 dark:text-neutral-400">
                                  {formatDateTime(new Date(transaction.createdAt))}
                                </span>
                              </div>
                              
                              {/* AI Analysis Section */}
                              {aiAnalysis.explanation && (
                                <div className={`mt-3 p-3 rounded-lg border ${
                                  isFlagged 
                                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' 
                                    : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
                                }`}>
                                  <div className="flex items-start gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                      isFlagged 
                                        ? 'bg-red-100 dark:bg-red-900/50' 
                                        : 'bg-blue-100 dark:bg-blue-900/50'
                                    }`}>
                                      <Brain className={`h-3.5 w-3.5 ${
                                        isFlagged 
                                          ? 'text-red-600 dark:text-red-400' 
                                          : 'text-blue-600 dark:text-blue-400'
                                      }`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-semibold ${
                                          isFlagged 
                                            ? 'text-red-700 dark:text-red-300' 
                                            : 'text-blue-700 dark:text-blue-300'
                                        }`}>
                                          AI Analysis
                                        </span>
                                        {fraudScore !== null && (
                                          <Badge 
                                            variant={fraudScore >= 70 ? 'destructive' : fraudScore >= 40 ? 'warning' : 'secondary'}
                                            className="text-xs"
                                          >
                                            {fraudScore}% Risk
                                          </Badge>
                                        )}
                                      </div>
                                      <p className={`text-sm leading-relaxed ${
                                        isFlagged 
                                          ? 'text-red-800 dark:text-red-200' 
                                          : 'text-blue-800 dark:text-blue-200'
                                      }`}>
                                        {aiAnalysis.explanation}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                      No transactions found
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      {searchTerm || selectedFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria.'
                        : 'You have no transactions yet.'}
                    </p>
                    <Button onClick={() => setShowTransactionForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Transaction
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>New Transaction</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowTransactionForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Account</label>
                  {accountsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm text-neutral-600">Loading accounts...</span>
                    </div>
                  ) : accounts.length === 0 ? (
                    <div className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-md bg-yellow-50 dark:bg-yellow-950/20">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        No accounts found. Please create an account first before adding transactions.
                      </p>
                    </div>
                  ) : (
                    <select
                      value={transactionForm.accountId}
                      onChange={(e) => setTransactionForm({...transactionForm, accountId: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                      required
                    >
                      <option value="">Select Account</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name || `${acc.accountType} Account`} - {formatCurrency(acc.balance)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      value={transactionForm.type}
                      onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                      required
                    >
                      <option value="debit">Debit</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                    required
                    placeholder="e.g., Grocery Store Purchase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Merchant Name (Optional)</label>
                  <Input
                    value={transactionForm.merchantName}
                    onChange={(e) => setTransactionForm({...transactionForm, merchantName: e.target.value})}
                    placeholder="e.g., Fresh Market"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                    required
                  >
                    <option value="food">Food & Dining</option>
                    <option value="transport">Transportation</option>
                    <option value="shopping">Shopping</option>
                    <option value="bills">Bills & Utilities</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="income">Income</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Transaction'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowTransactionForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}
