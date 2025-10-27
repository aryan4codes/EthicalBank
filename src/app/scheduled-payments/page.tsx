'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Repeat,
  CreditCard,
  Building,
  User,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Settings
} from 'lucide-react'
import { useState } from 'react'

export default function ScheduledPayments() {
  const [filter, setFilter] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const scheduledPayments = [
    {
      id: '1',
      name: 'Rent Payment',
      payee: 'Property Management LLC',
      amount: 1850.00,
      frequency: 'Monthly',
      nextDate: new Date('2024-11-01T09:00:00'),
      fromAccount: 'Checking ****1234',
      status: 'Active',
      lastPayment: new Date('2024-10-01T09:00:00'),
      category: 'Housing',
      isActive: true,
      autoPayEnabled: true
    },
    {
      id: '2',
      name: 'Electric Bill',
      payee: 'City Electric Company',
      amount: 125.00,
      frequency: 'Monthly',
      nextDate: new Date('2024-10-28T12:00:00'),
      fromAccount: 'Checking ****1234',
      status: 'Active',
      lastPayment: new Date('2024-09-28T12:00:00'),
      category: 'Utilities',
      isActive: true,
      autoPayEnabled: true
    },
    {
      id: '3',
      name: 'Car Loan Payment',
      payee: 'Auto Finance Corp',
      amount: 420.50,
      frequency: 'Monthly',
      nextDate: new Date('2024-10-30T10:00:00'),
      fromAccount: 'Checking ****1234',
      status: 'Active',
      lastPayment: new Date('2024-09-30T10:00:00'),
      category: 'Transportation',
      isActive: true,
      autoPayEnabled: false
    },
    {
      id: '4',
      name: 'Gym Membership',
      payee: 'FitLife Gym',
      amount: 45.00,
      frequency: 'Monthly',
      nextDate: new Date('2024-11-15T08:00:00'),
      fromAccount: 'Checking ****1234',
      status: 'Paused',
      lastPayment: new Date('2024-09-15T08:00:00'),
      category: 'Health & Fitness',
      isActive: false,
      autoPayEnabled: false
    },
    {
      id: '5',
      name: 'Netflix Subscription',
      payee: 'Netflix Inc.',
      amount: 15.99,
      frequency: 'Monthly',
      nextDate: new Date('2024-10-29T00:00:00'),
      fromAccount: 'Credit Card ****5678',
      status: 'Active',
      lastPayment: new Date('2024-09-29T00:00:00'),
      category: 'Entertainment',
      isActive: true,
      autoPayEnabled: true
    },
    {
      id: '6',
      name: 'Insurance Premium',
      payee: 'SafeGuard Insurance',
      amount: 89.99,
      frequency: 'Monthly',
      nextDate: new Date('2024-11-05T14:00:00'),
      fromAccount: 'Checking ****1234',
      status: 'Active',
      lastPayment: new Date('2024-10-05T14:00:00'),
      category: 'Insurance',
      isActive: true,
      autoPayEnabled: true
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success'
      case 'Paused': return 'warning'
      case 'Failed': return 'destructive'
      default: return 'secondary'
    }
  }

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'Weekly': return <Calendar className="h-4 w-4" />
      case 'Monthly': return <Repeat className="h-4 w-4" />
      case 'Yearly': return <Clock className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Housing': return <Building className="h-4 w-4" />
      case 'Utilities': return <DollarSign className="h-4 w-4" />
      case 'Transportation': return <CreditCard className="h-4 w-4" />
      case 'Health & Fitness': return <User className="h-4 w-4" />
      case 'Entertainment': return <Play className="h-4 w-4" />
      case 'Insurance': return <CheckCircle className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  const filteredPayments = filter === 'all' 
    ? scheduledPayments 
    : filter === 'active'
    ? scheduledPayments.filter(p => p.status === 'Active')
    : filter === 'paused'
    ? scheduledPayments.filter(p => p.status === 'Paused')
    : scheduledPayments.filter(p => p.category.toLowerCase().includes(filter.toLowerCase()))

  const totalMonthlyAmount = scheduledPayments
    .filter(p => p.status === 'Active' && p.frequency === 'Monthly')
    .reduce((total, p) => total + p.amount, 0)

  const upcomingPayments = scheduledPayments
    .filter(p => p.status === 'Active')
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
    .slice(0, 3)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Scheduled Payments
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Automate your recurring payments and never miss a due date
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Payment
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Scheduled</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{scheduledPayments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Active Payments</p>
                <p className="text-2xl font-bold text-green-600">{scheduledPayments.filter(p => p.status === 'Active').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Monthly Total</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalMonthlyAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Auto-Pay Enabled</p>
                <p className="text-2xl font-bold text-purple-600">{scheduledPayments.filter(p => p.autoPayEnabled).length}</p>
              </div>
              <Repeat className="h-8 w-8 text-purple-600" />
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-600" />
              Upcoming Payments
            </CardTitle>
            <CardDescription>
              Next 3 scheduled payments due soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      {getCategoryIcon(payment.category)}
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{payment.name}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {payment.payee} • {payment.fromAccount}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(payment.amount)}
                    </div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      Due {formatDate(payment.nextDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filter Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Filters</CardTitle>
            <CardDescription>Filter payments by status or category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Payments' },
                { key: 'active', label: 'Active' },
                { key: 'paused', label: 'Paused' },
                { key: 'housing', label: 'Housing' },
                { key: 'utilities', label: 'Utilities' },
                { key: 'transportation', label: 'Transportation' },
                { key: 'entertainment', label: 'Entertainment' }
              ].map((filterOption) => (
                <Button
                  key={filterOption.key}
                  variant={filter === filterOption.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(filterOption.key)}
                >
                  {filterOption.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>
              All Scheduled Payments ({filteredPayments.length})
            </CardTitle>
            <CardDescription>
              Manage your recurring payments and subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        {getCategoryIcon(payment.category)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                            {payment.name}
                          </h3>
                          <Badge variant={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                          {payment.autoPayEnabled && (
                            <Badge variant="secondary" className="text-xs">
                              <Repeat className="h-3 w-3 mr-1" />
                              Auto-Pay
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          Pay {payment.payee} • From {payment.fromAccount}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center text-neutral-500">
                            {getFrequencyIcon(payment.frequency)}
                            <span className="ml-1">{payment.frequency}</span>
                          </span>
                          <span className="text-neutral-500">
                            Next: {formatDate(payment.nextDate)}
                          </span>
                          <span className="text-neutral-500">
                            Last: {formatDate(payment.lastPayment)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {payment.frequency}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {payment.isActive ? (
                          <Button size="sm" variant="outline">
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredPayments.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    No scheduled payments found
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {filter === 'all' 
                      ? "Get started by scheduling your first recurring payment."
                      : `No payments match the current filter: ${filter}`
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Setup Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              Quick Setup Templates
            </CardTitle>
            <CardDescription>
              Common payment templates to get you started quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Monthly Rent', icon: Building, amount: 'Variable', description: 'Set up your monthly rent payment' },
                { name: 'Utility Bills', icon: DollarSign, amount: 'Variable', description: 'Electricity, gas, water, internet' },
                { name: 'Loan Payments', icon: CreditCard, amount: 'Fixed', description: 'Car loans, student loans, mortgages' },
                { name: 'Subscriptions', icon: Play, amount: 'Fixed', description: 'Streaming services, software, memberships' },
                { name: 'Insurance', icon: CheckCircle, amount: 'Fixed', description: 'Auto, health, life insurance premiums' },
                { name: 'Savings Transfer', icon: Repeat, amount: 'Variable', description: 'Automatic savings contributions' }
              ].map((template, index) => (
                <div key={index} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <template.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {template.name}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {template.amount} amount
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    {template.description}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Set Up
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
