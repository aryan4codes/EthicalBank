'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useSavings } from '@/hooks/useBackend'
import { useSavingsRecommendations } from '@/hooks/useBackend'
import { useTransactions } from '@/hooks/useBackend'
import { useAccounts } from '@/hooks/useBackend'
import { 
  PiggyBank,
  Target,
  TrendingUp,
  DollarSign,
  Plus,
  ArrowUpRight,
  Calendar,
  Zap,
  CheckCircle,
  Edit,
  Trash2,
  X,
  Percent,
  LineChart,
  Loader2,
  Calculator,
  Brain,
  Lightbulb,
  Eye,
  ArrowDownRight
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Savings() {
  const {
    accounts,
    goals,
    summary,
    isLoading,
    error,
    fetchAll,
    createAccount,
    createGoal,
    updateAccount,
    updateGoal,
    deleteAccount,
    deleteGoal,
    depositToAccount,
    contributeToGoal,
  } = useSavings()

  const {
    recommendations: savingsRecommendations,
    isLoading: recommendationsLoading,
    fetchRecommendations: fetchSavingsRecommendations,
  } = useSavingsRecommendations()

  const { createTransaction: createTransactionHook } = useTransactions()
  const { accounts: regularAccounts, fetchAll: fetchRegularAccounts } = useAccounts()

  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [editingAccount, setEditingAccount] = useState<any>(null)
  const [editingGoal, setEditingGoal] = useState<any>(null)
  const [showDepositModal, setShowDepositModal] = useState<string | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState<string | null>(null)
  const [showContributeModal, setShowContributeModal] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [contributeAmount, setContributeAmount] = useState('')
  const [transactionLoading, setTransactionLoading] = useState(false)
  const [transactionForm, setTransactionForm] = useState({
    type: 'credit',
    amount: '',
    description: '',
    category: 'other',
  })

  // Form states
  const [accountForm, setAccountForm] = useState({
    name: '',
    accountType: 'Standard Savings',
    interestRate: '2.5',
    apy: '2.53',
    minimumBalance: '100',
    institution: 'EthicalBank',
  })

  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    monthlyContribution: '',
    priority: 'Medium',
    category: 'Custom',
    accountId: '',
  })

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    fetchRegularAccounts()
  }, [fetchRegularAccounts])

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createAccount({
        name: accountForm.name,
        accountType: accountForm.accountType,
        interestRate: parseFloat(accountForm.interestRate),
        apy: parseFloat(accountForm.apy),
        minimumBalance: parseFloat(accountForm.minimumBalance),
        institution: accountForm.institution,
      })
      setShowAccountForm(false)
      setAccountForm({
        name: '',
        accountType: 'Standard Savings',
        interestRate: '2.5',
        apy: '2.53',
        minimumBalance: '100',
        institution: 'EthicalBank',
      })
    } catch (err) {
      console.error('Failed to create account:', err)
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createGoal({
        name: goalForm.name,
        targetAmount: parseFloat(goalForm.targetAmount),
        deadline: goalForm.deadline,
        monthlyContribution: parseFloat(goalForm.monthlyContribution),
        priority: goalForm.priority,
        category: goalForm.category,
        accountId: goalForm.accountId || undefined,
      })
      setShowGoalForm(false)
      setGoalForm({
        name: '',
        targetAmount: '',
        deadline: '',
        monthlyContribution: '',
        priority: 'Medium',
        category: 'Custom',
        accountId: '',
      })
    } catch (err) {
      console.error('Failed to create goal:', err)
    }
  }

  const handleDeposit = async (accountId: string) => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return
    try {
      await depositToAccount(accountId, parseFloat(depositAmount))
      setShowDepositModal(null)
      setDepositAmount('')
    } catch (err) {
      console.error('Failed to deposit:', err)
    }
  }

  const handleContribute = async (goalId: string) => {
    if (!contributeAmount || parseFloat(contributeAmount) <= 0) return
    try {
      await contributeToGoal(goalId, parseFloat(contributeAmount))
      setShowContributeModal(null)
      setContributeAmount('')
    } catch (err) {
      console.error('Failed to contribute:', err)
    }
  }

  const handleCreateTransaction = async (accountId: string) => {
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) return
    setTransactionLoading(true)
    try {
      // Find the savings account to get the linked account ID
      const savingsAccount = accounts.find((a: any) => a.id === accountId)
      if (!savingsAccount) return

      // Find the linked regular account
      const linkedAccount = regularAccounts.find((a: any) => 
        a.accountNumber === savingsAccount.accountNumber
      )
      
      if (!linkedAccount) {
        alert('Linked account not found. Please ensure the savings account is properly synchronized.')
        return
      }

      await createTransactionHook({
        accountId: linkedAccount.id,
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount),
        description: transactionForm.description || `${transactionForm.type === 'credit' ? 'Deposit' : 'Withdrawal'} to ${savingsAccount.name}`,
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
      // Refresh to show updated balance (don't await)
      fetchAll().catch(err => console.error('Failed to refresh:', err))
    } catch (err: any) {
      console.error('Failed to create transaction:', err)
      alert(err.message || 'Failed to create transaction')
    } finally {
      setTransactionLoading(false)
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'success'
      case 'Ahead': return 'success'
      case 'Completed': return 'success'
      case 'Behind': return 'warning'
      default: return 'secondary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900'
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900'
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900'
      default: return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-900'
    }
  }

  const totalSavings = summary?.totalSavings || 0
  const totalMonthlyGrowth = summary?.totalMonthlyGrowth || 0
  const averageAPY = summary?.averageAPY || 0

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Savings & Goals
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Build your financial future with smart saving strategies
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              Savings Calculator
            </Button>
            <Button className="flex items-center" onClick={() => setShowGoalForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Savings Goal
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

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Savings</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(totalSavings)}</p>
              </div>
              <PiggyBank className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Monthly Growth</p>
                <p className="text-2xl font-bold text-green-600">+{formatCurrency(totalMonthlyGrowth)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Average APY</p>
                <p className="text-2xl font-bold text-purple-600">{averageAPY.toFixed(2)}%</p>
              </div>
              <Percent className="h-8 w-8 text-purple-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Active Goals</p>
                <p className="text-2xl font-bold text-orange-600">{goals.length}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </CardContent>
          </Card>
        </div>

        {/* Savings Accounts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <PiggyBank className="h-5 w-5 mr-2 text-blue-600" />
                  Savings Accounts
                </CardTitle>
                <CardDescription>
                  Your savings accounts and their performance
                </CardDescription>
              </div>
              <Button onClick={() => {
                setShowAccountForm(true)
                setEditingAccount(null)
                setAccountForm({
                  name: '',
                  accountType: 'Standard Savings',
                  interestRate: '2.5',
                  apy: '2.53',
                  minimumBalance: '100',
                  institution: 'EthicalBank',
                })
                fetchSavingsRecommendations()
              }} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && accounts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                No savings accounts yet. Create one to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {accounts.map((account) => (
                  <div key={account.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{account.name}</h3>
                      <Badge variant="secondary">{account.accountType}</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Balance</span>
                        <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">APY</span>
                        <span className="font-medium text-green-600">{account.apy}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Monthly Growth</span>
                        <span className="font-medium text-green-600">+{formatCurrency(account.monthlyGrowth)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-500">Account {account.accountNumber}</span>
                        <span className="text-neutral-500">Min: {formatCurrency(account.minimumBalance)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => setShowDepositModal(account.id)}
                      >
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        Quick Deposit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowTransactionModal(account.id)
                          setTransactionForm({
                            type: 'credit',
                            amount: '',
                            description: '',
                            category: 'other',
                          })
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Transaction
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingAccount(account)
                          setAccountForm({
                            name: account.name,
                            accountType: account.accountType,
                            interestRate: account.interestRate.toString(),
                            apy: account.apy.toString(),
                            minimumBalance: account.minimumBalance.toString(),
                            institution: account.institution,
                          })
                          setShowAccountForm(true)
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this account?')) {
                            deleteAccount(account.id)
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Savings Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-orange-600" />
              Savings Goals
            </CardTitle>
            <CardDescription>
              Track your progress toward financial milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && goals.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                No savings goals yet. Create one to start tracking your progress!
              </div>
            ) : (
              <div className="space-y-6">
                {goals.map((goal) => (
                  <div key={goal.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            {goal.name}
                          </h3>
                          <Badge variant={getStatusColor(goal.status) as any}>
                            {goal.status}
                          </Badge>
                          <Badge variant="secondary" className={getPriorityColor(goal.priority)}>
                            {goal.priority} Priority
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due {formatDate(new Date(goal.deadline))}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatCurrency(goal.monthlyContribution)}/month
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingGoal(goal)
                            setGoalForm({
                              name: goal.name,
                              targetAmount: goal.targetAmount.toString(),
                              deadline: goal.deadline.split('T')[0],
                              monthlyContribution: goal.monthlyContribution.toString(),
                              priority: goal.priority,
                              category: goal.category,
                              accountId: goal.accountId || '',
                            })
                            setShowGoalForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this goal?')) {
                              deleteGoal(goal.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Progress</p>
                          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            {formatCurrency(goal.currentAmount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Target</p>
                          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            {formatCurrency(goal.targetAmount)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{getProgressPercentage(goal.currentAmount, goal.targetAmount).toFixed(1)}% complete</span>
                          <span>{formatCurrency(goal.targetAmount - goal.currentAmount)} remaining</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                            style={{width: `${getProgressPercentage(goal.currentAmount, goal.targetAmount)}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-700">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {goal.accountId ? `Linked to Account ${accounts.find(a => a.id === goal.accountId)?.accountNumber || ''}` : 'No linked account'}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowContributeModal(goal.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Contribution
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Form Modal */}
      {showAccountForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl my-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingAccount ? 'Edit Account' : 'New Savings Account'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowAccountForm(false)
                  setEditingAccount(null)
                  setShowRecommendations(false)
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Recommendations */}
              {!editingAccount && savingsRecommendations && savingsRecommendations.length > 0 && (
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        AI Recommendation
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowRecommendations(!showRecommendations)}
                      >
                        {showRecommendations ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </div>
                  </CardHeader>
                  {recommendationsLoading ? (
                    <CardContent>
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="ml-2 text-sm">Analyzing your profile...</span>
                      </div>
                    </CardContent>
                  ) : (
                    <>
                      {savingsRecommendations.map((rec: any, idx: number) => (
                        <CardContent key={idx} className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Badge variant="secondary" className="mb-2">
                                {rec.accountType}
                              </Badge>
                              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                                {rec.reasoning}
                              </p>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-neutral-600 dark:text-neutral-400">APY</span>
                                  <p className="font-semibold text-green-600">{rec.recommendedAPY}%</p>
                                </div>
                                <div>
                                  <span className="text-neutral-600 dark:text-neutral-400">Min Balance</span>
                                  <p className="font-semibold">{formatCurrency(rec.recommendedMinimumBalance)}</p>
                                </div>
                                <div>
                                  <span className="text-neutral-600 dark:text-neutral-400">Est. Monthly Growth</span>
                                  <p className="font-semibold text-green-600">+{formatCurrency(rec.estimatedMonthlyGrowth)}</p>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAccountForm({
                                  ...accountForm,
                                  accountType: rec.accountType,
                                  interestRate: rec.recommendedInterestRate.toString(),
                                  apy: rec.recommendedAPY.toString(),
                                  minimumBalance: rec.recommendedMinimumBalance.toString(),
                                })
                              }}
                            >
                              Use Recommendation
                            </Button>
                          </div>
                          
                          {showRecommendations && (
                            <div className="border-t border-blue-200 dark:border-blue-800 pt-3 mt-3 space-y-3">
                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  Why This Recommendation?
                                </h4>
                                {rec.factors && rec.factors.length > 0 ? (
                                  <div className="space-y-2">
                                    {rec.factors.map((factor: any, fIdx: number) => (
                                      <div key={fIdx} className="text-xs bg-white dark:bg-neutral-800 p-2 rounded border border-neutral-200 dark:border-neutral-700">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium">{factor.attribute}</span>
                                          <Badge variant={factor.impact === 'positive' ? 'success' : factor.impact === 'negative' ? 'destructive' : 'secondary'} className="text-xs">
                                            {factor.impact}
                                          </Badge>
                                        </div>
                                        <p className="text-neutral-600 dark:text-neutral-400">
                                          Value: {typeof factor.value === 'number' ? formatCurrency(factor.value) : factor.value}
                                        </p>
                                        <p className="text-neutral-500 dark:text-neutral-500 italic mt-1">
                                          {factor.explanation}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                    No specific factors provided
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-semibold mb-2">Data Attributes Used</h4>
                                <div className="flex flex-wrap gap-2">
                                  {rec.attributes_used && rec.attributes_used.length > 0 ? (
                                    rec.attributes_used.map((attr: string, aIdx: number) => (
                                      <Badge key={aIdx} variant="outline" className="text-xs">
                                        {attr}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-xs text-neutral-500">No attributes listed</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      ))}
                    </>
                  )}
                </Card>
              )}
              
              {!editingAccount && (!savingsRecommendations || savingsRecommendations.length === 0) && !recommendationsLoading && (
                <Card className="border-neutral-200 dark:border-neutral-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Brain className="h-4 w-4" />
                      <span>AI recommendations will appear here based on your profile</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <form onSubmit={editingAccount ? async (e) => {
                e.preventDefault()
                try {
                  await updateAccount(editingAccount.id, {
                    name: accountForm.name,
                    accountType: accountForm.accountType,
                    interestRate: parseFloat(accountForm.interestRate),
                    apy: parseFloat(accountForm.apy),
                    minimumBalance: parseFloat(accountForm.minimumBalance),
                    institution: accountForm.institution,
                  })
                  setShowAccountForm(false)
                  setEditingAccount(null)
                } catch (err) {
                  console.error('Failed to update account:', err)
                }
              } : handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Account Name</label>
                  <Input
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                    required
                    placeholder="e.g., Emergency Fund"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Account Type</label>
                  <select
                    value={accountForm.accountType}
                    onChange={(e) => setAccountForm({...accountForm, accountType: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                    required
                  >
                    <option value="High-Yield">High-Yield</option>
                    <option value="Money Market">Money Market</option>
                    <option value="Standard Savings">Standard Savings</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Interest Rate (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={accountForm.interestRate}
                      onChange={(e) => setAccountForm({...accountForm, interestRate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">APY (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={accountForm.apy}
                      onChange={(e) => setAccountForm({...accountForm, apy: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Balance</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={accountForm.minimumBalance}
                    onChange={(e) => setAccountForm({...accountForm, minimumBalance: e.target.value})}
                    required
                  />
                </div>
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

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingGoal ? 'Edit Goal' : 'New Savings Goal'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowGoalForm(false)
                  setEditingGoal(null)
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingGoal ? async (e) => {
                e.preventDefault()
                try {
                  await updateGoal(editingGoal.id, {
                    name: goalForm.name,
                    targetAmount: parseFloat(goalForm.targetAmount),
                    deadline: goalForm.deadline,
                    monthlyContribution: parseFloat(goalForm.monthlyContribution),
                    priority: goalForm.priority,
                    category: goalForm.category,
                    accountId: goalForm.accountId || undefined,
                  })
                  setShowGoalForm(false)
                  setEditingGoal(null)
                } catch (err) {
                  console.error('Failed to update goal:', err)
                }
              } : handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Goal Name</label>
                  <Input
                    value={goalForm.name}
                    onChange={(e) => setGoalForm({...goalForm, name: e.target.value})}
                    required
                    placeholder="e.g., Emergency Fund"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Amount</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={goalForm.targetAmount}
                      onChange={(e) => setGoalForm({...goalForm, targetAmount: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deadline</label>
                    <Input
                      type="date"
                      value={goalForm.deadline}
                      onChange={(e) => setGoalForm({...goalForm, deadline: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Contribution</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={goalForm.monthlyContribution}
                    onChange={(e) => setGoalForm({...goalForm, monthlyContribution: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={goalForm.priority}
                      onChange={(e) => setGoalForm({...goalForm, priority: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={goalForm.category}
                      onChange={(e) => setGoalForm({...goalForm, category: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                    >
                      <option value="Emergency">Emergency</option>
                      <option value="Travel">Travel</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Home">Home</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Link to Account (Optional)</label>
                  <select
                    value={goalForm.accountId}
                    onChange={(e) => setGoalForm({...goalForm, accountId: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <option value="">None</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingGoal ? 'Update' : 'Create')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowGoalForm(false)
                    setEditingGoal(null)
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Deposit Money</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowDepositModal(null)
                  setDepositAmount('')
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleDeposit(showDepositModal)}
                    disabled={isLoading || !depositAmount}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Deposit'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowDepositModal(null)
                    setDepositAmount('')
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {transactionForm.type === 'credit' ? 'Add Money' : 'Withdraw Money'}
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
                  <label className="block text-sm font-medium mb-2">Savings Account</label>
                  <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-800">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {accounts.find((a: any) => a.id === showTransactionModal)?.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      ...{accounts.find((a: any) => a.id === showTransactionModal)?.accountNumber}
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                    required
                    placeholder={transactionForm.type === 'credit' ? 'e.g., Monthly savings deposit' : 'e.g., Withdrawal for emergency'}
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
                    {transactionForm.type === 'credit' ? (
                      <>
                        <option value="income">Income</option>
                        <option value="salary">Salary</option>
                        <option value="business">Business</option>
                        <option value="other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="food">Food & Dining</option>
                        <option value="transport">Transportation</option>
                        <option value="shopping">Shopping</option>
                        <option value="bills">Bills & Utilities</option>
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
                      transactionForm.type === 'credit' ? 'Add Money' : 'Withdraw'
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

      {/* Contribute Modal */}
      {showContributeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Contribution</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowContributeModal(null)
                  setContributeAmount('')
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleContribute(showContributeModal)}
                    disabled={isLoading || !contributeAmount}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Contribute'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowContributeModal(null)
                    setContributeAmount('')
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}
