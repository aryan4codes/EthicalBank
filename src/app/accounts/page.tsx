/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { useAccounts } from '@/hooks/useBackend'
import { useTransactions } from '@/hooks/useBackend'
import { useUser } from '@clerk/nextjs'
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
  CheckCircle,
  Loader2,
  X,
  Edit,
  Trash2
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Accounts() {
  const [showBalances, setShowBalances] = useState(true)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState<string | null>(null)
  const [editingAccount, setEditingAccount] = useState<any>(null)
  const [transactionLoading, setTransactionLoading] = useState(false)
  const { user, isLoaded } = useUser()
  const {
    accounts,
    summary,
    isLoading,
    error,
    fetchAll,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useAccounts()
  const { createTransaction: createTransactionHook } = useTransactions()

  const [accountForm, setAccountForm] = useState({
    accountType: 'checking',
    name: '',
    currency: 'INR',
  })

  const [transactionForm, setTransactionForm] = useState({
    type: 'credit',
    amount: '',
    description: '',
    category: 'other',
  })

  useEffect(() => {
    // Only fetch if user is loaded and we don't have data yet
    if (isLoaded && user && accounts.length === 0 && !summary) {
      fetchAll()
    }
  }, [isLoaded, user]) // Removed fetchAll from deps to prevent infinite loops

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createAccount({
        accountType: accountForm.accountType,
        name: accountForm.name || undefined,
        currency: accountForm.currency,
      })
      setShowAccountForm(false)
      setAccountForm({
        accountType: 'checking',
        name: '',
        currency: 'INR',
      })
    } catch (err) {
      console.error('Failed to create account:', err)
    }
  }

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateAccount(editingAccount.id, {
        name: accountForm.name,
      })
      setShowAccountForm(false)
      setEditingAccount(null)
      setAccountForm({
        accountType: 'checking',
        name: '',
        currency: 'INR',
      })
    } catch (err) {
      console.error('Failed to update account:', err)
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (confirm('Are you sure you want to close this account? This action cannot be undone.')) {
      try {
        await deleteAccount(accountId)
      } catch (err) {
        console.error('Failed to delete account:', err)
        alert('Cannot close account with non-zero balance. Please transfer funds first.')
      }
    }
  }

  const handleCreateTransaction = async (accountId: string) => {
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) return
    setTransactionLoading(true)
    try {
      // Optimistically update account balance
      const account = accounts.find((a: any) => a.id === accountId)
      if (account) {
        const amount = parseFloat(transactionForm.amount)
        const newBalance = transactionForm.type === 'credit' 
          ? account.balance + amount 
          : account.balance - amount
        
        // Update local state immediately for instant feedback
        // This will be overwritten when fetchAll completes
      }

      await createTransactionHook({
        accountId,
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount),
        description: transactionForm.description || `${transactionForm.type === 'credit' ? 'Deposit' : 'Withdrawal'} transaction`,
        category: transactionForm.category,
        currency: 'INR',
      }, true) // Skip AI for faster processing
      
      setShowTransactionModal(null)
      setTransactionForm({
        type: 'credit',
        amount: '',
        description: '',
        category: 'other',
      })
      
      // Refresh accounts in background (don't await)
      fetchAll().catch(err => console.error('Failed to refresh accounts:', err))
    } catch (err: any) {
      console.error('Failed to create transaction:', err)
      alert(err.message || 'Failed to create transaction')
    } finally {
      setTransactionLoading(false)
    }
  }

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

  // Use summary data if available, otherwise calculate from accounts
  const totalAssets = summary?.totalAssets || accounts
    .filter((account: any) => account.balance > 0)
    .reduce((sum: number, account: any) => sum + account.balance, 0)
  
  const totalLiabilities = summary?.totalLiabilities || accounts
    .filter((account: any) => account.balance < 0)
    .reduce((sum: number, account: any) => sum + Math.abs(account.balance), 0)
  
  const netWorth = summary?.netWorth || (totalAssets - totalLiabilities)

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
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
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
            <Button onClick={() => {
              setShowAccountForm(true)
              setEditingAccount(null)
              setAccountForm({
                accountType: 'checking',
                name: '',
                currency: 'INR',
              })
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Open New Account
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
                {summary?.assetAccountCount || accounts.filter((a: any) => a.balance > 0).length} accounts
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
                {summary?.liabilityAccountCount || accounts.filter((a: any) => a.balance < 0).length} credit accounts
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
        {isLoading && accounts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : accounts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {accounts.map((account: any) => {
              const Icon = getAccountIcon(account.accountType)
              const isCredit = account.accountType === 'credit'
              
              return (
                <Card key={account.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg capitalize">
                            {account.name || `${account.accountType} Account`}
                          </CardTitle>
                          <CardDescription>
                            Account • ...{account.accountNumber.slice(-4)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(account.status) as any}>
                        {account.status}
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
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setShowTransactionModal(account.id)
                            setTransactionForm({
                              type: 'credit',
                              amount: '',
                              description: '',
                              category: 'income',
                            })
                          }}
                        >
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          Deposit
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            setShowTransactionModal(account.id)
                            setTransactionForm({
                              type: 'debit',
                              amount: '',
                              description: '',
                              category: 'other',
                            })
                          }}
                        >
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                          Withdraw
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingAccount(account)
                            setAccountForm({
                              accountType: account.accountType,
                              name: account.name || '',
                              currency: account.currency || 'INR',
                            })
                            setShowAccountForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                No Accounts Found
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                You don&apos;t have any accounts yet. Get started by opening your first account.
              </p>
              <Button onClick={() => setShowAccountForm(true)}>
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
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => setShowAccountForm(true)}
              >
                <Plus className="h-6 w-6 mb-2" />
                Open New Account
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <CreditCard className="h-6 w-6 mb-2" />
                Apply for Credit Card
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={() => window.location.href = '/savings'}>
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
              {accounts.length > 0 ? (
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

                  {accounts.some((account: any) => account.accountType === 'savings') && (
                    <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Savings Opportunity</h4>
                        <Badge variant="secondary">Recommendation</Badge>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Consider setting up automatic transfers to grow your savings consistently.
                      </p>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = '/savings'}>
                        Setup Auto-Transfer
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Open an account to see personalized AI insights and recommendations.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {transactionForm.type === 'credit' ? 'Deposit Money' : 'Withdraw Money'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowTransactionModal(null)
                  setTransactionForm({
                    type: 'credit',
                    amount: '',
                    description: '',
                    category: 'other',
                  })
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                handleCreateTransaction(showTransactionModal)
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Account</label>
                  <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-800">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {accounts.find((a: any) => a.id === showTransactionModal)?.name || 
                       `${accounts.find((a: any) => a.id === showTransactionModal)?.accountType} Account`}
                    </p>
                    <p className="text-xs text-neutral-500">
                      ...{accounts.find((a: any) => a.id === showTransactionModal)?.accountNumber.slice(-4)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                    required
                    placeholder="0.00"
                    className="text-lg"
                    disabled={transactionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                    required
                    placeholder={transactionForm.type === 'credit' ? 'e.g., Salary deposit' : 'e.g., ATM withdrawal'}
                    disabled={transactionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                    required
                    disabled={transactionLoading}
                  >
                    {transactionForm.type === 'credit' ? (
                      <>
                        <option value="income">Income</option>
                        <option value="salary">Salary</option>
                        <option value="business">Business</option>
                        <option value="rental">Rental Income</option>
                        <option value="other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="food">Food & Dining</option>
                        <option value="transport">Transportation</option>
                        <option value="shopping">Shopping</option>
                        <option value="bills">Bills & Utilities</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="other">Other</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1" disabled={transactionLoading || isLoading}>
                    {transactionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      transactionForm.type === 'credit' ? 'Deposit' : 'Withdraw'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowTransactionModal(null)
                      setTransactionForm({
                        type: 'credit',
                        amount: '',
                        description: '',
                        category: 'other',
                      })
                    }}
                    disabled={transactionLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Account Form Modal */}
      {showAccountForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingAccount ? 'Edit Account' : 'New Account'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowAccountForm(false)
                  setEditingAccount(null)
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Account Name (Optional)</label>
                  <Input
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                    placeholder="e.g., Primary Checking"
                  />
                </div>
                {!editingAccount && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Account Type</label>
                      <select
                        value={accountForm.accountType}
                        onChange={(e) => setAccountForm({...accountForm, accountType: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                        required
                      >
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                        <option value="credit">Credit</option>
                        <option value="investment">Investment</option>
                        <option value="loan">Loan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Currency</label>
                      <select
                        value={accountForm.currency}
                        onChange={(e) => setAccountForm({...accountForm, currency: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                      >
                        <option value="INR">INR (Indian Rupee)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingAccount ? 'Update' : 'Create')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowAccountForm(false)
                    setEditingAccount(null)
                  }}>
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
