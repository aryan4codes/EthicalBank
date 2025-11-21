'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LoanEligibilityChecker } from '@/components/LoanEligibilityChecker'
import { 
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Brain,
  Calculator,
  TrendingUp,
  DollarSign,
  Calendar,
  Info,
  Eye
} from 'lucide-react'

export default function Loans() {
  const loanApplications = [
    {
      id: '1',
      type: 'Personal Loan',
      amountRequested: 15000,
      amountApproved: 0,
      interestRate: 0,
      termInMonths: 36,
      purpose: 'Home Improvement',
      status: 'Denied',
      applicationDate: new Date('2024-10-25'),
      decisionDate: new Date('2024-10-25'),
      aiDecisionLogId: 'ai_loan_001',
      creditScoreSnapshot: 650,
      debtToIncomeRatio: 0.45,
      denialReasons: [
        'High debt-to-income ratio (45%)',
        'Recent credit inquiries (5 in last 6 months)',
        'Insufficient credit history for requested amount'
      ]
    },
    {
      id: '2',
      type: 'Auto Loan',
      amountRequested: 25000,
      amountApproved: 22000,
      interestRate: 4.99,
      termInMonths: 60,
      purpose: 'Vehicle Purchase',
      status: 'Approved',
      applicationDate: new Date('2024-09-15'),
      decisionDate: new Date('2024-09-16'),
      aiDecisionLogId: 'ai_loan_002',
      creditScoreSnapshot: 720,
      debtToIncomeRatio: 0.32
    },
    {
      id: '3',
      type: 'Home Equity',
      amountRequested: 50000,
      amountApproved: 0,
      interestRate: 0,
      termInMonths: 120,
      purpose: 'Debt Consolidation',
      status: 'Under Review',
      applicationDate: new Date('2024-10-26'),
      decisionDate: null,
      aiDecisionLogId: null,
      creditScoreSnapshot: 780,
      debtToIncomeRatio: 0.28
    }
  ]

  const existingLoans = [
    {
      id: '1',
      type: 'Mortgage',
      originalAmount: 350000,
      currentBalance: 298567.89,
      monthlyPayment: 1847.32,
      interestRate: 3.25,
      termRemaining: 23.5,
      nextPaymentDate: new Date('2024-11-01'),
      accountNumber: '****7890'
    },
    {
      id: '2',
      type: 'Student Loan',
      originalAmount: 45000,
      currentBalance: 23456.78,
      monthlyPayment: 287.50,
      interestRate: 4.25,
      termRemaining: 8.2,
      nextPaymentDate: new Date('2024-11-15'),
      accountNumber: '****5432'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return CheckCircle
      case 'Denied':
        return XCircle
      case 'Under Review':
        return Clock
      default:
        return FileText
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success'
      case 'Denied':
        return 'destructive'
      case 'Under Review':
        return 'warning'
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
              Loans & Credit
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage your loan applications and existing credit accounts
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Apply for Loan
          </Button>
        </div>

        {/* Loan Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Total Debt</CardTitle>
              <DollarSign className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(322024.67)}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Across all loans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Payments</CardTitle>
              <Calendar className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(2134.82)}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Total monthly obligation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Credit Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">780</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Excellent rating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Debt-to-Income</CardTitle>
              <Calculator className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">28%</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Good ratio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Loan Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Recent Loan Applications
            </CardTitle>
            <CardDescription>
              Track the status of your loan applications with AI decision explanations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loanApplications.map((application) => {
              const StatusIcon = getStatusIcon(application.status)
              
              return (
                <div key={application.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        application.status === 'Approved' ? 'bg-green-100 dark:bg-green-900' :
                        application.status === 'Denied' ? 'bg-red-100 dark:bg-red-900' :
                        'bg-yellow-100 dark:bg-yellow-900'
                      }`}>
                        <StatusIcon className={`h-5 w-5 ${
                          application.status === 'Approved' ? 'text-green-600' :
                          application.status === 'Denied' ? 'text-red-600' :
                          'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {application.type}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {application.purpose} • Applied {formatDate(application.applicationDate)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(application.status) as any}>
                      {application.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Amount Requested</span>
                      <div className="font-semibold text-black">{formatCurrency(application.amountRequested)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {application.status === 'Approved' ? 'Amount Approved' : 'Amount Approved'}
                      </span>
                      <div className={`font-semibold text-black ${
                        application.status === 'Approved' ? 'text-green-600' : 
                        application.status === 'Denied' ? 'text-red-600' : 'text-neutral-900 dark:text-neutral-100'
                      }`}>
                        {application.status === 'Denied' ? 'N/A' : 
                         application.status === 'Under Review' ? 'Pending' :
                         formatCurrency(application.amountApproved)}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Interest Rate</span>
                      <div className="font-semibold text-black">
                        {application.status === 'Approved' ? `${application.interestRate}%` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Term</span>
                      <div className="font-semibold text-black">{application.termInMonths} months</div>
                    </div>
                  </div>

                  {/* AI Decision Explanation */}
                  {application.status === 'Denied' && (
                    <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Brain className="h-5 w-5 text-red-600" />
                        <h4 className="font-medium text-red-900 dark:text-red-100">
                          AI Decision Explanation
                        </h4>
                      </div>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        Your loan application was denied based on the following factors:
                      </p>
                      <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                        {application.denialReasons?.map((reason, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          How to improve your chances:
                        </h5>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          <li>• Pay down existing debt to improve debt-to-income ratio</li>
                          <li>• Wait 6 months before reapplying to reduce recent inquiry impact</li>
                          <li>• Consider applying for a smaller loan amount</li>
                          <li>• Add a co-signer with strong credit</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {application.status === 'Approved' && (
                    <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium text-green-900 dark:text-green-100">
                          AI Approval Factors
                        </h4>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Your application was approved based on excellent credit score ({application.creditScoreSnapshot}), 
                        low debt-to-income ratio ({(application.debtToIncomeRatio * 100).toFixed(0)}%), 
                        and stable employment history.
                      </p>
                    </div>
                  )}

                  {application.status === 'Under Review' && (
                    <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                          Manual Review Required
                        </h4>
                      </div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Your application requires additional verification. Our underwriting team will 
                        contact you within 2-3 business days with next steps.
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {application.aiDecisionLogId && (
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Full AI Analysis
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Download Application
                    </Button>
                    {application.status === 'Denied' && (
                      <Button variant="outline" size="sm">
                        Apply Again
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Existing Loans */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Loans</CardTitle>
            <CardDescription>
              Current loan balances and payment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {existingLoans.map((loan) => (
                <div key={loan.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {loan.type}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Account •••{loan.accountNumber.slice(-4)}
                      </p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Current Balance</span>
                      <div className="text-lg font-semibold text-black ">{formatCurrency(loan.currentBalance)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Monthly Payment</span>
                      <div className="text-lg font-semibold text-black">{formatCurrency(loan.monthlyPayment)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Interest Rate</span>
                      <div className="text-lg font-semibold text-black">{loan.interestRate}%</div>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Time Remaining</span>
                      <div className="text-lg font-semibold text-black">{loan.termRemaining} years</div>
                    </div>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Loan Progress</span>
                      <span className="text-sm font-medium">
                        {((loan.originalAmount - loan.currentBalance) / loan.originalAmount * 100).toFixed(1)}% paid off
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{
                          width: `${((loan.originalAmount - loan.currentBalance) / loan.originalAmount) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">Next Payment: </span>
                      <span className="font-medium">{formatDate(loan.nextPaymentDate)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Make Payment
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loan Eligibility Checker */}
        <LoanEligibilityChecker />

        {/* Pre-qualification Tool */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-blue-600" />
              AI Loan Pre-qualification
            </CardTitle>
            <CardDescription>
              Get instant pre-qualification estimates with AI-powered assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Personal Loan</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Pre-qualified Amount:</span>
                    <span className="font-medium">{formatCurrency(12000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Rate:</span>
                    <span className="font-medium">8.99% - 15.99%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Confidence:</span>
                    <span className="font-medium text-green-600">High</span>
                  </div>
                </div>
                <Button className="w-full" size="sm">Apply Now</Button>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Auto Loan</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Pre-qualified Amount:</span>
                    <span className="font-medium">{formatCurrency(35000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Rate:</span>
                    <span className="font-medium">4.99% - 7.99%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Confidence:</span>
                    <span className="font-medium text-green-600">Very High</span>
                  </div>
                </div>
                <Button className="w-full" size="sm">Apply Now</Button>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Home Equity Line</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Pre-qualified Amount:</span>
                    <span className="font-medium">{formatCurrency(75000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Rate:</span>
                    <span className="font-medium">6.25% - 8.75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Confidence:</span>
                    <span className="font-medium text-yellow-600">Medium</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" size="sm">Check Eligibility</Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    How AI Pre-qualification Works
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Our AI analyzes your credit profile, income, existing debts, and banking history to provide 
                    instant pre-qualification estimates. These amounts are based on your current financial profile 
                    and are subject to full underwriting review.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
