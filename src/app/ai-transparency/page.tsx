'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { 
  Brain, 
  Eye, 
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  PieChart,
  TrendingUp
} from 'lucide-react'

export default function AITransparency() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            AI Transparency Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Understand how AI makes decisions about your banking activities
          </p>
        </div>

        {/* AI Decision Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total AI Decisions</CardTitle>
              <Brain className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                In the last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Decisions</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">239</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                96.8% approval rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged for Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">8</div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                3.2% flagged for manual review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent AI Decisions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2 text-blue-600" />
              Recent AI Decision Explanations
            </CardTitle>
            <CardDescription>
              Detailed explanations for AI decisions affecting your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Loan Application Decision */}
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <h3 className="font-semibold">Personal Loan Application - Denied</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDateTime(new Date('2024-10-25T14:30:00'))}
                    </p>
                  </div>
                </div>
                <Badge variant="destructive">Denied</Badge>
              </div>
              
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 mb-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Why was this decision made?
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                  Your loan application was denied primarily due to a high debt-to-income ratio (45%) 
                  and a high number of recent credit inquiries (5 in the last 6 months).
                </p>
                
                {/* Feature Importance Chart */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Decision Factors:</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Debt-to-Income Ratio</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                          <div className="h-2 bg-red-500 rounded-full" style={{width: '50%'}}></div>
                        </div>
                        <span className="text-sm text-red-600">50%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Recent Credit Inquiries</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                          <div className="h-2 bg-red-500 rounded-full" style={{width: '30%'}}></div>
                        </div>
                        <span className="text-sm text-red-600">30%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Credit Score</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                          <div className="h-2 bg-yellow-500 rounded-full" style={{width: '15%'}}></div>
                        </div>
                        <span className="text-sm text-yellow-600">15%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Employment History</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                          <div className="h-2 bg-green-500 rounded-full" style={{width: '5%'}}></div>
                        </div>
                        <span className="text-sm text-green-600">5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                  How to improve your chances:
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Pay down existing debt to reduce your debt-to-income ratio</li>
                  <li>• Wait 6 months before applying again to reduce recent inquiry impact</li>
                  <li>• Consider a secured loan or smaller loan amount</li>
                </ul>
              </div>
            </div>

            {/* Transaction Approval */}
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Large Transaction Approved</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Electronics Store - {formatCurrency(1299.99)}
                    </p>
                  </div>
                </div>
                <Badge variant="success">Approved</Badge>
              </div>
              
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Why was this transaction approved?
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                  This transaction was approved because it matches your typical spending pattern for electronics, 
                  occurred at a familiar merchant category, and your account has sufficient funds.
                </p>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-green-600">Low</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">Fraud Risk</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">98%</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">Confidence</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-600">0.2s</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">Processing Time</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fraud Alert */}
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold">Transaction Flagged for Review</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Unknown Merchant - {formatCurrency(450.00)}
                    </p>
                  </div>
                </div>
                <Badge variant="warning">Under Review</Badge>
              </div>
              
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Why was this transaction flagged?
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                  This transaction was flagged because it occurred at an unusual location, 
                  at an uncommon time for your spending pattern, and the merchant is not in your typical categories.
                </p>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Risk Factors:</h5>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Unusual Location</span>
                      <Badge variant="warning">High Risk</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Time of Transaction</span>
                      <Badge variant="warning">Medium Risk</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Merchant Category</span>
                      <Badge variant="secondary">Low Risk</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Models Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              AI Models Currently Protecting Your Account
            </CardTitle>
            <CardDescription>
              Information about the AI systems working to keep your banking secure and personalized
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Fraud Detection AI</h3>
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Monitors all transactions in real-time to identify potentially fraudulent activity.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Accuracy Rate:</span>
                    <span className="font-medium">99.7%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Updated:</span>
                    <span className="font-medium">Oct 15, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bias Check:</span>
                    <span className="font-medium text-green-600">Passed</span>
                  </div>
                </div>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Credit Risk Model</h3>
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Evaluates creditworthiness for loan applications and credit limit adjustments.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Accuracy Rate:</span>
                    <span className="font-medium">94.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Updated:</span>
                    <span className="font-medium">Oct 1, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bias Check:</span>
                    <span className="font-medium text-green-600">Passed</span>
                  </div>
                </div>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Personalization Engine</h3>
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Recommends relevant products and services based on your financial profile.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Accuracy Rate:</span>
                    <span className="font-medium">87.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Updated:</span>
                    <span className="font-medium">Oct 20, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bias Check:</span>
                    <span className="font-medium text-green-600">Passed</span>
                  </div>
                </div>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Customer Insights AI</h3>
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Analyzes spending patterns to provide financial insights and recommendations.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Accuracy Rate:</span>
                    <span className="font-medium">91.8%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Updated:</span>
                    <span className="font-medium">Oct 22, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bias Check:</span>
                    <span className="font-medium text-green-600">Passed</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Query AI Section */}
        <Card>
          <CardHeader>
            <CardTitle>Ask AI About Your Account</CardTitle>
            <CardDescription>
              Get explanations about any AI-driven decisions or recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ask about any AI decision, e.g., 'Why was my transaction flagged?'"
                  className="flex-1 rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
                <Button>Ask AI</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" size="sm">
                  Why was my loan denied?
                </Button>
                <Button variant="outline" size="sm">
                  Explain my credit score
                </Button>
                <Button variant="outline" size="sm">
                  Why this product recommendation?
                </Button>
                <Button variant="outline" size="sm">
                  How is my risk profile calculated?
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
