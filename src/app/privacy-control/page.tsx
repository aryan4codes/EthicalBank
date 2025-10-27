'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import { 
  Shield, 
  Eye, 
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bell,
  Lock,
  Database,
  Users,
  FileText,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { useState } from 'react'

export default function PrivacyControl() {
  const [consents, setConsents] = useState({
    personalizedOffers: true,
    creditScoring: true,
    fraudDetection: true,
    thirdPartySharing: false,
    marketingCommunications: true,
    analyticsInsights: false,
    productRecommendations: true,
    spendingAnalysis: true
  })

  const [realTimeAlerts, setRealTimeAlerts] = useState({
    aiDecisions: true,
    newDataUse: false,
    privacyChanges: true,
    securityEvents: true
  })

  const toggleConsent = (key: keyof typeof consents) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleAlert = (key: keyof typeof realTimeAlerts) => {
    setRealTimeAlerts(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Privacy & Data Control Center
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your data privacy settings and control how AI uses your information
          </p>
        </div>

        {/* Privacy Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Privacy Score</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">95%</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Excellent privacy protection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Consents</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6 / 8</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Services enabled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Sharing</CardTitle>
              <Users className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">0</div>
              <p className="text-xs text-red-600 dark:text-red-400">
                Third parties with access
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Review</CardTitle>
              <FileText className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2 days</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Since last privacy review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Usage Consents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-600" />
              Data Usage Permissions
            </CardTitle>
            <CardDescription>
              Control how your data is used for different AI services and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Essential Services */}
              <div>
                <h3 className="font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
                  Essential Banking Services
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">Fraud Detection</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Allow us to analyze your transactions in real-time to prevent fraud and protect your account.
                      </p>
                      <Badge variant="secondary" className="mt-1">Required for account security</Badge>
                    </div>
                    <div className="ml-4">
                      <button
                        disabled
                        className="flex items-center text-green-600"
                      >
                        <CheckCircle className="h-5 w-5" />
                        <span className="ml-1 text-sm">Always On</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">Automated Credit Scoring</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Allow us to use your financial profile for instant loan decisions and credit assessments.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => toggleConsent('creditScoring')}
                        className={`flex items-center ${consents.creditScoring ? 'text-green-600' : 'text-neutral-400'}`}
                      >
                        {consents.creditScoring ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personalization Services */}
              <div>
                <h3 className="font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
                  Personalization & Insights
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">Personalized Product Offers</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Allow us to use your transaction history to suggest relevant financial products and services.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => toggleConsent('personalizedOffers')}
                        className={`flex items-center ${consents.personalizedOffers ? 'text-green-600' : 'text-neutral-400'}`}
                      >
                        {consents.personalizedOffers ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">Product Recommendations</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Receive AI-powered recommendations for financial products that match your needs.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => toggleConsent('productRecommendations')}
                        className={`flex items-center ${consents.productRecommendations ? 'text-green-600' : 'text-neutral-400'}`}
                      >
                        {consents.productRecommendations ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">Spending Analysis & Insights</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Analyze your spending patterns to provide budgeting insights and financial advice.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => toggleConsent('spendingAnalysis')}
                        className={`flex items-center ${consents.spendingAnalysis ? 'text-green-600' : 'text-neutral-400'}`}
                      >
                        {consents.spendingAnalysis ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketing & Analytics */}
              <div>
                <h3 className="font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
                  Marketing & Analytics
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">Marketing Communications</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Receive personalized marketing communications based on your profile and preferences.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => toggleConsent('marketingCommunications')}
                        className={`flex items-center ${consents.marketingCommunications ? 'text-green-600' : 'text-neutral-400'}`}
                      >
                        {consents.marketingCommunications ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">Analytics & Research</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Use anonymized data for product improvement and market research.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => toggleConsent('analyticsInsights')}
                        className={`flex items-center ${consents.analyticsInsights ? 'text-green-600' : 'text-neutral-400'}`}
                      >
                        {consents.analyticsInsights ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">Third-Party Data Sharing</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Share anonymized data with trusted partners for market research and service improvement.
                      </p>
                      <Badge variant="destructive" className="mt-1">Currently disabled</Badge>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => toggleConsent('thirdPartySharing')}
                        className={`flex items-center ${consents.thirdPartySharing ? 'text-green-600' : 'text-neutral-400'}`}
                      >
                        {consents.thirdPartySharing ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-600" />
              Real-time Privacy Alerts
            </CardTitle>
            <CardDescription>
              Get notified when AI makes decisions or when your data is used in new ways
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">AI Decision Notifications</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Get notified whenever an AI system makes a decision about your account.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => toggleAlert('aiDecisions')}
                    className={`flex items-center ${realTimeAlerts.aiDecisions ? 'text-green-600' : 'text-neutral-400'}`}
                  >
                    {realTimeAlerts.aiDecisions ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">New Data Usage Alerts</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Be alerted when your data is used for new purposes or by new AI models.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => toggleAlert('newDataUse')}
                    className={`flex items-center ${realTimeAlerts.newDataUse ? 'text-green-600' : 'text-neutral-400'}`}
                  >
                    {realTimeAlerts.newDataUse ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">Privacy Policy Changes</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Get notified about changes to privacy policies and data usage terms.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => toggleAlert('privacyChanges')}
                    className={`flex items-center ${realTimeAlerts.privacyChanges ? 'text-green-600' : 'text-neutral-400'}`}
                  >
                    {realTimeAlerts.privacyChanges ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">Security Events</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Immediate alerts for security-related AI decisions and account protection events.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => toggleAlert('securityEvents')}
                    className={`flex items-center ${realTimeAlerts.securityEvents ? 'text-green-600' : 'text-neutral-400'}`}
                  >
                    {realTimeAlerts.securityEvents ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Consent Change History
            </CardTitle>
            <CardDescription>
              View your complete history of privacy consent changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Granted consent for Personalized Offers</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDateTime(new Date('2024-10-25T10:30:00'))}
                    </p>
                  </div>
                </div>
                <Badge variant="success">Granted</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">Revoked consent for Third-Party Data Sharing</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDateTime(new Date('2024-10-20T14:15:00'))}
                    </p>
                  </div>
                </div>
                <Badge variant="destructive">Revoked</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Granted consent for Spending Analysis</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDateTime(new Date('2024-10-15T09:45:00'))}
                    </p>
                  </div>
                </div>
                <Badge variant="success">Granted</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Export & Deletion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Your Data Rights
            </CardTitle>
            <CardDescription>
              Exercise your rights to access, export, or delete your personal data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Eye className="h-6 w-6 mb-2" />
                View My Profile
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Database className="h-6 w-6 mb-2" />
                Export My Data
              </Button>
              <Button variant="outline" className="h-20 flex-col text-red-600 border-red-200 hover:bg-red-50">
                <AlertTriangle className="h-6 w-6 mb-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
