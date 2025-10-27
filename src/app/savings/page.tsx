'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  PiggyBank,
  Target,
  TrendingUp,
  DollarSign,
  Plus,
  ArrowUpRight,
  Calendar,
  Award,
  Zap,
  CheckCircle,
  Clock,
  Edit,
  MoreHorizontal,
  Calculator,
  Percent,
  LineChart
} from 'lucide-react'
import { useState } from 'react'

export default function Savings() {
  const [activeGoal, setActiveGoal] = useState<string | null>(null)

  const savingsAccounts = [
    {
      id: '1',
      name: 'High-Yield Savings',
      accountNumber: '****5678',
      balance: 15650.00,
      interestRate: 4.25,
      apy: 4.34,
      monthlyGrowth: 65.42,
      type: 'High-Yield',
      institution: 'EthicalBank',
      minimumBalance: 0
    },
    {
      id: '2',
      name: 'Emergency Fund',
      accountNumber: '****9012',
      balance: 8200.00,
      interestRate: 3.85,
      apy: 3.92,
      monthlyGrowth: 26.32,
      type: 'Money Market',
      institution: 'EthicalBank',
      minimumBalance: 1000
    },
    {
      id: '3',
      name: 'Vacation Savings',
      accountNumber: '****3456',
      balance: 2450.00,
      interestRate: 2.50,
      apy: 2.53,
      monthlyGrowth: 5.10,
      type: 'Standard Savings',
      institution: 'EthicalBank',
      minimumBalance: 100
    }
  ]

  const savingsGoals = [
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 15000.00,
      currentAmount: 8200.00,
      deadline: new Date('2024-12-31'),
      monthlyContribution: 500.00,
      priority: 'High',
      status: 'On Track',
      category: 'Emergency',
      accountId: '2'
    },
    {
      id: '2',
      name: 'Europe Vacation',
      targetAmount: 5000.00,
      currentAmount: 2450.00,
      deadline: new Date('2025-06-15'),
      monthlyContribution: 300.00,
      priority: 'Medium',
      status: 'On Track',
      category: 'Travel',
      accountId: '3'
    },
    {
      id: '3',
      name: 'New Car Down Payment',
      targetAmount: 8000.00,
      currentAmount: 1200.00,
      deadline: new Date('2025-03-01'),
      monthlyContribution: 800.00,
      priority: 'High',
      status: 'Behind',
      category: 'Transportation',
      accountId: '1'
    },
    {
      id: '4',
      name: 'Home Renovation',
      targetAmount: 25000.00,
      currentAmount: 3500.00,
      deadline: new Date('2025-09-01'),
      monthlyContribution: 2000.00,
      priority: 'Medium',
      status: 'Ahead',
      category: 'Home',
      accountId: '1'
    }
  ]

  const savingsTips = [
    {
      id: '1',
      title: 'Automate Your Savings',
      description: 'Set up automatic transfers to save consistently without thinking about it',
      potentialSavings: 150,
      difficulty: 'Easy',
      timeToImplement: '5 minutes'
    },
    {
      id: '2',
      title: 'High-Yield Account Optimization',
      description: 'Move your emergency fund to a higher-yield account for better returns',
      potentialSavings: 340,
      difficulty: 'Easy',
      timeToImplement: '15 minutes'
    },
    {
      id: '3',
      title: 'Round-Up Savings',
      description: 'Enable round-up on purchases to automatically save spare change',
      potentialSavings: 75,
      difficulty: 'Easy',
      timeToImplement: '2 minutes'
    }
  ]

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'success'
      case 'Ahead': return 'success'
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

  const totalSavings = savingsAccounts.reduce((total, account) => total + account.balance, 0)
  const totalMonthlyGrowth = savingsAccounts.reduce((total, account) => total + account.monthlyGrowth, 0)
  const averageAPY = savingsAccounts.reduce((total, account) => total + account.apy, 0) / savingsAccounts.length

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
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Savings Goal
            </Button>
          </div>
        </div>

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
                <p className="text-2xl font-bold text-orange-600">{savingsGoals.length}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </CardContent>
          </Card>
        </div>

        {/* Savings Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PiggyBank className="h-5 w-5 mr-2 text-blue-600" />
              Savings Accounts
            </CardTitle>
            <CardDescription>
              Your savings accounts and their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savingsAccounts.map((account) => (
                <div key={account.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{account.name}</h3>
                    <Badge variant="secondary">{account.type}</Badge>
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
                    <Button variant="outline" size="sm" className="flex-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Transfer
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-6">
              {savingsGoals.map((goal) => (
                <div key={goal.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {goal.name}
                        </h3>
                        <Badge variant={getStatusColor(goal.status)}>
                          {goal.status}
                        </Badge>
                        <Badge variant="secondary" className={getPriorityColor(goal.priority)}>
                          {goal.priority} Priority
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due {formatDate(goal.deadline)}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(goal.monthlyContribution)}/month
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
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
                        Linked to Account {savingsAccounts.find(a => a.id === goal.accountId)?.accountNumber}
                      </span>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Contribution
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Savings Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Smart Savings Tips
            </CardTitle>
            <CardDescription>
              Personalized recommendations to boost your savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savingsTips.map((tip) => (
                <div key={tip.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                      <Zap className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{tip.title}</h3>
                      <Badge variant="success" className="text-xs">
                        +{formatCurrency(tip.potentialSavings)}/year
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    {tip.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-neutral-500 mb-4">
                    <span>Difficulty: {tip.difficulty}</span>
                    <span>Setup: {tip.timeToImplement}</span>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Implement
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Savings Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 mr-2 text-purple-600" />
              Savings Analytics
            </CardTitle>
            <CardDescription>
              Track your savings performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Monthly Savings Rate</h4>
                <div className="space-y-3">
                  {['January', 'February', 'March', 'April', 'May', 'June'].map((month, index) => {
                    const amount = 1200 + (index * 150) + (Math.random() * 200 - 100)
                    const percentage = (amount / 5000) * 100
                    return (
                      <div key={month} className="flex items-center justify-between">
                        <span className="text-sm w-20">{month}</span>
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{width: `${Math.min(percentage, 100)}%`}}
                            ></div>
                          </div>
                          <span className="text-sm w-20 text-right">{formatCurrency(amount)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Goal Progress Summary</h4>
                <div className="space-y-4">
                  {savingsGoals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{goal.name}</span>
                        <div className="text-xs text-neutral-500">{goal.category}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{width: `${getProgressPercentage(goal.currentAmount, goal.targetAmount)}%`}}
                          ></div>
                        </div>
                        <span className="text-xs w-12 text-right">
                          {getProgressPercentage(goal.currentAmount, goal.targetAmount).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
