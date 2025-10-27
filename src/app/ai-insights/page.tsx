'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
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
  Shield
} from 'lucide-react'

export default function AIInsights() {
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
              Personalized insights and recommendations powered by ethical AI
            </p>
          </div>
          <Badge variant="success" className="text-sm">
            <Brain className="w-3 h-3 mr-1" />
            Insights updated daily
          </Badge>
        </div>

        {/* AI Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-600" />
              Your AI Financial Profile
            </CardTitle>
            <CardDescription>
              How our AI understands your financial behavior and goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Customer Segment</h3>
                <p className="text-lg font-bold text-blue-800 dark:text-blue-200">Frequent Transactor</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You actively use your accounts with regular transactions and maintain good balances.
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Risk Profile</h3>
                <p className="text-lg font-bold text-green-800 dark:text-green-200">Low Risk</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Stable income, good payment history, and conservative spending patterns.
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Financial Goals</h3>
                <p className="text-lg font-bold text-purple-800 dark:text-purple-200">Wealth Building</p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Focused on saving and investment growth with moderate risk tolerance.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                    Want to correct or update your profile?
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Help us improve our understanding of your financial situation
                  </p>
                </div>
                <Button variant="outline">Update Profile</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spending Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-green-600" />
                Spending Analysis
              </CardTitle>
              <CardDescription>AI-powered breakdown of your spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm font-medium">Groceries & Food</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(1247.89)}</div>
                    <div className="text-xs text-neutral-500">32%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm font-medium">Transportation</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(865.32)}</div>
                    <div className="text-xs text-neutral-500">22%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm font-medium">Entertainment</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(432.15)}</div>
                    <div className="text-xs text-neutral-500">11%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-sm font-medium">Shopping</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(623.44)}</div>
                    <div className="text-xs text-neutral-500">16%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm font-medium">Bills & Utilities</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(734.20)}</div>
                    <div className="text-xs text-neutral-500">19%</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">AI Insight</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Your grocery spending increased by 15% this month. Consider using our cashback credit card for groceries to earn 3% back.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Savings Opportunities
              </CardTitle>
              <CardDescription>AI-identified ways to optimize your finances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-green-200 dark:border-green-800 rounded-lg p-3 bg-green-50 dark:bg-green-950">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900 dark:text-green-100">High-Yield Savings</h4>
                    <Badge variant="success">+{formatCurrency(156)}/year</Badge>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Move {formatCurrency(5000)} to our high-yield savings account (4.5% APY) to earn more interest.
                  </p>
                  <Button size="sm" className="mt-2">Learn More</Button>
                </div>

                <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-3 bg-blue-50 dark:bg-blue-950">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Credit Card Optimization</h4>
                    <Badge variant="secondary">+{formatCurrency(89)}/month</Badge>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Switch to our rewards card for dining purchases to earn 2x points on your restaurant spending.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">Compare Cards</Button>
                </div>

                <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 bg-yellow-50 dark:bg-yellow-950">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Budget Optimization</h4>
                    <Badge variant="warning">Save {formatCurrency(200)}/month</Badge>
                  </div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Your entertainment spending is 15% above average. Set a monthly limit to increase savings.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">Set Budget</Button>
                </div>

                <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-3 bg-purple-50 dark:bg-purple-950">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100">Investment Opportunity</h4>
                    <Badge variant="secondary">Potential Growth</Badge>
                  </div>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    Based on your risk profile, consider our balanced mutual fund portfolio for long-term growth.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">Explore Investing</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Financial Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Financial Health Score
            </CardTitle>
            <CardDescription>
              AI assessment of your overall financial wellbeing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 relative">
                  <div className="w-20 h-20 rounded-full border-8 border-green-200 dark:border-green-800"></div>
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-8 border-green-500 dark:border-green-400" 
                       style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 85%, 50% 85%)'}}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-green-600">85</span>
                  </div>
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Overall Score</h3>
                <p className="text-sm text-green-600">Excellent</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Savings Rate</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">22% of income</p>
                <p className="text-xs text-green-600">Above average</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Credit Usage</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">15% of limit</p>
                <p className="text-xs text-green-600">Excellent</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Emergency Fund</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">4.2 months</p>
                <p className="text-xs text-yellow-600">Good</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">Strong Points</p>
                  <p className="text-sm text-green-800 dark:text-green-200">Consistent savings, low debt utilization</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">Areas to Improve</p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">Build emergency fund to 6 months</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personalized Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
              Personalized Product Recommendations
            </CardTitle>
            <CardDescription>
              Products and services tailored to your financial profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Premium Rewards Card</h3>
                  <Badge variant="success">95% Match</Badge>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Earn 3x points on dining and travel. Perfect for your spending pattern.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Annual Fee:</span>
                    <span className="font-medium">$95</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sign-up Bonus:</span>
                    <span className="font-medium text-green-600">50,000 points</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Est. Annual Value:</span>
                    <span className="font-medium text-green-600">+{formatCurrency(340)}</span>
                  </div>
                </div>
                <Button className="w-full" size="sm">Apply Now</Button>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Investment Portfolio</h3>
                  <Badge variant="secondary">87% Match</Badge>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Balanced portfolio matching your moderate risk tolerance.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Minimum Investment:</span>
                    <span className="font-medium">{formatCurrency(1000)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Annual Fee:</span>
                    <span className="font-medium">0.25%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Projected Return:</span>
                    <span className="font-medium text-green-600">7-9% annually</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" size="sm">Learn More</Button>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Home Equity Line</h3>
                  <Badge variant="secondary">72% Match</Badge>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Low-rate credit line secured by your home equity.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Rate:</span>
                    <span className="font-medium">6.25% APR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Credit Limit:</span>
                    <span className="font-medium">Up to {formatCurrency(150000)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Monthly Payment:</span>
                    <span className="font-medium">Interest only option</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" size="sm">Check Eligibility</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goal Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-600" />
              Financial Goals Progress
            </CardTitle>
            <CardDescription>
              AI-powered tracking of your financial objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Emergency Fund</h3>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatCurrency(12600)} / {formatCurrency(18000)}
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-3">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '70%'}}></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">70% complete</span>
                  <span className="text-blue-600">On track to complete in 8 months</span>
                </div>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Down Payment Savings</h3>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatCurrency(45000)} / {formatCurrency(60000)}
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-3">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">75% complete</span>
                  <span className="text-green-600">Ahead of schedule</span>
                </div>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Retirement Savings</h3>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    15% of income
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-3">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">Target: 20% of income</span>
                  <span className="text-yellow-600">Consider increasing contribution</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
