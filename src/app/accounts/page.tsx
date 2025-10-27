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
  DollarSign
} from 'lucide-react'
import { useState } from 'react'

export default function Accounts() {
  const [showBalances, setShowBalances] = useState(true)

  const accounts = [
    {
      id: '1',
      name: 'Primary Checking',
      type: 'Checking',
      accountNumber: '****1234',
      balance: 3247.89,
      change: 156.23,
      changeType: 'increase',
      status: 'Active',
      interestRate: 0.01
    },
    {
      id: '2',
      name: 'High-Yield Savings',
      type: 'Savings',
      accountNumber: '****5678',
      balance: 9300.00,
      change: 42.50,
      changeType: 'increase',
      status: 'Active',
      interestRate: 4.5
    },
    {
      id: '3',
      name: 'Premium Rewards Card',
      type: 'Credit Card',
      accountNumber: '****9012',
      balance: -1250.67,
      change: -89.45,
      changeType: 'decrease',
      status: 'Active',
      creditLimit: 15000,
      interestRate: 18.24
    },
    {
      id: '4',
      name: 'Certificate of Deposit',
      type: 'CD',
      accountNumber: '****3456',
      balance: 10000.00,
      change: 0,
      changeType: 'stable',
      status: 'Active',
      maturityDate: '2025-06-15',
      interestRate: 5.25
    }
  ]

  const displayBalance = (balance: number) => {
    return showBalances ? formatCurrency(Math.abs(balance)) : '****'
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'Checking':
      case 'Credit Card':
        return CreditCard
      case 'Savings':
      case 'CD':
        return PiggyBank
      default:
        return DollarSign
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Frozen':
        return 'warning'
      case 'Closed':
        return 'destructive'
      default:
        return 'secondary'
    }
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
                {showBalances ? formatCurrency(22547.89) : '****'}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                <ArrowUpRight className="inline h-3 w-3" />
                +2.3% from last month
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
                {showBalances ? formatCurrency(1250.67) : '****'}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400">
                <ArrowDownRight className="inline h-3 w-3" />
                Credit card balance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {showBalances ? formatCurrency(21297.22) : '****'}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Excellent financial health
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {accounts.map((account) => {
            const Icon = getAccountIcon(account.type)
            const isCredit = account.type === 'Credit Card'
            
            return (
              <Card key={account.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <CardDescription>
                          {account.type} • {account.accountNumber}
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
                          <div className={`text-2xl font-bold ${isCredit ? 'text-red-600' : 'text-neutral-900 dark:text-neutral-100'}`}>
                            {isCredit && account.balance < 0 ? '-' : ''}
                            {displayBalance(account.balance)}
                          </div>
                          {account.change !== 0 && (
                            <div className={`text-xs flex items-center justify-end ${
                              account.changeType === 'increase' ? 'text-green-600' : 
                              account.changeType === 'decrease' ? 'text-red-600' : 'text-neutral-600'
                            }`}>
                              {account.changeType === 'increase' && <ArrowUpRight className="h-3 w-3" />}
                              {account.changeType === 'decrease' && <ArrowDownRight className="h-3 w-3" />}
                              {showBalances ? formatCurrency(Math.abs(account.change)) : '****'} this month
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Credit Limit for Credit Cards */}
                    {isCredit && account.creditLimit && (
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600 dark:text-neutral-400">Credit Limit</span>
                          <span className="font-medium">
                            {showBalances ? formatCurrency(account.creditLimit) : '****'}
                          </span>
                        </div>
                        <div className="mt-1">
                          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{width: `${(Math.abs(account.balance) / account.creditLimit) * 100}%`}}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                            <span>
                              {showBalances ? `${((Math.abs(account.balance) / account.creditLimit) * 100).toFixed(1)}% used` : '****'}
                            </span>
                            <span>
                              Available: {showBalances ? formatCurrency(account.creditLimit - Math.abs(account.balance)) : '****'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Account Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Interest Rate</span>
                        <div className="font-medium">{account.interestRate}% APY</div>
                      </div>
                      {account.maturityDate && (
                        <div>
                          <span className="text-neutral-600 dark:text-neutral-400">Maturity Date</span>
                          <div className="font-medium">{account.maturityDate}</div>
                        </div>
                      )}
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
              <Button variant="outline" className="h-20 flex-col">
                <Plus className="h-6 w-6 mb-2" />
                Open New Account
              </Button>
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
              <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-green-900 dark:text-green-100">Optimize Your Savings</h4>
                  <Badge variant="success">+{formatCurrency(156)}/year</Badge>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                  Move {formatCurrency(2000)} from checking to your high-yield savings to earn 4.49% more interest annually.
                </p>
                <Button size="sm" variant="outline">Setup Auto-Transfer</Button>
              </div>

              <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Credit Utilization Alert</h4>
                  <Badge variant="secondary">Good Standing</Badge>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Your credit utilization is at 8.3% - excellent! Keep it below 30% to maintain your credit score.
                </p>
                <Button size="sm" variant="outline">View Credit Report</Button>
              </div>

              <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-950">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">CD Maturity Reminder</h4>
                  <Badge variant="secondary">237 days remaining</Badge>
                </div>
                <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                  Your CD matures on June 15, 2025. Consider our new 5.75% APY CD for better returns.
                </p>
                <Button size="sm" variant="outline">Explore Options</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
