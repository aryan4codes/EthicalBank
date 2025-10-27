'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Settings,
  Smartphone,
  Mail,
  MessageSquare,
  Filter,
  MoreHorizontal,
  Clock,
  DollarSign,
  Shield,
  TrendingUp,
  CreditCard
} from 'lucide-react'
import { useState } from 'react'

export default function Alerts() {
  const [filter, setFilter] = useState('all')
  const [alertSettings, setAlertSettings] = useState({
    email: true,
    push: true,
    sms: false
  })

  const alerts = [
    {
      id: '1',
      type: 'Security',
      category: 'Login',
      title: 'New device login detected',
      message: 'Login from iPhone 15 Pro at 2:30 PM PST from San Francisco, CA',
      timestamp: new Date('2024-10-27T14:30:00'),
      severity: 'warning',
      read: false,
      actionRequired: true
    },
    {
      id: '2',
      type: 'Transaction',
      category: 'Large Transaction',
      title: 'Large transaction processed',
      message: 'Transfer of $2,500.00 to ABC Real Estate LLC was completed successfully',
      timestamp: new Date('2024-10-26T10:15:00'),
      severity: 'info',
      read: true,
      actionRequired: false
    },
    {
      id: '3',
      type: 'Account',
      category: 'Low Balance',
      title: 'Low balance warning',
      message: 'Your Checking account ****1234 balance is below $500.00',
      timestamp: new Date('2024-10-26T08:00:00'),
      severity: 'warning',
      read: false,
      actionRequired: true
    },
    {
      id: '4',
      type: 'AI Decision',
      category: 'Credit Decision',
      title: 'Loan application update',
      message: 'Your personal loan application has been approved with AI-assisted underwriting',
      timestamp: new Date('2024-10-25T16:45:00'),
      severity: 'success',
      read: true,
      actionRequired: false
    },
    {
      id: '5',
      type: 'Market',
      category: 'Investment Alert',
      title: 'Market volatility detected',
      message: 'Unusual market activity detected in your investment portfolio sectors',
      timestamp: new Date('2024-10-25T09:20:00'),
      severity: 'info',
      read: false,
      actionRequired: false
    },
    {
      id: '6',
      type: 'Payment',
      category: 'Due Date',
      title: 'Payment reminder',
      message: 'Credit card payment of $234.56 is due in 3 days',
      timestamp: new Date('2024-10-24T12:00:00'),
      severity: 'warning',
      read: true,
      actionRequired: true
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <X className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Login': return <Shield className="h-5 w-5" />
      case 'Large Transaction': return <DollarSign className="h-5 w-5" />
      case 'Low Balance': return <CreditCard className="h-5 w-5" />
      case 'Credit Decision': return <CheckCircle className="h-5 w-5" />
      case 'Investment Alert': return <TrendingUp className="h-5 w-5" />
      case 'Due Date': return <Clock className="h-5 w-5" />
      default: return <Bell className="h-5 w-5" />
    }
  }

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : filter === 'unread' 
    ? alerts.filter(alert => !alert.read)
    : filter === 'action-required'
    ? alerts.filter(alert => alert.actionRequired)
    : alerts.filter(alert => alert.type.toLowerCase() === filter)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Alerts & Notifications
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Stay informed about your account activity and important updates
            </p>
          </div>
          <Button variant="outline" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Notification Settings
          </Button>
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Alerts</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{alerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{alerts.filter(a => !a.read).length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Action Required</p>
                <p className="text-2xl font-bold text-red-600">{alerts.filter(a => a.actionRequired).length}</p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Security Alerts</p>
                <p className="text-2xl font-bold text-purple-600">{alerts.filter(a => a.type === 'Security').length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Filters</CardTitle>
            <CardDescription>Filter alerts by category or status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Alerts' },
                { key: 'unread', label: 'Unread' },
                { key: 'action-required', label: 'Action Required' },
                { key: 'security', label: 'Security' },
                { key: 'transaction', label: 'Transactions' },
                { key: 'account', label: 'Account' },
                { key: 'ai decision', label: 'AI Decisions' }
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

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Receive alerts via email</p>
                  </div>
                </div>
                <Button
                  variant={alertSettings.email ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAlertSettings(prev => ({ ...prev, email: !prev.email }))}
                >
                  {alertSettings.email ? 'On' : 'Off'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Mobile app notifications</p>
                  </div>
                </div>
                <Button
                  variant={alertSettings.push ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAlertSettings(prev => ({ ...prev, push: !prev.push }))}
                >
                  {alertSettings.push ? 'On' : 'Off'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium">SMS Alerts</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Text message notifications</p>
                  </div>
                </div>
                <Button
                  variant={alertSettings.sms ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAlertSettings(prev => ({ ...prev, sms: !prev.sms }))}
                >
                  {alertSettings.sms ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Recent Alerts ({filteredAlerts.length})
            </CardTitle>
            <CardDescription>
              {filter === 'all' ? 'All notifications and alerts' : `Filtered by: ${filter}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg ${
                    !alert.read ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                        {getCategoryIcon(alert.category)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                            {alert.title}
                          </h3>
                          {!alert.read && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                          {alert.actionRequired && (
                            <Badge variant="destructive" className="text-xs">Action Required</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          {alert.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-neutral-500">
                          <span className="flex items-center">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs mr-2 ${getSeverityColor(alert.severity)}`}
                            >
                              {getSeverityIcon(alert.severity)}
                              <span className="ml-1 capitalize">{alert.severity}</span>
                            </Badge>
                            {alert.type} • {alert.category}
                          </span>
                          <span>{formatDate(alert.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {alert.actionRequired && (
                        <Button size="sm" variant="outline">
                          Take Action
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredAlerts.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    No alerts found
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {filter === 'all' 
                      ? "You're all caught up! No new alerts at this time."
                      : `No alerts match the current filter: ${filter}`
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alert Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Summary</CardTitle>
            <CardDescription>Quick overview of your notification activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Most Common Alert Types</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Security Alerts</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-xs text-neutral-500">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transaction Alerts</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                      <span className="text-xs text-neutral-500">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Account Alerts</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '15%'}}></div>
                      </div>
                      <span className="text-xs text-neutral-500">15%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Response Times</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average response time</span>
                    <span className="font-medium">2.3 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Critical alerts resolved</span>
                    <span className="font-medium text-green-600">&lt; 1 hour</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Alerts auto-resolved</span>
                    <span className="font-medium">23%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
