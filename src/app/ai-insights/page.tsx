'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useAIInsights } from '@/hooks/useBackend'
import { useUser } from '@clerk/nextjs'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle,
  DollarSign,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Shield,
  Eye,
  Info,
  RefreshCw,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sparkles,
  Users,
  Database
} from 'lucide-react'

export default function AIInsights() {
  const { user, isLoaded } = useUser()
  const { insights, isLoading, isRefreshing, error, fetchInsights } = useAIInsights()
  const [expandedPlans, setExpandedPlans] = useState<Set<number>>(new Set())
  const [showAttributes, setShowAttributes] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      fetchInsights()
    }
  }, [isLoaded, user, fetchInsights])
  
  const handleRefresh = () => {
    fetchInsights(true) // Force refresh
  }

  const togglePlan = (index: number) => {
    const newExpanded = new Set(expandedPlans)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedPlans(newExpanded)
  }

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              AI Financial Insights
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Please sign in to view your personalized AI insights.
            </p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-red-500" />
    if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-green-500" />
    return <div className="h-4 w-4 bg-neutral-400 rounded-full" />
  }

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'destructive'
    if (priority === 'medium') return 'warning'
    return 'secondary'
  }

  const getTimeframeColor = (timeframe: string) => {
    if (timeframe === 'short-term') return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    if (timeframe === 'medium-term') return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
    return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              AI Financial Insights
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Comprehensive financial analysis and personalized recommendations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Ethical AI
            </Badge>
          </div>
        </div>

        {error && (
          <Card className={`border-yellow-200 dark:border-yellow-800 ${error.includes('cached') ? 'border-yellow-300' : 'border-red-200 dark:border-red-800'}`}>
            <CardContent className="pt-6">
              <div className={`text-sm flex items-center gap-2 ${error.includes('cached') ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                {error.includes('cached') ? (
                  <>
                    <Info className="h-4 w-4" />
                    <span>{error}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span>Error: {error}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {isRefreshing && insights && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Refreshing insights in the background...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && !insights ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-3 text-neutral-600">Analyzing your financial profile...</span>
          </div>
        ) : insights ? (
          <>
            {/* Financial Health Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Financial Health Score
                </CardTitle>
                <CardDescription>
                  AI assessment of your overall financial wellbeing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-3 relative">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-neutral-200 dark:text-neutral-700"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeDasharray={`${(insights.healthScore.overall / 100) * 251.2} 251.2`}
                          className={getHealthScoreColor(insights.healthScore.overall)}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${getHealthScoreColor(insights.healthScore.overall)}`}>
                          {insights.healthScore.overall}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Overall Score</h3>
                    <p className={`text-sm ${getHealthScoreColor(insights.healthScore.overall)}`}>
                      {getHealthScoreLabel(insights.healthScore.overall)}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <PiggyBank className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Savings Rate</h3>
                    <p className="text-lg font-bold text-green-600">{insights.healthScore.savingsRate}%</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">of income</p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Credit Score</h3>
                    <p className="text-lg font-bold text-blue-600">{insights.healthScore.creditScore}</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">out of 850</p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Emergency Fund</h3>
                    <p className="text-lg font-bold text-yellow-600">{insights.healthScore.emergencyFund} months</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">of expenses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  Your Financial Profile
                </CardTitle>
                <CardDescription>
                  Key metrics analyzed by AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-700">Monthly Income</p>
                    <p className="text-lg font-bold text-black">{formatCurrency(insights.profileSummary.monthlyIncome)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Monthly Spending</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(insights.profileSummary.monthlySpending)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Savings</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(insights.profileSummary.totalSavings)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Goals</p>
                    <p className="text-lg font-bold text-blue-600">{insights.profileSummary.activeGoals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Planning */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Personalized Financial Plans
                    </CardTitle>
                    <CardDescription>
                      {insights.financialPlanning.summary}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAttributes(!showAttributes)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showAttributes ? 'Hide' : 'Show'} Attributes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showAttributes && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Data Attributes Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {insights.financialPlanning.attributes_used.map((attr: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {attr}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {insights.financialPlanning.plans.map((plan: any, idx: number) => (
                  <div key={idx} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{plan.title}</h3>
                          <Badge className={getTimeframeColor(plan.timeframe)}>
                            {plan.timeframe}
                          </Badge>
                          <Badge variant={getPriorityColor(plan.priority)}>
                            {plan.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          {plan.description}
                        </p>
                        <p className="text-xs text-green-600 font-medium">
                          Expected: {plan.expectedOutcome}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePlan(idx)}
                      >
                        {expandedPlans.has(idx) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {expandedPlans.has(idx) && (
                      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                        <h4 className="text-sm font-semibold mb-3">Action Steps:</h4>
                        <ol className="space-y-2">
                          {plan.steps.map((step: string, stepIdx: number) => (
                            <li key={stepIdx} className="flex items-start gap-2 text-sm">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-medium">
                                {stepIdx + 1}
                              </span>
                              <span className="text-neutral-700 dark:text-neutral-300">{step}</span>
                            </li>
                          ))}
                        </ol>
                        
                        {plan.attributes_used && plan.attributes_used.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                            <p className="text-xs text-neutral-500 mb-2">Attributes considered for this plan:</p>
                            <div className="flex flex-wrap gap-1">
                              {plan.attributes_used.map((attr: string, attrIdx: number) => (
                                <Badge key={attrIdx} variant="outline" className="text-xs">
                                  {attr}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Spending Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-600" />
                  Spending Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered breakdown of your spending patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Category Breakdown</h3>
                    {insights.spendingAnalysis.categories && insights.spendingAnalysis.categories.length > 0 ? (
                      <div className="space-y-3">
                        {insights.spendingAnalysis.categories.map((cat: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getTrendIcon(cat.trend)}
                              <div>
                                <p className="font-medium capitalize">{cat.category}</p>
                                <p className="text-xs text-neutral-500">
                                  {cat.percentage ? `${cat.percentage.toFixed(1)}% of total` : 'No spending'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(cat.amount)}</p>
                              <p className="text-xs text-neutral-500">
                                {cat.averageSpending ? `Avg: ${formatCurrency(cat.averageSpending)}/mo` : 'No transactions'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                        <PieChart className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                          No spending data available
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          Add transactions to see your spending breakdown by category.
                        </p>
                      </div>
                    )}
                    
                    {insights.spendingAnalysis.categories.some((cat: any) => cat.recommendation) && (
                      <div className="mt-4 space-y-2">
                        {insights.spendingAnalysis.categories
                          .filter((cat: any) => cat.recommendation)
                          .map((cat: any, idx: number) => (
                            <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 capitalize">
                                    {cat.category}
                                  </p>
                                  <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                                    {cat.recommendation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      Waste Analysis
                    </h3>
                    {insights.spendingAnalysis.wasteAnalysis.length > 0 ? (
                      <div className="space-y-3">
                        {insights.spendingAnalysis.wasteAnalysis.map((waste: any, idx: number) => (
                          <div key={idx} className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 capitalize">
                                  {waste.category}
                                </h4>
                                <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
                                  {waste.reason}
                                </p>
                              </div>
                              <Badge variant="warning" className="text-xs">
                                -{formatCurrency(waste.wastedAmount)}/mo
                              </Badge>
                            </div>
                            <p className="text-sm text-yellow-900 dark:text-yellow-100 font-medium mt-2">
                              💡 {waste.recommendation}
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                              Potential monthly savings: {formatCurrency(waste.monthlyImpact)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-950">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          No significant waste detected!
                        </p>
                        <p className="text-xs text-green-800 dark:text-green-200 mt-1">
                          Your spending patterns look efficient.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {insights.spendingAnalysis.attributes_used.length > 0 && (
                  <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Data Attributes Used for Spending Analysis
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {insights.spendingAnalysis.attributes_used.map((attr: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {attr}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overall Attributes Used */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Complete Transparency
                </CardTitle>
                <CardDescription>
                  All data attributes used to generate these insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insights.attributes_used && insights.attributes_used.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      // Group attributes by category
                      const grouped: Record<string, string[]> = {}
                      insights.attributes_used.forEach((attr: string) => {
                        const category = attr.split('.')[0]
                        if (!grouped[category]) {
                          grouped[category] = []
                        }
                        grouped[category].push(attr)
                      })

                      const categoryNames: Record<string, string> = {
                        'user': 'Personal Information',
                        'accounts': 'Account Information',
                        'transactions': 'Transaction Data',
                        'savings_accounts': 'Savings Accounts',
                        'savings_goals': 'Savings Goals'
                      }

                      const categoryIcons: Record<string, any> = {
                        'user': Users,
                        'accounts': CreditCard,
                        'transactions': DollarSign,
                        'savings_accounts': PiggyBank,
                        'savings_goals': Target
                      }

                      return Object.entries(grouped).map(([category, attrs]) => {
                        const Icon = categoryIcons[category] || Database
                        const categoryName = categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)
                        
                        return (
                          <div key={category} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Icon className="h-4 w-4 text-blue-600" />
                              <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                                {categoryName}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {attrs.length} {attrs.length === 1 ? 'attribute' : 'attributes'}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {attrs.map((attr: string, idx: number) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs font-mono bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                >
                                  {attr}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <Eye className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                      No attributes recorded
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      This may occur if no data was accessed for these insights.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No insights available
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Add some transactions and complete your profile to get personalized insights.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
