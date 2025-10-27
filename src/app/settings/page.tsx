'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Settings,
  User,
  Shield,
  Bell,
  CreditCard,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Lock,
  Key,
  Download,
  Upload,
  Trash2,
  Edit,
  Check,
  X,
  Globe,
  Moon,
  Sun,
  Monitor,
  Palette,
  Languages,
  DollarSign,
  Clock,
  Database,
  AlertTriangle,
  Save
} from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [darkMode, setDarkMode] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  })

  const settingsTabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'accounts', label: 'Accounts & Cards', icon: CreditCard },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'privacy', label: 'Privacy', icon: Lock },
    { key: 'data', label: 'Data Management', icon: Database },
    { key: 'advanced', label: 'Advanced', icon: Settings }
  ]

  const connectedDevices = [
    {
      id: '1',
      name: 'iPhone 15 Pro',
      type: 'Mobile',
      lastActive: '2024-10-27T14:30:00',
      location: 'San Francisco, CA',
      current: true
    },
    {
      id: '2',
      name: 'MacBook Pro',
      type: 'Desktop',
      lastActive: '2024-10-27T09:15:00',
      location: 'San Francisco, CA',
      current: false
    },
    {
      id: '3',
      name: 'Chrome Browser',
      type: 'Web',
      lastActive: '2024-10-26T16:45:00',
      location: 'San Francisco, CA',
      current: false
    }
  ]

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your account details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">John Doe</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">john.doe@email.com</p>
              <Button variant="outline" size="sm" className="mt-2">
                <Edit className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                defaultValue="John"
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                defaultValue="Doe"
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                defaultValue="john.doe@email.com"
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea
              defaultValue="123 Main Street, Apt 4B, San Francisco, CA 94102"
              rows={3}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
          
          <Button className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password & Authentication</CardTitle>
          <CardDescription>Manage your login credentials and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Lock className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium">Password</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Last changed 3 months ago</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Key className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {twoFactorEnabled ? 'Enabled via Authenticator App' : 'Not enabled'}
                </p>
              </div>
            </div>
            <Button 
              variant={twoFactorEnabled ? 'destructive' : 'default'} 
              size="sm"
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Connected Devices</CardTitle>
          <CardDescription>Manage devices that have access to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{device.name}</h3>
                      {device.current && <Badge variant="success">Current Device</Badge>}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {device.type} • Last active: {new Date(device.lastActive).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-neutral-500">{device.location}</p>
                  </div>
                </div>
                {!device.current && (
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to be notified about account activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', icon: Mail, description: 'Receive account alerts via email' },
              { key: 'push', label: 'Push Notifications', icon: Smartphone, description: 'Mobile app notifications' },
              { key: 'sms', label: 'SMS Alerts', icon: Bell, description: 'Text message notifications for critical alerts' },
              { key: 'marketing', label: 'Marketing Communications', icon: Globe, description: 'Product updates and promotional offers' }
            ].map((notification) => (
              <div key={notification.key} className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <notification.icon className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium">{notification.label}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{notification.description}</p>
                  </div>
                </div>
                <Button
                  variant={notificationsEnabled[notification.key as keyof typeof notificationsEnabled] ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNotificationsEnabled(prev => ({
                    ...prev,
                    [notification.key]: !prev[notification.key as keyof typeof notificationsEnabled]
                  }))}
                >
                  {notificationsEnabled[notification.key as keyof typeof notificationsEnabled] ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme & Display</CardTitle>
          <CardDescription>Customize the appearance of your banking interface</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Theme Preference</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'light', label: 'Light Mode', icon: Sun },
                { key: 'dark', label: 'Dark Mode', icon: Moon },
                { key: 'system', label: 'System Default', icon: Monitor }
              ].map((theme) => (
                <div key={theme.key} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <div className="flex items-center space-x-3">
                    <theme.icon className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">{theme.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Language & Region</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800">
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>CAD (C$)</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDataSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Export & Import</CardTitle>
          <CardDescription>Manage your account data and transaction history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Download className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium">Export Account Data</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Download all your account information and transaction history</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Download
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Upload className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium">Import Financial Data</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Import transactions from other banks or financial institutions</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Import
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
            <div>
              <h3 className="font-medium text-red-900 dark:text-red-100">Delete Account</h3>
              <p className="text-sm text-red-800 dark:text-red-200">Permanently delete your account and all associated data</p>
            </div>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileSettings()
      case 'security': return renderSecuritySettings()
      case 'notifications': return renderNotificationSettings()
      case 'appearance': return renderAppearanceSettings()
      case 'data': return renderDataSettings()
      default: return renderProfileSettings()
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Settings
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage your account preferences and security settings
            </p>
          </div>
        </div>

        {/* Settings Navigation */}
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex flex-col items-center space-y-2 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 border-b-2 border-blue-600'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Content */}
        {renderTabContent()}
      </div>
    </AppLayout>
  )
}
