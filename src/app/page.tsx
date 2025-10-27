'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  Shield, 
  Brain,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Welcome back, Jane
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Here's what's happening with your accounts today.
            </p>
          </div>
          <Badge variant="success" className="text-sm">
            <Shield className="w-3 h-3 mr-1" />
            All systems secure
          </Badge>
        </div>

        {/* Account Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(12547.89)}</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                <ArrowUpRight className="inline h-3 w-3" />
                +2.3% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checking</CardTitle>
              <CreditCard className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(3247.89)}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Account ending in 1234
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings</CardTitle>
              <PiggyBank className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(9300.00)}</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="inline h-3 w-3" />
                Earning 4.5% APY
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">780</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Excellent rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Transparency Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-blue-600" />
                Recent AI Decisions
              </CardTitle>
              <CardDescription>
                AI decisions made on your account in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Transaction approved</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Coffee purchase - $4.50</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Explain
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Transaction flagged</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Large purchase - $1,200</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Explain
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Personalized offer</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Premium credit card recommendation</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Explain
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest account activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium">Grocery Store</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{formatDate(new Date())}</p>
                  </div>
                </div>
                <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(87.43)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Salary Deposit</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Oct 25, 2024</p>
                  </div>
                </div>
                <span className="font-medium text-green-600 dark:text-green-400">+{formatCurrency(3200.00)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium">Electric Bill</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Oct 24, 2024</p>
                  </div>
                </div>
                <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(125.67)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium">Coffee Shop</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Oct 24, 2024</p>
                  </div>
                </div>
                <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(4.50)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and account management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <ArrowUpRight className="h-6 w-6 mb-2" />
                Transfer Money
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <CreditCard className="h-6 w-6 mb-2" />
                Pay Bills
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Eye className="h-6 w-6 mb-2" />
                AI Explanations
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Shield className="h-6 w-6 mb-2" />
                Privacy Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Upcoming Scheduled Payments
            </CardTitle>
            <CardDescription>Your next automatic payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div>
                  <p className="font-medium">Rent Payment</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Due Nov 1, 2024</p>
                </div>
                <span className="font-medium">{formatCurrency(1800.00)}</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div>
                  <p className="font-medium">Internet & Cable</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Due Nov 5, 2024</p>
                </div>
                <span className="font-medium">{formatCurrency(89.99)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
